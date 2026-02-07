"use client";

import { CompareProvider } from '@/context/CompareContext';
import { AuthProvider } from '@/context/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <CompareProvider>
                {children}
            </CompareProvider>
        </AuthProvider>
    );
}
