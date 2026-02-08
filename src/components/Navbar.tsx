"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed w-full top-0 z-50 transition-all duration-300"
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

                {/* Desktop Menu */}
                <nav className="desktop-nav" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link href="/" style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>หน้าแรก</Link>
                    <Link href="/products" style={{ fontWeight: 500, color: 'var(--color-text-sub)' }}>สินค้า</Link>
                    <Link href="/services" style={{ fontWeight: 500, color: 'var(--color-text-sub)' }}>บริการติดตั้ง</Link>
                    <Link href="/about" style={{ fontWeight: 500, color: 'var(--color-text-sub)' }}>ผลงาน</Link>
                </nav>

                {/* Desktop Action Button */}
                <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/booking" className="btn-wow" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
                        จองคิวช่าง
                    </Link>
                </div>

                {/* Mobile Hamburger Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                        display: 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        flexDirection: 'column',
                        gap: '5px'
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
            </div>

            {/* Mobile Menu Dropdown */}
            <div
                className="mobile-menu"
                style={{
                    display: 'none',
                    position: 'absolute',
                    top: '70px',
                    left: 0,
                    right: 0,
                    background: 'white',
                    borderBottom: '1px solid #e2e8f0',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
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
                            background: '#f8fafc'
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
                            borderRadius: '8px'
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
                            borderRadius: '8px'
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
                            borderRadius: '8px'
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
                            marginTop: '0.5rem'
                        }}
                    >
                        📅 จองคิวช่าง
                    </Link>
                </nav>
            </div>

            {/* Mobile Styles */}
            <style jsx>{`
                @media (max-width: 900px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: flex !important;
                    }
                    .mobile-menu {
                        display: block !important;
                    }
                }
            `}</style>
        </header>
    );
}
