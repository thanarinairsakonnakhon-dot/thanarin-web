"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-aurora flex items-center justify-center">Loading...</div>}>
            <ProductsContent />
        </Suspense>
    );
}

function ProductsContent() {
    const { addToCart } = useCart();
    const searchParams = useSearchParams();
    const urlBrand = searchParams.get('brand');

    // Normalize case for matching (e.g. "daikin" -> "Daikin" if possible, or just use as is)
    // The existing brands array is: ['All', 'Daikin', 'Mitsubishi', 'Carrier', 'Haier', 'Samsung', 'Midea', 'LG', 'Panasonic', 'TCL', 'AUX']
    const brands = ['All', 'Daikin', 'Mitsubishi', 'Carrier', 'Haier', 'Samsung', 'Midea', 'LG', 'Panasonic', 'TCL', 'AUX'];

    // Initialize selectedBrand from URL if valid, otherwise 'All'
    // We try to find a case-insensitive match from our known brands list
    const initialBrand = useMemo(() => {
        if (!urlBrand) return 'All';
        const match = brands.find(b => b.toLowerCase() === urlBrand.toLowerCase());
        return match || 'All';
    }, [urlBrand]);

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
    const [selectedType, setSelectedType] = useState<string>('All');
    const [minBtu, setMinBtu] = useState<number>(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Update selectedBrand if URL changes (e.g. nav updates)
    useEffect(() => {
        if (urlBrand) {
            const match = brands.find(b => b.toLowerCase() === urlBrand.toLowerCase());
            if (match) setSelectedBrand(match);
        }
    }, [urlBrand]);

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    const mappedProducts: Product[] = data.map(p => ({
                        id: p.id,
                        name: p.name,
                        brand: p.brand,
                        type: p.type,
                        btu: p.btu,
                        price: p.price,
                        inverter: p.inverter,
                        features: p.features || [],
                        seer: p.seer || 0,
                        image: p.image || p.image_url || '/images/placeholder.png', // Map image or image_url to image
                        stock: p.stock,
                        status: p.status,
                        minStock: p.min_stock || 0,
                        cost: p.cost || 0
                    }));
                    setProducts(mappedProducts);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Filter Logic
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchBrand = selectedBrand === 'All' || p.brand === selectedBrand;
            const matchType = selectedType === 'All' || p.type === selectedType;
            // Allow a small buffer for match, or strict? strictly >= minBtu
            const matchBtu = p.btu >= minBtu;
            return matchBrand && matchType && matchBtu;
        });
    }, [products, selectedBrand, selectedType, minBtu]);

    // Mapping for Category Types to Thai
    const typeMapping: { [key: string]: string } = {
        'All': 'ทั้งหมด',
        'Wall': 'แอร์ติดผนัง (Wall Type)',
        'Cassette': 'แอร์สี่ทิศทาง (Cassette)',
        'Ceiling': 'แอร์แขวน (Ceiling)',
        'Floor': 'แอร์ตั้งพื้น (Floor Standing)',
        'Portable': 'แอร์เคลื่อนที่ (Portable)'
    };

    const types = Object.keys(typeMapping);

    return (
        <main className="bg-aurora" style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '120px', paddingBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', margin: 0 }}>
                        สินค้าทั้งหมด <span style={{ color: 'var(--color-primary-blue)', fontSize: '1.5rem' }}>({filteredProducts.length})</span>
                    </h1>

                    {/* Mobile Filter Toggle */}
                    <button
                        className="mobile-filter-toggle"
                        onClick={() => setIsFilterOpen(true)}
                        style={{
                            display: 'none',
                            alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1.2rem',
                            background: 'white', border: '1px solid #e2e8f0',
                            borderRadius: '50px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            fontWeight: 600, color: '#475569'
                        }}
                    >
                        <span>🔍</span> ตัวกรอง
                    </button>
                </div>

                {/* Mobile Overlay - Moved out of grid */}
                <div
                    className={`filter-overlay ${isFilterOpen ? 'open' : ''}`}
                    onClick={() => setIsFilterOpen(false)}
                ></div>

                <div className="grid-sidebar-layout">

                    {/* Sidebar Filters */}
                    <aside className={`sidebar-filter ${isFilterOpen ? 'open' : ''} card-glass`}>
                        <div className="filter-header" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>🔍 ค้นหาแบบละเอียด</h3>
                            <button onClick={() => setIsFilterOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>

                        <h3 className="desktop-filter-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>🔍 ค้นหาแบบละเอียด</h3>

                        {/* Brand Filter */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem' }}>ยี่ห้อ (Brand)</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {brands.map(brand => (
                                    <label key={brand} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="brand"
                                            checked={selectedBrand === brand}
                                            onChange={() => setSelectedBrand(brand)}
                                            style={{ accentColor: 'var(--color-primary-blue)' }}
                                        />
                                        {brand === 'All' ? 'ทั้งหมด' : brand}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem' }}>ประเภท (Type)</label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            >
                                {types.map(t => <option key={t} value={t}>{typeMapping[t]}</option>)}
                            </select>
                        </div>

                        {/* BTU Filter */}
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.8rem' }}>BTU ขั้นต่ำ</label>
                            <input
                                type="range"
                                min="0" max="36000" step="1000"
                                value={minBtu}
                                onChange={(e) => setMinBtu(parseInt(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--color-primary-blue)' }}
                            />
                            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                {minBtu > 0 ? `> ${minBtu.toLocaleString()} BTU` : 'ทั้งหมด'}
                            </div>
                        </div>

                        <button
                            className="mobile-apply-btn"
                            onClick={() => setIsFilterOpen(false)}
                            style={{
                                display: 'none', width: '100%', marginTop: '2rem',
                                padding: '1rem', background: 'var(--color-primary-blue)', color: 'white',
                                border: 'none', borderRadius: '12px', fontWeight: 600
                            }}
                        >
                            ดูผลลัพธ์ ({filteredProducts.length})
                        </button>
                    </aside>


                    {/* Product Grid */}
                    <div className="product-grid-container">
                        {loading ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
                                <h3>กำลังโหลดข้อมูลสินค้า...</h3>
                                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
                                <h3>ไม่พบสินค้าตามเงื่อนไข</h3>
                                <p>ลองปรับตัวกรองค้นหาดูใหม่นะครับ</p>
                            </div>
                        ) : (

                            filteredProducts.map((p) => (
                                <div key={p.id} className="card-glass product-card-item">
                                    {/* Image Area */}
                                    <div style={{
                                        height: '200px',
                                        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        position: 'relative'
                                    }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/images/placeholder.png';
                                                (e.target as HTMLImageElement).style.opacity = '0.5';
                                            }}
                                        />
                                        {p.inverter && (
                                            <span style={{
                                                position: 'absolute', top: '10px', right: '10px',
                                                background: '#22c55e', color: 'white', padding: '0.2rem 0.8rem',
                                                borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700
                                            }}>INVERTER</span>
                                        )}
                                    </div>

                                    {/* Content Area */}
                                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.2rem' }}>
                                            {p.brand} | {typeMapping[p.type]?.split(' (')[0] || p.type}
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: 1.4, minHeight: '2.8rem' }}>{p.name}</h3>

                                        {/* Features Pucks */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                                            {p.features?.slice(0, 2).map((feat, idx) => (
                                                <span key={idx} style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#64748b' }}>
                                                    {feat}
                                                </span>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.8rem', background: '#eff6ff', color: 'var(--color-primary-blue)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                                {p.btu.toLocaleString()} BTU
                                            </span>
                                            {(p.seer || 0) > 0 && (
                                                <span style={{ fontSize: '0.8rem', background: '#fff7ed', color: 'var(--color-action-orange)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                                    SEER {p.seer}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>ราคาปกติ</div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-blue)' }}>
                                                    ฿{p.price.toLocaleString()}
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        addToCart(p);
                                                    }}
                                                    className="btn-wow"
                                                    style={{
                                                        padding: '0.6rem 0.4rem',
                                                        fontSize: '0.85rem',
                                                        background: 'var(--color-action-orange)',
                                                        boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.2)',
                                                        borderRadius: '10px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '1rem' }}>🛒</span> ลงรถเข็น
                                                </button>
                                                <Link
                                                    href={`/products/${p.id}`}
                                                    className="btn-wow"
                                                    style={{
                                                        padding: '0.6rem 0.4rem',
                                                        fontSize: '0.85rem',
                                                        borderRadius: '10px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    รายละเอียด
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))

                        )}
                    </div>

                </div>
            </div>
            <Footer />
        </main>
    );
}
