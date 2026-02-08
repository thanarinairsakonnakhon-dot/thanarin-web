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
        const today = new Date().toISOString().split('T')[0];

        const { data } = await supabase
            .from('promotions')
            .select('*')
            .eq('is_active', true)
            .or(`start_date.is.null,start_date.lte.${today}`)
            .or(`end_date.is.null,end_date.gte.${today}`)
            .order('display_order')
            .limit(5);

        if (data && data.length > 0) {
            setPromotions(data);
        }
    };

    if (promotions.length === 0) return null;

    const current = promotions[currentIndex];

    return (
        <section style={{ padding: '2rem 0' }}>
            <div className="container">
                <div style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
                    borderRadius: '20px',
                    padding: '2rem 3rem',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(251, 191, 36, 0.3)'
                }}>
                    {/* Decorative Elements */}
                    <div style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        fontSize: '8rem',
                        opacity: 0.2
                    }}>🎉</div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            {current.discount_text && (
                                <span style={{
                                    background: '#ef4444',
                                    color: 'white',
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '50px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    display: 'inline-block',
                                    marginBottom: '0.75rem'
                                }}>
                                    🔥 {current.discount_text}
                                </span>
                            )}
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                                {current.title}
                            </h3>
                            {current.description && (
                                <p style={{ color: '#78350f', fontSize: '0.95rem' }}>
                                    {current.description}
                                </p>
                            )}
                        </div>

                        <Link
                            href={current.link_url || '/products'}
                            className="btn-wow"
                            style={{
                                textDecoration: 'none',
                                padding: '1rem 2rem',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            ดูเลย →
                        </Link>
                    </div>

                    {/* Dots Indicator */}
                    {promotions.length > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                            {promotions.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        border: 'none',
                                        background: index === currentIndex ? '#1e293b' : 'rgba(0,0,0,0.2)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
