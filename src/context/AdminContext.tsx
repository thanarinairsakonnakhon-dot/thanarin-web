"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

// Define Types
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
    // Inventory fields
    stock: number;
    minStock: number;
    cost: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    lastUpdate?: string;
};

export type Booking = {
    id: string;
    customer: string;
    phone: string;
    service: string;
    date: string;
    time: string;
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
    technician: string;
};

type AdminContextType = {
    products: Product[];
    bookings: Booking[];
    addProduct: (product: Product) => Promise<void>;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    updateStock: (id: string, qty: number, type: 'IN' | 'OUT', reason: string) => Promise<void>;
    updateBookingStatus: (id: string, status: Booking['status']) => void;
    assignTechnician: (id: string, technician: string) => void;
    isLoading: boolean;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Initial Data from Supabase
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // Map DB snake_case to app camelCase if needed, or adjust types. 
                // For simplicity, assuming direct mapping or keeping field names consistent.
                // Note: The schema uses snake_case keys (min_stock) but type uses camelCase (minStock).
                // We need to map them.
                const mappedProducts: Product[] = data.map(p => ({
                    id: p.id,
                    name: p.name,
                    brand: p.brand,
                    type: p.type,
                    btu: p.btu,
                    price: p.price,
                    inverter: p.inverter,
                    features: p.features || [],
                    seer: p.seer,
                    image: p.image_url || '', // Schema is image_url
                    stock: p.stock,
                    minStock: p.min_stock, // Schema: min_stock
                    cost: p.cost,
                    status: p.status as any, // Cast status
                    lastUpdate: new Date(p.created_at).toLocaleDateString()
                }));
                setProducts(mappedProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Actions
    const addProduct = async (product: Product) => {
        try {
            // Map to DB Schema
            const dbProduct = {
                name: product.name,
                brand: product.brand,
                type: product.type,
                btu: product.btu,
                price: product.price,
                inverter: product.inverter,
                features: product.features,
                image: product.image,
                stock: product.stock,
                min_stock: product.minStock,
                cost: product.cost,
                status: product.status
            };

            const { data, error } = await supabase.from('products').insert([dbProduct]).select();

            if (error) throw error;
            if (data) {
                await fetchProducts(); // Refresh list
            }
        } catch (error) {
            alert('Failed to add product: ' + (error as Error).message);
        }
    };

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        try {
            // Prepare DB updates
            const dbUpdates: any = { ...updates };
            if (updates.image) {
                dbUpdates.image = updates.image;
            }
            if (updates.minStock !== undefined) {
                dbUpdates.min_stock = updates.minStock;
                delete dbUpdates.minStock;
            }
            if (updates.price !== undefined) {
                dbUpdates.cost = Math.round(updates.price * 0.7);
            }

            const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
            if (error) throw error;

            await fetchProducts();
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;

            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const updateStock = async (id: string, qty: number, type: 'IN' | 'OUT', reason: string) => {
        // Optimistic update first (for UI speed)
        const product = products.find(p => p.id === id);
        if (!product) return;

        const newStock = type === 'IN' ? product.stock + qty : Math.max(0, product.stock - qty);
        let newStatus = 'In Stock';
        if (newStock === 0) newStatus = 'Out of Stock';
        else if (newStock <= product.minStock) newStatus = 'Low Stock';

        // Update in DB
        await updateProduct(id, { stock: newStock, status: newStatus as any });
    };

    const updateBookingStatus = (id: string, status: Booking['status']) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    };

    const assignTechnician = (id: string, technician: string) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, technician } : b));
    };

    return (
        <AdminContext.Provider value={{
            products,
            bookings,
            addProduct,
            updateProduct,
            deleteProduct,
            updateStock,
            updateBookingStatus,
            assignTechnician,
            isLoading
        }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}
