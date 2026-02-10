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

    useEffect(() => {
        loadPromotions();
    }, []);

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
        <section style={{ padding: '4rem 0', background: 'white' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                    <h2 style={{ fontSize: "2.8rem", fontWeight: 900, marginBottom: "0.8rem", color: "#1e293b", letterSpacing: '-1px' }}>
                        โปรโมชั่นพิเศษ <span style={{ color: '#0A84FF' }}>Hot Deals</span>
                    </h2>
                    <p style={{ color: "#64748b", fontSize: "1.2rem", fontWeight: 500 }}>
                        ดีลสุดคุ้ม ประจำเดือนนี้ มั่นใจ ชัดเจน เป็นธรรม
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '2rem',
                    justifyContent: 'center',
                    maxWidth: displayPromotions.length === 1 ? '400px' : (displayPromotions.length === 2 ? '800px' : '100%'),
                    margin: '0 auto'
                }}>
                    {displayPromotions.map((promo) => (
                        <div
                            key={promo.id}
                            className="card-glass"
                            style={{
                                background: 'white',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                height: '100%',
                                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(10, 132, 255, 0.15)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.05)';
                            }}
                        >
                            {/* Card Header (Brand Blue Gradient) */}
                            <div style={{
                                background: 'linear-gradient(135deg, #0A84FF 0%, #0070E0 100%)',
                                padding: '1.5rem',
                                textAlign: 'center',
                                color: 'white'
                            }}>
                                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{promo.title}</h4>
                            </div>

                            {/* Card Content */}
                            <div style={{ padding: '2.5rem 2rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    พิเศษเพียง
                                </div>
                                <div style={{
                                    fontSize: '3rem',
                                    fontWeight: 900,
                                    color: '#1e293b',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: '2px',
                                    lineHeight: 1
                                }}>
                                    {promo.discount_text && promo.discount_text.replace(/[^\d]/g, '') ? (
                                        <>
                                            <span style={{ fontSize: '1.5rem', color: '#0A84FF' }}>฿</span>
                                            {promo.discount_text.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>.-</span>
                                        </>
                                    ) : (
                                        <span style={{ fontSize: '2rem', color: '#0A84FF' }}>{promo.discount_text || 'Hot Deal'}</span>
                                    )}
                                </div>

                                <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                                    {promo.description}
                                </p>

                                <Link
                                    href={promo.link_url || '/products'}
                                    className="btn-wow"
                                    style={{
                                        marginTop: 'auto',
                                        width: '100%',
                                        padding: '1.1rem',
                                        borderRadius: '16px',
                                        textDecoration: 'none',
                                        textAlign: 'center',
                                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                        color: 'white',
                                        display: 'block',
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    คลิกดูรายละเอียด →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
