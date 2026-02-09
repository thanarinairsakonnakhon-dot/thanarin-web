"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface Order {
    id: string;
    created_at: string;
    total_price: number;
    status: string;
    order_items: any[];
}

export default function OrderHistoryPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/history');
        } else if (user) {
            fetchOrders();
        }
    }, [user, authLoading, router]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return { bg: '#fff7ed', color: '#f59e0b', label: 'รอดำเนินการ' };
            case 'confirmed': return { bg: '#eff6ff', color: '#3b82f6', label: 'ยืนยันแล้ว' };
            case 'shipped': return { bg: '#f5f3ff', color: '#8b5cf6', label: 'กำลังส่ง' };
            case 'completed': return { bg: '#f0fdf4', color: '#22c55e', label: 'สำเร็จ' };
            case 'cancelled': return { bg: '#fef2f2', color: '#ef4444', label: 'ยกเลิก' };
            default: return { bg: '#f1f5f9', color: '#64748b', label: status };
        }
    };

    if (authLoading || loading) {
        return (
            <main style={{ minHeight: '100vh', background: '#F8FAFC' }}>
                <Navbar />
                <div style={{ paddingTop: '200px', textAlign: 'center' }}>กำลังโหลดข้อมูล...</div>
                <Footer />
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2rem', margin: 0 }}>📋 ประวัติการสั่งซื้อ</h1>
                    <Link href="/products" className="btn-wow" style={{ textDecoration: 'none', padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>ช้อปปิ้งต่อ</Link>
                </div>

                {orders.length === 0 ? (
                    <div className="card-glass" style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📦</div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>ยังไม่มีรายการสั่งซื้อ</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>เมื่อคุณสั่งซื้อสินค้า รายการจะปรากฏที่นี่ครับ</p>
                        <Link href="/products" className="btn-wow" style={{ textDecoration: 'none' }}>ไปหน้าร้านค้า</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {orders.map((order) => {
                            const status = getStatusStyle(order.status);
                            return (
                                <div key={order.id} className="card-glass" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>เลขที่ใบสั่งซื้อ: #{order.id.slice(0, 8).toUpperCase()}</div>
                                            <div style={{ fontWeight: 600 }}>วันที่สั่งซื้อ: {new Date(order.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{
                                                padding: '0.3rem 1rem',
                                                borderRadius: '50px',
                                                fontSize: '0.85rem',
                                                fontWeight: 700,
                                                background: status.bg,
                                                color: status.color,
                                                display: 'inline-block'
                                            }}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {order.order_items?.map((item: any) => (
                                            <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                                    <img src={item.image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.product_name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>฿{item.price.toLocaleString()} x {item.quantity} ชิ้น</div>
                                                </div>
                                                <div style={{ fontWeight: 700 }}>
                                                    ฿{(item.price * item.quantity).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                            {order.order_items?.length} รายการสินค้า
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ color: '#64748b', fontSize: '0.9rem', marginRight: '8px' }}>ยอดรวมสุทธิ</span>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-blue)' }}>฿{order.total_price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
