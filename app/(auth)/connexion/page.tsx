'use client'

import { useState } from 'react'
import { signIn } from '@/lib/actions/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Zap } from 'lucide-react'

const TEAM = [
  { name: 'Mathieu', email: 'mathieu@kluster.fr', initials: 'MA', role: 'Admin', color: 'from-indigo-500 to-violet-500' },
  { name: 'Sarah', email: 'kloppsara@gmail.com', initials: 'SA', role: 'Commercial', color: 'from-emerald-500 to-teal-500' },
  { name: 'Edouard', email: 'edouard@kluster.fr', initials: 'ED', role: 'Commercial', color: 'from-amber-500 to-orange-500' },
]

const SHARED_PASSWORD = 'Kluster2026!'

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleLogin(email: string, name: string) {
    setLoading(name)
    setError('')

    const result = await signIn(email, SHARED_PASSWORD)

    if (result?.error) {
      setError(`Impossible de se connecter. Vérifiez que le compte « ${name} » existe dans Supabase.`)
      setLoading(null)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-primary/20 glow-indigo">
            <Zap className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
          CRM Kluster
        </h1>
        <p className="text-muted-foreground mt-2">Qui êtes-vous ?</p>
      </div>

      <div className="space-y-3">
        {TEAM.map((member) => (
          <button
            key={member.name}
            onClick={() => handleLogin(member.email, member.name)}
            disabled={loading !== null}
            className="group w-full flex items-center gap-4 p-4 rounded-xl glass-card hover:border-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Avatar className="h-12 w-12 ring-2 ring-white/10 group-hover:ring-primary/30 transition-all">
              <AvatarFallback className={`bg-gradient-to-br ${member.color} text-white text-lg font-semibold`}>
                {member.initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-left flex-1">
              <p className="font-semibold">
                {member.name}
                {loading === member.name && (
                  <span className="text-primary font-normal ml-2 animate-pulse">
                    Connexion...
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive text-center mt-4 glass rounded-lg p-3">{error}</p>
      )}

      <p className="text-xs text-muted-foreground text-center mt-8">
        Modifiez les noms et emails dans le code source
      </p>
    </div>
  )
}
