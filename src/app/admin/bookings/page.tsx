"use client";

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Booking } from '@/types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Plus, X, User, Phone } from 'lucide-react';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AdminBookingsPage() {
    const { bookings, updateBookingStatus, createBooking, assignTechnician, isLoading } = useAdmin();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
            setFormData(booking); // Pre-fill for editing
        } else {
            setEditingBooking(null);
            setFormData({
                ...formData,
                date: dateStr || new Date().toISOString().split('T')[0],
                customer_name: '',
                customer_phone: '',
                technician: '',
                // Reset other fields if needed
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingBooking) {
            // Edit logic - mostly for status/technician
            if (formData.status && formData.status !== editingBooking.status) {
                await updateBookingStatus(editingBooking.id, formData.status);
            }
            if (formData.technician !== editingBooking.technician && formData.technician !== undefined) {
                await assignTechnician(editingBooking.id, formData.technician);
            }
            // For simplicity, we are not fully updating all fields via AdminContext yet explicitly,
            // but could add updateBookingFields if needed. Main use case is assigning tech/status.
            alert('บันทึกการแก้ไขเรียบร้อย');
        } else {
            // Create New
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
        <div className="container mx-auto p-4 md:p-6 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 flex items-center gap-2">
                    <CalendarIcon className="text-blue-600" /> ตารางงาน (Calendar)
                </h1>

                <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                    <button onClick={() => navMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-bold text-lg text-slate-800 min-w-[140px] text-center">
                        {MONTHS[month]} {year}
                    </span>
                    <button onClick={() => navMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                        <ChevronRight size={20} />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 ml-2"
                    >
                        Today
                    </button>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
                >
                    <Plus size={18} /> ลงคิวงาน (Manual)
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                    {DAYS.map(day => (
                        <div key={day} className="py-3 text-center text-sm font-bold text-slate-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-[1px]">
                    {/* Empty cells for offset */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-white h-32 md:h-40" />
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
                                className={`bg-white min-h-[120px] md:h-40 p-2 transition hover:bg-slate-50 cursor-pointer flex flex-col gap-1 relative group
                                    ${isToday ? 'bg-blue-50/30' : ''}`}
                                onClick={(e) => {
                                    // Prevent opening modal if clicking on a booking item
                                    if (e.target === e.currentTarget) handleOpenModal(dateStr);
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                                        ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700'}`}>
                                        {day}
                                    </span>
                                    <button
                                        onClick={() => handleOpenModal(dateStr)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 text-blue-600 rounded-full transition"
                                        title="Add Booking"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto mt-1 space-y-1 custom-scrollbar">
                                    {dayBookings.map(booking => (
                                        <button
                                            key={booking.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenModal(dateStr, booking);
                                            }}
                                            className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium border-l-2 transition hover:brightness-95 shadow-sm
                                                ${booking.service_type === 'installation'
                                                    ? 'bg-blue-50 text-blue-800 border-blue-500'
                                                    : booking.service_type === 'cleaning'
                                                        ? 'bg-cyan-50 text-cyan-800 border-cyan-500'
                                                        : 'bg-orange-50 text-orange-800 border-orange-500'}
                                                ${booking.status === 'completed' ? 'opacity-60 saturate-0' : ''}
                                            `}
                                        >
                                            <div className="flex items-center gap-1 font-bold">
                                                <Clock size={10} /> {booking.time}
                                            </div>
                                            <div className="truncate">
                                                {booking.customer_name}
                                            </div>
                                            {booking.technician && (
                                                <div className="mt-0.5 text-[10px] opacity-80 truncate">
                                                    🔧 {booking.technician}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center gap-2">
                                {editingBooking ? '✏️ แก้ไขข้อมูล / จัดการงาน' : '📝 ลงคิวงานใหม่'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {!editingBooking ? (
                                // Creation Form
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">วันที่</label>
                                            <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-blue-100" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">เวลา</label>
                                            <select required value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-blue-100">
                                                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">ประเภทงาน</label>
                                        <select value={formData.service_type} onChange={e => setFormData({ ...formData, service_type: e.target.value })} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100">
                                            <option value="installation">❄️ ติดตั้งแอร์</option>
                                            <option value="cleaning">✨ ล้างแอร์</option>
                                            <option value="repair">🔧 ซ่อมแอร์</option>
                                            <option value="inspection">🔍 ตรวจเช็ค / อื่นๆ</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">ชื่อลูกค้า</label>
                                            <input type="text" required value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100" placeholder="ระบุชื่อลูกค้า..." />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">เบอร์โทร</label>
                                            <input type="text" value={formData.customer_phone} onChange={e => setFormData({ ...formData, customer_phone: e.target.value })} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100" placeholder="08x-xxx-xxxx" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">ช่างผู้รับผิดชอบ</label>
                                        <input type="text" value={formData.technician} onChange={e => setFormData({ ...formData, technician: e.target.value })} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100" placeholder="ระบุชื่อช่าง..." />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">รายละเอียดที่อยู่ / หมายเหตุ</label>
                                        <textarea
                                            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 min-h-[80px]"
                                            onChange={e => setFormData({ ...formData, address_details: { ...formData.address_details, houseNo: e.target.value } as any })}
                                            placeholder="บ้านเลขที่ หมู่บ้าน ซอย..."
                                        ></textarea>
                                    </div>
                                </>
                            ) : (
                                // Editing Form (Simplified for Status/Tech)
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="font-bold text-lg text-slate-800">{editingBooking.customer_name}</div>
                                        <div className="text-slate-600 text-sm flex gap-4 mt-1">
                                            <span className="flex items-center gap-1"><CalendarIcon size={14} /> {editingBooking.date}</span>
                                            <span className="flex items-center gap-1"><Clock size={14} /> {editingBooking.time}</span>
                                        </div>
                                        <div className="mt-2 text-sm text-slate-700">
                                            {editingBooking.service_type === 'installation' ? 'ติดตั้งแอร์' : editingBooking.service_type}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">สถานะงาน</label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="pending">🟡 รอดำเนินการ (Pending)</option>
                                            <option value="confirmed">🔵 รับงานแล้ว (Confirmed)</option>
                                            <option value="completed">🟢 เสร็จสิ้น (Completed)</option>
                                            <option value="cancelled">🔴 ยกเลิก (Cancelled)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">มอบหมายช่าง</label>
                                        <div className="flex items-center gap-2">
                                            <User size={18} className="text-slate-400" />
                                            <input
                                                type="text"
                                                value={formData.technician || ''}
                                                onChange={e => setFormData({ ...formData, technician: e.target.value })}
                                                className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                                                placeholder="ยังไม่ระบุช่าง..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 border-t border-slate-100 mt-2 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition">
                                    ยกเลิก
                                </button>
                                <button type="submit" className="flex-[2] bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                                    {editingBooking ? 'บันทึกการเปลี่ยนแปลง' : 'ยืนยันลงคิว'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
