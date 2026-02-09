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

    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return (
        <div style={{ paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 className="text-gradient-blue" style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarIcon size={32} /> ตารางงาน (Calendar)
                </h1>

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

            {/* Calendar Grid */}
            <div className="calendar-wrapper">
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

            {/* Modal */}
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
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{editingBooking.customer_name}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{editingBooking.service_type} • {editingBooking.date} • {editingBooking.time}</div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>สถานะงาน</label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        >
                                            <option value="pending">🟡 รอดำเนินการ</option>
                                            <option value="confirmed">🔵 ยืนยันแล้ว</option>
                                            <option value="completed">🟢 เสร็จสิ้น</option>
                                            <option value="cancelled">🔴 ยกเลิก</option>
                                        </select>
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
