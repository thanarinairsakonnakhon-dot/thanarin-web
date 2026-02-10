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
    image_url?: string;
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
                            {/* Card Header (Image or Brand Blue Gradient) */}
                            <div style={{
                                width: '100%',
                                paddingTop: '56.25%', // 16:9 Aspect Ratio (Shorter)
                                background: promo.image_url
                                    ? '#f8fafc'
                                    : 'linear-gradient(135deg, #0A84FF 0%, #0070E0 100%)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {promo.image_url ? (
                                    <img
                                        src={promo.image_url}
                                        alt={promo.title}
                                        style={{
                                            position: 'absolute',
                                            top: 0, left: 0,
                                            width: '100%', height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        padding: '1.5rem',
                                        textAlign: 'center',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.3 }}>{promo.title}</h4>
                                    </div>
                                )}

                                {/* Premium Floating Badge */}
                                {promo.discount_text && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '0.8rem',
                                        left: '0.8rem',
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(8px)',
                                        color: '#0A84FF',
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '8px',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        zIndex: 2,
                                        textTransform: 'uppercase'
                                    }}>
                                        Promotion active
                                    </div>
                                )}
                            </div>

                            {/* Card Content - Compact padding */}
                            <div style={{ padding: '1.25rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <h4 style={{
                                    margin: '0 0 0.8rem 0',
                                    fontSize: '1.15rem',
                                    fontWeight: 800,
                                    color: '#1e293b',
                                    lineHeight: 1.4,
                                    height: '3rem', // Shorter fixed height
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {promo.title}
                                </h4>

                                <div style={{
                                    color: '#94a3b8',
                                    fontSize: '0.7rem',
                                    marginBottom: '0.3rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    ราคาพิเศษเริ่มเพียง
                                </div>

                                <div style={{
                                    fontSize: '2.2rem', // More compact price
                                    fontWeight: 900,
                                    color: '#1e293b',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: '4px',
                                    lineHeight: 1
                                }}>
                                    {promo.discount_text && promo.discount_text.replace(/[^\d]/g, '') ? (
                                        <>
                                            <span style={{ fontSize: '1.1rem', color: '#0A84FF', fontWeight: 800 }}>฿</span>
                                            {promo.discount_text.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>.-</span>
                                        </>
                                    ) : (
                                        <div style={{
                                            padding: '0.3rem 1rem',
                                            background: '#f1f5f9',
                                            borderRadius: '50px',
                                            fontSize: '1rem',
                                            color: '#475569',
                                            fontWeight: 700
                                        }}>
                                            {promo.discount_text || 'Hot Deal'}
                                        </div>
                                    )}
                                </div>

                                <p style={{
                                    color: '#64748b',
                                    fontSize: '0.85rem',
                                    lineHeight: 1.5,
                                    margin: '0 0 1.5rem 0',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2, // 2 lines
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    height: '2.6rem' // Compact height
                                }}>
                                    {promo.description}
                                </p>

                                <Link
                                    href={promo.link_url || '/products'}
                                    className="btn-wow"
                                    style={{
                                        marginTop: 'auto',
                                        width: '100%',
                                        padding: '0.9rem',
                                        borderRadius: '12px',
                                        textDecoration: 'none',
                                        textAlign: 'center',
                                        background: '#0F172A',
                                        color: 'white',
                                        display: 'block',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 10px rgba(15, 23, 42, 0.15)'
                                    }}
                                >
                                    จองรับสิทธิ์เลย →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
