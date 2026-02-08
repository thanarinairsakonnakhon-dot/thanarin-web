"use client";

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Booking } from '@/types';

export default function AdminBookingsPage() {
    const { bookings, updateBookingStatus, isLoading } = useAdmin();
    const [filter, setFilter] = useState<'all' | Booking['status']>('all');

    const filteredBookings = bookings.filter(b =>
        filter === 'all' ? true : b.status === filter
    );

    const getStatusColor = (status: Booking['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: Booking['status']) => {
        if (confirm(`คุณต้องการเปลี่ยนสถานะเป็น ${newStatus} ใช่หรือไม่?`)) {
            await updateBookingStatus(id, newStatus);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading bookings...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                📅 จัดการการจอง (Booking Management)
            </h1>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap
                            ${filter === f
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                    >
                        {f === 'all' ? 'ทั้งหมด' : f.charAt(0).toUpperCase() + f.slice(1)}
                        <span className="ml-2 opacity-80 text-xs">
                            ({bookings.filter(b => f === 'all' ? true : b.status === f).length})
                        </span>
                    </button>
                ))}
            </div>

            {/* Booking List */}
            <div className="grid gap-4">
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
                        ไม่พบรายการจอง
                    </div>
                ) : (
                    filteredBookings.map((booking) => (
                        <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
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
                                                {booking.service_type === 'installation' && '❄️ ติดตั้งแอร์ใหม่'}
                                                {booking.service_type === 'cleaning' && '✨ ล้างแอร์'}
                                                {booking.service_type === 'repair' && '🔧 ซ่อมแอร์'}
                                            </h3>
                                            <div className="text-slate-600 flex items-center gap-2 mb-1">
                                                📅 <span className="font-semibold text-blue-600">
                                                    {new Date(booking.date).toLocaleDateString('th-TH', {
                                                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                                    })}
                                                </span>
                                                ⏰ <span className="font-semibold text-blue-600">{booking.time}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 border-l pl-6 border-slate-100">
                                            <div className="mb-2">
                                                <div className="text-sm text-slate-500">ลูกค้า</div>
                                                <div className="font-semibold text-slate-800">{booking.customer_name}</div>
                                                <div className="text-slate-600 text-sm">📞 {booking.customer_phone}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-slate-500">สถานที่</div>
                                                <div className="text-slate-700 text-sm leading-relaxed">
                                                    {booking.address_details?.houseNo} {booking.address_details?.village}<br />
                                                    {booking.address_details?.subdistrict} {booking.address_details?.district}<br />
                                                    {booking.address_details?.province}
                                                </div>
                                                {booking.location_lat && (
                                                    <a
                                                        href={`https://www.google.com/maps?q=${booking.location_lat},${booking.location_lng}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block mt-2 text-xs text-blue-500 hover:underline"
                                                    >
                                                        📍 ดูแผนที่ (Google Maps)
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-start md:flex-col gap-2 min-w-[150px]">
                                    {booking.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                                className="w-full py-2 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                                            >
                                                ยืนยันการจอง
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                                className="w-full py-2 px-4 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition"
                                            >
                                                ยกเลิก
                                            </button>
                                        </>
                                    )}

                                    {booking.status === 'confirmed' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                                className="w-full py-2 px-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
                                            >
                                                งานเสร็จสิ้น
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                                className="w-full py-2 px-4 text-red-600 text-sm hover:underline"
                                            >
                                                ยกเลิกการจอง
                                            </button>
                                        </>
                                    )}
                                    {booking.status === 'cancelled' && (
                                        <div className="text-red-500 font-semibold text-center w-full py-2">
                                            ยกเลิกแล้ว
                                        </div>
                                    )}
                                    {booking.status === 'completed' && (
                                        <div className="text-green-600 font-semibold text-center w-full py-2">
                                            ✅ เสร็จสิ้น
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
