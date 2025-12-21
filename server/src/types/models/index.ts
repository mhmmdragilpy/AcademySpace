export type UserRole = 'admin' | 'user' | 'admin_verificator';
export type ApprovalAction = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
export type AuditChange = 'CREATE' | 'UPDATE' | 'DELETE' | 'CANCEL';

export interface User {
    user_id: number;
    email: string;
    password_hash: string;
    full_name: string;
    role: UserRole;
    profile_picture_url?: string | null;
    verification_token?: string | null;
    username?: string | null;
    recovery_token?: string | null;
    is_suspended?: boolean;
    created_at: Date;
    last_login_at?: Date | null;
}

export interface Building {
    building_id: number;
    name: string;
    code?: string | null;
    location_description?: string | null;
    image_url?: string | null;
    created_at: Date;
    updated_at: Date;
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
    maintenance_until?: Date | null;
    maintenance_reason?: string | null;
    created_at: Date;
    updated_at: Date;
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
    created_at: Date;
    updated_at: Date;
}

export interface ReservationItem {
    item_id: number;
    reservation_id: number;
    facility_id?: number | null;

    start_datetime: Date;
    end_datetime: Date;
    created_at: Date;
}

export interface ApprovalLog {
    approval_id: number;
    reservation_id: number;
    acted_by: number;
    action: ApprovalAction;
    comment?: string | null;
    acted_at: Date;
}

export interface ReservationAudit {
    audit_id: number;
    reservation_id: number;
    changed_by?: number | null;
    change_type: AuditChange;
    change_data?: any | null; // JSONB
    changed_at: Date;
}

export interface Notification {
    notification_id: number;
    user_id: number;
    reservation_id?: number | null;
    title?: string | null;
    message?: string | null;
    is_read: boolean;
    status_id?: number | null;
    created_at: Date;
}

export interface PasswordResetToken {
    token_id: number;
    user_id: number;
    token: string;
    expires_at?: Date | null;
    used: boolean;
    created_at: Date;
}
export interface Rating {
    rating_id: number;
    user_id: number;
    facility_id: number;
    reservation_id: number;
    rating: number;
    review?: string | null;
    created_at: Date;
}
