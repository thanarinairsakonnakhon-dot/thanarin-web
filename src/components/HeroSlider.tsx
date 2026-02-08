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
        }, 5000); // Change slide every 5 seconds

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
                height: '70vh',
                minHeight: '500px',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ color: '#64748b' }}>กำลังโหลด...</div>
            </section>
        );
    }

    if (slides.length === 0) {
        return null; // Don't render if no slides
    }

    return (
        <section style={{
            position: 'relative',
            height: '70vh',
            minHeight: '500px',
            maxHeight: '700px',
            overflow: 'hidden'
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
                        transition: 'opacity 0.8s ease-in-out',
                        background: `linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, transparent 100%), url(${slide.image_url}) center/cover no-repeat`,
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{ maxWidth: '600px', color: 'white' }}>
                            {slide.title && (
                                <h2 style={{
                                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                                    fontWeight: 800,
                                    marginBottom: '1rem',
                                    textShadow: '2px 2px 10px rgba(0,0,0,0.3)',
                                    lineHeight: 1.2
                                }}>
                                    {slide.title}
                                </h2>
                            )}
                            {slide.subtitle && (
                                <p style={{
                                    fontSize: '1.2rem',
                                    marginBottom: '2rem',
                                    textShadow: '1px 1px 5px rgba(0,0,0,0.3)',
                                    opacity: 0.95
                                }}>
                                    {slide.subtitle}
                                </p>
                            )}
                            {slide.link_url && slide.button_text && (
                                <Link
                                    href={slide.link_url}
                                    className="btn-wow"
                                    style={{
                                        display: 'inline-block',
                                        padding: '1rem 2.5rem',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {slide.button_text}
                                </Link>
                            )}
                        </div>
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
                            left: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.9)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            zIndex: 20,
                            transition: 'transform 0.2s, background 0.2s'
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
                            right: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.9)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            zIndex: 20,
                            transition: 'transform 0.2s, background 0.2s'
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
                    bottom: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '10px',
                    zIndex: 20
                }}>
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            style={{
                                width: index === currentIndex ? '30px' : '12px',
                                height: '12px',
                                borderRadius: '10px',
                                background: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
