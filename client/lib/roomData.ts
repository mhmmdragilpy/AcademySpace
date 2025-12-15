import { RoomBooking } from "@/components/RoomBookingInterface";

// Parse the CSV data from your file
export const parseRoomDataFromCSV = (csvData: string): RoomBooking[] => {
  const lines = csvData.trim().split('\n');
  // Headers are: Gedung;Nama Ruangan;Kapasitas
  const headers = lines[0].split(';').map(h => h.trim());

  const rooms: RoomBooking[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    const building = values[0]?.trim() || '';
    const roomName = values[1]?.trim() || '';
    const capacityStr = values[2]?.trim() || '';

    // Create RoomBooking object
    const room: RoomBooking = {
      id: i.toString(),
      name: roomName,
      location: building,
      capacity: parseInt(capacityStr) || 0,
      imageSrc: `/images/rooms/${building.toLowerCase().replace(/\s+/g, '_').replace(/\(/g, '_').replace(/\)/g, '_').replace(/[^a-z0-9_]/g, '')}/${roomName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}.jpg`,
      bookings: [] // Initially empty - would be populated from separate booking data
    };

    rooms.push(room);
  }

  return rooms;
};

// Sample CSV data in the format from your file (Gedung;Nama Ruangan;Kapasitas)
export const sampleCSVData = `Gedung;Nama Ruangan;Kapasitas
TULT;TULT Dining Hall;50
Library;Study Room A;10
Academic Block;Lecture Hall B;150
Admin Building;Conference Room C;12
Science Building;Lab Room D;25`;

export const getRoomBookings = (): RoomBooking[] => {
  return parseRoomDataFromCSV(sampleCSVData);
};