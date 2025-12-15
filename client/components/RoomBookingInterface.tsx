"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// Types
export type Booking = {
  userId: string
  bookingName: string
  date: string
  startTime: string
  endTime: string
}

export type TimeSlot = {
  time: string
  available: boolean
  booking?: Booking
}

export type RoomBooking = {
  id: string
  name: string
  location: string
  capacity: number
  imageSrc: string
  bookings: Booking[]
}

export type RoomBookingProps = {
  room: RoomBooking
}

export function RoomBookingInterface({ room }: RoomBookingProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Generate time slots based on the room's bookings for the selected date
  useEffect(() => {
    const generateTimeSlots = () => {
      const selectedDateString = selectedDate.toISOString().split('T')[0]
      const roomBookingsForDate = room.bookings.filter(booking =>
        booking.date === selectedDateString
      )

      // Define time slots from 05:00 to 21:00 (every hour)
      const slots: TimeSlot[] = []
      for (let hour = 5; hour <= 21; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`

        // Check if this time slot is booked
        const bookingForTime = roomBookingsForDate.find(booking =>
          booking.startTime === time
        )

        slots.push({
          time,
          available: !bookingForTime,
          booking: bookingForTime
        })
      }

      setTimeSlots(slots)
    }

    generateTimeSlots()
  }, [selectedDate, room])

  // Helper functions for calendar
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    const startDay = firstDay.getDay()  // 0 = Sunday, 1 = Monday, etc.

    const days = Array(6).fill(null).map(() => Array(7).fill(null))

    let day = 1
    for (let week = 0; week < 6; week++) {
      for (let weekday = 0; weekday < 7; weekday++) {
        if (week === 0 && weekday < startDay) {
          // Empty cells before the first day of the month
          continue
        } else if (day <= daysInMonth) {
          days[week][weekday] = day
          day++
        }
      }
    }

    return days
  }

  const daysInMonth = getDaysInMonth(currentMonth)

  const selectDay = (day: number) => {
    if (!day) return
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(newDate)
    setSelectedTime(null) // Reset selected time when changing date
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)

    // If the selected date is in a different month after navigation, reset to first day of new month
    if (selectedDate.getMonth() !== newMonth.getMonth() || selectedDate.getFullYear() !== newMonth.getFullYear()) {
      const newSelectedDate = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1)
      setSelectedDate(newSelectedDate)
      setSelectedTime(null)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Calendar */}
      <div className="relative w-full">
        <div className="relative w-full h-[1280px] md:h-[720px] overflow-visible">
          <div className="relative w-full h-full overflow-hidden ellipse-bottom-hero">
            <Image
              src={room.imageSrc}
              alt={room.name}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg"; // fallback image
              }}
              priority
            />
          </div>

          {/* Calendar Popup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-6 w-80 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#333333]">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button
                  className="p-1 hover:bg-gray-100 rounded"
                  onClick={() => navigateMonth('prev')}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  className="p-1 hover:bg-gray-100 rounded"
                  onClick={() => navigateMonth('next')}
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              <div className="text-[#666666] font-medium">Su</div>
              <div className="text-[#666666] font-medium">Mo</div>
              <div className="text-[#666666] font-medium">Tu</div>
              <div className="text-[#666666] font-medium">We</div>
              <div className="text-[#666666] font-medium">Th</div>
              <div className="text-[#666666] font-medium">Fr</div>
              <div className="text-[#666666] font-medium">Sa</div>

              {daysInMonth.flat().map((day, idx) => (
                <div key={idx} className="aspect-square flex items-center justify-center">
                  {day !== null && (
                    <button
                      onClick={() => selectDay(day)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${selectedDate.getDate() === day &&
                          selectedDate.getMonth() === currentMonth.getMonth() &&
                          selectedDate.getFullYear() === currentMonth.getFullYear()
                          ? "bg-[#fb3f4a] text-white"
                          : "text-[#333333] hover:bg-gray-100"
                        }`}
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white shadow-lg px-12 py-16 -mt-8 ellipse-bottom-card">
          {/* Room Header with Name and Details */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#333333] mb-4">{room.name}</h1>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-[#fa7436]">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">{room.location}</span>
              </div>
              <div className="flex items-center gap-2 text-[#ffca00]">
                <Users className="w-5 h-5" />
                <span className="font-medium text-[#333333]">{room.capacity}</span>
              </div>
            </div>
          </div>

          <p className="text-center text-[#666666] mb-12 leading-relaxed max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur.
          </p>

          {/* Date Selector */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              className="p-2 hover:bg-gray-100 rounded"
              onClick={() => {
                const prevDay = new Date(selectedDate)
                prevDay.setDate(prevDay.getDate() - 1)
                setSelectedDate(prevDay)
                setSelectedTime(null)
              }}
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-[#333333]">{formatDate(selectedDate)}</span>
            <button
              className="p-2 hover:bg-gray-100 rounded"
              onClick={() => {
                const nextDay = new Date(selectedDate)
                nextDay.setDate(nextDay.getDate() + 1)
                setSelectedDate(nextDay)
                setSelectedTime(null)
              }}
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Time Slots */}
          <div className="space-y-3 mb-8 max-w-2xl mx-auto">
            {timeSlots.map((slot) => (
              <label
                key={slot.time}
                className={`block rounded-lg border-2 transition-all cursor-pointer ${!slot.available
                    ? "bg-[#fb3f4a] border-[#fb3f4a] text-white"
                    : selectedTime === slot.time
                      ? "border-[#04aa57] bg-[#04aa57]/5"
                      : "border-[#ebebeb] hover:border-[#04aa57]/50"
                  }`}
              >
                <div className="flex items-center gap-3 p-4">
                  <input
                    type="radio"
                    name="timeSlot"
                    value={slot.time}
                    checked={selectedTime === slot.time}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={!slot.available}
                    className="w-5 h-5 accent-[#04aa57]"
                  />
                  <div className="flex-1">
                    <div className={`font-medium ${!slot.available ? "text-white" : "text-[#333333]"}`}>
                      {slot.time}
                    </div>
                    {slot.booking && (
                      <div className="text-sm text-white mt-1">
                        Booked: {slot.booking.bookingName}
                      </div>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Book Button */}
          <div className="max-w-md mx-auto">
            <Button
              className="w-full bg-[#04aa57] hover:bg-[#044343] text-white py-6 text-lg font-semibold rounded-lg"
              disabled={!selectedTime}
            >
              Book {room.name}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}