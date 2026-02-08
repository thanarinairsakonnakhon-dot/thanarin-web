"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import Link from 'next/link';

interface DashboardStats {
    totalProducts: number;
    lowStockProducts: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    activeChatSessions: number;
}

interface Booking {
    id: string;
    customer_name: string;
    service_type: string;
    booking_date: string;
    booking_time: string;
    status: string;
}


export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        lowStockProducts: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        activeChatSessions: 0
    });
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);

        // Load products
        const { data: products } = await supabase
            .from('products')
            .select('*');

        // Load bookings
        const { data: bookings } = await supabase
            .from('bookings')
            .select('*')
            .order('booking_date', { ascending: true })
            .limit(10);

        // Load chat sessions (only those waiting for reply from admin)
        const { data: chatSessions } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('is_active', true)
            .eq('last_message_sender', 'user');

        if (products) {
            const lowStock = products.filter(p => p.stock <= (p.minStock || 2)); // Use minStock
            setLowStockProducts(lowStock.slice(0, 5));
            setStats(prev => ({
                ...prev,
                totalProducts: products.length,
                lowStockProducts: lowStock.length
            }));
        }

        if (bookings) {
            setRecentBookings(bookings.slice(0, 5));
            setStats(prev => ({
                ...prev,
                pendingBookings: bookings.filter(b => b.status === 'Pending').length,
                confirmedBookings: bookings.filter(b => b.status === 'Confirmed').length,
                completedBookings: bookings.filter(b => b.status === 'Completed').length
            }));
        }

        if (chatSessions) {
            setStats(prev => ({
                ...prev,
                activeChatSessions: chatSessions.length
            }));
        }

        setIsLoading(false);
    };

    const formatDate = (dateStr: string, timeStr: string) => {
        const date = new Date(dateStr);
        return `${date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}, ${timeStr}`;
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending': return { bg: '#fff7ed', color: '#f59e0b', label: 'รอยืนยัน' };
            case 'Confirmed': return { bg: '#ecfdf5', color: '#059669', label: 'ยืนยันแล้ว' };
            case 'Completed': return { bg: '#eff6ff', color: '#3b82f6', label: 'เสร็จสิ้น' };
            default: return { bg: '#f1f5f9', color: '#64748b', label: status };
        }
    };

    if (isLoading) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                กำลังโหลดข้อมูล...
            </div>
        );
    }

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem', color: '#1e293b' }}>Dashboard Overview</h1>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { title: 'งานรอยืนยัน', value: stats.pendingBookings, color: '#f59e0b', icon: '⏳', link: '/admin/bookings' },
                    { title: 'งานยืนยันแล้ว', value: stats.confirmedBookings, color: '#059669', icon: '✅', link: '/admin/bookings' },
                    { title: 'สินค้าใกล้หมด', value: stats.lowStockProducts, color: '#ef4444', icon: '📦', link: '/admin/inventory' },
                    { title: 'แชทรอตอบ', value: stats.activeChatSessions, color: '#3b82f6', icon: '💬', link: '/admin/chat' },
                ].map((stat, index) => (
                    <Link key={index} href={stat.link} style={{ textDecoration: 'none' }}>
                        <div style={{
                            background: 'white', padding: '1.5rem', borderRadius: '16px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9',
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '45px', height: '45px',
                                    background: `${stat.color}20`, color: stat.color,
                                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                                }}>
                                    {stat.icon}
                                </div>
                                {stat.value > 0 && (
                                    <span style={{
                                        fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '50px',
                                        background: '#fef2f2', color: '#ef4444', fontWeight: 600
                                    }}>
                                        ต้องดูแล
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.2rem' }}>{stat.title}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{stat.value}</div>
                        </div>
                    </Link>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>

                {/* Recent Bookings */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>📅 งานล่าสุด</h3>
                        <Link href="/admin/bookings" style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem' }}>ดูทั้งหมด</Link>
                    </div>
                    {recentBookings.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                            ยังไม่มีการจอง
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {recentBookings.map((booking) => {
                                const style = getStatusStyle(booking.status);
                                return (
                                    <div key={booking.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', borderRadius: '8px', background: '#f8fafc' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{booking.customer_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{booking.service_type}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatDate(booking.booking_date, booking.booking_time)}</div>
                                            <span style={{
                                                padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem',
                                                background: style.bg, color: style.color, fontWeight: 600
                                            }}>
                                                {style.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Low Stock Alert */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>⚠️ สินค้าใกล้หมด</h3>
                        <Link href="/admin/inventory" style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem' }}>ดูทั้งหมด</Link>
                    </div>
                    {lowStockProducts.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#22c55e' }}>
                            ✅ สินค้าทุกรายการมีสต็อกเพียงพอ
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {lowStockProducts.map((item) => (
                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', borderRadius: '8px', background: '#fff1f2' }}>
                                    <div style={{ fontSize: '1.5rem' }}>❄️</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>
                                            เหลือ {item.stock} เครื่อง (ต่ำกว่า {item.minStock || 2})
                                        </div>
                                    </div>
                                    <Link href="/admin/inventory" style={{
                                        padding: '0.4rem 0.8rem', background: 'white', border: '1px solid #ef4444',
                                        color: '#ef4444', borderRadius: '6px', fontSize: '0.8rem', textDecoration: 'none'
                                    }}>
                                        เติมของ
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
