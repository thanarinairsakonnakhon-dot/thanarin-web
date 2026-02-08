"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 900);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <header
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
                {/* Logo Area */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <Image
                        src="/logo.png"
                        alt="Thanarin Air"
                        width={120}
                        height={40}
                        style={{ objectFit: 'contain' }}
                        priority
                    />
                </Link>

                {/* Desktop Menu - Hidden on mobile */}
                {!isMobile && (
                    <>
                        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <Link href="/" style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>หน้าแรก</Link>
                            <Link href="/products" style={{ fontWeight: 500, color: 'var(--color-text-sub)' }}>สินค้า</Link>
                            <Link href="/services" style={{ fontWeight: 500, color: 'var(--color-text-sub)' }}>บริการติดตั้ง</Link>
                            <Link href="/about" style={{ fontWeight: 500, color: 'var(--color-text-sub)' }}>ผลงาน</Link>
                        </nav>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Link href="/booking" className="btn-wow" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
                                จองคิวช่าง
                            </Link>
                        </div>
                    </>
                )}

                {/* Mobile Hamburger Button */}
                {isMobile && (
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px',
                            zIndex: 1001
                        }}
                    >
                        <span style={{
                            width: '24px',
                            height: '3px',
                            background: '#1e293b',
                            borderRadius: '2px',
                            transition: 'all 0.3s',
                            transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
                        }}></span>
                        <span style={{
                            width: '24px',
                            height: '3px',
                            background: '#1e293b',
                            borderRadius: '2px',
                            transition: 'all 0.3s',
                            opacity: isMenuOpen ? 0 : 1
                        }}></span>
                        <span style={{
                            width: '24px',
                            height: '3px',
                            background: '#1e293b',
                            borderRadius: '2px',
                            transition: 'all 0.3s',
                            transform: isMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
                        }}></span>
                    </button>
                )}
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobile && (
                <div
                    style={{
                        position: 'absolute',
                        top: '70px',
                        left: 0,
                        right: 0,
                        background: 'white',
                        borderBottom: isMenuOpen ? '1px solid #e2e8f0' : 'none',
                        boxShadow: isMenuOpen ? '0 10px 20px rgba(0,0,0,0.1)' : 'none',
                        padding: isMenuOpen ? '1rem' : '0',
                        maxHeight: isMenuOpen ? '400px' : '0',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        opacity: isMenuOpen ? 1 : 0
                    }}
                >
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Link
                            href="/"
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                padding: '1rem',
                                fontWeight: 500,
                                color: 'var(--color-text-main)',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                textDecoration: 'none'
                            }}
                        >
                            🏠 หน้าแรก
                        </Link>
                        <Link
                            href="/products"
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                padding: '1rem',
                                fontWeight: 500,
                                color: 'var(--color-text-sub)',
                                borderRadius: '8px',
                                textDecoration: 'none'
                            }}
                        >
                            ❄️ สินค้า
                        </Link>
                        <Link
                            href="/services"
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                padding: '1rem',
                                fontWeight: 500,
                                color: 'var(--color-text-sub)',
                                borderRadius: '8px',
                                textDecoration: 'none'
                            }}
                        >
                            🔧 บริการติดตั้ง
                        </Link>
                        <Link
                            href="/about"
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                padding: '1rem',
                                fontWeight: 500,
                                color: 'var(--color-text-sub)',
                                borderRadius: '8px',
                                textDecoration: 'none'
                            }}
                        >
                            📸 ผลงาน
                        </Link>
                        <Link
                            href="/booking"
                            onClick={() => setIsMenuOpen(false)}
                            className="btn-wow"
                            style={{
                                padding: '1rem',
                                textAlign: 'center',
                                marginTop: '0.5rem',
                                textDecoration: 'none'
                            }}
                        >
                            📅 จองคิวช่าง
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
