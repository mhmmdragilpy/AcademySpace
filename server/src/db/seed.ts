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
            { name: 'Laboratory', description: 'Computer or science lab' },
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
        const lines = csvContent.trim().split('\n');

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

                const [buildingCode, name, capacityStr] = line.split(';');

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
                    typeName = 'Laboratory';
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
                        `Layout for ${name.trim()}`,
                        imageUrl,
                        `Facility located available for booking.`
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

seedDatabase();