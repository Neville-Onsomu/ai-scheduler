import { z } from "zod"

// Event schema
export const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  date: z.string(), // ISO date string
  time: z.string(), // HH:MM format
  duration: z.number().default(60),
  type: z.enum(["work", "personal"]).default("work"),
  description: z.string().optional(),
})

export type Event = z.infer<typeof eventSchema>

// AI Action schemas
export const aiActionSchema = z.discriminatedUnion("action", [
  // Create event
  z.object({
    action: z.literal("create_event"),
    event: eventSchema.omit({ id: true }),
    response: z.string(),
  }),

  // Update event
  z.object({
    action: z.literal("update_event"),
    eventId: z.string(),
    updates: eventSchema.partial(),
    response: z.string(),
  }),

  // Delete event
  z.object({
    action: z.literal("delete_event"),
    eventId: z.string(),
    response: z.string(),
  }),

  // Query schedule
  z.object({
    action: z.literal("query_schedule"),
    timeframe: z.enum(["today", "tomorrow", "this_week", "next_week", "specific_date"]),
    date: z.string().optional(), // For specific_date queries
    response: z.string(),
  }),

  // Find availability
  z.object({
    action: z.literal("find_availability"),
    date: z.string().optional(),
    duration: z.number().default(60),
    timeframe: z.enum(["morning", "afternoon", "evening", "all_day"]).optional(),
    availableSlots: z.array(z.string()),
    response: z.string(),
  }),

  // Send message to friend
  z.object({
    action: z.literal("send_message"),
    friendName: z.string(),
    message: z.string(),
    response: z.string(),
  }),

  // Share calendar
  z.object({
    action: z.literal("share_calendar"),
    friendName: z.string(),
    timeframe: z.enum(["today", "this_week", "next_week"]),
    response: z.string(),
  }),

  // General response (when no specific action is needed)
  z.object({
    action: z.literal("respond"),
    response: z.string(),
  }),
])

export type AIAction = z.infer<typeof aiActionSchema>

// Friend schema
export const friendSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  status: z.enum(["online", "offline"]).default("offline"),
})

export type Friend = z.infer<typeof friendSchema>

// Message schema
export const messageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
  content: z.string(),
  timestamp: z.string(),
  isRead: z.boolean().default(false),
})

export type Message = z.infer<typeof messageSchema>