import { notFound } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { RoomAvailabilityContent } from './RoomAvailabilityContent';

// Function to get room details from API
const getRoomDetails = async (slug: string) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    // We have to fetch all and filter because backend doesn't support slug lookup yet
    // In production, we should add a specific endpoint for this
    const res = await fetch(`${apiUrl}/facilities`, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error('Failed to fetch facilities');
    }

    const responseData = await res.json();
    const facilities = responseData.data || [];

    const room = facilities.find((f: any) => {
      const fSlug = f.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return fSlug === slug;
    });

    if (room) {
      return {
        id: room.id,
        name: room.name,
        building: room.building,
        capacity: room.capacity,
        description: room.description || `Facility located in ${room.building}`,
        // Add other fields if RoomAvailabilityContent needs them, e.g. image
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching room details:", error);
    return null;
  }
};

export default async function RoomAvailabilityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const roomDetails = await getRoomDetails(slug);

  if (!roomDetails) {
    notFound();
  }

  return (
    <>
      <Navigation />
      <RoomAvailabilityContent roomDetails={roomDetails} />
      <Footer />
    </>
  );
}