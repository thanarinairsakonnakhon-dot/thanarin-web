"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Portfolio {
    id: string;
    title: string;
    description: string;
    category: string;
    image_url: string;
    size: string;
    is_active: boolean;
    display_order: number;
}

export default function AdminPortfolios() {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Portfolio | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Residential',
        image_url: '',
        size: 'medium',
        is_active: true,
        display_order: 0
    });

    useEffect(() => {
        loadPortfolios();
    }, []);

    const loadPortfolios = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('portfolios')
            .select('*')
            .order('display_order');
        if (data) setPortfolios(data);
        setIsLoading(false);
    };

    const handleOpenModal = (item?: Portfolio) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title || '',
                description: item.description || '',
                category: item.category || 'Residential',
                image_url: item.image_url || '',
                size: item.size || 'medium',
                is_active: item.is_active,
                display_order: item.display_order || 0
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                description: '',
                category: 'Residential',
                image_url: '',
                size: 'medium',
                is_active: true,
                display_order: portfolios.length
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

                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Could not create blob'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Could not load image'));
            img.src = URL.createObjectURL(file);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            const resizedBlob = await resizeImage(file, 1200, 900, 0.85);

            const fileName = `portfolio_${Date.now()}.jpg`;
            const filePath = `portfolios/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, resizedBlob, {
                    contentType: 'image/jpeg'
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
        } catch (error) {
            console.error('Upload error:', error);
            alert('อัปโหลดรูปไม่สำเร็จ กรุณาตรวจสอบ Supabase Storage');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title) {
            alert('กรุณาใส่ชื่อผลงาน');
            return;
        }

        try {
            if (editingItem) {
                const { error } = await supabase.from('portfolios').update(formData).eq('id', editingItem.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('portfolios').insert(formData);
                if (error) throw error;
            }

            setShowModal(false);
            loadPortfolios();
        } catch (error: unknown) {
            console.error('Error saving:', error);
            const errorMessage = error && typeof error === 'object' && 'message' in error
                ? (error as { message: string }).message
                : 'Unknown error';
            alert(`บันทึกไม่สำเร็จ: ${errorMessage}\n\nกรุณาตรวจสอบว่าได้สร้างตาราง portfolios ใน Supabase แล้ว`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ลบผลงานนี้?')) return;
        await supabase.from('portfolios').delete().eq('id', id);
        loadPortfolios();
    };

    const handleToggleActive = async (id: string, current: boolean) => {
        await supabase.from('portfolios').update({ is_active: !current }).eq('id', id);
        loadPortfolios();
    };

    const categories = ['Residential', 'Commercial', 'Service'];
    const sizes = ['small', 'medium', 'large'];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>🏆 ผลงาน (Portfolio)</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>จัดการผลงานที่แสดงในหน้า About Us</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-wow" style={{ padding: '0.8rem 1.5rem' }}>
                    + เพิ่มผลงาน
                </button>
            </div>

            {/* Portfolios Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {isLoading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>กำลังโหลด...</div>
                ) : portfolios.length === 0 ? (
                    <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                        <div style={{ color: '#94a3b8' }}>ยังไม่มีผลงาน</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>กดปุ่ม + เพิ่มผลงาน เพื่อเริ่มต้น</div>
                    </div>
                ) : (
                    portfolios.map(item => (
                        <div key={item.id} style={{
                            background: 'white',
                            borderRadius: '12px',
                            border: item.is_active ? '2px solid #22c55e' : '1px solid #e2e8f0',
                            opacity: item.is_active ? 1 : 0.6,
                            overflow: 'hidden'
                        }}>
                            {/* Image Preview */}
                            <div style={{
                                height: '150px',
                                background: item.image_url
                                    ? `url(${item.image_url}) center/cover`
                                    : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                {!item.image_url && <span style={{ fontSize: '3rem' }}>📷</span>}
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: item.is_active ? '#22c55e' : '#94a3b8',
                                    color: 'white',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '50px',
                                    fontSize: '0.7rem',
                                    fontWeight: 600
                                }}>
                                    {item.is_active ? 'Active' : 'Off'}
                                </div>
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10px',
                                    background: 'rgba(0,0,0,0.6)',
                                    color: 'white',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '50px',
                                    fontSize: '0.7rem'
                                }}>
                                    {item.category}
                                </div>
                            </div>

                            {/* Info */}
                            <div style={{ padding: '1rem' }}>
                                <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem', fontSize: '0.95rem' }}>
                                    {item.title}
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1rem' }}>
                                    {item.description || '(ไม่มีรายละเอียด)'}
                                </p>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleToggleActive(item.id, item.is_active)}
                                        style={{ flex: 1, padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        {item.is_active ? '⏸️ ปิด' : '▶️ เปิด'}
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(item)}
                                        style={{ flex: 1, padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        ✏️ แก้ไข
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
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
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
                            {editingItem ? '✏️ แก้ไขผลงาน' : '🏆 เพิ่มผลงานใหม่'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Image Upload */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>รูปภาพ</label>
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
                                        background: formData.image_url ? `url(${formData.image_url}) center/cover` : '#f8fafc',
                                        position: 'relative'
                                    }}
                                >
                                    {uploading ? (
                                        <div style={{ color: '#64748b' }}>กำลังอัปโหลด...</div>
                                    ) : !formData.image_url ? (
                                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                                            <div>คลิกเพื่ออัปโหลดรูป</div>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                                            คลิกเพื่อเปลี่ยน
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ชื่อผลงาน *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="เช่น ติดตั้งแอร์ 4 ทิศทาง - คอนโดหรู"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>รายละเอียด</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="รายละเอียดเพิ่มเติม..."
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>หมวดหมู่</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ขนาดการ์ด</label>
                                    <select
                                        value={formData.size}
                                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    >
                                        {sizes.map(s => (
                                            <option key={s} value={s}>{s === 'small' ? 'เล็ก' : s === 'medium' ? 'กลาง' : 'ใหญ่'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

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
