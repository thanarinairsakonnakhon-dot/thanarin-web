"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { items, subtotal, clearCart } = useCart();
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        address: '',
        notes: ''
    });

    // Auth Guard - Redirect guest to login
    React.useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/checkout');
        } else if (user && !customerInfo.name) {
            // Auto-fill name from profile
            setCustomerInfo(prev => ({
                ...prev,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || ''
            }));
        }
    }, [user, authLoading, router, customerInfo.name]);

    const handleOrderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) return;

        setLoading(true);
        try {
            // 1. Insert Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_id: user?.id,
                    customer_name: customerInfo.name,
                    customer_phone: customerInfo.phone,
                    customer_address: customerInfo.address,
                    total_price: subtotal,
                    status: 'pending',
                    admin_notes: customerInfo.notes
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // Store order ID for success UI
            setSubmittedOrderId(orderData.id);

            // 2. Insert Order Items
            const orderItems = items.map(item => ({
                order_id: orderData.id,
                product_id: item.product_id,
                product_name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Success
            setOrderSuccess(true);
            clearCart();
            window.scrollTo(0, 0);

        } catch (error) {
            console.error('Checkout error:', error);
            alert('เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <main style={{ minHeight: '100vh', background: '#F8FAFC' }}>
                <Navbar />
                <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', textAlign: 'center' }}>
                    <div className="card-glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✅</div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>สั่งซื้อสำเร็จ!</h1>
                        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
                            ขอบคุณที่ใช้บริการธนรินทร์แอร์ครับ <br />
                            เจ้าหน้าที่จะติดต่อกลับที่เบอร์ {customerInfo.phone} เพื่อยืนยันการสั่งซื้อและนัดหมายการจัดส่ง/ติดตั้งครับ
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link
                                href={`/booking?service=installation&order_id=${submittedOrderId}&step=2&model=${encodeURIComponent(items[0]?.name || '')}`}
                                className="btn-wow"
                                style={{ padding: '1rem 2rem', textDecoration: 'none', background: 'var(--color-primary-blue)' }}
                            >
                                📅 จองคิวติดตั้งทันที (นัดหมายช่าง)
                            </Link>
                            <Link href="/products" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
                                กลับไปดูสินค้าอื่น
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>💰 ชำระเงิน</h1>

                {items.length === 0 ? (
                    <div className="card-glass" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>ไม่มีสินค้าในตะกร้า</p>
                        <Link href="/products" className="btn-wow" style={{ textDecoration: 'none' }}>ไปที่หน้าร้านค้า</Link>
                    </div>
                ) : (
                    <div className="grid-sidebar-layout">
                        {/* Summary Column */}
                        <div className="card-glass" style={{ padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>สรุปรายการสั่งซื้อ</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ width: '50px', height: '50px', background: '#f8fafc', borderRadius: '4px', overflow: 'hidden' }}>
                                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '2px' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                ฿{item.price.toLocaleString()} x {item.quantity}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#64748b' }}>จำนวนทั้งหมด</span>
                                    <span>{items.reduce((a, b) => a + b.quantity, 0)} ชิ้น</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700 }}>
                                    <span>ยอดรวมสุทธิ</span>
                                    <span style={{ color: 'var(--color-primary-blue)' }}>฿{subtotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Form Column */}
                        <div className="card-glass" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>ข้อมูลผู้ซื้อ / สถานที่จัดส่ง</h3>
                            <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>ชื่อ-นามสกุล *</label>
                                    <input
                                        required
                                        type="text"
                                        className="form-input"
                                        placeholder="ระบุชื่อผู้รับสินค้า"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        value={customerInfo.name}
                                        onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>เบอร์โทรศัพท์ *</label>
                                    <input
                                        required
                                        type="tel"
                                        className="form-input"
                                        placeholder="08x-xxx-xxxx"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        value={customerInfo.phone}
                                        onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>ที่อยู่จัดส่ง / หน้างาน *</label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="form-input"
                                        placeholder="บ้านเลขที่ หมู่บ้าน ตำบล อำเภอ..."
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        value={customerInfo.address}
                                        onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>หมายเหตุเพิ่มเติม (ถ้ามี)</label>
                                    <textarea
                                        rows={2}
                                        className="form-input"
                                        placeholder="สอบถามพื้นที่ติดตั้ง, นัดหมายเวลา..."
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        value={customerInfo.notes}
                                        onChange={e => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                                    />
                                </div>

                                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', marginTop: '1rem', fontSize: '0.85rem', color: '#1e40af' }}>
                                    ✨ **เจ้าหน้าที่จะติดต่อกลับเพื่อยืนยันรายการและบริการติดตั้ง** <br />
                                    ท่านสามารถชำระเงินกับช่างได้โดยตรงหลังติดตั้งเสร็จครับ
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="btn-wow"
                                    style={{
                                        padding: '1rem',
                                        fontSize: '1.2rem',
                                        marginTop: '1.5rem',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading ? 'กำลังยืนยันการสั่งซื้อ...' : '🛒 ยืนยันการสั่งซื้อสินค้า'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
