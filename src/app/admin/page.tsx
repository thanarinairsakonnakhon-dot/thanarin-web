"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, MapPin, Phone, User as UserIcon, Calendar as CalIcon, Clock, Clipboard } from 'lucide-react';

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
    date: string;
    time: string;
    status: string;
    created_at: string;
    customer_phone: string;
    address_details?: {
        houseNo?: string;
        subdistrict?: string;
        district?: string;
        province?: string;
    };
    location_lat?: number;
    location_lng?: number;
    admin_notes?: string;
    technician?: string;
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
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [settings, setSettings] = useState<{ phone_number?: string }>({
        phone_number: '086-238-7571' // Official fallback
    });

    useEffect(() => {
        loadDashboardData();

        // Real-time subscription for Bookings
        const bookingChannel = supabase
            .channel('dashboard_bookings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                loadDashboardData();
            })
            .subscribe();

        // Real-time subscription for Chat
        const chatChannel = supabase
            .channel('dashboard_chat')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, async (payload) => {
                const newMessage = payload.new as any;
                if (newMessage.sender === 'user') {
                    // Play notification sound
                    try {
                        const audio = new Audio('/notification.mp3'); // Assuming you might have one, or just use browser API
                        audio.play().catch(() => { }); // Ignore auto-play errors
                    } catch (e) { }

                    // Show browser notification
                    if (Notification.permission === 'granted') {
                        new Notification('ข้อความใหม่จากลูกค้า', {
                            body: newMessage.message || 'ส่งรูปภาพ/สติ๊กเกอร์',
                            icon: '/icons/chat-icon.png' // Optional
                        });
                    } else if (Notification.permission !== 'denied') {
                        Notification.requestPermission().then(permission => {
                            if (permission === 'granted') {
                                new Notification('ข้อความใหม่จากลูกค้า', {
                                    body: newMessage.message || 'ส่งรูปภาพ/สติ๊กเกอร์'
                                });
                            }
                        });
                    }

                    loadDashboardData();
                }
            })
            .subscribe();

        // Request notification permission on mount
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        return () => {
            supabase.removeChannel(bookingChannel);
            supabase.removeChannel(chatChannel);
        };
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);

        // Load products
        const { data: products } = await supabase
            .from('products')
            .select('*');

        // Load bookings (most recent first)
        const { data: bookings } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        // Load chat sessions (only those waiting for reply from admin)
        const { data: chatSessions } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('is_active', true)
            .eq('last_message_sender', 'user');

        // Load site settings
        const { data: siteSettings } = await supabase
            .from('site_settings')
            .select('setting_key, setting_value')
            .in('setting_key', ['phone_number']);

        if (siteSettings && siteSettings.length > 0) {
            const settingsMap: any = {};
            siteSettings.forEach(item => {
                settingsMap[item.setting_key] = item.setting_value;
            });
            setSettings(prev => ({ ...prev, ...settingsMap }));
        }

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
                pendingBookings: bookings.filter(b => b.status?.toLowerCase() === 'pending').length,
                confirmedBookings: bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length,
                completedBookings: bookings.filter(b => b.status?.toLowerCase() === 'completed').length
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
        const lowerStatus = status?.toLowerCase();
        switch (lowerStatus) {
            case 'pending': return { bg: '#fff7ed', color: '#f59e0b', label: 'รอยืนยัน' };
            case 'confirmed': return { bg: '#ecfdf5', color: '#059669', label: 'ยืนยันแล้ว' };
            case 'completed': return { bg: '#eff6ff', color: '#3b82f6', label: 'เสร็จสิ้น' };
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
            <div className="dashboard-stats-grid">
                {[
                    { title: 'งานรอยืนยัน', value: stats.pendingBookings, color: '#f59e0b', icon: '⏳', link: '/admin/bookings' },
                    { title: 'งานยืนยันแล้ว', value: stats.confirmedBookings, color: '#059669', icon: '✅', link: '/admin/bookings' },
                    { title: 'สินค้าใกล้หมด', value: stats.lowStockProducts, color: '#ef4444', icon: '📦', link: '/admin/inventory' },
                    { title: 'แชทรอตอบ', value: stats.activeChatSessions, color: '#3b82f6', icon: '💬', link: '/admin/chat' },
                ].map((stat, index) => (
                    <Link key={index} href={stat.link} style={{ textDecoration: 'none' }}>
                        <div className="stat-card">
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

            <div className="dashboard-content-grid">

                {/* Recent Bookings */}
                <div className="dashboard-card">
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
                                    <div
                                        key={booking.id}
                                        className="booking-item"
                                        onClick={() => setSelectedBooking(booking)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{booking.customer_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{booking.service_type}</div>
                                        </div>
                                        <div className="booking-meta">
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatDate(booking.date, booking.time)}</div>
                                            <span style={{
                                                padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem',
                                                background: style.bg, color: style.color, fontWeight: 600,
                                                display: 'inline-block', textAlign: 'center'
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

                {/* Booking Detail Modal */}
                {selectedBooking && (
                    <BookingDetailModal
                        booking={selectedBooking}
                        onClose={() => setSelectedBooking(null)}
                        adminPhone={settings.phone_number || '086-238-7571'}
                    />
                )}

                {/* Low Stock Alert */}
                <div className="dashboard-card">
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
                                <div key={item.id} className="stock-item">
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

function BookingDetailModal({ booking, onClose, adminPhone }: { booking: Booking, onClose: () => void, adminPhone: string }) {
    const handlePrint = () => {
        window.print();
    };

    const googleMapsUrl = (booking.location_lat && booking.location_lng)
        ? `https://www.google.com/maps/search/?api=1&query=${booking.location_lat},${booking.location_lng}`
        : null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="modal-content printable-card" style={{
                background: 'white', borderRadius: '20px', width: '100%', maxWidth: '600px',
                padding: '2rem', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className="no-print">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clipboard size={24} color="#2563EB" /> รายละเอียดใบงาน
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={handlePrint} className="btn-wow" style={{
                            padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            <Printer size={18} /> พิมพ์ใบงาน
                        </button>
                        <button onClick={onClose} style={{
                            background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer'
                        }}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Print Header (Only visible on paper) */}
                <div className="print-only" style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'black' }}>TH.AIR - ใบสั่งงานช่าง</h1>
                    <p style={{ fontSize: '1rem', color: 'black' }}>ร้านธนรินทร์แอร์ สกลนคร | โทร. {adminPhone}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="job-details">
                    <section>
                        <h3 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <UserIcon size={16} /> ข้อมูลลูกค้า
                        </h3>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{booking.customer_name}</div>
                        <div style={{ color: '#2563EB', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Phone size={14} /> {booking.customer_phone}
                        </div>
                    </section>

                    <section>
                        <h3 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <CalIcon size={16} /> นัดหมาย
                        </h3>
                        <div style={{ fontWeight: 700 }}>{new Date(booking.date).toLocaleDateString('th-TH', { dateStyle: 'long' })}</div>
                        <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Clock size={14} /> เวลา {booking.time} น.
                        </div>
                    </section>

                    <section style={{ gridColumn: 'span 2' }}>
                        <h3 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <MapPin size={16} /> สถานที่หน้างาน
                        </h3>
                        <p style={{ fontSize: '1rem', lineHeight: '1.6', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            {booking.address_details?.houseNo} {booking.address_details?.subdistrict} {booking.address_details?.district} {booking.address_details?.province}
                        </p>
                    </section>

                    <section style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.8rem' }}>ประเภทงาน</h3>
                            <div style={{
                                display: 'inline-block', padding: '0.5rem 1.5rem', borderRadius: '50px',
                                background: '#E0F2FE', color: '#0369A1', fontWeight: 800, fontSize: '1.2rem', textTransform: 'uppercase'
                            }}>
                                {booking.service_type === 'installation' ? 'ติดตั้งแอร์' :
                                    booking.service_type === 'cleaning' ? 'ล้างแอร์' :
                                        booking.service_type === 'repair' ? 'ซ่อมแอร์' : booking.service_type}
                            </div>
                        </div>

                        {googleMapsUrl && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }} className="no-print">สแกนเพื่อนำทาง (GPS)</div>
                                <div style={{ padding: '10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                    <QRCodeSVG value={googleMapsUrl} size={120} />
                                </div>
                            </div>
                        )}
                    </section>

                    {booking.admin_notes && (
                        <section style={{ gridColumn: 'span 2', borderTop: '1px dashed #e2e8f0', paddingTop: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>หมายเหตุเพิ่มเติม</h3>
                            <p style={{ fontStyle: 'italic', color: '#334155' }}>"{booking.admin_notes}"</p>
                        </section>
                    )}
                </div>

                {/* Footer and Signatures (Print Only) */}
                <div className="print-only" style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ width: '45%', textAlign: 'center' }}>
                        <div style={{ borderBottom: '1px solid #000', marginBottom: '0.5rem', height: '40px' }}></div>
                        <p style={{ fontSize: '0.9rem', color: 'black' }}>ลงชื่อช่างผู้รับงาน</p>
                    </div>
                    <div style={{ width: '45%', textAlign: 'center' }}>
                        <div style={{ borderBottom: '1px solid #000', marginBottom: '0.5rem', height: '40px' }}></div>
                        <p style={{ fontSize: '0.9rem', color: 'black' }}>ลงชื่อลูกค้า (เมื่อจบงาน)</p>
                    </div>
                </div>

                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        .admin-sidebar { display: none !important; }
                        .admin-content { padding: 0 !important; margin: 0 !important; }
                        .modal-overlay { background: none !important; position: static !important; padding: 0 !important; }
                        .printable-card, .printable-card * { visibility: visible; }
                        .printable-card {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            box-shadow: none !important;
                            border: none !important;
                            padding: 0 !important;
                            background: white !important;
                        }
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                    }
                    .print-only { display: none; }
                `}</style>
            </div>
        </div>
    );
}
