import { Header } from "@/components/header"
import { FriendsContent } from "@/components/friends-content"

export default function FriendsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">Friends</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your connections and share schedules</p>
        </div>
        <FriendsContent />
      </main>
    </div>
  )
}