"use client";

import { useState } from 'react';
import { useAdmin, Product } from '@/context/AdminContext';

export default function AdminProducts() {
    const { products, addProduct, updateProduct, deleteProduct, isLoading } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', brand: 'Daikin', type: 'Wall', btu: 9000, price: 0,
        inverter: true, seer: 13, features: [], stock: 0, minStock: 2, image: ''
    });

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingId(product.id);
            setFormData(product);
        } else {
            setEditingId(null);
            setFormData({
                name: '', brand: 'Daikin', type: 'Wall', btu: 9000, price: 0,
                inverter: true, seer: 13, features: [], stock: 0, minStock: 2, image: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            await updateProduct(editingId, formData);
        } else {
            const newProduct: Product = {
                ...formData as Product,
                id: 'TEMP', // Will be ignored by DB insert
                features: formData.features || [],
                image: formData.image || '/images/products/placeholder.jpg',
                status: (formData.stock || 0) > 0 ? 'In Stock' : 'Out of Stock',
                cost: (formData.price || 0) * 0.7 // Mock cost
            };
            await addProduct(newProduct);
        }
        setShowModal(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('ยืนยันการลบสินค้า?')) {
            await deleteProduct(id);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>จัดการสินค้า</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-wow"
                    style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <span>+</span> เพิ่มสินค้าใหม่
                </button>
            </div>

            {/* Filter Bar */}
            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <input
                    type="text"
                    placeholder="🔍 ค้นหาชื่อสินค้า..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <select style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option>ทุกยี่ห้อ</option>
                    <option>Daikin</option>
                    <option>Mitsubishi</option>
                </select>
                <select style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option>ทุกประเภท</option>
                    <option>Wall Type</option>
                    <option>Cassette</option>
                </select>
            </div>

            {/* Product Table */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>สินค้า</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>ยี่ห้อ</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>BTU</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>ราคา</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((product) => (
                            <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{product.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ID: {product.id}</div>
                                </td>
                                <td style={{ padding: '1rem', color: '#64748b' }}>{product.brand}</td>
                                <td style={{ padding: '1rem', color: '#64748b' }}>{product.btu.toLocaleString()}</td>
                                <td style={{ padding: '1rem', fontWeight: 600 }}>฿{product.price.toLocaleString()}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button
                                        onClick={() => handleOpenModal(product)}
                                        style={{ marginRight: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                                    >
                                        ✏️ แก้ไข
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}
                                    >
                                        🗑️ ลบ
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="animate-fade-in" style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>{editingId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ชื่อสินค้า</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ยี่ห้อ</label>
                                    <select
                                        value={formData.brand}
                                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    >
                                        <option value="Daikin">Daikin</option>
                                        <option value="Mitsubishi">Mitsubishi</option>
                                        <option value="Carrier">Carrier</option>
                                        <option value="Haier">Haier</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ประเภท</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    >
                                        <option value="Wall">Wall Type</option>
                                        <option value="Cassette">Cassette</option>
                                        <option value="Ceiling">Ceiling</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>BTU</label>
                                    <input
                                        type="number" required
                                        value={formData.btu}
                                        onChange={e => setFormData({ ...formData, btu: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ราคาขาย</label>
                                    <input
                                        type="number" required
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>รูปภาพ (URL)</label>
                                <input
                                    type="text"
                                    placeholder="https://example.com/image.jpg"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                                {formData.image && (
                                    <div style={{ marginTop: '0.5rem', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
                                >ยกเลิก</button>
                                <button
                                    type="submit"
                                    className="btn-wow"
                                    style={{ flex: 1, padding: '0.8rem', borderRadius: '8px' }}
                                >
                                    บันทึก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
