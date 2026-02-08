"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const itemsPerPage = windowWidth < 768 ? 1 : (windowWidth < 1024 ? 2 : 3);
    const totalPages = Math.ceil(slides.length / itemsPerPage);

    // Auto-scroll every 5 seconds if more slides than visible
    useEffect(() => {
        if (slides.length <= itemsPerPage) return;

        const interval = setInterval(() => {
            setCurrentPage(prev => (prev + 1) % totalPages);
        }, 5000);

        return () => clearInterval(interval);
    }, [slides.length, totalPages, itemsPerPage]);

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
    }, [currentPage, totalPages, slides.length, itemsPerPage]);

    const goToPrev = useCallback(() => {
        setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
    }, [totalPages]);

    const goToNext = useCallback(() => {
        setCurrentPage(prev => (prev + 1) % totalPages);
    }, [totalPages]);

    if (isLoading) {
        return (
            <section style={{
                paddingTop: '120px',
                paddingBottom: '3rem',
                background: '#F8FAFC'
            }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{
                                height: '450px',
                                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                borderRadius: '24px'
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
            paddingTop: '120px',
            paddingBottom: '4rem',
            background: '#F8FAFC'
        }}>
            <div className="container" style={{ position: 'relative' }}>
                {/* Slider Header */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 0.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem', color: '#1e293b' }}>
                            ไฮไลท์เด่น <span style={{ color: 'var(--color-primary-blue)' }}>จากธนรินทร์</span>
                        </h2>
                    </div>
                </div>

                {/* Slider Container */}
                <div
                    ref={scrollRef}
                    style={{
                        display: 'flex',
                        gap: '1.5rem',
                        overflowX: 'hidden',
                        scrollBehavior: 'smooth',
                        scrollSnapType: 'x mandatory',
                        padding: '0.5rem'
                    }}
                >
                    {slides.map((slide) => (
                        <div
                            key={slide.id}
                            style={{
                                flex: `0 0 calc(${100 / itemsPerPage}% - ${((itemsPerPage - 1) * 1.5) / itemsPerPage}rem)`,
                                minWidth: `calc(${100 / itemsPerPage}% - ${((itemsPerPage - 1) * 1.5) / itemsPerPage}rem)`,
                                position: 'relative',
                                height: '450px',
                                borderRadius: '28px',
                                overflow: 'hidden',
                                display: 'block',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                scrollSnapAlign: 'start'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-12px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(10, 132, 255, 0.25)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
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
                                transition: 'transform 0.8s ease'
                            }} />

                            {/* Gradient Overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                height: '80%',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)',
                                zIndex: 1
                            }} />

                            {/* Content */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '2.5rem 2rem',
                                zIndex: 10
                            }}>
                                {slide.title && (
                                    <h3 style={{
                                        fontSize: '1.6rem',
                                        fontWeight: 800,
                                        color: 'white',
                                        marginBottom: '0.8rem',
                                        lineHeight: 1.2
                                    }}>
                                        {slide.title}
                                    </h3>
                                )}
                                {slide.subtitle && (
                                    <p style={{
                                        fontSize: '1rem',
                                        color: 'rgba(255,255,255,0.9)',
                                        lineHeight: 1.5,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {slide.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                {slides.length > itemsPerPage && (
                    <>
                        <button
                            onClick={goToPrev}
                            style={{
                                position: 'absolute',
                                left: '-25px',
                                top: '55%',
                                transform: 'translateY(-50%)',
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                                zIndex: 20,
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(10, 132, 255, 0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(-50%)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                            }}
                        >
                            ‹
                        </button>
                        <button
                            onClick={goToNext}
                            style={{
                                position: 'absolute',
                                right: '-25px',
                                top: '55%',
                                transform: 'translateY(-50%)',
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                                zIndex: 20,
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(10, 132, 255, 0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(-50%)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                            }}
                        >
                            ›
                        </button>

                        {/* Page Dots */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '10px',
                            marginTop: '2rem'
                        }}>
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(index)}
                                    style={{
                                        width: index === currentPage ? '32px' : '10px',
                                        height: '10px',
                                        borderRadius: '10px',
                                        background: index === currentPage ? '#0A84FF' : '#CBD5E1',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
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
