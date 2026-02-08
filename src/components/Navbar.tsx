"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(0);

    // Check window width on client side
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        // Set initial width
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close menu when clicking outside or navigating
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const isMobile = windowWidth > 0 && windowWidth <= 900;
    const showDesktop = windowWidth > 900;

    return (
        <>
            <header
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px', padding: '0 1rem' }}>
                    {/* Logo Area */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                        <Image
                            src="/logo.png"
                            alt="Thanarin Air"
                            width={180}
                            height={60}
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </Link>

                    {/* Desktop Menu */}
                    {showDesktop && (
                        <>
                            <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                <Link href="/" style={{ fontWeight: 500, color: 'var(--color-text-main)', textDecoration: 'none' }}>หน้าแรก</Link>
                                <Link href="/products" style={{ fontWeight: 500, color: 'var(--color-text-sub)', textDecoration: 'none' }}>สินค้า</Link>
                                <Link href="/prices" style={{ fontWeight: 500, color: 'var(--color-text-sub)', textDecoration: 'none' }}>ตารางราคาแอร์</Link>
                                <Link href="/calculator" style={{ fontWeight: 500, color: 'var(--color-text-sub)', textDecoration: 'none' }}>คำนวณ BTU</Link>

                                {/* Portfolio Dropdown */}
                                <div
                                    className="nav-dropdown-container"
                                    style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
                                >
                                    <Link
                                        href="/about"
                                        style={{
                                            fontWeight: 500,
                                            color: 'var(--color-text-sub)',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        ผลงาน <span style={{ fontSize: '0.8rem', transition: 'transform 0.3s' }}>▼</span>
                                    </Link>

                                    <div className="nav-dropdown-content">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 220px)', padding: '10px' }}>
                                            {[
                                                { label: 'ล้างแอร์', icon: '🧼' },
                                                { label: 'ซ่อมแอร์', icon: '🔧' },
                                                { label: 'ติดตั้งแอร์', icon: '❄️' },
                                                { label: 'งานโครงการ', icon: '🏢' },
                                                { label: 'ขายส่ง', icon: '📦' }
                                            ].map((item) => (
                                                <Link
                                                    key={item.label}
                                                    href={`/about?category=${item.label}`}
                                                    className="dropdown-item"
                                                >
                                                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                                                </Link>
                                            ))}
                                            <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '5px', paddingTop: '5px' }}>
                                                <Link
                                                    href="/about"
                                                    className="dropdown-item"
                                                    style={{ color: 'var(--color-primary-blue) !important' }}
                                                >
                                                    <span style={{ fontSize: '1.2rem' }}>📸</span>
                                                    <span style={{ fontWeight: 600 }}>ดูผลงานทั้งหมด</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </nav>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Link href="/booking" className="btn-wow" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', textDecoration: 'none' }}>
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
                                padding: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                zIndex: 1001
                            }}
                        >
                            <span style={{
                                width: '28px',
                                height: '3px',
                                background: '#1e293b',
                                borderRadius: '2px',
                                transition: 'all 0.3s ease',
                                transformOrigin: 'center',
                                transform: isMenuOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none'
                            }}></span>
                            <span style={{
                                width: '28px',
                                height: '3px',
                                background: '#1e293b',
                                borderRadius: '2px',
                                transition: 'all 0.3s ease',
                                opacity: isMenuOpen ? 0 : 1
                            }}></span>
                            <span style={{
                                width: '28px',
                                height: '3px',
                                background: '#1e293b',
                                borderRadius: '2px',
                                transition: 'all 0.3s ease',
                                transformOrigin: 'center',
                                transform: isMenuOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none'
                            }}></span>
                        </button>
                    )}
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobile && isMenuOpen && (
                <div
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 998
                    }}
                />
            )}

            {/* Mobile Menu Drawer */}
            {isMobile && (
                <div
                    style={{
                        position: 'fixed',
                        top: '80px',
                        left: 0,
                        right: 0,
                        background: 'white',
                        zIndex: 999,
                        boxShadow: isMenuOpen ? '0 10px 30px rgba(0,0,0,0.15)' : 'none',
                        transform: isMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
                        opacity: isMenuOpen ? 1 : 0,
                        transition: 'all 0.3s ease',
                        padding: isMenuOpen ? '1rem' : '0 1rem',
                        pointerEvents: isMenuOpen ? 'auto' : 'none'
                    }}
                >
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Link
                            href="/"
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                padding: '1rem 1.25rem',
                                fontWeight: 600,
                                color: '#1e293b',
                                borderRadius: '12px',
                                background: '#f8fafc',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '1rem'
                            }}
                        >
                            🏠 หน้าแรก
                        </Link>
                        <Link
                            href="/products"
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                padding: '1rem 1.25rem',
                                fontWeight: 500,
                                color: '#475569',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '1rem'
                            }}
                        >
                            ❄️ สินค้า
                        </Link>
                        <Link
                            href="/prices"
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                padding: '1rem 1.25rem',
                                fontWeight: 500,
                                color: '#475569',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '1rem'
                            }}
                        >
                            💰 ตารางราคาแอร์
                        </Link>
                        <Link
                            href="/calculator"
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                padding: '1rem 1.25rem',
                                fontWeight: 500,
                                color: '#475569',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '1rem'
                            }}
                        >
                            🧮 คำนวณ BTU
                        </Link>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8fafc', borderRadius: '12px', padding: '0.5rem' }}>
                            <Link
                                href="/about"
                                onClick={() => setIsMenuOpen(false)}
                                style={{
                                    padding: '1rem 1.25rem',
                                    fontWeight: isMenuOpen ? 600 : 500,
                                    color: '#1e293b',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    fontSize: '1rem'
                                }}
                            >
                                📸 ผลงานทั้งหมด
                            </Link>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', padding: '0 0.5rem 0.5rem' }}>
                                {[
                                    { label: 'ล้างแอร์', icon: '🧼' },
                                    { label: 'ซ่อมแอร์', icon: '🔧' },
                                    { label: 'ติดตั้งแอร์', icon: '❄️' },
                                    { label: 'งานโครงการ', icon: '🏢' },
                                    { label: 'ขายส่ง', icon: '📦' }
                                ].map((item) => (
                                    <Link
                                        key={item.label}
                                        href={`/about?category=${item.label}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="dropdown-item"
                                        style={{
                                            padding: '0.75rem',
                                            background: 'white',
                                            fontSize: '0.9rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <span>{item.icon}</span> {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <Link
                            href="/booking"
                            onClick={() => setIsMenuOpen(false)}
                            className="btn-wow"
                            style={{
                                padding: '1rem 1.25rem',
                                textAlign: 'center',
                                marginTop: '0.5rem',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                fontSize: '1rem'
                            }}
                        >
                            📅 จองคิวช่าง
                        </Link>
                    </nav>
                </div>
            )}
        </>
    );
}
