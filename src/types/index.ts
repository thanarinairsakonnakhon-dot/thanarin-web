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
    stock?: number;
    status?: string;
    minStock?: number;
    cost?: number;
    updatedAt?: string;
};
