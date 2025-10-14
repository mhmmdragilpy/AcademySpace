"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export type BookingProps = {
  title?: string
  location?: string
  capacity?: number
  imageSrc?: string
}

export function BookingInterface({
  title = "TULT Dining Hall",
  location = "TULT LL, 16",
  capacity = 50,
  imageSrc = "/images/TULT_DINING_HALL.png",
}: BookingProps) {
  const [selectedDate, setSelectedDate] = useState(8)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const timeSlots = [
    { time: "05:00", available: true },
    { time: "06:00", available: true },
    { time: "07:00", available: true },
    { time: "08:00", available: true },
    { time: "09:00", available: true },
    { time: "10:00", available: true },
    { time: "11:00", available: true },
    { time: "12:00", available: true },
    { time: "13:00", available: false, booking: "Rehan Shockbreaker - UKM Himali Masak Telor Ceplok" },
    { time: "14:00", available: false, booking: "Rehan Shockbreaker - UKM Himali Masak Telor Ceplok" },
    { time: "15:00", available: false, booking: "Rehan Shockbreaker - UKM Himali Masak Telor Ceplok" },
    { time: "16:00", available: true },
    { time: "17:00", available: true },
    { time: "18:00", available: true },
    { time: "19:00", available: true },
    { time: "20:00", available: true },
    { time: "21:00", available: true },
  ]

  const daysInMonth = [
    [null, null, null, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, 31, null],
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Calendar */}
      <div className="relative w-full">
        <div className="relative w-full h-[1280px] md:h-[720px] overflow-visible">
          <div className="relative w-full h-full overflow-hidden ellipse-bottom-hero">
            <Image src={imageSrc || "/placeholder.svg"} alt={title} fill className="object-cover" priority />
          </div>

          {/* Calendar Popup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-6 w-80 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#333333]">October 2020</h3>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              <div className="text-[#666666] font-medium">Mo</div>
              <div className="text-[#666666] font-medium">Tu</div>
              <div className="text-[#666666] font-medium">We</div>
              <div className="text-[#666666] font-medium">Th</div>
              <div className="text-[#666666] font-medium">Fr</div>
              <div className="text-[#666666] font-medium">Sa</div>
              <div className="text-[#666666] font-medium">Su</div>

              {daysInMonth.flat().map((day, idx) => (
                <div key={idx} className="aspect-square flex items-center justify-center">
                  {day && (
                    <button
                      onClick={() => setSelectedDate(day)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        day === 8 ? "bg-[#fb3f4a] text-white" : "text-[#333333] hover:bg-gray-100"
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
          <h1 className="text-4xl font-bold text-center mb-6 text-[#333333]">{title}</h1>

          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-[#fa7436]">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{location}</span>
            </div>
            <div className="flex items-center gap-2 text-[#ffca00]">
              <Users className="w-5 h-5" />
              <span className="font-medium text-[#333333]">{capacity}</span>
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
            <button className="p-2 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-[#333333]">Thursday, 8 October</span>
            <button className="p-2 hover:bg-gray-100 rounded">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Time Slots */}
          <div className="space-y-3 mb-8 max-w-2xl mx-auto">
            {timeSlots.map((slot) => (
              <label
                key={slot.time}
                className={`block rounded-lg border-2 transition-all cursor-pointer ${
                  !slot.available
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
                    {slot.booking && <div className="text-sm text-white mt-1">{slot.booking}</div>}
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
              Book
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
