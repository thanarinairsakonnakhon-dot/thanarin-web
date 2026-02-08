import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: { id: string };
}

async function getProduct(id: string): Promise<Product | null> {
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !product) {
        return null;
    }

    return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        type: product.type,
        btu: product.btu,
        price: product.price,
        inverter: product.inverter,
        features: product.features || [],
        seer: product.seer || 0,
        image: product.image || product.image_url || '/images/placeholder.png', // Map image/image_url
        // Inventory fields
        stock: product.stock || 0,
        minStock: product.min_stock || 0, // Map min_stock to minStock
        cost: product.cost || 0,
        status: product.status || 'Out of Stock'
    };
}

export default async function ProductDetailPage({ params }: PageProps) {
    const product = await getProduct(params.id);

    if (!product) {
        notFound();
    }

    return <ProductDetailClient product={product} />;
}
