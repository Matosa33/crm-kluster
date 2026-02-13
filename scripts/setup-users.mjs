/**
 * Script de creation des utilisateurs dans Supabase Auth.
 *
 * PREREQUIS : Le schema SQL (seed-database.sql) doit etre execute AVANT ce script.
 * Le trigger handle_new_user() creera automatiquement les profils.
 *
 * Usage : node scripts/setup-users.mjs
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// Lire les variables d'environnement depuis .env.local
const envFile = readFileSync('.env.local', 'utf-8')
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const eqIndex = line.indexOf('=')
      return [line.slice(0, eqIndex).trim(), line.slice(eqIndex + 1).trim()]
    })
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const TEAM = [
  { email: 'mathieu@kluster.fr', full_name: 'Mathieu', role: 'admin' },
  { email: 'kloppsara@gmail.com', full_name: 'Sarah', role: 'commercial' },
  { email: 'edouard@kluster.fr', full_name: 'Edouard', role: 'commercial' },
]

const PASSWORD = 'Kluster2026!'

console.log('Creation des utilisateurs dans Supabase Auth...\n')

for (const member of TEAM) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: member.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: member.full_name, role: member.role },
  })

  if (error) {
    if (error.message.includes('already been registered')) {
      console.log(`-- ${member.full_name} (${member.email}) existe deja`)
    } else {
      console.error(`ERREUR ${member.full_name}: ${error.message}`)
    }
  } else {
    console.log(`OK ${member.full_name} cree (${member.email}) -> id: ${data.user.id}`)
  }
}

console.log('\nTermine ! Les profils ont ete crees automatiquement via le trigger.')
console.log('Vous pouvez maintenant vous connecter sur http://localhost:3000/connexion')
