"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TimePickerProps {
  value?: string // Time string (HH:mm)
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
  step?: number // minutes step (default 15)
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Pick a time",
  required,
  className,
  step = 15,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Generate time slots
  const timeSlots = React.useMemo(() => {
    const slots: string[] = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += step) {
        const h = hour.toString().padStart(2, "0")
        const m = minute.toString().padStart(2, "0")
        slots.push(`${h}:${m}`)
      }
    }
    return slots
  }, [step])

  // Format time for display (12-hour format with AM/PM)
  const formatTime = (time: string): string => {
    if (!time) return ""
    const [hours, minutes] = time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const displayHour = hours % 12 || 12
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const handleSelect = (time: string) => {
    onChange(time)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatTime(value) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <ScrollArea className="h-72">
          <div className="p-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant="ghost"
                className={cn(
                  "w-full justify-start font-normal",
                  value === time && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleSelect(time)}
              >
                {formatTime(time)}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
