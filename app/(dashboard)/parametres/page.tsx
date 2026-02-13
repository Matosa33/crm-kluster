import { getUser, getAllUsers } from '@/lib/actions/auth'
import { getAiSettings } from '@/lib/actions/ai-settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AiSettingsCard } from '@/components/copilot/ai-settings-card'

export default async function SettingsPage() {
  const [currentUser, allUsers, aiSettings] = await Promise.all([
    getUser(),
    getAllUsers(),
    getAiSettings(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Configuration de votre compte
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mon profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                <AvatarFallback className="text-lg bg-primary/20 text-primary">
                  {currentUser?.full_name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">
                  {currentUser?.full_name}
                </p>
                <Badge variant="outline" className="capitalize">
                  {currentUser?.role}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Équipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/15 text-primary text-sm">
                      {user.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.full_name}</p>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {user.role}
                    </Badge>
                  </div>
                  {user.id === currentUser?.id && (
                    <Badge variant="outline" className="text-xs">
                      Vous
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configuration API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Les clés API sont configurées dans les variables d&apos;environnement
              du serveur. Contactez l&apos;administrateur pour les modifier.
            </p>
            <div className="flex gap-2">
              <Badge variant="outline">Serper.dev</Badge>
              <Badge variant="outline">SerpAPI</Badge>
              <Badge variant="outline">Supabase</Badge>
            </div>
          </CardContent>
        </Card>

        <AiSettingsCard initialSettings={aiSettings} />
      </div>
    </div>
  )
}
