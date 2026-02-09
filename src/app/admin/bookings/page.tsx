"use client";

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Booking } from '@/types';
import { Calendar, Clock, MapPin, Phone, User, Plus, Search, Calendar as CalendarIcon, X } from 'lucide-react';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

export default function AdminBookingsPage() {
    const { bookings, updateBookingStatus, createBooking, assignTechnician, isLoading } = useAdmin();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState<'schedule' | 'list'>('schedule');
    const [showModal, setShowModal] = useState(false);

    // Modal State
    const [formData, setFormData] = useState<Partial<Booking>>({
        date: selectedDate,
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

    const bookingsOnDate = bookings.filter(b => b.date === selectedDate && b.status !== 'cancelled');

    const handleOpenModal = (date = selectedDate, time = '09:00') => {
        setFormData({
            ...formData,
            date,
            time,
            customer_name: '',
            customer_phone: '-',
            technician: ''
        });
        setShowModal(true);
    };

    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await createBooking(formData);
        if (result.success) {
            alert('เพิ่มคิวเรียบร้อย');
            setShowModal(false);
        } else {
            alert('เกิดข้อผิดพลาด: ' + result.error);
        }
    };

    const handleAssignTechnician = async (id: string, techName: string) => {
        if (!techName) return;
        await assignTechnician(id, techName);
    };

    // Generate next 14 days for date picker
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
    }

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="text-gradient-blue" style={{ fontSize: '2rem', fontWeight: 800 }}>📅 จัดการตารางงาน</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setViewMode('schedule')}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${viewMode === 'schedule' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
                    >
                        ตารางงาน
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
                    >
                        รายการทั้งหมด
                    </button>
                </div>
            </div>

            {viewMode === 'schedule' && (
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Date Picker Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-fit">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <CalendarIcon size={18} /> เลือกวันที่
                        </h3>
                        <div className="flex flex-col gap-2">
                            {dates.map(date => {
                                const count = bookings.filter(b => b.date === date && b.status !== 'cancelled').length;
                                return (
                                    <button
                                        key={date}
                                        onClick={() => setSelectedDate(date)}
                                        className={`p-3 rounded-xl text-left transition flex justify-between items-center
                                            ${selectedDate === date
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 border'
                                                : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                                    >
                                        <span className="font-medium">
                                            {new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                        </span>
                                        {count > 0 && (
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Schedule Grid */}
                    <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">
                                {new Date(selectedDate).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </h2>
                            <button
                                onClick={() => handleOpenModal(selectedDate)}
                                className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-slate-800"
                            >
                                <Plus size={16} /> เพิ่มคิวงานด่วน
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {TIME_SLOTS.map(time => {
                                const booking = bookingsOnDate.find(b => b.time === time);
                                return (
                                    <div key={time} className="flex gap-4 items-stretch group">
                                        <div className="w-20 py-4 flex items-center justify-center font-bold text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                                            {time}
                                        </div>

                                        <div className="flex-1">
                                            {booking ? (
                                                <div className={`h-full p-4 rounded-xl border transition hover:shadow-md flex flex-col md:flex-row gap-4 items-start md:items-center justify-between
                                                    ${booking.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-blue-100 shadow-sm'}
                                                `}>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold 
                                                                ${booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                                    booking.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {booking.status.toUpperCase()}
                                                            </span>
                                                            <span className="font-bold text-slate-800">
                                                                {booking.customer_name}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-slate-600 flex items-center gap-4">
                                                            <span>🔧 {
                                                                booking.service_type === 'installation' ? 'ติดตั้งแอร์' :
                                                                    booking.service_type === 'cleaning' ? 'ล้างแอร์' : 'ซ่อมแอร์'
                                                            }</span>
                                                            <span>📞 {booking.customer_phone}</span>
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-slate-700">ช่างผู้รับผิดชอบ:</span>
                                                            <input
                                                                type="text"
                                                                className="text-sm border-b border-dashed border-slate-300 focus:border-blue-500 outline-none bg-transparent px-1 min-w-[150px]"
                                                                placeholder="ระบุชื่อช่าง..."
                                                                defaultValue={booking.technician || ''}
                                                                onBlur={(e) => handleAssignTechnician(booking.id, e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        {booking.status === 'pending' && <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg">รับงาน</button>}
                                                        {booking.status === 'confirmed' && <button onClick={() => updateBookingStatus(booking.id, 'completed')} className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg">ปิดงาน</button>}
                                                        <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100">ยกเลิก</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleOpenModal(selectedDate, time)}
                                                    className="w-full h-full min-h-[80px] border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition gap-2"
                                                >
                                                    <Plus size={18} /> ว่าง - คลิกเพื่อลงคิวงาน
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* List View (Original) */}
            {viewMode === 'list' && (
                <div className="grid gap-4">
                    {bookings.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
                            ไม่พบรายการจอง
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border 
                                                ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}
                                            `}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                            <span className="text-slate-500 text-sm">
                                                ID: {booking.id.slice(0, 8)}
                                            </span>
                                            <span className="text-slate-400 text-sm">
                                                จองเมื่อ: {new Date(booking.created_at || '').toLocaleDateString('th-TH')}
                                            </span>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-6 mt-4">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-slate-800 mb-1">
                                                    {booking.service_type}
                                                </h3>
                                                <div className="text-slate-600 flex items-center gap-2 mb-1">
                                                    📅 <span className="font-semibold text-blue-600">
                                                        {new Date(booking.date).toLocaleDateString('th-TH', {
                                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                                        })}
                                                    </span>
                                                    ⏰ <span className="font-semibold text-blue-600">{booking.time}</span>
                                                </div>
                                                <div className="text-slate-700 mt-2">
                                                    <b>ช่าง:</b> {booking.technician || '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal for Manual Booking */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                                📝 ลงคิวงาน (Manual Booking)
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateBooking} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">วันที่</label>
                                    <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full p-2 border rounded-lg bg-slate-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">เวลา</label>
                                    <select value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full p-2 border rounded-lg bg-slate-50">
                                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">ประเภทงาน</label>
                                <select value={formData.service_type} onChange={e => setFormData({ ...formData, service_type: e.target.value })} className="w-full p-2 border rounded-lg">
                                    <option value="installation">ติดตั้งแอร์</option>
                                    <option value="cleaning">ล้างแอร์</option>
                                    <option value="repair">ซ่อมแอร์</option>
                                    <option value="inspection">ตรวจเช็ค / อื่นๆ</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อลูกค้า (หรือชื่อช่าง)</label>
                                    <input type="text"
                                        value={formData.customer_name}
                                        onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                                        className="w-full p-2 border rounded-lg focus:border-blue-500 outline-none"
                                        placeholder="ระบุชื่อ..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">เบอร์โทรติดต่อ</label>
                                    <input type="text"
                                        value={formData.customer_phone}
                                        onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                                        className="w-full p-2 border rounded-lg focus:border-blue-500 outline-none"
                                        placeholder="-"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">ระบุช่าง (Optional)</label>
                                <input type="text"
                                    value={formData.technician}
                                    onChange={e => setFormData({ ...formData, technician: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:border-blue-500 outline-none"
                                    placeholder="เช่น ช่างเอก, ช่างบอย..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">รายละเอียด / หมายเหตุ</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg focus:border-blue-500 outline-none"
                                    rows={3}
                                    placeholder="ใส่รายละเอียดที่อยู่ หรือหมายเหตุกำกับงาน..."
                                    onChange={e => setFormData({
                                        ...formData,
                                        address_details: { ...formData.address_details, houseNo: e.target.value } as any // Using houseNo to store simple note for manual
                                    })}
                                ></textarea>
                            </div>

                            <button type="submit" className="mt-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                                ยืนยันการลงคิวงาน
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
