"use client";

import { useState } from 'react';
import { bookingSlots } from '@/data/bookings'; // Re-using mock data structure somewhat or defining new ones

export default function AdminBookings() {
    // Mock Booking Data for visualization
    const [bookings, setBookings] = useState([
        { id: 'B001', customer: 'คุณวิชัย', phone: '081-111-1111', service: 'ติดตั้งแอร์ใหม่ (2 เครื่อง)', date: '2024-02-15', time: '09:00', status: 'Pending', technician: '-' },
        { id: 'B002', customer: 'ร้านกาแฟ Space', phone: '089-999-8888', service: 'ล้างแอร์ (Cassette)', date: '2024-02-15', time: '13:00', status: 'Confirmed', technician: 'ช่างเอก' },
        { id: 'B003', customer: 'คุณสมชาย', phone: '085-555-5555', service: 'ซ่อมแอร์น้ำหยด', date: '2024-02-16', time: '10:00', status: 'Completed', technician: 'ช่างบอย' },
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return { bg: '#fff7ed', text: '#f59e0b' };
            case 'Confirmed': return { bg: '#ecfdf5', text: '#059669' };
            case 'Completed': return { bg: '#f1f5f9', text: '#64748b' };
            default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>รายการจองคิว</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ padding: '0.6rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>Export CSV</button>
                    <button style={{ padding: '0.6rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>Print Schedule</button>
                </div>
            </div>

            {/* Kanban / List Toggle (Simplified to List for now) */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>ID</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>ลูกค้า</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>บริการ</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>วัน-เวลา</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>ช่างผู้รับผิดชอบ</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>สถานะ</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => {
                            const statusStyle = getStatusColor(booking.status);
                            return (
                                <tr key={booking.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>{booking.id}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{booking.customer}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{booking.phone}</div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#475569' }}>{booking.service}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{booking.date}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{booking.time} น.</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {booking.technician === '-' ? (
                                            <span style={{ color: '#ef4444', fontSize: '0.9rem', fontStyle: 'italic' }}>ยังไม่ระบุ</span>
                                        ) : (
                                            <span style={{ color: '#1e293b', fontWeight: 500 }}>👷 {booking.technician}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600,
                                            background: statusStyle.bg, color: statusStyle.text
                                        }}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button className="btn-wow" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                                            จัดการ
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
