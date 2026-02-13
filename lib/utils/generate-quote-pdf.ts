import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { QuoteWithRelations } from '@/lib/actions/quotes'
import { LOGO_BASE64 } from '@/lib/constants/logo-base64'

// ── Safe number formatter for jsPDF (no Unicode special chars) ──
function fmtEur(n: number, decimals = 2): string {
  const fixed = Math.abs(n).toFixed(decimals)
  const [intPart, decPart] = fixed.split('.')
  // Add spaces as thousands separator (regular ASCII space, not U+00A0)
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  const sign = n < 0 ? '-' : ''
  return `${sign}${withSep},${decPart} EUR`
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const KLUSTER = {
  name: 'MATHIEU KLOPP',
  address: '21 Rue Pierre Noailles, 33400 Talence',
  siret: 'SIRET : 84785443700013',
  tva: 'TVA : FR29847854437',
}

const C = {
  primary: [99, 102, 241] as [number, number, number],
  dark: [30, 30, 40] as [number, number, number],
  muted: [120, 120, 140] as [number, number, number],
  light: [245, 245, 250] as [number, number, number],
}

export function generateQuotePDF(quote: QuoteWithRelations) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const W = doc.internal.pageSize.getWidth() // 210
  const H = doc.internal.pageSize.getHeight() // 297
  const m = 20 // margin
  let y = 0

  // ── Top color bar ──
  doc.setFillColor(...C.primary)
  doc.rect(0, 0, W, 10, 'F')

  // ── Logo + KLUSTER + Reference ──
  y = 16
  try {
    doc.addImage(LOGO_BASE64, 'PNG', m, y - 3, 12, 12)
  } catch {
    // fallback: no logo
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...C.primary)
  doc.text('KLUSTER', m + 15, y + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...C.muted)
  doc.text(quote.reference, W - m, y + 5, { align: 'right' })

  // ── DEVIS title ──
  y += 18
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(...C.dark)
  doc.text('DEVIS', m, y)

  // ── Dates line ──
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...C.muted)
  let dateLine = `Date : ${fmtDate(quote.created_at)}`
  if (quote.valid_until) {
    dateLine += `   -   Valable jusqu'au : ${fmtDate(quote.valid_until)}`
  }
  doc.text(dateLine, m, y)

  // ── Separator ──
  y += 5
  doc.setDrawColor(...C.primary)
  doc.setLineWidth(0.4)
  doc.line(m, y, W - m, y)

  // ── Emetteur / Client columns ──
  y += 7
  const midX = W / 2 + 5

  // Left: Emetteur
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...C.primary)
  doc.text('EMETTEUR', m, y)

  doc.setFontSize(9)
  doc.setTextColor(...C.dark)
  doc.text(KLUSTER.name, m, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.muted)
  doc.text(KLUSTER.address, m, y + 10)
  doc.text(KLUSTER.siret, m, y + 15)
  doc.text(KLUSTER.tva, m, y + 20)

  // Right: Client
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...C.primary)
  doc.text('CLIENT', midX, y)

  doc.setFontSize(9)
  doc.setTextColor(...C.dark)
  doc.text(quote.client_name || 'Client', midX, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.muted)

  let cy = y + 10
  if (quote.client_address) {
    // Wrap long addresses
    const addrLines = doc.splitTextToSize(quote.client_address, W - m - midX)
    doc.text(addrLines, midX, cy)
    cy += addrLines.length * 4.5
  }
  if (quote.client_siret) {
    doc.text(`SIRET : ${quote.client_siret}`, midX, cy)
    cy += 4.5
  }
  if (quote.client_vat_number) {
    doc.text(`TVA : ${quote.client_vat_number}`, midX, cy)
  }

  // ── Lines table ──
  y += 33

  const lines = quote.lines || []
  const tableBody = lines.map((line) => [
    line.label + (line.description ? `\n${line.description}` : ''),
    `${line.quantity} ${line.unit_label || ''}`.trim(),
    fmtEur(line.unit_price_ht),
    line.discount_percent > 0 ? `-${line.discount_percent}%` : '-',
    fmtEur(line.total_ht),
  ])

  autoTable(doc, {
    startY: y,
    margin: { left: m, right: m },
    head: [['Prestation', 'Qte', 'Prix unit. HT', 'Remise', 'Total HT']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: C.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: C.dark,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 32, halign: 'right' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 34, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 248, 255],
    },
    styles: {
      lineColor: [230, 230, 240],
      lineWidth: 0.2,
    },
    didDrawPage: () => {
      // Footer on each page
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...C.muted)
      doc.text(`${KLUSTER.name} - ${KLUSTER.siret} - ${quote.reference}`, m, H - 10)
      doc.text(
        `Page ${doc.getCurrentPageInfo().pageNumber}`,
        W - m,
        H - 10,
        { align: 'right' }
      )
    },
  })

  // ── Totals section ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || y + 40
  y = finalY + 12

  // Check if we need a new page
  if (y > H - 70) {
    doc.addPage()
    y = m
  }

  const boxW = 90
  const boxX = W - m - boxW

  // Count rows for background height
  let rowCount = 2 // Total HT + TVA
  if (quote.discount_percent > 0) rowCount += 2 // discount + after discount
  const boxH = rowCount * 8 + 18 // rows + TTC row

  // Background
  doc.setFillColor(...C.light)
  doc.roundedRect(boxX - 5, y - 4, boxW + 10, boxH, 2, 2, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...C.dark)

  // Total HT
  doc.text('Total HT', boxX, y + 2)
  doc.text(fmtEur(quote.total_ht), boxX + boxW, y + 2, { align: 'right' })
  let ty = y + 2

  // Discount
  if (quote.discount_percent > 0) {
    ty += 8
    doc.setTextColor(16, 185, 129)
    doc.text(`Remise (${quote.discount_percent}%)`, boxX, ty)
    doc.text(`-${fmtEur(quote.discount_amount)}`, boxX + boxW, ty, { align: 'right' })

    ty += 8
    doc.setTextColor(...C.dark)
    doc.text('Apres remise', boxX, ty)
    doc.text(fmtEur(quote.total_after_discount), boxX + boxW, ty, { align: 'right' })
  }

  // TVA
  ty += 8
  doc.setTextColor(...C.dark)
  doc.text(`TVA (${quote.tva_rate}%)`, boxX, ty)
  doc.text(fmtEur(quote.total_tva), boxX + boxW, ty, { align: 'right' })

  // Separator + Total TTC
  ty += 5
  doc.setDrawColor(...C.primary)
  doc.setLineWidth(0.3)
  doc.line(boxX, ty, boxX + boxW, ty)

  ty += 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...C.primary)
  doc.text('Total TTC', boxX, ty)
  doc.text(fmtEur(quote.total_ttc), boxX + boxW, ty, { align: 'right' })

  // ── Notes ──
  if (quote.notes) {
    y = ty + 16
    if (y > H - 40) {
      doc.addPage()
      y = m
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...C.primary)
    doc.text('NOTES', m, y)

    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...C.muted)
    const noteLines = doc.splitTextToSize(quote.notes, W - m * 2)
    doc.text(noteLines, m, y)
  }

  // ── Legal footer ──
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...C.muted)
  doc.text(
    "Ce devis est valable 30 jours a compter de sa date d'emission, sauf indication contraire.",
    m,
    H - 18
  )

  // ── Save ──
  doc.save(`${quote.reference}.pdf`)
}
