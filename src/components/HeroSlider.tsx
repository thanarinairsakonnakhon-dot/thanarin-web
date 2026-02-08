"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Slide {
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
    link_url: string;
    button_text: string;
}

export default function HeroSlider() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSlides = async () => {
            const { data } = await supabase
                .from('hero_slides')
                .select('*')
                .eq('is_active', true)
                .order('display_order')
                .limit(4); // Only show 4 slides

            if (data && data.length > 0) {
                setSlides(data);
            }
            setIsLoading(false);
        };

        loadSlides();
    }, []);

    if (isLoading) {
        return (
            <section style={{
                paddingTop: '100px',
                paddingBottom: '2rem',
                background: '#F8FAFC'
            }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '1rem'
                    }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{
                                height: '200px',
                                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                borderRadius: '16px'
                            }} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (slides.length === 0) {
        return null;
    }

    return (
        <section style={{
            paddingTop: '100px',
            paddingBottom: '2rem',
            background: '#F8FAFC'
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem'
                }}>
                    {slides.map((slide) => (
                        <Link
                            key={slide.id}
                            href={slide.link_url || '/products'}
                            style={{
                                position: 'relative',
                                height: '200px',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                display: 'block',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                textDecoration: 'none'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                            }}
                        >
                            {/* Background Image */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(${slide.image_url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                transition: 'transform 0.3s'
                            }} />

                            {/* Gradient Overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                height: '70%',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                                zIndex: 1
                            }} />

                            {/* Content */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '1rem',
                                zIndex: 10
                            }}>
                                {slide.title && (
                                    <h3 style={{
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        color: 'white',
                                        marginBottom: '0.3rem',
                                        lineHeight: 1.3
                                    }}>
                                        {slide.title}
                                    </h3>
                                )}
                                {slide.subtitle && (
                                    <p style={{
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.8)',
                                        lineHeight: 1.4,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {slide.subtitle}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Responsive Styles */}
            <style jsx>{`
                @media (max-width: 1024px) {
                    .container > div {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 600px) {
                    .container > div {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    );
}
