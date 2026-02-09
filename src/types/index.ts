// Define standardized Product type
export type Product = {
    id: string;
    name: string;
    brand: string;
    type: string;
    btu: number;
    price: number;
    inverter: boolean;
    features: string[];
    seer: number;
    image: string;
    image_url?: string; // For compatibility
    description?: string; // Detailed description
    // Inventory fields
    stock: number;
    minStock: number;
    cost: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock' | string; // Allow string for flexibility but prefer specific values
    updatedAt?: string;
    lastUpdate?: string; // For AdminContext compatibility
};

export type Booking = {
    id: string;
    service_type: string;
    date: string;
    time: string;
    customer_name: string;
    customer_phone: string;
    address_details: {
        houseNo: string;
        village?: string;
        subdistrict: string;
        district: string;
        province: string;
        lat?: number | null;
        lng?: number | null;
    };
    location_lat?: number;
    location_lng?: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    technician?: string;
    order_id?: string;
    admin_notes?: string;
    created_at?: string;
};
