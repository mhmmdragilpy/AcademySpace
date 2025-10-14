"use client"

import Image from "next/image"
import Link from "next/link" // added
import { useState } from "react"
import { Users, MapPin } from "lucide-react"

interface FacilityCard {
  id: string
  name: string
  image: string
  capacity: number
  description: string
  location: string
  slug: string // added
}

export default function FacilitiesSection() {
  const [activeTab, setActiveTab] = useState("facilities")

  const facilities: FacilityCard[] = [
    {
      id: "1",
      name: "TULT Dining Hall",
      image: "/images/TULT_DINING_HALL.png",
      capacity: 50,
      description: "consectetur adipisicing elit.",
      location: "TULT Lt. 16",
      slug: "tult-dining-hall",
    },
    {
      id: "2",
      name: "TULT Auditorium",
      image: "/images/TULT_AUDITORIUM.png",
      capacity: 100,
      description: "consectetur adipisicing elit.",
      location: "TULT Lt. 16",
      slug: "tult-auditorium",
    },
    {
      id: "3",
      name: "TULT Hall",
      image: "/images/TULT_HALL.png",
      capacity: 400,
      description: "consectetur adipisicing elit.",
      location: "TULT Lt. 2",
      slug: "tult-hall",
    },
    {
      id: "4",
      name: "Meeting Room 1602",
      image: "/images/MEETING_ROOM_1602.png",
      capacity: 20,
      description: "consectetur adipisicing elit.",
      location: "TULT Lt. 16",
      slug: "meeting-room-1602",
    },
    {
      id: "5",
      name: "Small Room 1605",
      image: "/images/SMALL_ROOM_1605.png",
      capacity: 4,
      description: "consectetur adipisicing elit.",
      location: "TULT Lt. 16",
      slug: "small-room-1605",
    },
    {
      id: "6",
      name: "Meeting Room 1604",
      image: "/images/MEETING_ROOM_1604.png",
      capacity: 20,
      description: "consectetur adipisicing elit.",
      location: "TULT Lt. 16",
      slug: "meeting-room-1604",
    },
    {
      id: "7",
      name: "Meeting Room 1601",
      image: "/images/MEETING_ROOM_1601.png",
      capacity: 20,
      description: "consectetur adipisicing elit.",
      location: "TULT Lt. 16",
      slug: "meeting-room-1601",
    },
  ]

  const toolsContent = [
    { id: "1", name: "Projector", description: "High-quality projectors available for presentations" },
    { id: "2", name: "Whiteboard", description: "Interactive whiteboards for collaborative work" },
    { id: "3", name: "Sound System", description: "Professional audio equipment for events" },
    { id: "4", name: "Video Conference", description: "Video conferencing equipment and setup" },
    { id: "5", name: "Computer Lab", description: "Full computer stations with software" },
    { id: "6", name: "Kitchen Equipment", description: "Professional kitchen tools and appliances" },
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-poppins mb-2">
            <span className="text-primary-orange">Everything</span>{" "}
            <span className="text-black">the campus has to offer</span>
          </h2>
        </div>

        {/* Tabs - Centered with underline */}
        <div className="flex justify-center gap-12 mb-12 relative pb-4">
          {/* Facility Tab */}
          <div className="relative">
            <button
              onClick={() => setActiveTab("facilities")}
              className={`font-poppins text-lg pb-2 transition-all duration-300 ${
                activeTab === "facilities" ? "text-primary-orange" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Facility
            </button>
            {activeTab === "facilities" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-orange rounded-t-lg"></div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px bg-gray-300 h-6"></div>

          {/* Tools Tab */}
          <div className="relative">
            <button
              onClick={() => setActiveTab("tools")}
              className={`font-poppins text-lg pb-2 transition-all duration-300 ${
                activeTab === "tools" ? "text-primary-orange" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Tools & Equipments
            </button>
            {activeTab === "tools" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-orange rounded-t-lg"></div>
            )}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "facilities" && (
          <div className="animate-fadeIn">
            {/* Facility Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {facilities.map((facility) => (
                <Link href={`/booking/${facility.slug}`} key={facility.id} className="block">
                  {" "}
                  {/* wrapped card with Link */}
                  <div className="bg-light-gray rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                    {/* Card Image */}
                    <div className="relative h-40 bg-gray-300">
                      <Image
                        src={facility.image || "/placeholder.svg"}
                        alt={facility.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Card Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-poppins font-bold text-gray-800">{facility.name}</h3>
                        <span className="inline-flex items-center gap-1 text-[#FFCA00] text-sm font-poppins font-semibold">
                          <Users size={16} />
                          <span className="text-black font-light">{facility.capacity}</span>
                        </span>
                      </div>
                      {/* Location Pin */}
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={16} className="text-[#FA7436] flex-shrink-0" />
                        <span className="text-[#FA7436] text-sm font-poppins font-semibold">{facility.location}</span>
                      </div>
                      <p className="text-gray-600 text-sm font-poppins">{facility.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tools" && (
          <div className="animate-fadeIn">
            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {toolsContent.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-light-gray rounded-lg p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <h3 className="font-poppins font-bold text-gray-800 mb-2">{tool.name}</h3>
                  <p className="text-gray-600 text-sm font-poppins">{tool.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Choose Location Button */}
        <div className="flex justify-center mb-8">
          <Link
            href="/booking/tult-dining-hall"
            className="px-8 py-3 border-2 border-primary-orange text-primary-orange rounded-lg font-poppins font-semibold hover:bg-primary-orange hover:text-white transition-colors"
          >
            Choose Location
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </section>
  )
}
