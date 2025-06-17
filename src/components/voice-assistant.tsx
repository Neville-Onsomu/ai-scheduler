"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2, VolumeX, CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react"
import { Card } from "@/components/ui/card"
import { processVoiceCommand as processAICommand, findAvailableSlots } from "@/lib/ai-actions"
import { useApp } from "@/contexts/app-context"
import { toast } from "sonner"
import type { AIAction } from "@/lib/schemas"

interface ConversationMessage {
  role: "user" | "assistant"
  content: string
  action?: AIAction
  timestamp: string
}

export function VoiceAssistant() {
  const { events, addEvent, updateEvent, deleteEvent, friends, addMessage } = useApp()

  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<ConversationMessage[]>([])

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join("")
          setTranscript(transcript)
        }

        recognitionRef.current.onend = () => {
          if (isListening) {
            recognitionRef.current?.start()
          }
        }

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error)
          setIsListening(false)
        }
      }
    }

    // Initialize speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [isListening])

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false)
      recognitionRef.current?.stop()

      if (transcript.trim()) {
        processVoiceCommand(transcript)
      }
    } else {
      setIsListening(true)
      setTranscript("")
      recognitionRef.current?.start()
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (synthRef.current) {
      if (!isMuted) {
        synthRef.current.cancel()
      }
    }
  }

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true)
    setTranscript("")

    const userMessage: ConversationMessage = {
      role: "user",
      content: command,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])

    try {
      const aiAction = await processAICommand(command, events, friends)

      const assistantMessage: ConversationMessage = {
        role: "assistant",
        content: aiAction.response,
        action: aiAction,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Execute the action
      await executeAction(aiAction)

      // Speak the response
      if (!isMuted && synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(aiAction.response)
        synthRef.current.speak(utterance)
      }
    } catch (error) {
      console.error("Error processing voice command:", error)
      const errorMessage: ConversationMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error processing your request.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const executeAction = async (action: AIAction) => {
    switch (action.action) {
      case "create_event":
        addEvent(action.event)
        toast.success("Event Created", {
          description: `"${action.event.title}" has been added to your calendar.`,
        })
        break

      case "update_event":
        updateEvent(action.eventId, action.updates)
        toast.success("Event Updated", {
          description: "Your event has been successfully updated.",
        })
        break

      case "delete_event":
        deleteEvent(action.eventId)
        toast.success("Event Deleted", {
          description: "The event has been removed from your calendar.",
        })
        break

      case "find_availability":
        const slots = findAvailableSlots(events, action.date || new Date().toISOString().split("T")[0], action.duration)
        toast.info("Available Time Slots", {
          description: `Found ${slots.length} available slots.`,
        })
        break

      case "send_message":
        const friend = friends.find((f) => f.name.toLowerCase().includes(action.friendName.toLowerCase()))
        if (friend) {
          addMessage({
            senderId: "me",
            receiverId: friend.id,
            content: action.message,
            timestamp: new Date().toISOString(),
            isRead: false,
          })
          toast.success("Message Sent", {
            description: `Message sent to ${friend.name}.`,
          })
        }
        break

      case "query_schedule":
      case "share_calendar":
      case "respond":
        // These actions don't require additional execution
        break
    }
  }

  const getActionIcon = (action?: AIAction) => {
    if (!action) return null

    switch (action.action) {
      case "create_event":
      case "update_event":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "delete_event":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "find_availability":
      case "query_schedule":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "send_message":
      case "share_calendar":
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      default:
        return null
    }
  }

  // Check if speech recognition is supported
  const isSpeechSupported =
    typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">AI Voice Assistant</h3>
        <Button variant="ghost" size="icon" onClick={toggleMute}>
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[400px]">
        {messages.map((message, index) => (
          <Card
            key={index}
            className={`p-3 max-w-[85%] ${
              message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            <div className="flex items-start gap-2">
              {message.role === "assistant" && getActionIcon(message.action)}
              <div className="flex-1">
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </Card>
        ))}

        {isListening && (
          <div className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
            🎤 Listening: {transcript || "Say something..."}
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            <span className="text-sm text-slate-500">Processing...</span>
          </div>
        )}
      </div>

      <div className="mt-auto">
        {!isSpeechSupported ? (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 mb-4">
            Speech recognition is not supported in this browser
          </div>
        ) : null}

        <Button
          className={`w-full ${isListening ? "bg-red-500 hover:bg-red-600" : ""}`}
          onClick={toggleListening}
          disabled={isProcessing || !isSpeechSupported}
        >
          {isListening ? (
            <>
              <MicOff className="h-5 w-5 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="h-5 w-5 mr-2" />
              Start Listening
            </>
          )}
        </Button>

        <div className="text-xs text-center mt-2 text-slate-500 dark:text-slate-400">
          Try: "Add a meeting tomorrow at 2 PM" • "What's my schedule today?" • "Send Alex a message"
        </div>
      </div>
    </div>
  )
}