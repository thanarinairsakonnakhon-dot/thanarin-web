"use client";

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBrand, setSelectedBrand] = useState<string>('All');
    const [selectedType, setSelectedType] = useState<string>('All');
    const [minBtu, setMinBtu] = useState<number>(0);

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
                        image: p.image_url || '/images/placeholder.png', // Map image_url to image
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
            const matchBtu = p.btu >= minBtu;
            return matchBrand && matchType && matchBtu;
        });
    }, [products, selectedBrand, selectedType, minBtu]);

    const brands = ['All', 'Daikin', 'Mitsubishi', 'Carrier', 'Haier', 'Samsung', 'Midea', 'LG', 'Panasonic', 'TCL', 'AUX'];

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
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                    สินค้าทั้งหมด <span style={{ color: 'var(--color-primary-blue)' }}>({filteredProducts.length})</span>
                </h1>

                <div className="grid-sidebar-layout">

                    {/* Sidebar Filters */}
                    <aside className="card-glass" style={{ padding: '2rem', position: 'sticky', top: '120px' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>🔍 ค้นหาแบบละเอียด</h3>

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
                    </aside>

                    {/* Product Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
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
                                <div key={p.id} className="card-glass" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
                                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.2rem' }}>
                                            {p.brand} | {typeMapping[p.type]?.split(' (')[0] || p.type}
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>{p.name}</h3>

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

                                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                                                ฿{p.price.toLocaleString()}
                                            </div>
                                            <Link href={`/products/${p.id}`} className="btn-wow" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                                ดูรายละเอียด
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}
