"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

import { Product } from '@/types';

interface StockLog {
    id: string;
    product_id: string;
    action_type: 'IN' | 'OUT';
    quantity: number;
    reason: string;
    previous_stock: number;
    new_stock: number;
    cost_per_unit: number;
    created_at: string;
}

export default function AdminInventory() {
    const [products, setProducts] = useState<Product[]>([]);
    const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [selectedProductName, setSelectedProductName] = useState<string>('');

    const [actionType, setActionType] = useState<'IN' | 'OUT'>('IN');
    const [qty, setQty] = useState(0);
    const [reason, setReason] = useState('');
    const [costPerUnit, setCostPerUnit] = useState(0);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');

        if (data) {
            setProducts(data);
        }
        if (error) console.error('Error loading products:', error);
        setIsLoading(false);
    };

    const loadStockLogs = async (productId: string) => {
        const { data, error } = await supabase
            .from('stock_logs')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) {
            setStockLogs(data);
        }
        if (error) console.error('Error loading stock logs:', error);
    };

    const handleOpenHistoryModal = async (product: Product) => {
        setSelectedProductId(product.id);
        setSelectedProductName(product.name);
        await loadStockLogs(product.id);
        setShowHistoryModal(true);
    };

    const handleOpenStockModal = (type: 'IN' | 'OUT') => {
        setActionType(type);
        setSelectedProductId('');
        setQty(0);
        setReason('');
        setCostPerUnit(0);
        setShowModal(true);
    };

    const handleStockAction = async () => {
        if (!selectedProductId || qty <= 0) return;

        const product = products.find(p => p.id === selectedProductId);
        if (!product) return;

        const previousStock = product.stock;
        const newStock = actionType === 'IN' ? previousStock + qty : Math.max(0, previousStock - qty);

        // Update product stock
        await supabase
            .from('products')
            .update({
                stock: newStock,
                min_stock: product.minStock, // Keep db column as min_stock if needed, but access via minStock
                status: newStock === 0 ? 'Out of Stock' : newStock <= (product.minStock || 2) ? 'Low Stock' : 'In Stock'
            })
            .eq('id', selectedProductId);

        // Create stock log
        await supabase
            .from('stock_logs')
            .insert({
                product_id: selectedProductId,
                action_type: actionType,
                quantity: qty,
                reason: reason || (actionType === 'IN' ? 'รับของเข้า' : 'เบิกของออก'),
                cost_per_unit: actionType === 'IN' ? costPerUnit : 0,
                previous_stock: previousStock,
                new_stock: newStock
            });

        setShowModal(false);
        loadProducts();
    };

    const totalValue = products.reduce((acc, item) => acc + ((item.cost || 0) * item.stock), 0);
    const lowStockCount = products.filter(i => i.stock <= (i.minStock || 2)).length;
    const totalStock = products.reduce((acc, item) => acc + item.stock, 0);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('th-TH', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>📦 ระบบคลังสินค้า</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Stock Management System</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => handleOpenStockModal('OUT')}
                        style={{ padding: '0.8rem 1.2rem', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', border: '1px solid #fecaca', fontWeight: 600, cursor: 'pointer' }}
                    >
                        📤 เบิกออก
                    </button>
                    <button
                        onClick={() => handleOpenStockModal('IN')}
                        className="btn-wow"
                        style={{ padding: '0.8rem 1.2rem' }}
                    >
                        📥 รับเข้า
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>💰 มูลค่าในคลัง</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' }}>฿{totalValue.toLocaleString()}</div>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>📊 รายการทั้งหมด</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' }}>{products.length} SKU</div>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>🏷️ สต็อกรวม</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' }}>{totalStock} ชิ้น</div>
                </div>
                <div style={{ background: lowStockCount > 0 ? '#fef2f2' : 'white', padding: '1.5rem', borderRadius: '12px', border: lowStockCount > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>⚠️ ต้องสั่งเพิ่ม</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ef4444' }}>{lowStockCount} รายการ</div>
                </div>
            </div>

            {/* Inventory Table */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {isLoading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>กำลังโหลด...</div>
                ) : products.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                        <div>ยังไม่มีสินค้าในระบบ</div>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>สินค้า</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>คงเหลือ</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b', fontSize: '0.85rem' }}>ต้นทุน</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b', fontSize: '0.85rem' }}>ราคาขาย</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>สถานะ</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b', fontSize: '0.85rem' }}>History</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((item) => {
                                const isLowStock = item.stock <= (item.minStock || 2);
                                return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', background: isLowStock ? '#fff5f5' : 'white' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.brand}</div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: isLowStock ? '#ef4444' : '#1e293b' }}>
                                                {item.stock}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Min: {item.minStock || 2}</div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>
                                            ฿{(item.cost || 0).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                                            ฿{item.price.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600,
                                                background: item.stock === 0 ? '#fef2f2' : isLowStock ? '#fff7ed' : '#ecfdf5',
                                                color: item.stock === 0 ? '#ef4444' : isLowStock ? '#f59e0b' : '#059669',
                                            }}>
                                                {item.stock === 0 ? 'หมด' : isLowStock ? 'ใกล้หมด' : 'พร้อม'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleOpenHistoryModal(item)}
                                                style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                                📜
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Stock In/Out Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '400px', maxWidth: '90%' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
                            {actionType === 'IN' ? '📥 รับสินค้าเข้า' : '📤 เบิกสินค้าออก'}
                        </h2>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>เลือกสินค้า</label>
                            <select
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            >
                                <option value="">-- กรุณาเลือก --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (คงเหลือ: {p.stock})</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>จำนวน</label>
                            <input
                                type="number"
                                min="1"
                                value={qty || ''}
                                onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>

                        {actionType === 'IN' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ต้นทุนต่อชิ้น (บาท)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={costPerUnit || ''}
                                    onChange={(e) => setCostPerUnit(parseInt(e.target.value) || 0)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                {actionType === 'IN' ? 'หมายเหตุ (Supplier)' : 'สาเหตุ'}
                            </label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder={actionType === 'IN' ? 'เช่น รับจาก Daikin Thailand' : 'เช่น ติดตั้งให้ลูกค้า'}
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
                                disabled={!selectedProductId || qty <= 0}
                                style={{
                                    flex: 1, padding: '0.8rem', borderRadius: '8px', border: 'none',
                                    background: actionType === 'IN' ? 'var(--color-primary-blue)' : '#ef4444',
                                    color: 'white', fontWeight: 700, cursor: 'pointer',
                                    opacity: (!selectedProductId || qty <= 0) ? 0.5 : 1
                                }}
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '500px', maxWidth: '90%', maxHeight: '80vh', overflow: 'auto' }}>
                        <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>📜 ประวัติ Stock</h2>
                        <p style={{ marginBottom: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>{selectedProductName}</p>

                        {stockLogs.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                ยังไม่มีประวัติ
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {stockLogs.map(log => (
                                    <div key={log.id} style={{
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        background: log.action_type === 'IN' ? '#ecfdf5' : '#fef2f2',
                                        border: `1px solid ${log.action_type === 'IN' ? '#bbf7d0' : '#fecaca'}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div>
                                                <span style={{
                                                    fontWeight: 700,
                                                    color: log.action_type === 'IN' ? '#059669' : '#ef4444'
                                                }}>
                                                    {log.action_type === 'IN' ? '📥 +' : '📤 -'}{log.quantity}
                                                </span>
                                                <span style={{ color: '#64748b', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                                                    ({log.previous_stock} → {log.new_stock})
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                {formatDate(log.created_at)}
                                            </span>
                                        </div>
                                        {log.reason && (
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                                                📝 {log.reason}
                                            </div>
                                        )}
                                        {log.action_type === 'IN' && log.cost_per_unit > 0 && (
                                            <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>
                                                💰 ต้นทุน: ฿{log.cost_per_unit.toLocaleString()}/ชิ้น
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setShowHistoryModal(false)}
                            style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
                        >ปิด</button>
                    </div>
                </div>
            )}
        </div>
    );
}
