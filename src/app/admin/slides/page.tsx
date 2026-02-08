"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Slide {
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
    link_url: string;
    button_text: string;
    is_active: boolean;
    display_order: number;
}

export default function AdminSlides() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        image_url: '',
        link_url: '/products',
        button_text: 'ดูเพิ่มเติม',
        is_active: true,
        display_order: 0
    });

    useEffect(() => {
        loadSlides();
    }, []);

    const loadSlides = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('hero_slides')
            .select('*')
            .order('display_order');
        if (data) setSlides(data);
        setIsLoading(false);
    };

    const handleOpenModal = (slide?: Slide) => {
        if (slide) {
            setEditingSlide(slide);
            setFormData({
                title: slide.title || '',
                subtitle: slide.subtitle || '',
                image_url: slide.image_url || '',
                link_url: slide.link_url || '/products',
                button_text: slide.button_text || 'ดูเพิ่มเติม',
                is_active: slide.is_active,
                display_order: slide.display_order || 0
            });
        } else {
            setEditingSlide(null);
            setFormData({
                title: '',
                subtitle: '',
                image_url: '',
                link_url: '/products',
                button_text: 'ดูเพิ่มเติม',
                is_active: true,
                display_order: slides.length
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

                // Calculate new dimensions
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                // Create canvas and draw resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob
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
            // Resize image: max 1920x800, quality 85%
            const resizedBlob = await resizeImage(file, 1920, 800, 0.85);

            const fileName = `slide_${Date.now()}.jpg`;
            const filePath = `slides/${fileName}`;

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
        if (!formData.image_url) {
            alert('กรุณาอัปโหลดรูปภาพ');
            return;
        }

        try {
            if (editingSlide) {
                const { error } = await supabase.from('hero_slides').update(formData).eq('id', editingSlide.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('hero_slides').insert(formData);
                if (error) throw error;
            }

            setShowModal(false);
            loadSlides();
        } catch (error: unknown) {
            console.error('Error saving slide:', error);
            const errorMessage = error && typeof error === 'object' && 'message' in error
                ? (error as { message: string }).message
                : 'Unknown error';
            alert(`บันทึกไม่สำเร็จ: ${errorMessage}\n\nกรุณาตรวจสอบว่าได้สร้างตาราง hero_slides ใน Supabase แล้ว`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ลบ Slide นี้?')) return;
        await supabase.from('hero_slides').delete().eq('id', id);
        loadSlides();
    };

    const handleToggleActive = async (id: string, current: boolean) => {
        await supabase.from('hero_slides').update({ is_active: !current }).eq('id', id);
        loadSlides();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>🖼️ Hero Slides</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>จัดการรูปสไลด์หน้าแรก</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-wow" style={{ padding: '0.8rem 1.5rem' }}>
                    + เพิ่ม Slide
                </button>
            </div>

            {/* Slides Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {isLoading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>กำลังโหลด...</div>
                ) : slides.length === 0 ? (
                    <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
                        <div style={{ color: '#94a3b8' }}>ยังไม่มี Slide</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>กดปุ่ม + เพิ่ม Slide เพื่อเริ่มต้น</div>
                    </div>
                ) : (
                    slides.map(slide => (
                        <div key={slide.id} style={{
                            background: 'white',
                            borderRadius: '12px',
                            border: slide.is_active ? '2px solid #22c55e' : '1px solid #e2e8f0',
                            opacity: slide.is_active ? 1 : 0.6,
                            overflow: 'hidden'
                        }}>
                            {/* Image Preview */}
                            <div style={{
                                height: '180px',
                                background: `url(${slide.image_url}) center/cover`,
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: slide.is_active ? '#22c55e' : '#94a3b8',
                                    color: 'white',
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '50px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                }}>
                                    {slide.is_active ? '🟢 Active' : '⚪ Off'}
                                </div>
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10px',
                                    background: 'rgba(0,0,0,0.6)',
                                    color: 'white',
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '50px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                }}>
                                    #{slide.display_order + 1}
                                </div>
                            </div>

                            {/* Slide Info */}
                            <div style={{ padding: '1rem' }}>
                                <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
                                    {slide.title || '(ไม่มีหัวข้อ)'}
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                    {slide.subtitle || '(ไม่มีคำบรรยาย)'}
                                </p>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleToggleActive(slide.id, slide.is_active)}
                                        style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        {slide.is_active ? '⏸️ ปิด' : '▶️ เปิด'}
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(slide)}
                                        style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        ✏️ แก้ไข
                                    </button>
                                    <button
                                        onClick={() => handleDelete(slide.id)}
                                        style={{ padding: '0.5rem', border: '1px solid #fecaca', borderRadius: '8px', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}
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
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '550px', maxWidth: '90%', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
                            {editingSlide ? '✏️ แก้ไข Slide' : '🖼️ เพิ่ม Slide ใหม่'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Image Upload */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>รูปภาพ *</label>
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
                                        height: '200px',
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        background: formData.image_url ? `url(${formData.image_url}) center/cover` : '#f8fafc',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {uploading ? (
                                        <div style={{ color: '#64748b' }}>กำลังอัปโหลด...</div>
                                    ) : !formData.image_url ? (
                                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                                            <div>คลิกเพื่ออัปโหลดรูป</div>
                                            <div style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>แนะนำ 1920 x 600 px</div>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                                            คลิกเพื่อเปลี่ยน
                                        </div>
                                    )}
                                </div>
                                {formData.image_url && (
                                    <input
                                        type="text"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="หรือวาง URL รูปภาพ"
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.5rem', fontSize: '0.85rem' }}
                                    />
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>หัวข้อ (แสดงบน Slide)</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="เช่น ลดสูงสุด 40%"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>คำบรรยาย</label>
                                <input
                                    type="text"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    placeholder="รายละเอียดเพิ่มเติม..."
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Link ปุ่ม</label>
                                    <input
                                        type="text"
                                        value={formData.link_url}
                                        onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                        placeholder="/products"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ข้อความปุ่ม</label>
                                    <input
                                        type="text"
                                        value={formData.button_text}
                                        onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                        placeholder="ดูเพิ่มเติม"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ลำดับการแสดง</label>
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
                                        เปิดใช้งาน Slide
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
