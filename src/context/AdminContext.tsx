"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, Booking } from '@/types'; // Import standardized type

type AdminContextType = {
    products: Product[];
    bookings: Booking[];
    addProduct: (product: Product) => Promise<{ success: boolean; error?: string }>;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
    deleteProduct: (id: string) => Promise<void>;
    updateStock: (id: string, qty: number, type: 'IN' | 'OUT', reason: string) => Promise<void>;
    updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
    assignTechnician: (id: string, technician: string) => Promise<void>;
    isLoading: boolean;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Initial Data from Supabase
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await Promise.all([fetchProducts(), fetchBookings()]);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const fetchProducts = async () => {
        try {
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
                        lastUpdate: new Date(p.created_at).toLocaleDateString(),
                        description: p.description || ''
                    };
                });
                setProducts(mappedProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchBookings = async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('date', { ascending: true }) // Upcoming first
                .order('time', { ascending: true });

            if (error) throw error;
            if (data) {
                setBookings(data as Booking[]);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
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
                status: product.status,
                description: product.description
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

    const updateBookingStatus = async (id: string, status: Booking['status']) => {
        try {
            const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
            if (error) throw error;
            fetchBookings();
        } catch (err) {
            console.error('Error updating booking status:', err);
        }
    };

    const assignTechnician = async (id: string, technician: string) => {
        // Note: 'technician' column assumes it exists or we handle it in future
        try {
            // For now, update local state to reflect change immediately in UI if needed
            // await supabase.from('bookings').update({ technician }).eq('id', id);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, technician } as any : b));
        } catch (err) {
            console.error('Error assigning technician:', err);
        }
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
