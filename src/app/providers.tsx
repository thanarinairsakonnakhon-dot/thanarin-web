"use client";

import { CompareProvider } from '@/context/CompareContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <CartProvider>
                <CompareProvider>
                    {children}
                </CompareProvider>
            </CartProvider>
        </AuthProvider>
    );
}
