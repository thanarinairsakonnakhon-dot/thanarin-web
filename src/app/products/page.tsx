"use client";

import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { products } from '@/data/products';
import Link from 'next/link';

export default function ProductsPage() {
    const [selectedBrand, setSelectedBrand] = useState<string>('All');
    const [selectedType, setSelectedType] = useState<string>('All');
    const [minBtu, setMinBtu] = useState<number>(0);

    // Filter Logic
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchBrand = selectedBrand === 'All' || p.brand === selectedBrand;
            const matchType = selectedType === 'All' || p.type === selectedType;
            const matchBtu = p.btu >= minBtu;
            return matchBrand && matchType && matchBtu;
        });
    }, [selectedBrand, selectedType, minBtu]);

    const brands = ['All', 'Daikin', 'Mitsubishi', 'Carrier', 'Haier'];

    // Mapping for Category Types to Thai
    const typeMapping: { [key: string]: string } = {
        'All': 'ทั้งหมด',
        'Wall': 'แอร์ติดผนัง (Wall Type)',
        'Cassette': 'แอร์สี่ทิศทาง (Cassette)',
        'Ceiling': 'แอร์แขวน (Ceiling)',
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
                        {filteredProducts.map((p) => (
                            <div key={p.id} className="card-glass" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                {/* Image Area */}
                                <div style={{
                                    height: '200px',
                                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    {p.inverter && (
                                        <span style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            background: '#22c55e', color: 'white', padding: '0.2rem 0.8rem',
                                            borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700
                                        }}>INVERTER</span>
                                    )}
                                    <span style={{ fontSize: '3rem', opacity: 0.2 }}>❄️</span>
                                </div>

                                {/* Content Area */}
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.2rem' }}>
                                        {p.brand} | {typeMapping[p.type].split(' (')[0]}
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>{p.name}</h3>

                                    {/* Features Pucks */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                                        {p.features.slice(0, 2).map((feat, idx) => (
                                            <span key={idx} style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#64748b' }}>
                                                {feat}
                                            </span>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.8rem', background: '#eff6ff', color: 'var(--color-primary-blue)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                            {p.btu.toLocaleString()} BTU
                                        </span>
                                        <span style={{ fontSize: '0.8rem', background: '#fff7ed', color: 'var(--color-action-orange)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                            SEER {p.seer}
                                        </span>
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
                        ))}

                        {filteredProducts.length === 0 && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
                                <h3>ไม่พบสินค้าตามเงื่อนไข</h3>
                                <p>ลองปรับตัวกรองค้นหาดูใหม่นะครับ</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}
