"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Booking {
    id: string;
    customer_name: string;
    phone: string;
    service_type: string;
    booking_date: string;
    booking_time: string;
    address: string;
    status: string;
    technician_id: string | null;
    created_at: string;
}

const technicians = [
    { id: 'tech1', name: 'ช่างเอก' },
    { id: 'tech2', name: 'ช่างบอย' },
    { id: 'tech3', name: 'ช่างนิว' },
];

export default function AdminBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Load bookings
    useEffect(() => {
        loadBookings();

        // Subscribe to real-time updates
        const channel = supabase
            .channel('admin_bookings')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'bookings'
            }, () => {
                loadBookings();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const loadBookings = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('booking_date', { ascending: true })
            .order('booking_time', { ascending: true });

        if (data) {
            setBookings(data);
        }
        if (error) {
            console.error('Error loading bookings:', error);
        }
        setIsLoading(false);
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        await supabase
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', id);
    };

    const handleAssignTechnician = async (id: string, techId: string) => {
        await supabase
            .from('bookings')
            .update({ technician_id: techId, status: 'Confirmed' })
            .eq('id', id);
        setShowModal(false);
    };

    const handleDeleteBooking = async (id: string) => {
        if (confirm('ยืนยันการลบการจองนี้?')) {
            await supabase
                .from('bookings')
                .delete()
                .eq('id', id);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return { bg: '#fff7ed', text: '#f59e0b', label: 'รอยืนยัน' };
            case 'Confirmed': return { bg: '#ecfdf5', text: '#059669', label: 'ยืนยันแล้ว' };
            case 'Completed': return { bg: '#eff6ff', text: '#3b82f6', label: 'เสร็จสิ้น' };
            case 'Cancelled': return { bg: '#fef2f2', text: '#ef4444', label: 'ยกเลิก' };
            default: return { bg: '#f1f5f9', text: '#64748b', label: status };
        }
    };

    const getTechnicianName = (techId: string | null) => {
        if (!techId) return null;
        const tech = technicians.find(t => t.id === techId);
        return tech ? tech.name : techId;
    };

    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('th-TH', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>📅 รายการจองคิว</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={loadBookings}
                        style={{ padding: '0.6rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        🔄 รีเฟรช
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'ทั้งหมด', count: bookings.length, color: '#64748b', filter: 'all' },
                    { label: 'รอยืนยัน', count: bookings.filter(b => b.status === 'Pending').length, color: '#f59e0b', filter: 'Pending' },
                    { label: 'ยืนยันแล้ว', count: bookings.filter(b => b.status === 'Confirmed').length, color: '#059669', filter: 'Confirmed' },
                    { label: 'เสร็จสิ้น', count: bookings.filter(b => b.status === 'Completed').length, color: '#3b82f6', filter: 'Completed' },
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        onClick={() => setFilter(stat.filter)}
                        style={{
                            background: filter === stat.filter ? '#eff6ff' : 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: filter === stat.filter ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.count}</div>
                        <div style={{ color: '#64748b' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Bookings Table */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {isLoading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        กำลังโหลด...
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <div>ไม่มีรายการจอง</div>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>ลูกค้า</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>บริการ</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>วัน-เวลา</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>ช่าง</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>สถานะ</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((booking) => {
                                const statusStyle = getStatusColor(booking.status);
                                const techName = getTechnicianName(booking.technician_id);
                                return (
                                    <tr key={booking.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{booking.customer_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>📞 {booking.phone}</div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#475569' }}>
                                            <div>{booking.service_type}</div>
                                            {booking.address && (
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    📍 {booking.address}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{formatDate(booking.booking_date)}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>🕐 {booking.booking_time} น.</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {techName ? (
                                                <span style={{ color: '#1e293b', fontWeight: 500 }}>👷 {techName}</span>
                                            ) : (
                                                <button
                                                    onClick={() => { setSelectedBooking(booking); setShowModal(true); }}
                                                    style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                                >
                                                    + มอบหมายช่าง
                                                </button>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <select
                                                value={booking.status}
                                                onChange={(e) => handleUpdateStatus(booking.id, e.target.value)}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '50px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    border: 'none',
                                                    background: statusStyle.bg,
                                                    color: statusStyle.text,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="Pending">รอยืนยัน</option>
                                                <option value="Confirmed">ยืนยันแล้ว</option>
                                                <option value="Completed">เสร็จสิ้น</option>
                                                <option value="Cancelled">ยกเลิก</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => { setSelectedBooking(booking); setShowModal(true); }}
                                                style={{ marginRight: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBooking(booking.id)}
                                                style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Assign Technician Modal */}
            {showModal && selectedBooking && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '400px', maxWidth: '90%' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>มอบหมายช่าง</h2>

                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{selectedBooking.customer_name}</div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{selectedBooking.service_type}</div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                {formatDate(selectedBooking.booking_date)} - {selectedBooking.booking_time} น.
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>เลือกช่าง</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {technicians.map(tech => (
                                    <button
                                        key={tech.id}
                                        onClick={() => handleAssignTechnician(selectedBooking.id, tech.id)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            border: selectedBooking.technician_id === tech.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                            background: selectedBooking.technician_id === tech.id ? '#eff6ff' : 'white',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        👷 {tech.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
