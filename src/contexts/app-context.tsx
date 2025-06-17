"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import type { Event, Friend, Message } from "@/lib/schemas"

interface AppContextType {
  // Events
  events: Event[]
  addEvent: (event: Omit<Event, "id">) => void
  updateEvent: (id: string, updates: Partial<Event>) => void
  deleteEvent: (id: string) => void

  // Friends
  friends: Friend[]
  addFriend: (friend: Friend) => void

  // Messages
  messages: Message[]
  addMessage: (message: Omit<Message, "id">) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Sample data
const SAMPLE_EVENTS: Event[] = [
  {
    id: "1",
    title: "Team Meeting",
    date: "2025-01-11",
    time: "10:00",
    duration: 60,
    type: "work",
  },
  {
    id: "2",
    title: "Lunch with Alex",
    date: "2025-01-11",
    time: "12:30",
    duration: 90,
    type: "personal",
  },
  {
    id: "3",
    title: "Project Review",
    date: "2025-01-12",
    time: "14:00",
    duration: 45,
    type: "work",
  },
]

const SAMPLE_FRIENDS: Friend[] = [
  { id: "1", name: "Alex Johnson", status: "online" },
  { id: "2", name: "Jamie Smith", status: "offline" },
  { id: "3", name: "Taylor Brown", status: "online" },
  { id: "4", name: "Casey Wilson", status: "offline" },
]

const SAMPLE_MESSAGES: Message[] = [
  {
    id: "1",
    senderId: "me",
    receiverId: "1",
    content: "Hey Alex, are you free for lunch tomorrow?",
    timestamp: new Date().toISOString(),
    isRead: true,
  },
]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>(SAMPLE_EVENTS)
  const [friends, setFriends] = useState<Friend[]>(SAMPLE_FRIENDS)
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES)

  const addEvent = useCallback((event: Omit<Event, "id">) => {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
    }
    setEvents((prev) => [...prev, newEvent])
  }, [])

  const updateEvent = useCallback((id: string, updates: Partial<Event>) => {
    setEvents((prev) => prev.map((event) => (event.id === id ? { ...event, ...updates } : event)))
  }, [])

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id))
  }, [])

  const addFriend = useCallback((friend: Friend) => {
    setFriends((prev) => [...prev, friend])
  }, [])

  const addMessage = useCallback((message: Omit<Message, "id">) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
    }
    setMessages((prev) => [...prev, newMessage])
  }, [])

  return (
    <AppContext.Provider
      value={{
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        friends,
        addFriend,
        messages,
        addMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}