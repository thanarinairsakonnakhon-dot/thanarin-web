"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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
    const [currentPage, setCurrentPage] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

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

    const itemsPerPage = 4;
    const totalPages = Math.ceil(slides.length / itemsPerPage);

    // Auto-scroll every 5 seconds if more than 4 slides
    useEffect(() => {
        if (slides.length <= itemsPerPage) return;

        const interval = setInterval(() => {
            setCurrentPage(prev => (prev + 1) % totalPages);
        }, 5000);

        return () => clearInterval(interval);
    }, [slides.length, totalPages]);

    // Scroll to current page
    useEffect(() => {
        if (scrollRef.current && slides.length > itemsPerPage) {
            const scrollWidth = scrollRef.current.scrollWidth;
            const pageWidth = scrollWidth / totalPages;
            scrollRef.current.scrollTo({
                left: currentPage * pageWidth,
                behavior: 'smooth'
            });
        }
    }, [currentPage, totalPages, slides.length]);

    const goToPrev = useCallback(() => {
        setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
    }, [totalPages]);

    const goToNext = useCallback(() => {
        setCurrentPage(prev => (prev + 1) % totalPages);
    }, [totalPages]);

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
            <div className="container" style={{ position: 'relative' }}>
                {/* Slider Container */}
                <div
                    ref={scrollRef}
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        overflowX: 'hidden',
                        scrollBehavior: 'smooth',
                        scrollSnapType: 'x mandatory'
                    }}
                >
                    {slides.map((slide) => (
                        <Link
                            key={slide.id}
                            href={slide.link_url || '/products'}
                            style={{
                                flex: '0 0 calc(25% - 0.75rem)',
                                minWidth: 'calc(25% - 0.75rem)',
                                position: 'relative',
                                height: '200px',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                display: 'block',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                textDecoration: 'none',
                                scrollSnapAlign: 'start'
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
                                backgroundPosition: 'center'
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

                {/* Navigation Arrows - Show only if more than 4 slides */}
                {slides.length > itemsPerPage && (
                    <>
                        <button
                            onClick={goToPrev}
                            style={{
                                position: 'absolute',
                                left: '-20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.3rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
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
                                right: '-20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.3rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
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

                        {/* Page Dots */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '1rem'
                        }}>
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(index)}
                                    style={{
                                        width: index === currentPage ? '24px' : '8px',
                                        height: '8px',
                                        borderRadius: '10px',
                                        background: index === currentPage ? '#0A84FF' : '#CBD5E1',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
