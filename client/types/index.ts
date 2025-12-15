export type UserRole = 'admin' | 'user' | 'admin_verificator';
export type ApprovalAction = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
export type AuditChange = 'CREATE' | 'UPDATE' | 'DELETE' | 'CANCEL';

export interface User {
    user_id: number;
    email: string;
    full_name: string;
    role: UserRole;
    profile_picture_url?: string | null;
    created_at: string; // Dates are strings in JSON
    last_login_at?: string | null;
}

export interface Building {
    building_id: number;
    name: string;
    code?: string | null;
    location_description?: string | null;
    image_url?: string | null;
    created_at: string;
    updated_at: string;
}

export interface FacilityType {
    type_id: number;
    name: string;
    description?: string | null;
}

export interface Facility {
    facility_id: number;
    type_id: number;
    building_id?: number | null;
    name: string;
    room_number?: string | null;
    capacity?: number | null;
    floor?: number | null;
    description?: string | null;
    layout_description?: string | null;
    photo_url?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Computed/Joined fields often present in responses
    type_name?: string;
    building_name?: string;
    image_url?: string | null;  // Alias for photo_url
    generic_description?: string | null;  // Alias for description
}

export interface Equipment {
    equipment_id: number;
    type_id: number;
    name: string;
    location?: string | null;
    quantity: number;
    description?: string | null;
    photo_url?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ReservationStatus {
    status_id: number;
    name: string;
    description?: string | null;
}

export interface Reservation {
    reservation_id: number;
    requester_id: number;
    status_id: number;
    purpose: string;
    attendees?: number | null;
    is_canceled: boolean;
    created_at: string;
    updated_at: string;

    // Joined fields
    id?: number;
    facility_name?: string;
    facilityName?: string;
    user_name?: string;
    status?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    start_time?: string;
    end_time?: string;
}

export interface ReservationItem {
    item_id: number;
    reservation_id: number;
    facility_id?: number | null;
    equipment_id?: number | null;
    start_datetime: string;
    end_datetime: string;
    created_at: string;
}

export interface ApprovalLog {
    approval_id: number;
    reservation_id: number;
    acted_by: number;
    action: ApprovalAction;
    comment?: string | null;
    acted_at: string;
}

export interface Notification {
    notification_id: number;
    user_id: number;
    reservation_id?: number | null;
    title?: string | null;
    message?: string | null;
    is_read: boolean;
    status_id?: number | null;
    created_at: string;
}

export interface Rating {
    rating_id: number;
    user_id: number;
    facility_id: number;
    reservation_id: number;
    rating: number;
    review?: string | null;
    created_at: string;
}

export type ApiResponse<T> = {
    status: 'success' | 'fail' | 'error';
    data: T;
    message?: string;
}
