"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { useApp } from "@/contexts/app-context"

export function MessagesContent() {
  const { friends, messages } = useApp()

  // Sample conversations for display
  const conversations = friends.map((friend) => {
    const friendMessages = messages.filter((m) => m.senderId === friend.id || m.receiverId === friend.id)
    const lastMessage = friendMessages[friendMessages.length - 1]

    return {
      id: friend.id,
      name: friend.name,
      avatar: friend.avatar,
      lastMessage: lastMessage?.content || "No messages yet",
      time: lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString() : "",
      unread: friendMessages.filter((m) => !m.isRead && m.senderId === friend.id).length,
    }
  })

  const activeConversation = conversations[0]
  const conversationMessages = messages.filter(
    (m) => m.senderId === activeConversation?.id || m.receiverId === activeConversation?.id,
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b dark:border-slate-700">
          <h2 className="font-semibold">Conversations</h2>
        </div>
        <div className="divide-y dark:divide-slate-700">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer ${
                conversation.id === activeConversation?.id ? "bg-slate-50 dark:bg-slate-700/50" : ""
              }`}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                  <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {conversation.unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="font-medium truncate">{conversation.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{conversation.time}</p>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{conversation.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-md flex flex-col h-[600px]">
        {activeConversation ? (
          <>
            <div className="p-4 border-b dark:border-slate-700 flex items-center gap-3">
              <Avatar>
                <AvatarImage src={activeConversation.avatar || "/placeholder.svg"} alt={activeConversation.name} />
                <AvatarFallback>{activeConversation.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{activeConversation.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Online</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationMessages.map((message) => (
                <div key={message.id} className={`flex ${message.senderId === "me" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderId === "me"
                        ? "bg-primary text-primary-foreground"
                        : "bg-slate-100 dark:bg-slate-700"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === "me" ? "text-primary-foreground/70" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t dark:border-slate-700">
              <div className="flex gap-2">
                <Input placeholder="Type a message..." className="flex-1" />
                <Button>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-500 dark:text-slate-400">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}