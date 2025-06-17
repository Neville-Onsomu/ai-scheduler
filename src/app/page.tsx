import { Calendar } from "@/components/calendar"
import { VoiceAssistant } from "@/components/voice-assistant"
import { Header } from "@/components/header"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">AI Voice Scheduler</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your time with intelligent voice commands that actually perform actions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
              <Calendar />
            </div>
          </div>

          <div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 sticky top-24">
              <VoiceAssistant />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}