"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/context/AdminContext';
import { QRCodeSVG } from 'qrcode.react';

interface Order {
    id: string;
    created_at: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    location_lat?: number;
    location_lng?: number;
    total_price: number;
    status: string;
    admin_notes?: string;
    items?: any[];
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [settings, setSettings] = useState<{ phone_number?: string }>({
        phone_number: '086-238-7571' // Official fallback
    });

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*), bookings(id)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const { data } = await supabase
                .from('site_settings')
                .select('setting_key, setting_value')
                .in('setting_key', ['phone_number']);

            if (data && data.length > 0) {
                const settingsMap: any = {};
                data.forEach(item => {
                    settingsMap[item.setting_key] = item.setting_value;
                });
                setSettings(prev => ({ ...prev, ...settingsMap }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchSettings();
    }, []);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return { bg: '#fff7ed', color: '#f59e0b', label: 'รอดำเนินการ' };
            case 'confirmed': return { bg: '#eff6ff', color: '#3b82f6', label: 'ยืนยันแล้ว' };
            case 'shipped': return { bg: '#f5f3ff', color: '#8b5cf6', label: 'กำลังส่ง' };
            case 'completed': return { bg: '#f0fdf4', color: '#22c55e', label: 'สำเร็จ' };
            case 'cancelled': return { bg: '#fef2f2', color: '#ef4444', label: 'ยกเลิก' };
            default: return { bg: '#f1f5f9', color: '#64748b', label: status };
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>📦 จัดการรายการสั่งซื้อ</h1>
                <button
                    onClick={fetchOrders}
                    style={{ padding: '0.6rem 1.2rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}
                >
                    🔄 รีเฟรช
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>กำลังโหลดข้อมูล...</div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem' }}>วันที่ / เวลา</th>
                                <th style={{ textAlign: 'left', padding: '1rem' }}>ลูกค้า</th>
                                <th style={{ textAlign: 'left', padding: '1rem' }}>ยอดรวม</th>
                                <th style={{ textAlign: 'left', padding: '1rem' }}>สถานะ</th>
                                <th style={{ textAlign: 'right', padding: '1rem' }}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const status = getStatusStyle(order.status);
                                return (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{new Date(order.created_at).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.customer_phone}</div>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 700 }}>฿{order.total_price.toLocaleString()}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '50px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: status.bg,
                                                color: status.color
                                            }}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                style={{ padding: '0.4rem 0.8rem', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer' }}
                                            >
                                                ดูรายละเอียด
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="card-glass" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>รายละเอียดการสั่งซื้อ</h2>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>ข้อมูลลูกค้า</h3>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedOrder.customer_name}</div>
                                <div style={{ marginBottom: '0.5rem' }}>📞 {selectedOrder.customer_phone}</div>
                                <div style={{ fontSize: '0.9rem', color: '#475569', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    📍 <strong>ที่อยู่:</strong> <br /> {selectedOrder.customer_address}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#10b981', background: '#f0fdf4', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                    📋 <strong>ข้อมูลการจอง:</strong> <br />
                                    {(selectedOrder as any).bookings?.length > 0 ? (
                                        <span>🟢 มีการเลื่อนนัด/จองคิวติดตั้งแล้ว</span>
                                    ) : (
                                        <span style={{ color: '#ef4444' }}>🔴 ยังไม่มีการจองคิวช่าง</span>
                                    )}
                                </div>

                                {selectedOrder.location_lat && selectedOrder.location_lng && (
                                    <div style={{ marginTop: '1rem', textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>📍 พิกัดหน้างาน (Scan นำทาง)</div>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', background: 'white', padding: '10px', borderRadius: '8px', width: 'fit-content', margin: '0 auto 8px' }}>
                                            <QRCodeSVG
                                                value={`https://www.google.com/maps?q=${selectedOrder.location_lat},${selectedOrder.location_lng}`}
                                                size={120}
                                            />
                                        </div>
                                        <a
                                            href={`https://www.google.com/maps?q=${selectedOrder.location_lat},${selectedOrder.location_lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
                                        >
                                            ดูใน Google Maps ↗
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>จัดการสถานะ</h3>
                                <select
                                    value={selectedOrder.status}
                                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1rem' }}
                                >
                                    <option value="pending">⏳ รอดำเนินการ</option>
                                    <option value="confirmed">✅ ยืนยันรายการ</option>
                                    <option value="shipped">🚚 กำลังจัดส่ง</option>
                                    <option value="completed">🏁 สำเร็จ</option>
                                    <option value="cancelled">❌ ยกเลิก</option>
                                </select>
                                <div style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                                    <strong>หมายเหตุ:</strong> <br />
                                    {selectedOrder.admin_notes || '- ไม่มีหมายเหตุ -'}
                                </div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>รายการสินค้า</h3>
                        <div style={{ marginBottom: '2rem' }}>
                            {(selectedOrder as any).order_items?.map((item: any) => (
                                <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #f8fafc' }}>
                                    <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '4px', overflow: 'hidden' }}>
                                        <img src={item.image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>฿{item.price.toLocaleString()} x {item.quantity} ชิ้น</div>
                                    </div>
                                    <div style={{ fontWeight: 700 }}>
                                        ฿{(item.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ textAlign: 'right', borderTop: '2px solid #f1f5f9', paddingTop: '1rem' }}>
                            <div style={{ fontSize: '1.2rem', color: '#64748b' }}>ยอดรวมทั้งหมด</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary-blue)' }}>฿{selectedOrder.total_price.toLocaleString()}</div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => window.print()}
                                style={{ flex: 1, padding: '1rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                🖨️ พิมพ์ใบปะหน้าสินค้า
                            </button>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                style={{ flex: 1, padding: '1rem', background: 'var(--color-primary-blue)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                ตกลง
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Print Area (Visible only when printing) */}
            {selectedOrder && (
                <div className="print-only-section">
                    <div className="job-sheet" style={{ padding: '0', background: 'white', color: 'black', fontSize: '10pt' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2.5px solid #000', paddingBottom: '1rem' }}>
                            <h1 style={{ margin: 0, fontSize: '24pt', fontWeight: 800 }}>THANARIN AIR</h1>
                            <p style={{ margin: '4px 0', fontSize: '12pt', fontWeight: 700 }}>ธนรินทร์แอร์ สกลนคร | ตัวแทนจำหน่ายและติดตั้งเครื่องปรับอากาศ</p>
                            <p style={{ margin: 0, fontSize: '10pt' }}>โทร: {settings.phone_number || '086-238-7571'} | thanarin-air.com</p>
                        </div>

                        <div style={{ display: 'flex', width: '100%', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                            <div style={{ width: '60%' }}>
                                <h3 style={{ fontSize: '11pt', fontWeight: 700, margin: '0 0 0.5rem 0', textDecoration: 'underline' }}>ข้อมูลลูกค้า (Customer)</h3>
                                <div style={{ lineHeight: 1.6, fontSize: '10pt', paddingRight: '1rem' }}>
                                    <strong>ชื่อผู้รับ:</strong> {selectedOrder.customer_name} <br />
                                    <strong>เบอร์โทรศัพท์:</strong> {selectedOrder.customer_phone} <br />
                                    <strong>ที่อยู่ติดตั้ง:</strong> <span style={{ wordBreak: 'break-word' }}>{selectedOrder.customer_address}</span>
                                </div>
                            </div>
                            <div style={{ width: '40%', textAlign: 'right' }}>
                                <h3 style={{ fontSize: '11pt', fontWeight: 700, margin: '0 0 0.5rem 0', textDecoration: 'underline' }}>ข้อมูลทั่วไป (Order Info)</h3>
                                <div style={{ lineHeight: 1.6, fontSize: '10pt' }}>
                                    <strong>เลขที่สั่งซื้อ:</strong> #{selectedOrder.id.slice(0, 8).toUpperCase()} <br />
                                    <strong>วันที่สั่งซื้อ:</strong> {new Date(selectedOrder.created_at).toLocaleDateString('th-TH')} <br />
                                    <strong>สถานะ:</strong> <span style={{ textTransform: 'uppercase' }}>{selectedOrder.status}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '11pt', fontWeight: 700, borderBottom: '2px solid #000', marginBottom: '0.5rem' }}>รายการสินค้า (Product List)</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
                                <thead>
                                    <tr style={{ background: '#f1f5f9' }}>
                                        <th style={{ textAlign: 'left', padding: '0.75rem', border: '1px solid #000', fontWeight: 700, width: '60%' }}>รายการสินค้า</th>
                                        <th style={{ textAlign: 'center', padding: '0.75rem', border: '1px solid #000', fontWeight: 700, width: '15%' }}>จำนวน</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem', border: '1px solid #000', fontWeight: 700, width: '25%' }}>รวม (บาท)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(selectedOrder as any).order_items?.map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td style={{ padding: '0.75rem', border: '1px solid #000' }}>{item.product_name}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center', border: '1px solid #000' }}>{item.quantity}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', border: '1px solid #000' }}>{item.price.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={2} style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 700, border: '1px solid #000' }}>รวมยอดเงินสุทธิ</td>
                                        <td style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 800, border: '1px solid #000', background: '#f8fafc', fontSize: '12pt' }}>฿{selectedOrder.total_price.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ border: '1px solid #000', padding: '1rem', borderRadius: '8px', minHeight: '100px' }}>
                                <strong style={{ fontSize: '10pt', textDecoration: 'underline' }}>หมายเหตุเพิ่มเติม (Notes):</strong> <br />
                                <div style={{ fontSize: '10pt', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{selectedOrder.admin_notes || '-'}</div>
                            </div>
                            {selectedOrder.location_lat && (
                                <div style={{ textAlign: 'center', border: '1px solid #000', padding: '0.75rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '9pt', fontWeight: 700, marginBottom: '0.5rem' }}>📍 แผนที่หน้างาน</div>
                                    <div style={{ background: 'white', padding: '5px', display: 'inline-block' }}>
                                        <QRCodeSVG value={`https://www.google.com/maps?q=${selectedOrder.location_lat},${selectedOrder.location_lng}`} size={120} />
                                    </div>
                                    <div style={{ fontSize: '7pt', color: '#666', marginTop: '0.3rem' }}>สแกนเพื่อนำทาง</div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ textAlign: 'center', width: '230px' }}>
                                <div style={{ borderBottom: '1.5px solid #000', marginBottom: '0.5rem', height: '40px' }}></div>
                                <div style={{ fontSize: '10pt', fontWeight: 600 }}>ลงชื่อ......................................................</div>
                                <div style={{ fontSize: '9pt' }}>ผู้จัดเตรียมสินค้า (Technician)</div>
                            </div>
                            <div style={{ textAlign: 'center', width: '230px' }}>
                                <div style={{ borderBottom: '1.5px solid #000', marginBottom: '0.5rem', height: '40px' }}></div>
                                <div style={{ fontSize: '10pt', fontWeight: 600 }}>ลงชื่อ......................................................</div>
                                <div style={{ fontSize: '9pt' }}>ผู้รับสินค้า (Customer)</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '9pt', color: '#444', borderTop: '1px dashed #ccc', paddingTop: '0.8rem' }}>
                            ขอบคุณที่ไว้วางใจ ธนรินทร์แอร์ สกลนคร | บริการด้วยใจ ใส่ใจทุกขั้นตอน
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
