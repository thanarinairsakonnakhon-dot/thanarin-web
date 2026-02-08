"use client";

import { useState, useRef, useEffect } from 'react';
import { useAdmin, Product } from '@/context/AdminContext';
import { supabase } from '@/lib/supabase';
import {
    Search, Plus, Edit, Trash2, Image as ImageIcon,
    X, Upload, Loader2, CheckCircle, AlertCircle, Package
} from 'lucide-react';

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
            background: type === 'success' ? 'rgba(22, 163, 74, 0.9)' : 'rgba(220, 38, 38, 0.9)',
            color: 'white', padding: '1rem 1.5rem', borderRadius: '12px',
            backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            fontWeight: 500
        }}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message}
        </div>
    );
};

const SkeletonRow = () => (
    <tr style={{ animation: 'pulse 1.5s infinite ease-in-out' }}>
        <td style={{ padding: '1rem' }}><div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '8px' }}></div></td>
        <td style={{ padding: '1rem' }}><div style={{ height: '20px', width: '60%', background: '#e2e8f0', borderRadius: '4px' }}></div></td>
        <td style={{ padding: '1rem' }}><div style={{ height: '20px', width: '40%', background: '#e2e8f0', borderRadius: '4px' }}></div></td>
        <td style={{ padding: '1rem' }}><div style={{ height: '20px', width: '30%', background: '#e2e8f0', borderRadius: '4px' }}></div></td>
        <td style={{ padding: '1rem' }}><div style={{ height: '20px', width: '30%', background: '#e2e8f0', borderRadius: '4px' }}></div></td>
        <td style={{ padding: '1rem' }}><div style={{ height: '30px', width: '80px', background: '#e2e8f0', borderRadius: '6px', margin: '0 auto' }}></div></td>
    </tr>
);

export default function AdminProducts() {
    const { products, addProduct, updateProduct, deleteProduct, isLoading } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', brand: 'Daikin', type: 'Wall', btu: 9000, price: 0,
        inverter: true, seer: 13, features: [], stock: 0, minStock: 2, image: ''
    });

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

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

    // Resize image before upload
    const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                let { width, height } = img;
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) { reject(new Error('No context')); return; }
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No blob')), 'image/jpeg', quality);
                URL.revokeObjectURL(url);
            };
            img.onerror = () => reject(new Error('Failed to load'));
            img.src = url;
        });
    };

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const resizedBlob = await resizeImage(file, 800, 800, 0.85);
            const fileName = `product_${Date.now()}.jpg`;
            const filePath = `products/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, resizedBlob, { contentType: 'image/jpeg' });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, image: data.publicUrl }));
            showToast('อัปโหลดรูปภาพสำเร็จ', 'success');
        } catch (error) {
            console.error('Upload error:', error);
            showToast('อัปโหลดรูปภาพไม่สำเร็จ', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let result: { success: boolean; error?: string };

        if (editingId) {
            result = await updateProduct(editingId, formData);
        } else {
            const newProduct: Product = {
                ...formData as Product,
                id: 'TEMP',
                features: formData.features || [],
                image: formData.image || '/images/products/placeholder.jpg',
                status: (formData.stock || 0) > 0 ? 'In Stock' : 'Out of Stock',
                cost: Math.round((formData.price || 0) * 0.7)
            };
            result = await addProduct(newProduct);
        }

        if (result.success) {
            setShowModal(false);
            showToast(editingId ? 'แก้ไขสินค้าเรียบร้อย' : 'เพิ่มสินค้าเรียบร้อย', 'success');
        } else {
            showToast(`เกิดข้อผิดพลาด: ${result.error}`, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('ยืนยันการลบสินค้า? หากลบแล้วจะไม่สามารถกู้คืนได้')) {
            await deleteProduct(id);
            showToast('ลบสินค้าเรียบร้อย', 'success');
        }
    };

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <style jsx global>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .glass-panel {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .hover-scale { transition: transform 0.2s; }
                .hover-scale:hover { transform: scale(1.02); }
            `}</style>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-gradient-blue" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>จัดการสินค้า</h1>
                    <p style={{ color: '#64748b' }}>จัดการคลังสินค้า ราคา และข้อมูลทั้งหมดได้ที่นี่</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-wow"
                    style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(10, 132, 255, 0.3)' }}
                >
                    <Plus size={20} /> เพิ่มสินค้าใหม่
                </button>
            </div>

            {/* Stats Cards (Optional Quick Stats) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card-glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#ecfeff', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>สินค้าทั้งหมด</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{products.length}</div>
                    </div>
                </div>
                <div className="card-glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>พร้อมขาย</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{products.filter(p => (p.stock || 0) > 0).length}</div>
                    </div>
                </div>
                <div className="card-glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>สินค้าหมด</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{products.filter(p => !p.stock || p.stock === 0).length}</div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card-glass" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Search size={20} color="#94a3b8" />
                <input
                    type="text"
                    placeholder="ค้นหาชื่อสินค้า / ยี่ห้อ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, padding: '0.8rem', border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem' }}
                />
            </div>

            {/* Product Table */}
            <div className="card-glass" style={{ overflow: 'hidden', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(248, 250, 252, 0.8)', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '1.2rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>สินค้า</th>
                            <th style={{ padding: '1.2rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>ยี่ห้อ</th>
                            <th style={{ padding: '1.2rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>BTU</th>
                            <th style={{ padding: '1.2rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>ราคา</th>
                            <th style={{ padding: '1.2rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>สถานะ</th>
                            <th style={{ padding: '1.2rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>ไม่พบข้อมูลสินค้า</td></tr>
                        ) : filtered.map(product => (
                            <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                <td style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {product.image ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <ImageIcon size={24} color="#cbd5e1" />
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{product.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{product.type}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.2rem', color: '#475569' }}>{product.brand}</td>
                                <td style={{ padding: '1.2rem', color: '#475569' }}>{product.btu?.toLocaleString()}</td>
                                <td style={{ padding: '1.2rem', fontWeight: 600, color: '#0A84FF' }}>฿{product.price?.toLocaleString()}</td>
                                <td style={{ padding: '1.2rem' }}>
                                    <span style={{
                                        padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 500,
                                        background: (product.stock || 0) > 2 ? '#dcfce7' : (product.stock || 0) > 0 ? '#fef9c3' : '#fee2e2',
                                        color: (product.stock || 0) > 2 ? '#166534' : (product.stock || 0) > 0 ? '#854d0e' : '#991b1b'
                                    }}>
                                        {(product.stock || 0) > 0 ? `${product.stock} เครื่อง` : 'หมด'}
                                    </span>
                                </td>
                                <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleOpenModal(product)}
                                            style={{
                                                padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px',
                                                background: 'white', cursor: 'pointer', color: '#475569', transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.borderColor = '#0A84FF'}
                                            onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            style={{
                                                padding: '0.6rem', border: '1px solid #fee2e2', borderRadius: '8px',
                                                background: '#fff1f2', cursor: 'pointer', color: '#ef4444', transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                                            onMouseOut={(e) => e.currentTarget.style.background = '#fff1f2'}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', padding: '2rem', borderRadius: '24px', width: '600px', maxWidth: '90%',
                        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                        animation: 'slideUp 0.3s ease-out'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 className="text-gradient-blue" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {editingId ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                                <X size={24} color="#64748b" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Image Upload Area */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#334155' }}>รูปภาพสินค้า</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        width: '100%', height: '200px',
                                        border: '2px dashed #cbd5e1', borderRadius: '16px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', background: formData.image ? '#f8fafc' : '#f8fafc',
                                        overflow: 'hidden', position: 'relative', transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#0A84FF'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                                >
                                    {uploading ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#0A84FF' }}>
                                            <Loader2 size={32} className="animate-spin" />
                                            <span>กำลังอัปโหลด...</span>
                                        </div>
                                    ) : formData.image ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            <div style={{
                                                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                opacity: 0, transition: 'opacity 0.2s', color: 'white'
                                            }}
                                                onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                                                onMouseOut={(e) => e.currentTarget.style.opacity = '0'}
                                            >
                                                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem', borderRadius: '8px' }}>คลิกเพื่อเปลี่ยนรูป</div>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                                            <div style={{ marginBottom: '1rem', background: '#e0f2fe', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                                                <Upload size={24} color="#0A84FF" />
                                            </div>
                                            <div style={{ fontWeight: 500 }}>คลิกเพื่ออัปโหลดรูปภาพ</div>
                                            <div style={{ fontSize: '0.85rem', marginTop: '0.3rem', color: '#94a3b8' }}>JPG, PNG ขนาดไม่เกิน 5MB</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>ชื่อสินค้า</label>
                                    <input
                                        type="text" required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border 0.2s' }}
                                        onFocus={(e) => e.target.style.borderColor = '#0A84FF'}
                                        onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>ยี่ห้อ</label>
                                    <select
                                        value={formData.brand}
                                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                        style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    >
                                        <option value="Daikin">Daikin</option>
                                        <option value="Mitsubishi">Mitsubishi</option>
                                        <option value="Carrier">Carrier</option>
                                        <option value="Haier">Haier</option>
                                        <option value="Midea">Midea</option>
                                        <option value="AUX">AUX</option>
                                        <option value="Samsung">Samsung</option>
                                        <option value="LG">LG</option>
                                        <option value="Panasonic">Panasonic</option>
                                        <option value="TCL">TCL</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>ประเภท</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                                    >
                                        <option value="Wall">Wall Type</option>
                                        <option value="Cassette">Cassette</option>
                                        <option value="Ceiling">Ceiling</option>
                                        <option value="Floor">Floor Standing</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>BTU</label>
                                    <input
                                        type="number" required
                                        value={formData.btu}
                                        onChange={e => setFormData({ ...formData, btu: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>SEER</label>
                                    <input
                                        type="number" required step="0.01"
                                        value={formData.seer}
                                        onChange={e => setFormData({ ...formData, seer: parseFloat(e.target.value) })}
                                        style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>ราคาขาย (บาท)</label>
                                    <input
                                        type="number" required
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1.1rem', fontWeight: 600, color: '#0A84FF' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>สต็อกสินค้า</label>
                                    <input
                                        type="number" required
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>คุณสมบัติเด่น</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                                    <input
                                        type="text"
                                        id="featureInput"
                                        placeholder="เพิ่มคุณสมบัติ เช่น กรองฝุ่น PM 2.5..."
                                        style={{ flex: 1, padding: '0.9rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = (e.currentTarget as HTMLInputElement).value.trim();
                                                if (val) {
                                                    setFormData({ ...formData, features: [...(formData.features || []), val] });
                                                    (e.currentTarget as HTMLInputElement).value = '';
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const input = document.getElementById('featureInput') as HTMLInputElement;
                                            const val = input.value.trim();
                                            if (val) {
                                                setFormData({ ...formData, features: [...(formData.features || []), val] });
                                                input.value = '';
                                            }
                                        }}
                                        style={{ padding: '0 1.2rem', background: '#0F172A', color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        เพิ่ม
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {formData.features?.map((feat, index) => (
                                        <span key={index} style={{ background: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>
                                            {feat}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newFeatures = [...(formData.features || [])];
                                                    newFeatures.splice(index, 1);
                                                    setFormData({ ...formData, features: newFeatures });
                                                }}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600, color: '#64748b' }}
                                >ยกเลิก</button>
                                <button
                                    type="submit"
                                    className="btn-wow"
                                    style={{ flex: 1, padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                    disabled={uploading}
                                >
                                    {uploading ? <Loader2 className="animate-spin" /> : editingId ? 'บันทึกการแก้ไข' : 'ยืนยันการเพิ่มสินค้า'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

