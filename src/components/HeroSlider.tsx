"use client";

import { useState, useEffect, useCallback } from 'react';
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSlides = async () => {
            const { data } = await supabase
                .from('hero_slides')
                .select('*')
                .eq('is_active', true)
                .order('display_order');

            if (data && data.length > 0) {
                setSlides(data);
            }
            setIsLoading(false);
        };

        loadSlides();
    }, []);

    // Auto-play
    useEffect(() => {
        if (slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [slides.length]);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    const goToPrev = useCallback(() => {
        setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % slides.length);
    }, [slides.length]);

    if (isLoading) {
        return (
            <section style={{
                paddingTop: '100px',
                paddingBottom: '2rem',
                background: '#F8FAFC'
            }}>
                <div className="container">
                    <div style={{
                        height: '280px',
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{ color: '#64748b' }}>กำลังโหลด...</div>
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
                    position: 'relative',
                    height: '280px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}>
                    {/* Slides */}
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: index === currentIndex ? 1 : 0,
                                transition: 'opacity 0.6s ease-in-out',
                                display: 'flex',
                                alignItems: 'center'
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
                                zIndex: 0
                            }} />

                            {/* Gradient Overlay */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '60%',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.5) 70%, transparent 100%)',
                                zIndex: 1
                            }} />

                            {/* Content */}
                            <div style={{
                                position: 'relative',
                                zIndex: 10,
                                padding: '2rem 2.5rem',
                                maxWidth: '450px'
                            }}>
                                {slide.title && (
                                    <h2 style={{
                                        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                                        fontWeight: 800,
                                        marginBottom: '0.5rem',
                                        color: 'white',
                                        lineHeight: 1.2
                                    }}>
                                        {slide.title}
                                    </h2>
                                )}
                                {slide.subtitle && (
                                    <p style={{
                                        fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                                        marginBottom: '1rem',
                                        color: 'rgba(255,255,255,0.85)',
                                        lineHeight: 1.5
                                    }}>
                                        {slide.subtitle}
                                    </p>
                                )}
                                {slide.link_url && slide.button_text && (
                                    <Link
                                        href={slide.link_url}
                                        style={{
                                            display: 'inline-block',
                                            padding: '0.6rem 1.5rem',
                                            background: 'linear-gradient(135deg, #0A84FF, #06B6D4)',
                                            color: 'white',
                                            borderRadius: '50px',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            transition: 'transform 0.2s, box-shadow 0.2s'
                                        }}
                                    >
                                        {slide.button_text} →
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Navigation Arrows */}
                    {slides.length > 1 && (
                        <>
                            <button
                                onClick={goToPrev}
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.9)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                                    zIndex: 20,
                                    transition: 'transform 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-50%)';
                                }}
                            >
                                ‹
                            </button>
                            <button
                                onClick={goToNext}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.9)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                                    zIndex: 20,
                                    transition: 'transform 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-50%)';
                                }}
                            >
                                ›
                            </button>
                        </>
                    )}

                    {/* Dots Indicator */}
                    {slides.length > 1 && (
                        <div style={{
                            position: 'absolute',
                            bottom: '15px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '8px',
                            zIndex: 20
                        }}>
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    style={{
                                        width: index === currentIndex ? '24px' : '8px',
                                        height: '8px',
                                        borderRadius: '10px',
                                        background: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
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
