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

interface OrderItem {
    product_name: string;
    quantity: number;
}

interface Order {
    order_items: OrderItem[];
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
    order_id?: string;
    order?: Order;
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
        phone_number: '086-238-7571'
    });

    useEffect(() => {
        loadDashboardData();

        const bookingChannel = supabase
            .channel('dashboard_bookings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
                loadDashboardData();
            })
            .subscribe();

        const chatChannel = supabase
            .channel('dashboard_chat')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, async (payload) => {
                const newMessage = payload.new as any;
                if (newMessage.sender === 'user') {
                    try {
                        const audio = new Audio('/notification.mp3');
                        audio.play().catch(() => { });
                    } catch (e) { }

                    if (Notification.permission === 'granted') {
                        new Notification('ข้อความใหม่จากลูกค้า', {
                            body: newMessage.message || 'ส่งรูปภาพ/สติ๊กเกอร์',
                            icon: '/icons/chat-icon.png'
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

        const { data: products } = await supabase.from('products').select('*');
        const { data: queueBookings } = await supabase
            .from('bookings')
            .select('*, order:orders(order_items(product_name, quantity))')
            .in('status', ['pending', 'confirmed'])
            .order('date', { ascending: true })
            .order('time', { ascending: true });

        const { count: completedCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed');
        const { count: pendingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        const { count: confirmedCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed');

        if (queueBookings) {
            setRecentBookings(queueBookings);
            setStats(prev => ({
                ...prev,
                pendingBookings: pendingCount || 0,
                confirmedBookings: confirmedCount || 0,
                completedBookings: completedCount || 0
            }));
        }

        const { data: chatSessions } = await supabase.from('chat_sessions').select('*').eq('is_active', true).eq('last_message_sender', 'user');
        const { data: siteSettings } = await supabase.from('site_settings').select('setting_key, setting_value').in('setting_key', ['phone_number']);

        if (siteSettings && siteSettings.length > 0) {
            const settingsMap: any = {};
            siteSettings.forEach(item => { settingsMap[item.setting_key] = item.setting_value; });
            setSettings(prev => ({ ...prev, ...settingsMap }));
        }

        if (products) {
            const lowStock = products.filter(p => p.stock <= (p.minStock || 2));
            setLowStockProducts(lowStock.slice(0, 5));
            setStats(prev => ({
                ...prev,
                totalProducts: products.length,
                lowStockProducts: lowStock.length
            }));
        }

        if (chatSessions) {
            setStats(prev => ({ ...prev, activeChatSessions: chatSessions.length }));
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
        return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>กำลังโหลดข้อมูล...</div>;
    }

    return (
        <>
            <div className="no-print">
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem', color: '#1e293b' }}>Dashboard Overview</h1>

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
                                    <div style={{ width: '45px', height: '45px', background: `${stat.color}20`, color: stat.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                        {stat.icon}
                                    </div>
                                    {stat.value > 0 && <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '50px', background: '#fef2f2', color: '#ef4444', fontWeight: 600 }}>ต้องดูแล</span>}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.2rem' }}>{stat.title}</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{stat.value}</div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="dashboard-content-grid">
                    <div className="dashboard-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>👷 คิวงานช่าง (เรียงตามเวลา)</h3>
                            <Link href="/admin/bookings" style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem' }}>ดูทั้งหมด</Link>
                        </div>
                        {recentBookings.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>✅ ไม่มีงานค้างในคิว (ว่าง)</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {recentBookings.map((booking) => {
                                    const style = getStatusStyle(booking.status);
                                    return (
                                        <div key={booking.id} className="booking-item" onClick={() => setSelectedBooking(booking)} style={{ cursor: 'pointer' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{booking.customer_name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{booking.service_type}</div>
                                            </div>
                                            <div className="booking-meta">
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatDate(booking.date, booking.time)}</div>
                                                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: style.bg, color: style.color, fontWeight: 600, display: 'inline-block', textAlign: 'center' }}>
                                                    {style.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="dashboard-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>⚠️ สินค้าใกล้หมด</h3>
                            <Link href="/admin/inventory" style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem' }}>ดูทั้งหมด</Link>
                        </div>
                        {lowStockProducts.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#22c55e' }}>✅ สินค้าทุกรายการมีสต็อกเพียงพอ</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {lowStockProducts.map((item) => (
                                    <div key={item.id} className="stock-item">
                                        <div style={{ fontSize: '1.5rem' }}>❄️</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>เหลือ {item.stock} เครื่อง (ต่ำกว่า {item.minStock || 2})</div>
                                        </div>
                                        <Link href="/admin/inventory" style={{ padding: '0.4rem 0.8rem', background: 'white', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', fontSize: '0.8rem', textDecoration: 'none' }}>เติมของ</Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    adminPhone={settings.phone_number || '086-238-7571'}
                />
            )}
        </>
    );
}

function BookingDetailModal({ booking, onClose, adminPhone }: { booking: Booking, onClose: () => void, adminPhone: string }) {
    const handlePrint = () => { window.print(); };

    const googleMapsUrl = (booking.location_lat && booking.location_lng)
        ? `https://www.google.com/maps/search/?api=1&query=${booking.location_lat},${booking.location_lng}`
        : null;

    const orderItems = booking.order?.order_items || [];

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="modal-content printable-card" style={{
                background: 'white', borderRadius: '20px', width: '100%', maxWidth: '750px',
                padding: '2rem', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }} className="no-print">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clipboard size={24} color="#2563EB" /> รายละเอียดใบงาน
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={handlePrint} className="btn-wow" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Printer size={18} /> พิมพ์ใบงาน
                        </button>
                        <button onClick={onClose} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div style={{ padding: '0' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2.5px solid #000', paddingBottom: '1rem' }}>
                        <h1 style={{ margin: 0, fontSize: '24pt', fontWeight: 800, color: 'black' }}>THANARIN AIR</h1>
                        <p style={{ margin: '4px 0', fontSize: '12pt', color: 'black', fontWeight: 700 }}>ธนรินทร์แอร์ สกลนคร | ตัวแทนจำหน่ายและติดตั้งเครื่องปรับอากาศ</p>
                        <p style={{ margin: 0, fontSize: '10pt', color: 'black' }}>โทร: {adminPhone} | thanarin-air.com</p>
                    </div>

                    <div style={{ display: 'flex', width: '100%', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                        <div style={{ width: '60%' }}>
                            <h3 style={{ fontSize: '11pt', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'black', textDecoration: 'underline' }}>ข้อมูลลูกค้า (Customer)</h3>
                            <div style={{ lineHeight: 1.6, color: 'black', fontSize: '10pt', paddingRight: '1rem' }}>
                                <strong>ชื่อลูกค้า:</strong> {booking.customer_name} <br />
                                <strong>เบอร์โทรศัพท์:</strong> {booking.customer_phone} <br />
                                <strong>สถานที่ติดตั้ง:</strong> <span style={{ wordBreak: 'break-word' }}>{booking.address_details?.houseNo} {booking.address_details?.subdistrict} {booking.address_details?.district} {booking.address_details?.province}</span>
                            </div>
                        </div>
                        <div style={{ width: '40%', textAlign: 'right' }}>
                            <h3 style={{ fontSize: '11pt', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'black', textDecoration: 'underline' }}>ข้อมูลใบงาน (Job Info)</h3>
                            <div style={{ lineHeight: 1.6, color: 'black', fontSize: '10pt' }}>
                                <strong>เลขที่ใบงาน:</strong> #{booking.id.slice(0, 8).toUpperCase()} <br />
                                <strong>วันที่รับแจ้ง:</strong> {new Date(booking.created_at).toLocaleDateString('th-TH')} <br />
                                <strong>วันนัดหมาย:</strong> <span style={{ whiteSpace: 'nowrap' }}>{new Date(booking.date).toLocaleDateString('th-TH')} / {booking.time} น.</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#2563eb' }}>ประเภทงาน (Work Type):</strong> <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                                {booking.service_type === 'installation' ? '🛠️ ติดตั้งแอร์' : booking.service_type === 'cleaning' ? '🧼 ล้างแอร์' : booking.service_type}
                            </span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '11pt', fontWeight: 700, borderBottom: '2px solid #000', marginBottom: '0.5rem', color: 'black' }}>รายการสินค้า/อุปกรณ์ (Product List)</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', color: 'black' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9' }}>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', border: '1px solid #000', fontWeight: 700, width: '75%' }}>รายการสินค้า</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem', border: '1px solid #000', fontWeight: 700, width: '25%' }}>จำนวน</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderItems.length > 0 ? (
                                    orderItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{ padding: '0.75rem', border: '1px solid #000' }}>{item.product_name}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center', border: '1px solid #000' }}>{item.quantity}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontStyle: 'italic', border: '1px solid #000' }}>-- ไม่พบรายการสินค้าในระบบคำสั่งซื้อ (Service Only) --</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ border: '1px solid #000', padding: '1rem', borderRadius: '8px', minHeight: '100px', color: 'black' }}>
                            <strong style={{ fontSize: '10pt', textDecoration: 'underline' }}>บันทึกเพิ่มเติม (Admin Notes):</strong> <br />
                            <div style={{ fontSize: '10pt', marginTop: '0.5rem' }}>{booking.admin_notes || '- ไม่มีหมายเหตุเพิ่มเติม -'}</div>
                        </div>
                        {googleMapsUrl && (
                            <div style={{ textAlign: 'center', border: '1px solid #000', padding: '0.75rem', borderRadius: '8px' }}>
                                <div style={{ fontSize: '9pt', fontWeight: 700, marginBottom: '0.5rem', color: 'black' }}>📍 แผนที่หน้างาน</div>
                                <div style={{ background: 'white', padding: '5px', display: 'inline-block' }}>
                                    <QRCodeSVG value={googleMapsUrl} size={120} />
                                </div>
                                <div style={{ fontSize: '7pt', color: '#666', marginTop: '0.3rem' }}>สแกนเพื่อนำทาง</div>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'center', width: '230px', color: 'black' }}>
                            <div style={{ borderBottom: '1.5px solid #000', marginBottom: '0.5rem', height: '40px' }}></div>
                            <div style={{ fontSize: '10pt', fontWeight: 600 }}>ลงชื่อ......................................................</div>
                            <div style={{ fontSize: '9pt' }}>ช่างผู้ปฏิบัติงาน (Technician)</div>
                        </div>
                        <div style={{ textAlign: 'center', width: '230px', color: 'black' }}>
                            <div style={{ borderBottom: '1.5px solid #000', marginBottom: '0.5rem', height: '40px' }}></div>
                            <div style={{ fontSize: '10pt', fontWeight: 600 }}>ลงชื่อ......................................................</div>
                            <div style={{ fontSize: '9pt' }}>ลูกค้าผู้รับงาน (Customer)</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '9pt', color: '#444', borderTop: '1px dashed #ccc', paddingTop: '0.8rem' }}>
                        ขอบคุณที่ใช้บริการ ธนรินทร์แอร์ สกลนคร | มั่นใจ ชัดเจน เป็นธรรม
                    </div>
                </div>
            </div>
        </div>
    );
}
