"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, removeFromCart, updateQuantity, subtotal, itemCount } = useCart();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 2000,
                visibility: isVisible ? 'visible' : 'hidden'
            }}
        >
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    opacity: isOpen ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                }}
            />

            {/* Drawer Content */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    maxWidth: '400px',
                    background: 'white',
                    boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>ตะกร้าสินค้า ({itemCount})</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
                </div>

                {/* Items List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '3rem', color: '#94a3b8' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                            <p>ไม่มีสินค้าในตะกร้า</p>
                            <button
                                onClick={onClose}
                                style={{
                                    marginTop: '1rem',
                                    padding: '0.6rem 1.2rem',
                                    background: 'var(--color-primary-blue)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                ไปเลือกสินค้า
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {items.map((item) => (
                                <div key={item.id} style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>{item.name}</h4>
                                        <div style={{ color: 'var(--color-primary-blue)', fontWeight: 700, marginBottom: '0.5rem' }}>
                                            ฿{item.price.toLocaleString()}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                <button
                                                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                    style={{ padding: '2px 8px', background: '#f8fafc', border: 'none', cursor: 'pointer' }}
                                                >-</button>
                                                <span style={{ padding: '0 8px', fontSize: '0.9rem', minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                    style={{ padding: '2px 8px', background: '#f8fafc', border: 'none', cursor: 'pointer' }}
                                                >+</button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.product_id)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer' }}
                                            >ยกเลิก</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontWeight: 600 }}>ยอดรวมสุทธิ</span>
                            <span style={{ fontWeight: 700, color: 'var(--color-primary-blue)', fontSize: '1.25rem' }}>฿{subtotal.toLocaleString()}</span>
                        </div>
                        <Link
                            href="/checkout"
                            onClick={onClose}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '1rem',
                                background: 'var(--color-primary-blue)',
                                color: 'white',
                                textAlign: 'center',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                fontWeight: 700,
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                            }}
                        >
                            ชำระเงิน
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
