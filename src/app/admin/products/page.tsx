"use client";

import { useState, useRef } from 'react';
import { useAdmin, Product } from '@/context/AdminContext';
import { supabase } from '@/lib/supabase';

export default function AdminProducts() {
    const { products, addProduct, updateProduct, deleteProduct, isLoading } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Resize image before upload
    const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
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
            };
            img.onerror = () => reject(new Error('Failed to load'));
            img.src = URL.createObjectURL(file);
        });
    };

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Resize image to 800x800 max, 85% quality
            const resizedBlob = await resizeImage(file, 800, 800, 0.85);
            const fileName = `product_${Date.now()}.jpg`;
            const filePath = `products/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, resizedBlob, { contentType: 'image/jpeg' });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, image: data.publicUrl }));
        } catch (error) {
            console.error('Upload error:', error);
            alert('อัปโหลดรูปภาพไม่สำเร็จ');
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
        } else {
            alert(`เกิดข้อผิดพลาด: ${result.error}`);
        }
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
                    <option value="">ทุกยี่ห้อ</option>
                    <option value="Daikin">Daikin</option>
                    <option value="Mitsubishi">Mitsubishi</option>
                    <option value="Carrier">Carrier</option>
                    <option value="Haier">Haier</option>
                </select>
                <select style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="">ทุกประเภท</option>
                    <option value="Wall">Wall Type</option>
                    <option value="Cassette">Cassette</option>
                    <option value="Ceiling">Ceiling</option>
                </select>
            </div>

            {/* Product Table */}
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>สินค้า</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>ยี่ห้อ</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>BTU</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>ราคา</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>กำลังโหลด...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>ไม่พบสินค้า</td></tr>
                        ) : filtered.map(product => (
                            <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', background: '#f1f5f9' }} />
                                    <span style={{ fontWeight: 500 }}>{product.name}</span>
                                </td>
                                <td style={{ padding: '1rem' }}>{product.brand}</td>
                                <td style={{ padding: '1rem' }}>{product.btu?.toLocaleString()} BTU</td>
                                <td style={{ padding: '1rem', fontWeight: 600, color: '#0A84FF' }}>฿{product.price?.toLocaleString()}</td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <button onClick={() => handleOpenModal(product)} style={{ marginRight: '0.5rem', padding: '0.4rem 0.8rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>✏️</button>
                                    <button onClick={() => handleDelete(product.id)} style={{ padding: '0.4rem 0.8rem', border: '1px solid #fecaca', borderRadius: '6px', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่'}</h2>
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
                                        <option value="Midea">Midea</option>
                                        <option value="AUX">AUX</option>
                                        <option value="Samsung">Samsung</option>
                                        <option value="LG">LG</option>
                                        <option value="Panasonic">Panasonic</option>
                                        <option value="TCL">TCL</option>
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
                                        <option value="Floor">Floor Standing</option>
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
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>SEER (ประหยัดไฟ)</label>
                                    <input
                                        type="number" required step="0.01"
                                        value={formData.seer}
                                        onChange={e => setFormData({ ...formData, seer: parseFloat(e.target.value) })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ราคาขาย</label>
                                    <input
                                        type="number" required
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                {/* Inverter Toggle */}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.inverter}
                                            onChange={e => setFormData({ ...formData, inverter: e.target.checked })}
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                        <span style={{ fontWeight: 600 }}>⚡ ระบบ Inverter</span>
                                    </label>
                                </div>
                            </div>

                            {/* Features Management */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>คุณสมบัติเด่น (Features)</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <input
                                        type="text"
                                        id="featureInput"
                                        placeholder="พิมพ์คุณสมบัติ เช่น กรองฝุ่น PM 2.5"
                                        style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = (e.target as HTMLInputElement).value.trim();
                                                if (val) {
                                                    setFormData({ ...formData, features: [...(formData.features || []), val] });
                                                    (e.target as HTMLInputElement).value = '';
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
                                        style={{ padding: '0.8rem 1.2rem', background: '#0F172A', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                                    >
                                        เพิ่ม
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {formData.features?.map((feat, index) => (
                                        <span key={index} style={{ background: '#f1f5f9', padding: '0.3rem 0.8rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                            {feat}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newFeatures = [...(formData.features || [])];
                                                    newFeatures.splice(index, 1);
                                                    setFormData({ ...formData, features: newFeatures });
                                                }}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>รูปภาพสินค้า</label>
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
                                        width: '100%',
                                        height: '150px',
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        background: formData.image ? 'white' : '#f8fafc',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}
                                >
                                    {uploading ? (
                                        <div style={{ color: '#64748b' }}>
                                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                                            กำลังอัปโหลด...
                                        </div>
                                    ) : formData.image ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={formData.image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '8px',
                                                right: '8px',
                                                background: 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem'
                                            }}>
                                                คลิกเพื่อเปลี่ยน
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                                            <div>คลิกเพื่ออัปโหลดรูปภาพ</div>
                                            <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', color: '#94a3b8' }}>JPG, PNG ขนาดไม่เกิน 5MB</div>
                                        </div>
                                    )}
                                </div>
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
                                    disabled={uploading}
                                >
                                    {uploading ? 'กำลังอัปโหลด...' : 'บันทึก'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
