import { query } from './index.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
    try {
        logger.info('Starting database seeding...');

        // Clear existing data (using TRUNCATE for cleaner reset)
        logger.info('Clearing existing data...');
        // Cascade to clear dependent tables
        await query('TRUNCATE buildings, facilities, users, facility_types, reservation_statuses, reservations, reservation_items, notifications, ratings, system_tokens RESTART IDENTITY CASCADE;');

        // 1. Insert System Tokens
        logger.info('Seeding system tokens...');
        const adminRegToken = 'ADM-SECRET-TOKEN-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        const resetPassToken = 'RST-SECRET-TOKEN-' + crypto.randomBytes(4).toString('hex').toUpperCase();

        await query(
            `INSERT INTO system_tokens ("key", "value", "description") VALUES ($1, $2, $3), ($4, $5, $6)`,
            [
                'ADMIN_REG_TOKEN', adminRegToken, 'Token for admin registration validation',
                'RESET_PASS_TOKEN', resetPassToken, 'Token for password reset validation'
            ]
        );
        console.log(`Generated ADMIN_REG_TOKEN: ${adminRegToken}`);
        console.log(`Generated RESET_PASS_TOKEN: ${resetPassToken}`);


        // 2. Insert Facility Types
        logger.info('Seeding facility types...');
        const typeMap = new Map<string, number>();
        const types = [
            { name: 'Classroom', description: 'Standard classroom for lectures' },
            { name: 'Auditorium', description: 'Large venue for events and seminars' },
            { name: 'Meeting Room', description: 'Room for meetings and discussions' },
            { name: 'Sports Facility', description: 'Fields and courts for sports activities' },
            { name: 'Outdoor', description: 'Outdoor areas and parks' },
            { name: 'Other', description: 'Other facilities not listed above' }
        ];

        for (const t of types) {
            try {
                const res = await query(
                    'INSERT INTO facility_types (name, description) VALUES ($1, $2) RETURNING type_id',
                    [t.name, t.description]
                );
                typeMap.set(t.name, res.rows[0].type_id);
                console.log(`Inserted type: ${t.name}, ID: ${res.rows[0].type_id}`);
            } catch (e) {
                console.error(`Failed to insert type ${t.name}`, e);
            }
        }

        // 3. Insert Reservation Statuses
        logger.info('Seeding reservation statuses...');
        const statusMap = new Map<string, number>();
        const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELED'];

        for (const s of statuses) {
            const res = await query(
                'INSERT INTO reservation_statuses (name) VALUES ($1) RETURNING status_id',
                [s]
            );
            statusMap.set(s, res.rows[0].status_id);
        }

        // 4. Insert Users
        logger.info('Creating users...');
        const adminPassword = await bcrypt.hash('rahasia', 10);
        await query(
            `INSERT INTO users (full_name, username, password_hash, role) 
             VALUES ($1, $2, $3, $4)`,
            ['Admin User', 'admin', adminPassword, 'admin']
        );

        // Optional standard user for testing
        const userPassword = await bcrypt.hash('user123', 10);
        await query(
            `INSERT INTO users (full_name, username, password_hash, role) 
             VALUES ($1, $2, $3, $4)`,
            ['John Doe', 'john_user', userPassword, 'user']
        );

        // 5. Process CSV, Insert Buildings, then Facilities
        logger.info('Reading CSV and seeding buildings and facilities...');
        const csvPath = path.join(__dirname, 'datagedungruangan.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.trim().split(/\r?\n/);

        if (lines.length > 1) {
            const buildingMap = new Map<string, number>();
            const buildingNames = new Set<string>();

            // First pass: Collect unique building names
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                if (!line) continue;
                const [building] = line.split(';');
                if (building) {
                    buildingNames.add(building.trim());
                }
            }

            // Insert Buildings
            for (const bName of buildingNames) {
                // Try to make a prettier name if it's all caps (simple heuristic)
                const prettyName = bName.replace(/_/g, ' ');
                const res = await query(
                    'INSERT INTO buildings (name, code) VALUES ($1, $2) RETURNING building_id',
                    [prettyName, bName]
                );
                buildingMap.set(bName, res.rows[0].building_id);
                console.log(`Inserted building: ${prettyName} (Code: ${bName})`);
            }

            // Second pass: Insert Facilities
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                if (!line) continue;

                const [buildingCode, name, capacityStr, description] = line.split(';');

                if (!buildingCode || !name || !capacityStr) {
                    continue;
                }

                const capacity = parseInt(capacityStr.trim());
                if (isNaN(capacity)) continue;

                // Determine Type
                let typeName = 'Classroom';
                const lowerName = name.toLowerCase();
                if (lowerName.includes('aula') || lowerName.includes('auditorium') || lowerName.includes('convention') || lowerName.includes('hall')) {
                    typeName = 'Auditorium';
                } else if (lowerName.includes('lapangan') || lowerName.includes('basket') || lowerName.includes('futsal') || lowerName.includes('volley') || lowerName.includes('tennis') || lowerName.includes('skate') || lowerName.includes('sport')) {
                    typeName = 'Sports Facility';
                } else if (lowerName.includes('ruang') || lowerName.includes('rapat') || lowerName.includes('lounge')) {
                    typeName = 'Meeting Room';
                } else if (lowerName.includes('lab') || lowerName.includes('komputer')) {
                    typeName = 'Other'; // Changed from Laboratory to Other
                } else if (lowerName.includes('outdoor') || lowerName.includes('taman') || lowerName.includes('teras')) {
                    typeName = 'Outdoor';
                }

                const typeId = typeMap.get(typeName) || typeMap.get('Classroom');
                const buildingId = buildingMap.get(buildingCode.trim());

                // Room Number Extraction (simple)
                const roomMatch = name.match(/(\d+)/);
                const roomNumber = roomMatch ? roomMatch[0] : null;

                // Image URL
                const imageName = name.trim().replace(/ /g, '_');
                const imageUrl = `/images/rooms/${buildingCode.trim()}/${imageName}.jpg`;

                // Insert Facility
                await query(
                    `INSERT INTO facilities (name, type_id, building_id, room_number, capacity, layout_description, photo_url, description) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        name.trim(),
                        typeId,
                        buildingId,
                        roomNumber,
                        capacity,
                        `Optimized layout for ${typeName} usage`, // Better layout description
                        imageUrl,
                        description ? description.trim() : `Facility located at ${buildingCode.trim()}`
                    ]
                );
            }
        }

        logger.info('Database seeding completed successfully!');

    } catch (error) {
        logger.error('Error during database seeding:', error);
        process.exit(1);
    }
}

function generateDescription(name: string, type: string, capacity: number, buildingCode: string): string {
    const amenities: string[] = [];
    let base = "";
    const lowerName = name.toLowerCase();

    // Building specific context (optional)
    let buildingContext = "";
    if (buildingCode === "TULT") buildingContext = "Located in the iconic TULT tower, offering stunning views and modern infrastructure.";
    else if (buildingCode === "GKU") buildingContext = "Situated in the General Course Building, a central hub for student activities.";
    else if (buildingCode === "SPORT_CENTER") buildingContext = "Part of the comprehensive Sport Center complex.";

    if (type === 'Auditorium' || lowerName.includes('aula') || lowerName.includes('convention') || lowerName.includes('hall')) {
        base = `A prestigious and expansive auditorium designed to host major university events, international conferences, and large-scale ceremonies. The acoustic architecture is world-class, ensuring every word is heard clearly.`;
        amenities.push("professional stage lighting rig", "cinema-grade surround sound system", "plush theater-style seating", "backstage preparation rooms");
    } else if (type === 'Sports Facility' || lowerName.includes('lapangan') || lowerName.includes('basket') || lowerName.includes('futsal') || lowerName.includes('volley') || lowerName.includes('tennis') || lowerName.includes('skate')) {
        const isOutdoor = lowerName.includes('outdoor') || !lowerName.includes('hall') && !lowerName.includes('gedung');
        base = `A premier ${isOutdoor ? 'outdoor' : 'indoor'} sports arena crafted for peak performance. Whether for competitive tournaments or recreational training, this facility offers a professional playing experience.`;
        amenities.push("competition-standard flooring/turf", "digital scoreboards", "dedicated spectator stands", "changing, and locker rooms");
    } else if (type === 'Meeting Room' || lowerName.includes('rapat') || lowerName.includes('vip') || lowerName.includes('lounge')) {
        base = `A sophisticated executive meeting suite designed for privacy, focus, and high-level decision making. The ambiance combines professional elegance with modern comfort.`;
        amenities.push("premium granite conference table", "4K video conferencing system", "ergonomic executive chairs", "sound-proofed walls");
    } else if (lowerName.includes('mulmed') || lowerName.includes('lab') || lowerName.includes('komputer')) {
        base = `A state-of-the-art innovation lab designed for technical mastery and creative production. This workspace is optimized for complex computations, multimedia design, and collaborative research.`;
        amenities.push("high-performance workstations", "gigabit fiber internet", "interactive smart boards", "specialized software suites");
    } else if (type === 'Outdoor' || lowerName.includes('taman') || lowerName.includes('teras') || lowerName.includes('joglo') || lowerName.includes('pendopo')) {
        base = `A tranquil open-air sanctuary that blends academic life with nature. Perfect for informal discussions, creative breakout sessions, or simply recharging in a refreshing environment.`;
        amenities.push("landscaped gardens", "weather-resistant seating", "integrated power outlets for mobile working", "ambient evening lighting");
    } else if (type === 'Classroom' || lowerName.includes('kelas')) {
        base = `A dynamic learning environment designed to facilitate active student engagement and modern pedagogical methods. The layout supports both lecture-style and collaborative group work.`;
        amenities.push("ultra-short-throw projectors", "modular furniture for flexible layouts", "climate control", "high-density Wi-Fi coverage");
    } else {
        base = `A highly versatile multi-purpose facility that adapts to your specific needs. From workshops to administrative functions, this space provides a reliable and comfortable setting.`;
        amenities.push("essential office furniture", "adjustable lighting", "central air conditioning", "whiteboard walls");
    }

    // Add capacity flair
    let capacityText = "";
    if (capacity >= 500) {
        capacityText = " With a massive capacity, it stands as a landmark venue for the entire academic community.";
    } else if (capacity >= 100) {
        capacityText = " Its spacious design comfortably accommodates large lecture cohorts and department-wide gatherings.";
    } else if (capacity >= 40) {
        capacityText = " Ideally sized for standard academic sessions, offering a balance of personal interaction and group energy.";
    } else if (capacity < 20) {
        capacityText = " The intimate setting fosters deep collaboration and focused group dynamics.";
    }

    const fullDesc = `${buildingContext} ${base} ${capacityText} Key features include: ${amenities.join(', ')}.`.trim();
    return fullDesc;
}

seedDatabase();