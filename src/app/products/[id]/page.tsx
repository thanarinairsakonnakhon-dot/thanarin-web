import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

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
        image: product.image_url || '/images/placeholder.png', // Map image_url
        stock: product.stock,
        status: product.status
    };
}

export default async function ProductDetailPage({ params }: PageProps) {
    const product = await getProduct(params.id);

    if (!product) {
        notFound();
    }

    return <ProductDetailClient product={product} />;
}
