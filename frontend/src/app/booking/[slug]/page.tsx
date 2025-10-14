"use client"

import React from "react" // add React to use the experimental use() for unwrapping promises
import Navigation from "@/components/Navigation"
import { BookingInterface } from "@/components/booking-interface"
import Footer from "@/components/Footer"

const META: Record<string, { title: string; location: string; capacity: number; imageSrc: string }> = {
  "tult-dining-hall": {
    title: "TULT Dining Hall",
    location: "TULT LL, 16",
    capacity: 50,
    imageSrc: "/images/TULT_DINING_HALL.png",
  },
  "tult-auditorium": {
    title: "TULT Auditorium",
    location: "TULT Lt. 16",
    capacity: 100,
    imageSrc: "/images/TULT_AUDITORIUM.png",
  },
  "tult-hall": {
    title: "TULT Hall",
    location: "TULT Lt. 2",
    capacity: 400,
    imageSrc: "/images/TULT_HALL.png",
  },
  "meeting-room-1602": {
    title: "Meeting Room 1602",
    location: "TULT Lt. 16",
    capacity: 20,
    imageSrc: "/images/MEETING_ROOM_1602.png",
  },
  "small-room-1605": {
    title: "Small Room 1605",
    location: "TULT Lt. 16",
    capacity: 4,
    imageSrc: "/images/SMALL_ROOM_1605.png",
  },
  "meeting-room-1604": {
    title: "Meeting Room 1604",
    location: "TULT Lt. 16",
    capacity: 20,
    imageSrc: "/images/MEETING_ROOM_1604.png",
  },
  "meeting-room-1601": {
    title: "Meeting Room 1601",
    location: "TULT Lt. 16",
    capacity: 20,
    imageSrc: "/images/MEETING_ROOM_1601.png",
  },
}

export default function BookingBySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = React.use(params)
  const meta = META[slug] ?? META["tult-dining-hall"]
  return (
    <>
      <Navigation />
      <BookingInterface {...meta} />
      <Footer />
    </>
  )
}
