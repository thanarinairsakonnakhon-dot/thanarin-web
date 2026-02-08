"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types'; // Import standardized type


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
    addProduct: (product: Product) => Promise<{ success: boolean; error?: string }>;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
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
                const mappedProducts: Product[] = data.map(p => {
                    // Logic to ensure robust image handling
                    const officialImage = p.image || '';
                    const fallbackImage = p.image_url || '';
                    const finalImage = officialImage || fallbackImage;

                    return {
                        id: p.id,
                        name: p.name,
                        brand: p.brand,
                        type: p.type,
                        btu: p.btu,
                        price: p.price,
                        inverter: p.inverter,
                        features: p.features || [],
                        seer: p.seer,
                        image: finalImage,
                        image_url: finalImage, // Populate both for compatibility
                        stock: p.stock,
                        minStock: p.min_stock, // Schema: min_stock
                        cost: p.cost,
                        status: p.status as any,
                        lastUpdate: new Date(p.created_at).toLocaleDateString()
                    };
                });
                setProducts(mappedProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Actions
    const addProduct = async (product: Product): Promise<{ success: boolean; error?: string }> => {
        try {
            // Map to DB Schema
            const dbProduct = {
                name: product.name,
                brand: product.brand,
                type: product.type,
                btu: product.btu,
                price: product.price,
                inverter: product.inverter,
                seer: product.seer,
                features: product.features,
                image: product.image, // schema uses image
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
            return { success: true };
        } catch (error: any) {
            console.error('Failed to add product:', error);
            return { success: false, error: error.message || 'Unknown error' };
        }
    };

    const updateProduct = async (id: string, updates: Partial<Product>): Promise<{ success: boolean; error?: string }> => {
        try {
            // Prepare DB updates
            const dbUpdates: any = { ...updates };

            // Ensure features are not lost if empty
            if (updates.features !== undefined) {
                dbUpdates.features = updates.features || [];
            }

            // Map app 'seer' back to DB if present
            if (updates.seer !== undefined) {
                dbUpdates.seer = updates.seer;
            }

            // Remove app-only fields
            delete dbUpdates.lastUpdate;
            delete dbUpdates.image_url; // Don't try to update this non-existent column
            delete dbUpdates.minStock;
            delete dbUpdates.id;

            const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);

            if (error) throw error;

            await fetchProducts();
            return { success: true };
        } catch (error: any) {
            console.error('Update failed:', error);
            return { success: false, error: error.message || 'Unknown error' };
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
