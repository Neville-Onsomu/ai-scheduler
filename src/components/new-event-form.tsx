"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DialogFooter } from "@/components/ui/dialog"
import type { Event } from "@/lib/schemas"

interface NewEventFormProps {
  onAddEvent: (event: Omit<Event, "id">) => void
}

export function NewEventForm({ onAddEvent }: NewEventFormProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("60")
  const [type, setType] = useState<"work" | "personal">("work")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onAddEvent({
      title,
      date,
      time,
      duration: Number.parseInt(duration),
      type,
    })

    // Reset form
    setTitle("")
    setDate("")
    setTime("")
    setDuration("60")
    setType("work")
  }

  // Get today's date in YYYY-MM-DD format for the date input min value
  const today = new Date().toISOString().split("T")[0]

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter event title"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} min={today} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="time">Time</Label>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="5"
            step="5"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label>Event Type</Label>
          <RadioGroup
            value={type}
            onValueChange={(value: "work" | "personal") => setType(value)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="work" id="work" />
              <Label htmlFor="work" className="cursor-pointer">
                Work
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="personal" id="personal" />
              <Label htmlFor="personal" className="cursor-pointer">
                Personal
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">Add Event</Button>
      </DialogFooter>
    </form>
  )
}