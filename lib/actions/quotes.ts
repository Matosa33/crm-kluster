'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Quote, QuoteLine, QuoteStatus } from '@/lib/types'

// ============================================================
// Types for joined queries
// ============================================================
export type QuoteWithRelations = Quote & {
  company: { id: string; name: string } | null
  contact: { id: string; first_name: string | null; last_name: string | null } | null
  created_by_user: { id: string; full_name: string } | null
  lines?: QuoteLine[]
}

// ============================================================
// Generate next reference
// ============================================================
async function generateReference(): Promise<string> {
  const supabase = await createClient()
  const year = new Date().getFullYear()
  const prefix = `DEV-${year}-`

  const { data } = await supabase
    .from('quotes')
    .select('reference')
    .like('reference', `${prefix}%`)
    .order('reference', { ascending: false })
    .limit(1)

  let seq = 1
  if (data && data.length > 0) {
    const last = (data[0] as unknown as { reference: string }).reference
    const num = parseInt(last.replace(prefix, ''), 10)
    if (!isNaN(num)) seq = num + 1
  }

  return `${prefix}${String(seq).padStart(3, '0')}`
}

// ============================================================
// List quotes
// ============================================================
export async function getQuotes(filters?: {
  status?: QuoteStatus
  companyId?: string
  contactId?: string
}): Promise<QuoteWithRelations[]> {
  const supabase = await createClient()

  let query = supabase
    .from('quotes')
    .select(`
      *,
      company:companies!quotes_company_id_fkey(id, name),
      contact:contacts!quotes_contact_id_fkey(id, first_name, last_name),
      created_by_user:profiles!quotes_created_by_fkey(id, full_name)
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.companyId) {
    query = query.eq('company_id', filters.companyId)
  }
  if (filters?.contactId) {
    query = query.eq('contact_id', filters.contactId)
  }

  const { data, error } = await query

  if (error) throw error
  return (data as unknown as QuoteWithRelations[]) || []
}

// ============================================================
// Get single quote with lines
// ============================================================
export async function getQuote(id: string): Promise<QuoteWithRelations> {
  const supabase = await createClient()

  const { data: quote, error } = await supabase
    .from('quotes')
    .select(`
      *,
      company:companies!quotes_company_id_fkey(id, name),
      contact:contacts!quotes_contact_id_fkey(id, first_name, last_name),
      created_by_user:profiles!quotes_created_by_fkey(id, full_name)
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  // Get lines separately
  const { data: lines } = await supabase
    .from('quote_lines')
    .select('*')
    .eq('quote_id', id)
    .order('sort_order', { ascending: true })

  const result = quote as unknown as QuoteWithRelations
  result.lines = (lines as unknown as QuoteLine[]) || []

  return result
}

// ============================================================
// Get quotes for a company
// ============================================================
export async function getQuotesByCompany(companyId: string): Promise<QuoteWithRelations[]> {
  return getQuotes({ companyId })
}

// ============================================================
// Get quotes for a contact
// ============================================================
export async function getQuotesByContact(contactId: string): Promise<QuoteWithRelations[]> {
  return getQuotes({ contactId })
}

// ============================================================
// Create quote
// ============================================================
export type CreateQuoteInput = {
  companyId?: string | null
  contactId?: string | null
  clientName?: string
  clientAddress?: string
  clientSiret?: string
  clientVatNumber?: string
  notes?: string
  conditions?: string
  discountPercent?: number
  tvaRate?: number
  lines: {
    catalogItemId?: string | null
    label: string
    description?: string
    quantity: number
    unitPriceHT: number
    discountPercent?: number
    unitLabel?: string
    section?: string
  }[]
}

export async function createQuote(input: CreateQuoteInput): Promise<{ id: string; reference: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const reference = await generateReference()

  // Calculate totals
  const lines = input.lines.map((line, i) => {
    const lineDiscount = line.discountPercent || 0
    const lineTotal = line.quantity * line.unitPriceHT * (1 - lineDiscount / 100)
    return { ...line, sortOrder: i, totalHT: Math.round(lineTotal * 100) / 100 }
  })

  const totalHT = lines.reduce((sum, l) => sum + l.totalHT, 0)
  const discountPercent = input.discountPercent || 0
  const discountAmount = Math.round(totalHT * discountPercent / 100 * 100) / 100
  const totalAfterDiscount = Math.round((totalHT - discountAmount) * 100) / 100
  const tvaRate = input.tvaRate ?? 20
  const totalTVA = Math.round(totalAfterDiscount * tvaRate / 100 * 100) / 100
  const totalTTC = Math.round((totalAfterDiscount + totalTVA) * 100) / 100

  // Validity: 30 days from now
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 30)

  const { data: quote, error } = await supabase
    .from('quotes')
    .insert({
      reference,
      company_id: input.companyId || null,
      contact_id: input.contactId || null,
      status: 'brouillon',
      valid_until: validUntil.toISOString(),
      total_ht: totalHT,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      total_after_discount: totalAfterDiscount,
      tva_rate: tvaRate,
      total_tva: totalTVA,
      total_ttc: totalTTC,
      client_name: input.clientName || null,
      client_address: input.clientAddress || null,
      client_siret: input.clientSiret || null,
      client_vat_number: input.clientVatNumber || null,
      notes: input.notes || null,
      conditions: input.conditions || null,
      created_by: user?.id,
    } as never)
    .select()
    .single()

  if (error) {
    return { id: '', reference: '', error: error.message }
  }

  const quoteData = quote as unknown as { id: string }

  // Insert lines
  if (lines.length > 0) {
    const lineInserts = lines.map((line) => ({
      quote_id: quoteData.id,
      sort_order: line.sortOrder,
      catalog_item_id: line.catalogItemId || null,
      label: line.label,
      description: line.description || null,
      quantity: line.quantity,
      unit_price_ht: line.unitPriceHT,
      discount_percent: line.discountPercent || 0,
      total_ht: line.totalHT,
      unit_label: line.unitLabel || 'unité',
      section: line.section || null,
    }))

    await supabase.from('quote_lines').insert(lineInserts as never[])
  }

  revalidatePath('/devis')
  if (input.companyId) revalidatePath(`/entreprises/${input.companyId}`)
  if (input.contactId) revalidatePath(`/contacts/${input.contactId}`)

  return { id: quoteData.id, reference }
}

// ============================================================
// Update quote status
// ============================================================
export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'envoye') {
    updateData.issued_at = new Date().toISOString()
  } else if (status === 'accepte') {
    updateData.accepted_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('quotes')
    .update(updateData as never)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/devis')
}

// ============================================================
// Delete quote
// ============================================================
export async function deleteQuote(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('quotes').delete().eq('id', id)

  if (error) throw error
  revalidatePath('/devis')
}

// ============================================================
// Duplicate quote
// ============================================================
export async function duplicateQuote(id: string): Promise<{ id: string; reference: string }> {
  const original = await getQuote(id)
  const result = await createQuote({
    companyId: original.company_id,
    contactId: original.contact_id,
    clientName: original.client_name || undefined,
    clientAddress: original.client_address || undefined,
    clientSiret: original.client_siret || undefined,
    clientVatNumber: original.client_vat_number || undefined,
    notes: original.notes || undefined,
    conditions: original.conditions || undefined,
    discountPercent: original.discount_percent,
    tvaRate: original.tva_rate,
    lines: (original.lines || []).map((line) => ({
      catalogItemId: line.catalog_item_id,
      label: line.label,
      description: line.description || undefined,
      quantity: line.quantity,
      unitPriceHT: line.unit_price_ht,
      discountPercent: line.discount_percent,
      unitLabel: line.unit_label,
      section: line.section || undefined,
    })),
  })

  return { id: result.id, reference: result.reference }
}
