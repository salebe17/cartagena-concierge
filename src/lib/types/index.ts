export type ActionResponse<T = null> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};

export interface Property {
    id: string;
    owner_id: string;
    title: string;
    address: string;
    image_url?: string;
    status: 'vacant' | 'occupied';
    ical_url?: string;
    bedrooms?: number;
    bathrooms?: number;
    size_sqm?: number;
    created_at: string;
}

export type ServiceType = 'cleaning' | 'maintenance' | 'concierge';
export type ServiceStatus = 'pending' | 'confirmed' | 'completed';

export interface ServiceRequest {
    id: string;
    property_id: string;
    service_type: ServiceType;
    notes?: string;
    requested_date?: string;
    status: ServiceStatus;
    assigned_staff_id?: string;
    created_at: string;
    properties?: Pick<Property, 'title' | 'address' | 'owner_id' | 'id'>;
    service_logs?: {
        id: string;
        started_at: string;
        ended_at?: string;
        staff_name?: string;
        notes?: string;
        start_photos?: string[];
        end_photos?: string[];
    }[];
}

export interface UserProfile {
    id: string;
    role: 'user' | 'admin' | 'driver';
    full_name?: string;
    phone?: string;
    avatar_url?: string;
}
