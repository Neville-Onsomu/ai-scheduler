import { Header } from "@/components/header"
import { MessagesContent } from "@/components/messages-content"

// Sample conversations data
const CONVERSATIONS = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Can we reschedule our meeting?",
    time: "10:30 AM",
    unread: 2,
  },
  {
    id: 2,
    name: "Jamie Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "I'll be there at 3 PM",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: 3,
    name: "Taylor Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Thanks for sharing your calendar",
    time: "Yesterday",
    unread: 0,
  },
]

// Sample messages for the active conversation
const MESSAGES = [
  { id: 1, sender: "Alex", content: "Hey, are you free tomorrow?", time: "10:15 AM", isMine: false },
  {
    id: 2,
    sender: "Me",
    content: "I have a meeting from 2-3 PM, but I'm free after that.",
    time: "10:20 AM",
    isMine: true,
  },
  { id: 3, sender: "Alex", content: "Great! Can we meet at 4 PM then?", time: "10:25 AM", isMine: false },
  { id: 4, sender: "Alex", content: "Can we reschedule our meeting?", time: "10:30 AM", isMine: false },
]

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">Messages</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Chat with your friends and coordinate schedules</p>
        </div>
        <MessagesContent conversations={CONVERSATIONS} messages={MESSAGES} />
      </main>
    </div>
  )
}