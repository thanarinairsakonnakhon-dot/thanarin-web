"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Brand {
    id: string;
    name: string;
    logo_url: string;
    color: string;
    is_active: boolean;
    display_order: number;
}

export default function AdminACPrices() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Brand | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        logo_url: '',
        color: '#0A84FF',
        is_active: true,
        display_order: 0
    });

    useEffect(() => {
        loadBrands();
    }, []);

    const loadBrands = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('ac_brands')
            .select('*')
            .order('display_order');
        if (data) setBrands(data);
        setIsLoading(false);
    };

    const handleOpenModal = (item?: Brand) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name || '',
                logo_url: item.logo_url || '',
                color: item.color || '#0A84FF',
                is_active: item.is_active,
                display_order: item.display_order || 0
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                logo_url: '',
                color: '#0A84FF',
                is_active: true,
                display_order: brands.length
            });
        }
        setShowModal(true);
    };

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
                canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No blob')), 'image/png', quality);
            };
            img.onerror = () => reject(new Error('Failed to load'));
            img.src = URL.createObjectURL(file);
        });
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const resizedBlob = await resizeImage(file, 200, 80, 0.9);
            const fileName = `brand_${Date.now()}.png`;
            const filePath = `brands/${fileName}`;
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, resizedBlob, { contentType: 'image/png' });
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, logo_url: data.publicUrl }));
        } catch (error) {
            console.error('Upload error:', error);
            alert('อัปโหลดโลโก้ไม่สำเร็จ');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert('กรุณาใส่ชื่อแบรนด์');
            return;
        }
        try {
            if (editingItem) {
                const { error } = await supabase.from('ac_brands').update(formData).eq('id', editingItem.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('ac_brands').insert(formData);
                if (error) throw error;
            }
            setShowModal(false);
            loadBrands();
        } catch (error: unknown) {
            console.error('Save error:', error);
            const msg = error && typeof error === 'object' && 'message' in error ? (error as { message: string }).message : 'Unknown';
            alert(`บันทึกไม่สำเร็จ: ${msg}\n\nกรุณาตรวจสอบว่าได้สร้างตาราง ac_brands แล้ว`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ลบแบรนด์นี้? (รวมถึง Series และ Model ทั้งหมด)')) return;
        await supabase.from('ac_brands').delete().eq('id', id);
        loadBrands();
    };

    const handleToggleActive = async (id: string, current: boolean) => {
        await supabase.from('ac_brands').update({ is_active: !current }).eq('id', id);
        loadBrands();
    };

    const presetColors = ['#E60012', '#00A0E9', '#C41230', '#003087', '#007DC5', '#FF6600', '#22c55e', '#8b5cf6'];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>💰 ตารางราคาแอร์</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>จัดการแบรนด์, ซีรีส์ และราคา</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-wow" style={{ padding: '0.8rem 1.5rem' }}>
                    + เพิ่มแบรนด์
                </button>
            </div>

            {/* Brands Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {isLoading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>กำลังโหลด...</div>
                ) : brands.length === 0 ? (
                    <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❄️</div>
                        <div style={{ color: '#94a3b8' }}>ยังไม่มีแบรนด์แอร์</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>กดปุ่ม + เพิ่มแบรนด์ เพื่อเริ่มต้น</div>
                    </div>
                ) : (
                    brands.map(brand => (
                        <div key={brand.id} style={{
                            background: 'white',
                            borderRadius: '16px',
                            border: brand.is_active ? `2px solid ${brand.color}` : '1px solid #e2e8f0',
                            opacity: brand.is_active ? 1 : 0.6,
                            overflow: 'hidden'
                        }}>
                            {/* Header with brand color */}
                            <div style={{
                                background: `linear-gradient(135deg, ${brand.color} 0%, ${brand.color}CC 100%)`,
                                padding: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                {brand.logo_url ? (
                                    <img src={brand.logo_url} alt={brand.name} style={{ height: '40px', maxWidth: '100px', objectFit: 'contain', background: 'white', borderRadius: '8px', padding: '4px' }} />
                                ) : (
                                    <div style={{ fontSize: '2rem' }}>❄️</div>
                                )}
                                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{brand.name}</h3>
                            </div>

                            <div style={{ padding: '1rem' }}>
                                {/* Actions Row 1 - Manage Series */}
                                {/* Actions Row 1 - Manage Series (Obsolete) */}
                                {/* <Link href={`/admin/ac-prices/${brand.id}`}>...</Link> */}
                                <div style={{
                                    padding: '0.6rem',
                                    background: '#f8fafc',
                                    borderRadius: '8px',
                                    color: '#64748b',
                                    fontSize: '0.85rem',
                                    textAlign: 'center',
                                    marginBottom: '0.8rem',
                                    border: '1px dashed #cbd5e1'
                                }}>
                                    ✨ จัดการราคาที่เมนู "สินค้า"
                                </div>

                                {/* Actions Row 2 */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleToggleActive(brand.id, brand.is_active)}
                                        style={{ flex: 1, padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        {brand.is_active ? '⏸️ ปิด' : '▶️ เปิด'}
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(brand)}
                                        style={{ flex: 1, padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        ✏️ แก้ไข
                                    </button>
                                    <button
                                        onClick={() => handleDelete(brand.id)}
                                        style={{ padding: '0.4rem 0.6rem', border: '1px solid #fecaca', borderRadius: '8px', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '450px', maxWidth: '90%', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
                            {editingItem ? '✏️ แก้ไขแบรนด์' : '❄️ เพิ่มแบรนด์ใหม่'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Logo Upload */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>โลโก้แบรนด์</label>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoUpload} style={{ display: 'none' }} />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        width: '100%',
                                        height: '80px',
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        background: formData.logo_url ? 'white' : '#f8fafc'
                                    }}
                                >
                                    {uploading ? (
                                        <div style={{ color: '#64748b' }}>กำลังอัปโหลด...</div>
                                    ) : formData.logo_url ? (
                                        <img src={formData.logo_url} alt="Logo" style={{ maxHeight: '60px', maxWidth: '150px', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                                            <div>📷 คลิกเพื่ออัปโหลดโลโก้</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ชื่อแบรนด์ *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="เช่น Mitsubishi, Daikin, Carrier"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>สีแบรนด์</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                    {presetColors.map(c => (
                                        <div
                                            key={c}
                                            onClick={() => setFormData({ ...formData, color: c })}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                background: c,
                                                cursor: 'pointer',
                                                border: formData.color === c ? '3px solid #1e293b' : '2px solid #e2e8f0'
                                            }}
                                        />
                                    ))}
                                </div>
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                                />
                            </div>

                            {/* Display Order */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ลำดับ</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '1.5rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        />
                                        เปิดใช้งาน
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
                                ยกเลิก
                            </button>
                            <button onClick={handleSave} className="btn-wow" style={{ flex: 1, padding: '0.8rem' }} disabled={uploading}>
                                {uploading ? 'กำลังอัปโหลด...' : 'บันทึก'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
