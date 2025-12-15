"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronLeft, ChevronRight, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameDay, addHours } from "date-fns"
import api from "@/lib/api"
import { toast } from "sonner"

export type BookingProps = {
  facilityId?: number
  title?: string
  location?: string
  capacity?: number
  imageSrc?: string
}

type Facility = {
  id: number
  name: string
  location?: string
  capacity: number
  imageUrl?: string
  description?: string
}

type Reservation = {
  reservation_id: number
  start_datetime: string
  end_datetime: string
  status: { name: string }
  purpose?: string
}

// Helper: set date time manually since date-fns/set might be missing in some versions
const setDateTime = (date: Date, options: { hours?: number, minutes?: number, seconds?: number }) => {
  const newDate = new Date(date)
  if (options.hours !== undefined) newDate.setHours(options.hours)
  if (options.minutes !== undefined) newDate.setMinutes(options.minutes)
  if (options.seconds !== undefined) newDate.setSeconds(options.seconds)
  newDate.setMilliseconds(0)
  return newDate
}

// Helper: generate days interval manually
const generateDayInterval = (interval: { start: Date, end: Date }) => {
  const days = []
  let current = new Date(interval.start)
  current.setHours(0, 0, 0, 0)

  const end = new Date(interval.end)
  end.setHours(0, 0, 0, 0)

  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return days
}

export function BookingInterface({
  facilityId,
  title: initialTitle,
  location: initialLocation,
  capacity: initialCapacity,
  imageSrc: initialImageSrc
}: BookingProps) {
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  // Data State
  const [facility, setFacility] = useState<Facility | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Booking Form State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingFormData, setBookingFormData] = useState({
    purpose: "",
    participants: 1
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch Facility Details
  useEffect(() => {
    const fetchFacility = async () => {
      if (!facilityId) return

      try {
        // Cast to any because our interceptor returns the data directly
        const data = await api.get(`/facilities/${facilityId}`) as any
        setFacility({
          id: data.facility_id,
          name: data.name,
          location: data.building || "Campus Building", // Fallback location
          capacity: data.capacity,
          imageUrl: data.image_url || "/images/TULT_DINING_HALL.png",
          description: data.description
        })
      } catch (error) {
        console.error("Failed to fetch facility:", error)
        toast.error("Failed to load facility details")
      }
    }

    if (facilityId) {
      fetchFacility()
    }
  }, [facilityId])

  // Fetch Reservations for Selected Date
  useEffect(() => {
    const fetchReservations = async () => {
      if (!facilityId) return

      try {
        setIsLoading(true)
        // Check API endpoint for getting reservations. The route is /facilities/:id/reservations
        // We ensure data is treated as an array
        const data = await api.get(`/facilities/${facilityId}/reservations`) as any
        const dataArray = Array.isArray(data) ? data : []

        const filtered = dataArray.filter((res: any) =>
          isSameDay(new Date(res.start_datetime), selectedDate)
        )
        setReservations(filtered)
      } catch (error) {
        console.error("Failed to fetch reservations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (facilityId) {
      fetchReservations()
    } else {
      // Mock data if no facilityId (Preview Mode) - Shows 3 consecutive booked slots like in the design
      setReservations([
        {
          reservation_id: 999,
          start_datetime: setDateTime(selectedDate, { hours: 13, minutes: 0 }).toISOString(),
          end_datetime: setDateTime(selectedDate, { hours: 16, minutes: 0 }).toISOString(),
          status: { name: 'APPROVED' },
          purpose: "Rehan Shockbreaker - UKM Himali\nMasak Telor Ceplok"
        } as any
      ])
    }
  }, [facilityId, selectedDate])

  // Generate Calendar Days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = generateDayInterval({ start, end })

    // Add padding for start of week (Monday start)
    const startDay = start.getDay() // 0 = Sunday
    const padding = startDay === 0 ? 6 : startDay - 1

    const paddedDays: (Date | null)[] = Array(padding).fill(null)
    return [...paddedDays, ...days]
  }, [currentMonth])

  // Generate Time Slots (05:00 - 21:00)
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 5; hour <= 21; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`
      const slotTime = setDateTime(selectedDate, { hours: hour, minutes: 0, seconds: 0 })

      // Check availability
      const existing = reservations.find(r => {
        const start = new Date(r.start_datetime)
        const end = new Date(r.end_datetime)
        return slotTime >= start && slotTime < end
      })

      // Parse booking info for display (format: "Name - Organization\nPurpose")
      let bookerName = null
      let bookerPurpose = null
      if (existing?.purpose) {
        const parts = existing.purpose.split('\n')
        bookerName = parts[0] || existing.purpose
        bookerPurpose = parts[1] || null
      }

      slots.push({
        time: timeString,
        available: !existing,
        bookerName: bookerName,
        bookerPurpose: bookerPurpose
      })
    }
    return slots
  }, [selectedDate, reservations])

  const handleBookClick = () => {
    if (!selectedTime) return
    setIsBookingModalOpen(true)
  }

  const handleBookingSubmit = async () => {
    if (!facilityId) {
      toast.success("Booking simulated! (No facility ID provided)")
      setIsBookingModalOpen(false)
      return
    }

    try {
      setIsSubmitting(true)
      const [hours, minutes] = selectedTime!.split(':').map(Number)
      const startDate = setDateTime(selectedDate, { hours, minutes })
      const endDate = addHours(startDate, 1) // Default 1 hour booking

      const payload = {
        facilityId: facilityId,
        date: format(startDate, 'yyyy-MM-dd'),
        startTime: format(startDate, 'HH:mm'),
        endTime: format(endDate, 'HH:mm'),
        purpose: bookingFormData.purpose,
        participants: Number(bookingFormData.participants)
      }

      await api.post('/reservations', payload)
      toast.success("Reservation request created successfully!")
      setIsBookingModalOpen(false)
      // Refresh reservations
      const data = await api.get(`/facilities/${facilityId}/reservations`) as any
      const dataArray = Array.isArray(data) ? data : []

      const filtered = dataArray.filter((res: any) =>
        isSameDay(new Date(res.start_datetime), selectedDate)
      )
      setReservations(filtered)
      setSelectedTime(null)
    } catch (error: any) {
      console.error("Booking failed:", error)
      toast.error(error.response?.data?.message || "Failed to create reservation")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Derived Display Values
  const displayTitle = facility?.name || initialTitle || "TULT Dining Hall"
  const displayLocation = facility?.location || initialLocation || "TULT LL, 16"
  const displayCapacity = facility?.capacity || initialCapacity || 50
  const displayImage = facility?.imageUrl || initialImageSrc || "/images/TULT_DINING_HALL.png"
  const displayDesc = facility?.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit."

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Calendar */}
      <div className="relative w-full">
        <div className="relative w-full h-[1280px] md:h-[720px] overflow-visible">
          <div className="relative w-full h-full overflow-hidden ellipse-bottom-hero">
            <Image
              src={displayImage}
              alt={displayTitle}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Calendar Popup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-6 w-80 z-10 transition-all duration-300 hover:shadow-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#333333]">{format(currentMonth, 'MMMM yyyy')}</h3>
              <div className="flex gap-2">
                <button onClick={() => setCurrentMonth(prev => subMonths(prev, 1))} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                <div key={day} className="text-[#666666] font-medium">{day}</div>
              ))}

              {calendarDays.map((day, idx) => (
                <div key={idx} className="aspect-square flex items-center justify-center">
                  {day && (
                    <button
                      onClick={() => setSelectedDate(day)}
                      disabled={day < new Date(new Date().setHours(0, 0, 0, 0))}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSameDay(day, selectedDate)
                        ? "bg-[#fb3f4a] text-white shadow-md transform scale-110"
                        : "text-[#333333] hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                        }`}
                    >
                      {format(day, 'd')}
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
        <div className="bg-white shadow-lg px-8 md:px-12 py-16 -mt-8 ellipse-bottom-card animate-in slide-in-from-bottom-5 fade-in duration-500">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-[#333333]">{displayTitle}</h1>

          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-[#fa7436]">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{displayLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-[#ffca00]">
              <Users className="w-5 h-5" />
              <span className="font-medium text-[#333333]">{displayCapacity} Capacity</span>
            </div>
          </div>

          <p className="text-center text-[#666666] mb-12 leading-relaxed max-w-2xl mx-auto">
            {displayDesc}
          </p>

          {/* Date Selector Display */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button onClick={() => {
              const prev = new Date(selectedDate)
              prev.setDate(prev.getDate() - 1)
              setSelectedDate(prev)
            }} className="p-2 hover:bg-gray-100 rounded transition-colors">
              <span className="text-gray-400 font-bold text-lg">«</span>
            </button>
            <span className="font-semibold text-[#333333] min-w-[220px] text-center">
              {format(selectedDate, 'EEEE, d MMMM')} <span className="text-gray-400">»</span>
            </span>
            <button onClick={() => {
              const next = new Date(selectedDate)
              next.setDate(next.getDate() + 1)
              setSelectedDate(next)
            }} className="p-2 hover:bg-gray-100 rounded transition-colors">
              <span className="text-gray-400 font-bold text-lg">»</span>
            </button>
          </div>

          {/* Time Slots */}
          <div className="space-y-3 mb-8 max-w-2xl mx-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Loading availability...</div>
            ) : timeSlots.map((slot) => (
              <label
                key={slot.time}
                className={`block rounded-xl border transition-all cursor-pointer relative overflow-hidden ${!slot.available
                  ? "bg-[#F57C6B] border-[#F57C6B] text-white"
                  : selectedTime === slot.time
                    ? "border-[#04aa57] bg-[#04aa57]/10 scale-[1.01] shadow-sm"
                    : "border-[#e8e8e8] hover:border-[#04aa57]/50 hover:bg-gray-50 bg-white"
                  }`}
              >
                <div className="flex items-center gap-4 p-4">
                  <input
                    type="radio"
                    name="timeSlot"
                    value={slot.time}
                    checked={selectedTime === slot.time}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={!slot.available}
                    className={`w-5 h-5 ${!slot.available ? 'accent-white' : 'accent-[#04aa57]'}`}
                  />
                  <div className="flex-1">
                    <div className={`font-semibold ${!slot.available ? "text-white" : "text-[#333333]"}`}>
                      {slot.time}
                    </div>
                    {slot.bookerName && (
                      <div className="text-sm text-white mt-1">
                        <span className="font-medium">{slot.bookerName}</span>
                        {slot.bookerPurpose && (
                          <>
                            <br />
                            <span className="text-white/80">{slot.bookerPurpose}</span>
                          </>
                        )}
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
              onClick={handleBookClick}
              className="w-full bg-[#04aa57] hover:bg-[#038a47] text-white py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
              disabled={!selectedTime || isLoading}
            >
              Book
            </Button>
          </div>
        </div>
      </main>

      {/* Booking Dialog */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Complete your reservation for <span className="font-semibold text-primary">{displayTitle}</span> on {format(selectedDate, 'MMM d')} at {selectedTime}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="purpose">Purpose of Reservation</Label>
              <Input
                id="purpose"
                placeholder="e.g. Study Group, Club Meeting"
                value={bookingFormData.purpose}
                onChange={(e) => setBookingFormData(prev => ({ ...prev, purpose: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="participants">Number of Participants</Label>
              <Input
                id="participants"
                type="number"
                min={1}
                max={displayCapacity}
                value={bookingFormData.participants}
                onChange={(e) => setBookingFormData(prev => ({ ...prev, participants: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleBookingSubmit}
              disabled={isSubmitting || !bookingFormData.purpose || bookingFormData.participants < 1}
              className="bg-[#04aa57] hover:bg-[#044343]"
            >
              {isSubmitting ? "Confirming..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}