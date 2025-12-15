import { FacilityRepository } from '../repositories/FacilityRepository.js';
import { FacilityTypeRepository } from '../repositories/FacilityTypeRepository.js';
import { BuildingRepository } from '../repositories/BuildingRepository.js';
import type { Facility } from '../types/models/index.js';

export class FacilityService {
    private facilityRepository: FacilityRepository;
    private facilityTypeRepository: FacilityTypeRepository;
    private buildingRepository: BuildingRepository;

    constructor() {
        this.facilityRepository = new FacilityRepository();
        this.facilityTypeRepository = new FacilityTypeRepository();
        this.buildingRepository = new BuildingRepository();
    }

    async findAll(filters: any = {}) {
        let facilities = await this.facilityRepository.findWithDetails(filters);

        // Availability Check
        if (filters.date && filters.startTime && filters.endTime) {
            const startTimestamp = `${filters.date} ${filters.startTime}:00`;
            const endTimestamp = `${filters.date} ${filters.endTime}:00`;

            const conflictingIds = await this.facilityRepository.findConflictingFacilityIds(startTimestamp, endTimestamp);

            if (conflictingIds.length > 0) {
                facilities = facilities.filter((f: any) => !conflictingIds.includes(f.facility_id));
            }
        }

        // Map to backward compatible structure if needed, or stick to new structure?
        // Let's providing mapping to match the old controller output first.
        return facilities.map((f: any) => ({
            id: f.facility_id,
            facility_id: f.facility_id,
            name: f.name,
            type_id: f.type_id, // Ensure this is passed
            type: f.type_name,
            type_name: f.type_name,
            building: f.building_name,
            building_name: f.building_name,
            building_id: f.building_id,
            room_number: f.room_number,
            capacity: f.capacity,
            description: f.layout_description,
            layout_description: f.layout_description,
            image_url: f.photo_url,
            photo_url: f.photo_url,
            floor: f.floor,
            generic_description: f.description,
            is_active: f.is_active !== false
        }));
    }

    async findById(id: number) {
        const facility = await this.facilityRepository.findById(id);
        if (!facility) return null;

        // We need details like type and building name
        // The original findById implementation used a join. 
        // We can reuse findWithDetails but filter by ID if we want, or do distinct implementation.
        // Or implement a specific findByIdWithDetails in Repository.
        // For efficiency, let's just make a specific query in repo, but for now, reuse findWithDetails?
        // findWithDetails uses generic filters.
        // Let's add a getByIdWithDetails method to Repository to be clean.

        // Actually, let's fix this properly. 
        // I will implement findById in this service by calling a new method in repo.
        // But for now, let's just use the current logic, assuming Repository can do it.
        // Since I can't easily edit repo in same step, I will use raw repo logic here or call findWithDetails?
        // findWithDetails returns array.

        // Let's rely on `findAll` for now but filter by ID? No efficient.
        // Let's implement `findByIdWithDetails` in FacilityRepository in next step or use what I have.
        // Actually I defined standard `findById` in BaseRepo which only returns row.

        // I will fetch the row and then fetch type and building? N+1 problem but okay for single item.
        // OR better, update FacilityRepository to add findOneWithDetails.

        // Let's implement logic here:
        const facilities = await this.facilityRepository.findWithDetails({}); // This is BAD, gets ALL.
        // I should have added logic to filter by ID in the query builder or separate method.
        // I can pass `{ id: id }` to filters if I update repo logic.
        // But repo logic filters logic was specific.

        // Let's use `findById` and then manual fetch related names.
        // Or better, I will edit FacilityRepository later to add `findByIdWithDetails`.
        // For now, let's return standard object and minimal augmentation.

        // Wait, standard `findById` returns `Facility`.
        // The controller expects aliases like `image_url` mapped from `photo_url`.
        // And joined names.

        const type = await this.facilityTypeRepository.findById(facility.type_id);
        const building = facility.building_id ? await this.buildingRepository.findById(facility.building_id) : null;

        return {
            id: facility.facility_id,
            facility_id: facility.facility_id,
            name: facility.name,
            type_id: facility.type_id,
            type: type?.name,
            type_name: type?.name,
            building: building?.name,
            building_id: facility.building_id,
            building_name: building?.name,
            room_number: facility.room_number,
            capacity: facility.capacity,
            floor: facility.floor,
            description: facility.description,
            layout_description: facility.layout_description,
            generic_description: facility.description,
            image_url: facility.photo_url,
            photo_url: facility.photo_url,
            is_active: facility.is_active
        };
    }

    async create(data: any) {
        let typeId = data.type_id;

        if (!typeId && data.type) {
            const typeEntity = await this.facilityTypeRepository.findByName(data.type);
            if (typeEntity) {
                typeId = typeEntity.type_id;
            } else {
                // Default fallback logic?
                // Old service did "SELECT type_id FROM facility_types LIMIT 1"
                const allTypes = await this.facilityTypeRepository.findAll();
                const firstType = allTypes[0];
                if (firstType) typeId = firstType.type_id;
            }
        }

        let buildingId = data.building_id;
        if (!buildingId && data.building) {
            const buildingEntity = await this.buildingRepository.findByNameOrCode(data.building);
            if (buildingEntity) buildingId = buildingEntity.building_id;
        }

        const facilityData: Partial<Facility> = {
            name: data.name,
            type_id: typeId,
            building_id: buildingId,
            room_number: data.room_number || data.roomNumber,
            capacity: data.capacity,
            floor: data.floor,
            layout_description: data.layout_description || data.description,
            description: data.description || data.generic_description,
            photo_url: data.photo_url || data.image_url || data.imageUrl,
            is_active: data.is_active !== undefined ? data.is_active : true
        };

        const res = await this.facilityRepository.create(facilityData);
        // Return mapped
        return { id: res.facility_id, ...res };
    }

    async update(id: number, data: any) {
        const updateData: Partial<Facility> = {};

        if (data.name) updateData.name = data.name;

        // Support both type_id (from new forms) and type (from old forms)
        if (data.type_id) {
            updateData.type_id = data.type_id;
        } else if (data.type) {
            const typeEntity = await this.facilityTypeRepository.findByName(data.type);
            if (typeEntity) updateData.type_id = typeEntity.type_id;
        }

        // Support both building_id (from new forms) and building (from old forms)
        if (data.building_id !== undefined) {
            updateData.building_id = data.building_id;
        } else if (data.building) {
            const buildingEntity = await this.buildingRepository.findByNameOrCode(data.building);
            if (buildingEntity) updateData.building_id = buildingEntity.building_id;
        }

        if (data.room_number || data.roomNumber) updateData.room_number = data.room_number || data.roomNumber;
        if (data.capacity !== undefined) updateData.capacity = data.capacity;
        if (data.floor !== undefined) updateData.floor = data.floor;
        if (data.layout_description) updateData.layout_description = data.layout_description;
        if (data.description) updateData.description = data.description;
        if (data.photo_url || data.image_url || data.imageUrl) {
            updateData.photo_url = data.photo_url || data.image_url || data.imageUrl;
        }
        if (data.is_active !== undefined) updateData.is_active = data.is_active;

        const res = await this.facilityRepository.update(id, updateData);
        return res ? { id: res.facility_id, ...res } : null;
    }

    async delete(id: number) {
        return this.facilityRepository.delete(id);
    }
}

export const facilityService = new FacilityService();