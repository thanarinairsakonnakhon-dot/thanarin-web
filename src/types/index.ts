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
    // Inventory fields
    stock: number;
    minStock: number;
    cost: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock' | string; // Allow string for flexibility but prefer specific values
    updatedAt?: string;
    lastUpdate?: string; // For AdminContext compatibility
};

