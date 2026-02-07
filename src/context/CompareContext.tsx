"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/data/products';

interface CompareContextType {
    selectedProducts: Product[];
    addToCompare: (product: Product) => void;
    removeFromCompare: (productId: string) => void;
    isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

    const addToCompare = (product: Product) => {
        if (selectedProducts.length >= 3) {
            alert("เปรียบเทียบได้สูงสุด 3 รุ่นครับ");
            return;
        }
        if (!selectedProducts.find(p => p.id === product.id)) {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    const removeFromCompare = (productId: string) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    };

    const isInCompare = (productId: string) => {
        return selectedProducts.some(p => p.id === productId);
    };

    return (
        <CompareContext.Provider value={{ selectedProducts, addToCompare, removeFromCompare, isInCompare }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
}
