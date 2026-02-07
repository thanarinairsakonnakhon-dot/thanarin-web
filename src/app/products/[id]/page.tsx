import { products } from '@/data/products';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

// This is a Server Component
interface PageProps {
    params: { id: string };
}

// Generate Static Params for all products
export async function generateStaticParams() {
    return products.map((product) => ({
        id: product.id,
    }));
}

export default function ProductDetailPage({ params }: PageProps) {
    const product = products.find((p) => p.id === params.id);

    if (!product) {
        notFound();
    }

    return <ProductDetailClient product={product} />;
}
