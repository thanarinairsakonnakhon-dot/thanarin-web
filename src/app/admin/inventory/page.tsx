"use client";

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';

export default function AdminInventory() {
    const { products, updateStock } = useAdmin();
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState<'IN' | 'OUT'>('IN');
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [qty, setQty] = useState(0);
    const [reason, setReason] = useState('');

    const handleStockAction = () => {
        if (!selectedItem || qty <= 0) return;
        updateStock(selectedItem, qty, actionType, reason);
        setShowModal(false);
        setQty(0);
        setReason('');
    };

    const totalValue = products.reduce((acc, item) => acc + (item.cost * item.stock), 0);
    const lowStockCount = products.filter(i => i.stock <= i.minStock).length;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>ระบบจัดการคลังสินค้า</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time Stock Management System</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => { setActionType('OUT'); setShowModal(true); }}
                        style={{ padding: '0.8rem 1.5rem', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', border: '1px solid #fecaca', fontWeight: 600, cursor: 'pointer' }}
                    >
                        📤 เบิกของออก
                    </button>
                    <button
                        onClick={() => { setActionType('IN'); setShowModal(true); }}
                        style={{ padding: '0.8rem 1.5rem', background: 'var(--color-primary-blue)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(10, 132, 255, 0.3)' }}
                    >
                        📥 รับของเข้า
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>มูลค่าสินค้าในคลัง (Cost)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>฿{totalValue.toLocaleString()}</div>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>รายการทั้งหมด</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{products.length} SKU</div>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>ต้องสั่งซื้อเพิ่ม (Low Stock)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{lowStockCount} รายการ</div>
                </div>
            </div>

            {/* Inventory Table */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.9rem' }}>SKU Info</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>คงเหลือ</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b', fontSize: '0.9rem' }}>ทุนจม (Cost)</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b', fontSize: '0.9rem' }}>ราคาขาย</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>สถานะ</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b', fontSize: '0.9rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.id} • {item.brand}</div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: item.stock <= item.minStock ? '#ef4444' : '#1e293b' }}>
                                        {item.stock}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Min: {item.minStock}</div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>
                                    ฿{item.cost?.toLocaleString() || '0'}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                                    ฿{item.price.toLocaleString()}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <span style={{
                                        padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600,
                                        background: item.status === 'In Stock' ? '#ecfdf5' : item.status === 'Low Stock' ? '#fff7ed' : '#fef2f2',
                                        color: item.status === 'In Stock' ? '#059669' : item.status === 'Low Stock' ? '#f59e0b' : '#ef4444',
                                    }}>
                                        {item.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                        📜 History
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mock Stock In/Out Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="animate-fade-in" style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '400px', maxWidth: '90%' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
                            {actionType === 'IN' ? '📥 รับสินค้าเข้าสต็อก' : '📤 ตัดสต็อกสินค้า'}
                        </h2>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>เลือกสินค้า</label>
                            <select
                                value={selectedItem}
                                onChange={(e) => setSelectedItem(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            >
                                <option value="">-- กรุณาเลือก --</option>
                                {products.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>จำนวน ({actionType === 'IN' ? 'เพิ่ม' : 'ลด'})</label>
                            <input
                                type="number"
                                value={qty || ''}
                                onChange={(e) => setQty(parseInt(e.target.value))}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                {actionType === 'IN' ? 'รับจาก (Supplier)' : 'สาเหตุ/หมายเหตุ'}
                            </label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
                            >ยกเลิก</button>
                            <button
                                onClick={handleStockAction}
                                style={{
                                    flex: 1, padding: '0.8rem', borderRadius: '8px', border: 'none',
                                    background: actionType === 'IN' ? 'var(--color-primary-blue)' : '#ef4444',
                                    color: 'white', fontWeight: 700, cursor: 'pointer'
                                }}
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
