"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Promotion {
    id: string;
    title: string;
    description: string;
    discount_text: string;
    link_url: string;
}

export default function PromotionBanner() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        loadPromotions();
    }, []);

    useEffect(() => {
        if (promotions.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % promotions.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [promotions.length]);

    const loadPromotions = async () => {
        try {
            const { data } = await supabase
                .from('promotions')
                .select('*')
                .eq('is_active', true)
                .order('display_order');

            if (data && data.length > 0) {
                const now = new Date();
                now.setHours(0, 0, 0, 0);

                const activePromos = data.filter(promo => {
                    const start = promo.start_date ? new Date(promo.start_date) : null;
                    const end = promo.end_date ? new Date(promo.end_date) : null;

                    if (start) start.setHours(0, 0, 0, 0);
                    if (end) end.setHours(23, 59, 59, 999);

                    const isStarted = !start || now >= start;
                    const isNotEnded = !end || now <= end;

                    return isStarted && isNotEnded;
                });

                setPromotions(activePromos);
            }
        } catch (error) {
            console.error('Error loading promotions:', error);
        }
    };

    if (promotions.length === 0) return null;

    // Show only the top 4 active promotions
    const displayPromotions = promotions.slice(0, 4);

    return (
        <section style={{ padding: '4rem 0', background: '#f8fafc' }}>
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.5rem", color: "#1e293b" }}>
                        โปรโมชั่นพิเศษ (Hot Promotions)
                    </h2>
                    <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
                        ดีลดีที่สุดเพื่อคุณ มั่นใจ ชัดเจน เป็นธรรม
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                    justifyContent: 'center'
                }}>
                    {displayPromotions.map((promo) => (
                        <div
                            key={promo.id}
                            className="card-glass"
                            style={{
                                background: 'white',
                                borderRadius: '32px',
                                overflow: 'hidden',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s ease',
                                height: '100%',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                            }}
                        >
                            {/* Card Header (Gradient background like reference) */}
                            <div style={{
                                background: 'linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%)', // Pink gradient for style
                                padding: '1.2rem',
                                textAlign: 'center',
                                color: 'white'
                            }}>
                                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{promo.title}</h4>
                            </div>

                            {/* Card Content */}
                            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1rem' }}>
                                    พิเศษราคา
                                </div>
                                <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 900,
                                    color: '#FF1493', // Deep pink for price focus
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: '4px'
                                }}>
                                    {promo.discount_text && promo.discount_text.replace(/[^\d]/g, '') ? (
                                        <>
                                            {promo.discount_text.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            <span style={{ fontSize: '1.2rem' }}>.-</span>
                                        </>
                                    ) : (
                                        promo.discount_text || 'Hot Deal'
                                    )}
                                </div>

                                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                                    {promo.description}
                                </p>

                                <Link
                                    href={promo.link_url || '/products'}
                                    className="btn-wow"
                                    style={{
                                        marginTop: 'auto',
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '16px',
                                        textDecoration: 'none',
                                        textAlign: 'center',
                                        background: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)',
                                        color: 'white',
                                        display: 'block',
                                        boxShadow: '0 4px 15px rgba(255, 20, 147, 0.3)'
                                    }}
                                >
                                    รายละเอียดเพิ่มเติม →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
