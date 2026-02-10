"use client";

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Booking } from '@/types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, X, User } from 'lucide-react';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const extractCoords = (input: string) => {
    if (!input) return null;

    // Pattern 1: Google Maps URL with @lat,lng
    const atMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };

    // Pattern 2: Google Maps URL with query q=lat,lng
    const qMatch = input.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };

    // Pattern 3: Raw coordinates "lat, lng"
    const rawMatch = input.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (rawMatch) return { lat: parseFloat(rawMatch[1]), lng: parseFloat(rawMatch[2]) };

    return null;
};

export default function AdminBookingsPage() {
    const { bookings, updateBookingStatus, createBooking, assignTechnician } = useAdmin();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Booking>>({
        date: '',
        time: '09:00',
        service_type: 'installation',
        customer_name: '',
        customer_phone: '',
        address_details: {
            houseNo: '', subdistrict: '', district: '', province: ''
        } as any,
        status: 'confirmed',
        technician: ''
    });

    // Calendar Logic
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        return { daysInMonth, firstDayOfMonth };
    };

    const navMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const handleOpenModal = (dateStr?: string, booking?: Booking) => {
        if (booking) {
            setEditingBooking(booking);
            setFormData(booking);
        } else {
            setEditingBooking(null);
            setFormData({
                date: dateStr || new Date().toISOString().split('T')[0],
                time: '09:00',
                service_type: 'installation',
                customer_name: '',
                customer_phone: '',
                technician: '',
                status: 'confirmed',
                address_details: { houseNo: '' } as any
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingBooking) {
            if (formData.status && formData.status !== editingBooking.status) {
                await updateBookingStatus(editingBooking.id, formData.status);
            }
            if (formData.technician !== editingBooking.technician) {
                await assignTechnician(editingBooking.id, formData.technician || '');
            }
            alert('บันทึกการแก้ไขเรียบร้อย');
        } else {
            const result = await createBooking(formData);
            if (result.success) {
                alert('เพิ่มคิวเรียบร้อย');
            } else {
                alert('เกิดข้อผิดพลาด: ' + result.error);
                return;
            }
        }
        setShowModal(false);
    };

    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [summaryDate, setSummaryDate] = useState(new Date().toISOString().split('T')[0]);

    // ... existing helper functions ...

    // Summary Logic
    const getTechnicianSummary = (dateStr: string) => {
        const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
        const grouped: Record<string, Booking[]> = {};
        const unassigned: Booking[] = [];

        dayBookings.forEach(b => {
            if (b.technician) {
                if (!grouped[b.technician]) grouped[b.technician] = [];
                grouped[b.technician].push(b);
            } else {
                unassigned.push(b);
            }
        });

        return { grouped, unassigned };
    };

    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <div className="no-print">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 className="text-gradient-blue" style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CalendarIcon size={32} /> ตารางงาน (Calendar)
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => {
                                setSummaryDate(new Date().toISOString().split('T')[0]);
                                setShowSummaryModal(true);
                            }}
                            className="btn-wow"
                            style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            📋 สรุปงานรายวัน
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <button onClick={() => navMonth(-1)} style={{ padding: '0.5rem', cursor: 'pointer', border: 'none', background: 'none' }}>
                                <ChevronLeft size={24} color="#64748b" />
                            </button>
                            <span style={{ fontWeight: 800, fontSize: '1.2rem', minWidth: '160px', textAlign: 'center', color: '#1e293b' }}>
                                {MONTHS[month]} {year}
                            </span>
                            <button onClick={() => navMonth(1)} style={{ padding: '0.5rem', cursor: 'pointer', border: 'none', background: 'none' }}>
                                <ChevronRight size={24} color="#64748b" />
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                style={{ padding: '0.4rem 0.8rem', background: '#eff6ff', color: '#0A84FF', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                Today
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="calendar-wrapper">
                    {/* ... existing calendar grid ... */}
                    {/* Header */}
                    <div className="calendar-grid" style={{ marginBottom: '1px' }}>
                        {DAYS.map(day => (
                            <div key={day} className="calendar-header-cell">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="calendar-grid">
                        {/* Empty cells */}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="calendar-cell" style={{ background: '#f8fafc', cursor: 'default' }} />
                        ))}

                        {/* Date Cells */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dayBookings = bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
                            const isToday = new Date().toISOString().split('T')[0] === dateStr;

                            return (
                                <div
                                    key={day}
                                    className={`calendar-cell ${isToday ? 'today' : ''}`}
                                    onClick={(e) => {
                                        if (e.target === e.currentTarget) handleOpenModal(dateStr);
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div className="calendar-date-badge">{day}</div>
                                        <button
                                            className="add-btn"
                                            onClick={() => handleOpenModal(dateStr)}
                                            title="Add Booking"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div style={{ flex: 1, overflowY: 'auto' }}>
                                        {dayBookings.map(booking => {
                                            let typeClass = 'calendar-event';
                                            if (booking.service_type === 'installation') typeClass += ' install';
                                            if (booking.service_type === 'cleaning') typeClass += ' cleaning';
                                            if (booking.service_type === 'repair') typeClass += ' repair';

                                            return (
                                                <div
                                                    key={booking.id}
                                                    className={typeClass}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenModal(dateStr, booking);
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                                                        <Clock size={10} /> {booking.time}
                                                    </div>
                                                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {booking.customer_name}
                                                    </div>
                                                    {booking.technician && (
                                                        <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '2px' }}>
                                                            🔧 {booking.technician}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Summary Modal */}
            {showSummaryModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                                    📋 สรุปงานประจำวัน
                                </h2>
                                <input
                                    type="date"
                                    value={summaryDate}
                                    onChange={(e) => setSummaryDate(e.target.value)}
                                    style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => window.print()} style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                    🖨️ พิมพ์
                                </button>
                                <button onClick={() => setShowSummaryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                                    <X size={24} color="#94a3b8" />
                                </button>
                            </div>
                        </div>

                        <div className="summary-print-area">
                            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#334155' }}>
                                วันที่ {new Date(summaryDate).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </h3>

                            {(() => {
                                const { grouped, unassigned } = getTechnicianSummary(summaryDate);
                                return (
                                    <div style={{ display: 'grid', gap: '2rem' }}>
                                        {/* Unassigned Jobs */}
                                        {unassigned.length > 0 && (
                                            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '1.5rem', background: '#f8fafc' }}>
                                                <h4 style={{ color: '#64748b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    ⚠️ ยังไม่ระบุช่าง ({unassigned.length} งาน)
                                                </h4>
                                                <div style={{ display: 'grid', gap: '1rem' }}>
                                                    {unassigned.map(b => (
                                                        <div key={b.id} style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '0.5rem' }}>
                                                                <div>🕒 {b.time} น.</div>
                                                                <div style={{ color: '#ef4444' }}>{b.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอดำเนินการ'}</div>
                                                            </div>
                                                            <div>{b.customer_name} ({b.customer_phone})</div>
                                                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem' }}>📍 {b.address_details?.subdistrict} {b.address_details?.district}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Assigned Jobs by Technician */}
                                        {Object.entries(grouped).map(([tech, jobs]) => (
                                            <div key={tech} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', background: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                                                <h4 style={{ fontSize: '1.2rem', color: '#0F172A', marginBottom: '1rem', borderBottom: '2px solid #3b82f6', paddingBottom: '0.5rem', display: 'inline-block' }}>
                                                    👷‍♂️ ช่าง{tech} ({jobs.length} งาน)
                                                </h4>
                                                <div style={{ display: 'grid', gap: '1rem' }}>
                                                    {jobs.sort((a, b) => a.time.localeCompare(b.time)).map(b => (
                                                        <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '1rem', padding: '0.8rem', background: '#f8fafc', borderRadius: '8px', alignItems: 'center' }}>
                                                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#3b82f6' }}>{b.time}</div>
                                                            <div>
                                                                <div style={{ fontWeight: 600 }}>{b.customer_name}</div>
                                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>📞 {b.customer_phone}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.9rem' }}>
                                                                    {b.service_type === 'installation' && '❄️ ติดตั้ง'}
                                                                    {b.service_type === 'cleaning' && '✨ ล้าง'}
                                                                    {b.service_type === 'repair' && '🔧 ซ่อม'}
                                                                </div>
                                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>📍 {b.address_details?.subdistrict}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        {unassigned.length === 0 && Object.keys(grouped).length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                                ยังไม่มีคิวงานในวันนี้
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Original) */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                                {editingBooking ? '✏️ แก้ไขข้อมูล' : '📝 ลงคิวงานใหม่'}
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                                <X size={24} color="#94a3b8" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {!editingBooking ? (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>วันที่</label>
                                            <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>เวลา</label>
                                            <select required value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>ประเภทงาน</label>
                                        <select value={formData.service_type} onChange={e => setFormData({ ...formData, service_type: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                            <option value="installation">❄️ ติดตั้งแอร์</option>
                                            <option value="cleaning">✨ ล้างแอร์</option>
                                            <option value="repair">🔧 ซ่อมแอร์</option>
                                            <option value="inspection">🔍 ตรวจเช็ค / อื่นๆ</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>ชื่อลูกค้า</label>
                                        <input type="text" required value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="ระบุชื่อลูกค้า..." />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>เบอร์โทร</label>
                                        <input type="text" value={formData.customer_phone} onChange={e => setFormData({ ...formData, customer_phone: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="08x-xxx-xxxx" />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>ลิ้งค์แผนที่ / พิกัด (Google Maps)</label>
                                        <input
                                            type="text"
                                            placeholder="วางลิ้งค์ Google Maps หรือพิกัด..."
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                            onChange={(e) => {
                                                const coords = extractCoords(e.target.value);
                                                if (coords) {
                                                    setFormData({ ...formData, location_lat: coords.lat, location_lng: coords.lng });
                                                }
                                            }}
                                        />
                                        {formData.location_lat && (
                                            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
                                                ✅ ตรวจพบพิกัด: {formData.location_lat.toFixed(4)}, {formData.location_lng?.toFixed(4)}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>รายละเอียด/หมายเหตุ</label>
                                        <textarea
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px' }}
                                            onChange={e => setFormData({ ...formData, address_details: { ...formData.address_details, houseNo: e.target.value } as any })}
                                            placeholder="บ้านเลขที่, หมายเหตุ..."
                                        ></textarea>
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#1e293b' }}>{editingBooking.customer_name}</div>
                                                <a href={`tel:${editingBooking.customer_phone}`} style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                                                    📞 {editingBooking.customer_phone}
                                                </a>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 600, color: '#0A84FF' }}>
                                                    {editingBooking.service_type === 'installation' && '❄️ ติดตั้ง'}
                                                    {editingBooking.service_type === 'cleaning' && '✨ ล้าง'}
                                                    {editingBooking.service_type === 'repair' && '🔧 ซ่อม'}
                                                    {editingBooking.service_type === 'inspection' && '🔍 เช็ค'}
                                                </div>
                                                {editingBooking.order_id && (
                                                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
                                                        📦 Order: #{editingBooking.order_id.slice(0, 8)}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                    {new Date(editingBooking.date).toLocaleDateString('th-TH')} • {editingBooking.time}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address Section */}
                                        <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.8rem' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>📍 ที่อยู่หน้างาน</div>
                                            <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>
                                                {editingBooking.address_details?.houseNo} {editingBooking.address_details?.village} <br />
                                                {editingBooking.address_details?.subdistrict} {editingBooking.address_details?.district} <br />
                                                {editingBooking.address_details?.province}
                                            </div>

                                            {/* Google Maps Link */}
                                            {editingBooking.location_lat && editingBooking.location_lng && (
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${editingBooking.location_lat},${editingBooking.location_lng}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                        marginTop: '0.8rem', padding: '0.5rem 1rem',
                                                        background: '#eff6ff', color: '#0A84FF',
                                                        borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    🗺️ เปิดแผนที่ (Google Maps)
                                                </a>
                                            )}
                                        </div>

                                        {/* Notes Section (AC Model / Product Context) */}
                                        {editingBooking.note && (
                                            <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>📝 หมายเหตุ / รุ่นสินค้า</div>
                                                <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 500 }}>
                                                    {editingBooking.note}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>สถานะงาน</label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}
                                        >
                                            <option value="pending">⏳ รอยืนยัน</option>
                                            <option value="confirmed">✅ ยืนยันแล้ว</option>
                                            <option value="completed">🏁 เสร็จสิ้น</option>
                                            <option value="cancelled">❌ ยกเลิก</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>ลิ้งค์แผนที่ / พิกัด (Google Maps)</label>
                                        <input
                                            type="text"
                                            defaultValue={editingBooking.location_lat ? `${editingBooking.location_lat}, ${editingBooking.location_lng}` : ''}
                                            placeholder="วางลิ้งค์ Google Maps ใหม่เพื่อแก้ไขพิกัด..."
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                            onChange={(e) => {
                                                const coords = extractCoords(e.target.value);
                                                if (coords) {
                                                    setFormData({ ...formData, location_lat: coords.lat, location_lng: coords.lng });
                                                }
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>มอบหมายช่าง</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <User size={20} color="#94a3b8" />
                                            <input
                                                type="text"
                                                value={formData.technician || ''}
                                                onChange={e => setFormData({ ...formData, technician: e.target.value })}
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                placeholder="ยังไม่ระบุช่าง..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn-wow" style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                                    {editingBooking ? 'บันทึก' : 'ยืนยัน'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
