import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { aiActionSchema, type Event, type Friend } from "./schemas"

export async function processVoiceCommand(command: string, currentEvents: Event[], friends: Friend[]): Promise<any> {
  const currentDate = new Date().toISOString().split("T")[0]
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  })

  // Create context about current schedule
  const todayEvents = currentEvents.filter((event) => event.date === currentDate)

  const friendNames = friends.map((f) => f.name).join(", ")

  const systemPrompt = `You are an AI assistant for a scheduling app. Today is ${currentDate} and current time is ${currentTime}.

Current schedule for today:
${todayEvents.length > 0 ? todayEvents.map((e) => `- ${e.title} at ${e.time} (${e.duration}min)`).join("\n") : "- No events scheduled"}

Available friends: ${friendNames}

Based on the user's voice command, determine the appropriate action and provide a helpful response. 

For create_event actions:
- Convert relative dates like "tomorrow", "next Monday" to actual dates
- Use 24-hour time format (HH:MM)
- Default duration is 60 minutes unless specified
- Infer event type (work/personal) from context

For query_schedule actions:
- Analyze the current events and provide availability information

For send_message actions:
- Only use friend names that exist in the available friends list
- Create appropriate messages based on the context

For find_availability actions:
- Look at existing events and suggest free time slots
- Consider typical work hours (9-17) and personal time

Always provide a natural, conversational response that confirms the action taken.`

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: aiActionSchema,
      prompt: command,
      system: systemPrompt,
    })

    return object
  } catch (error) {
    console.error("Error processing voice command:", error)
    return {
      action: "respond",
      response: "Sorry, I had trouble understanding that command. Could you please try again?",
    }
  }
}

// Helper function to convert relative dates to actual dates
export function parseRelativeDate(dateString: string): string {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  switch (dateString.toLowerCase()) {
    case "today":
      return today.toISOString().split("T")[0]
    case "tomorrow":
      return tomorrow.toISOString().split("T")[0]
    default:
      // Try to parse as regular date
      const parsed = new Date(dateString)
      return isNaN(parsed.getTime()) ? today.toISOString().split("T")[0] : parsed.toISOString().split("T")[0]
  }
}

// Helper function to find available time slots
export function findAvailableSlots(events: Event[], date: string, duration = 60): string[] {
  const slots: string[] = []
  const workStart = 9 // 9 AM
  const workEnd = 17 // 5 PM

  // Get events for the specific date
  const dayEvents = events.filter((event) => event.date === date).sort((a, b) => a.time.localeCompare(b.time))

  // Generate potential slots every 30 minutes
  for (let hour = workStart; hour < workEnd; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      const slotEnd = new Date(`2000-01-01T${timeString}:00`)
      slotEnd.setMinutes(slotEnd.getMinutes() + duration)
      const endTimeString = `${slotEnd.getHours().toString().padStart(2, "0")}:${slotEnd.getMinutes().toString().padStart(2, "0")}`

      // Check if this slot conflicts with any existing events
      const hasConflict = dayEvents.some((event) => {
        const eventStart = event.time
        const eventEndTime = new Date(`2000-01-01T${eventStart}:00`)
        eventEndTime.setMinutes(eventEndTime.getMinutes() + event.duration)
        const eventEnd = `${eventEndTime.getHours().toString().padStart(2, "0")}:${eventEndTime.getMinutes().toString().padStart(2, "0")}`

        return (
          (timeString >= eventStart && timeString < eventEnd) ||
          (endTimeString > eventStart && endTimeString <= eventEnd) ||
          (timeString <= eventStart && endTimeString >= eventEnd)
        )
      })

      if (!hasConflict && slotEnd.getHours() <= workEnd) {
        slots.push(`${timeString} - ${endTimeString}`)
      }
    }
  }

  return slots.slice(0, 5) // Return first 5 available slots
}