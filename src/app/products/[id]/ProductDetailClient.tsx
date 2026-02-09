"use client";

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useCompare } from '@/context/CompareContext';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface ProductDetailClientProps {
    product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
    const { addToCompare, isInCompare, removeFromCompare } = useCompare();
    const { user } = useAuth();
    const router = useRouter();
    const isSelected = isInCompare(product.id);

    const handleBookNow = () => {
        const bookingUrl = `/booking?service=installation&model=${encodeURIComponent(`${product.brand} - ${product.name}`)}`;
        if (user) {
            router.push(bookingUrl);
        } else {
            router.push(`/login?redirect=${encodeURIComponent(bookingUrl)}`);
        }
    };

    return (
        <main className="bg-aurora" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            <Navbar />

            {/* Breadcrumb Area */}
            <div className="container" style={{ paddingTop: '100px', marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-sub)' }}>
                    <Link href="/products" style={{ textDecoration: 'none', color: 'inherit' }}>สินค้าทั้งหมด</Link>
                    {' > '}
                    <span style={{ color: 'var(--color-primary-blue)', fontWeight: 600 }}>{product.brand}</span>
                    {' > '}
                    {product.name}
                </div>
            </div>

            <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>

                {/* Left: Image Gallery */}
                <div className="card-glass animate-float" style={{
                    padding: '0',
                    overflow: 'hidden',
                    background: 'white',
                    position: 'sticky',
                    top: '120px'
                }}>
                    <div style={{
                        height: '400px',
                        background: 'radial-gradient(circle at center, #f8fafc 0%, #e2e8f0 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2rem' }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.setAttribute('style', 'display: flex');
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: '6rem', opacity: 0.2 }}>❄️</span>
                        )}
                        {/* Fallback placeholder if image fails or is missing */}
                        <span style={{ fontSize: '6rem', opacity: 0.2, display: product.image ? 'none' : 'block', position: 'absolute' }}>❄️</span>

                        {product.inverter && (
                            <div style={{
                                position: 'absolute', top: '20px', left: '20px',
                                background: '#22c55e', color: 'white',
                                padding: '0.5rem 1rem', borderRadius: '50px',
                                fontWeight: 700
                            }}>
                                INVERTER SYSTEM
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Product Info */}
                <div className="reveal">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <span style={{
                            background: '#eff6ff', color: 'var(--color-primary-blue)',
                            padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem'
                        }}>
                            {product.brand}
                        </span>
                        <span style={{
                            background: '#f1f5f9', color: 'var(--color-text-sub)',
                            padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem'
                        }}>
                            {product.type}
                        </span>
                    </div>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
                        {product.name}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '2rem' }}>
                        <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                            ฿{product.price.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '1.2rem', color: 'var(--color-text-sub)' }}>
                            (รวมติดตั้งฟรี)
                        </span>
                    </div>

                    {/* Key Specs Grid */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem'
                    }}>
                        <div style={{ background: 'rgba(255,255,255,0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>ขนาดทำความเย็น</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{product.btu.toLocaleString()} <span style={{ fontSize: '1rem' }}>BTU</span></div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>ประสิทธิภาพ (SEER)</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#22c55e' }}>{product.seer}</div>
                        </div>
                    </div>

                    {/* Description Section */}
                    {product.description && (
                        <div style={{ marginBottom: '3rem', color: '#475569', lineHeight: 1.8 }}>
                            {(() => {
                                const lines = product.description.split('\n');
                                const elements = [];
                                let currentList: string[] = [];

                                lines.forEach((line, index) => {
                                    const trimmed = line.trim();
                                    if (!trimmed) return;

                                    if (trimmed.startsWith('•')) {
                                        currentList.push(trimmed.substring(1).trim());
                                    } else {
                                        if (currentList.length > 0) {
                                            elements.push(
                                                <ul key={`list-${index}`} style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                                                    {currentList.map((item, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>)}
                                                </ul>
                                            );
                                            currentList = [];
                                        }
                                        elements.push(
                                            <div key={`text-${index}`} style={{
                                                marginTop: '1.5rem', marginBottom: '0.8rem',
                                                color: '#1e293b',
                                                // If it's short, look like header, otherwise paragraph
                                                fontSize: trimmed.length < 50 ? '1.1rem' : '1rem',
                                                fontWeight: trimmed.length < 50 ? 600 : 400
                                            }}>
                                                {trimmed}
                                            </div>
                                        );
                                    }
                                });

                                if (currentList.length > 0) {
                                    elements.push(
                                        <ul key={`list-last`} style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                                            {currentList.map((item, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>)}
                                        </ul>
                                    );
                                }

                                return elements;
                            })()}
                        </div>
                    )}

                    {/* Features List */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>คุณสมบัติเด่น</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {product.features.map((feature: string, index: number) => (
                                <li key={index} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.8rem',
                                    marginBottom: '0.8rem', fontSize: '1.1rem'
                                }}>
                                    <span style={{
                                        width: '24px', height: '24px', background: '#dbeafe',
                                        borderRadius: '50%', color: 'var(--color-primary-blue)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                    }}>✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handleBookNow}
                                className="btn-wow"
                                style={{ flex: 2, textAlign: 'center', fontSize: '1.2rem', padding: '1rem', cursor: 'pointer', border: 'none' }}
                            >
                                จองคิวติดตั้งแอร์รุ่นนี้ 📅
                            </button>
                            <button
                                className="btn"
                                onClick={() => isSelected ? removeFromCompare(product.id) : addToCompare(product)}
                                style={{
                                    flex: 1, border: '2px solid',
                                    borderColor: isSelected ? 'var(--color-primary-blue)' : '#e2e8f0',
                                    borderRadius: '99px',
                                    background: isSelected ? '#eff6ff' : 'white',
                                    color: isSelected ? 'var(--color-primary-blue)' : 'inherit',
                                    fontWeight: 600, fontSize: '1.1rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {isSelected ? '✓ เลือกแล้ว' : '+ เปรียบเทียบ'}
                            </button>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
                            *ยังไม่รวมลูกค้าเก่าที่มีส่วนลด
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </main>
    );
}
