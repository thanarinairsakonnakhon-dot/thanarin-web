"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, Loader2, Image as ImageIcon, X } from 'lucide-react';

interface Promotion {
    id: string;
    title: string;
    description: string;
    discount_text: string;
    image_url: string;
    link_url: string;
    is_active: boolean;
    start_date: string;
    end_date: string;
    display_order: number;
    created_at: string;
}

export default function AdminPromotions() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount_text: '',
        image_url: '',
        link_url: '/products',
        is_active: true,
        start_date: '',
        end_date: '',
        display_order: 0
    });

    const [bannerSettings, setBannerSettings] = useState({
        title: 'โปรโมชั่นพิเศษ Hot Deals',
        description: 'ดีลสุดคุ้ม ประจำเดือนนี้ มั่นใจ ชัดเจน เป็นธรรม'
    });
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        loadPromotions();
        loadBannerSettings();
    }, []);

    const loadBannerSettings = async () => {
        const { data } = await supabase
            .from('site_settings')
            .select('*')
            .in('setting_key', ['promotion_banner_title', 'promotion_banner_description']);

        if (data) {
            const settings = { ...bannerSettings };
            data.forEach(item => {
                if (item.setting_key === 'promotion_banner_title') settings.title = item.setting_value;
                if (item.setting_key === 'promotion_banner_description') settings.description = item.setting_value;
            });
            setBannerSettings(settings);
        }
    };

    const handleSaveBannerSettings = async () => {
        setSavingSettings(true);
        try {
            const updates = [
                { setting_key: 'promotion_banner_title', setting_value: bannerSettings.title },
                { setting_key: 'promotion_banner_description', setting_value: bannerSettings.description }
            ];

            const { error } = await supabase.from('site_settings').upsert(updates, { onConflict: 'setting_key' });
            if (error) throw error;
            alert('บันทึกการตั้งค่าสำเร็จ');
        } catch (error: any) {
            console.error('Error saving settings:', error);
            alert(`บันทึกไม่สำเร็จ: ${error.message}`);
        } finally {
            setSavingSettings(false);
        }
    };

    const loadPromotions = async () => {
        // ... existing loadPromotions code
        setIsLoading(true);
        const { data } = await supabase
            .from('promotions')
            .select('*')
            .order('display_order');
        if (data) setPromotions(data);
        setIsLoading(false);
    };

    const handleOpenModal = (promo?: Promotion) => {
        if (promo) {
            setEditingPromo(promo);
            setFormData({
                title: promo.title,
                description: promo.description || '',
                discount_text: promo.discount_text || '',
                image_url: promo.image_url || '',
                link_url: promo.link_url || '/products',
                is_active: promo.is_active,
                start_date: promo.start_date || '',
                end_date: promo.end_date || '',
                display_order: promo.display_order || 0
            });
        } else {
            setEditingPromo(null);
            setFormData({
                title: '',
                description: '',
                discount_text: '',
                image_url: '',
                link_url: '/products',
                is_active: true,
                start_date: '',
                end_date: '',
                display_order: promotions.length
            });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.title) {
            alert('กรุณาใส่ชื่อโปรโมชั่น');
            return;
        }

        const payload = {
            ...formData,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null
        };

        try {
            if (editingPromo) {
                const { error } = await supabase.from('promotions').update(payload).eq('id', editingPromo.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('promotions').insert(payload);
                if (error) throw error;
            }

            setShowModal(false);
            loadPromotions();
        } catch (error: any) {
            console.error('Error saving promotion:', error);
            alert(`บันทึกไม่สำเร็จ: ${error.message}\n\nกรุณาตรวจสอบว่าได้สร้างตาราง promotions ใน Supabase แล้ว`);
        }
    };

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const resizedBlob = await resizeImage(file, 1200, 600, 0.8);
            const fileName = `promo_${Date.now()}.jpg`;
            const filePath = `promotions/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, resizedBlob, { contentType: 'image/jpeg' });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
        } catch (error) {
            console.error('Upload error:', error);
            alert('อัปโหลดรูปภาพไม่สำเร็จ');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ลบโปรโมชั่นนี้?')) return;
        await supabase.from('promotions').delete().eq('id', id);
        loadPromotions();
    };

    const handleToggleActive = async (id: string, current: boolean) => {
        await supabase.from('promotions').update({ is_active: !current }).eq('id', id);
        loadPromotions();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>🎉 โปรโมชั่น</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>จัดการโปรโมชั่นแสดงในหน้าแรก</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-wow" style={{ padding: '0.8rem 1.5rem' }}>
                    + เพิ่มโปรโมชั่น
                </button>
            </div>

            {/* Banner Theme Settings */}
            <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                padding: '1.5rem',
                borderRadius: '16px',
                marginBottom: '2rem',
                border: '1px solid #e2e8f0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                alignItems: 'end'
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>หัวข้อใหญ่ (Main Title)</label>
                    <input
                        type="text"
                        value={bannerSettings.title}
                        onChange={(e) => setBannerSettings(prev => ({ ...prev, title: e.target.value }))}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                        placeholder="โปรโมชั่นพิเศษ Hot Deals"
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>คำบรรยาย (Subtitle)</label>
                    <input
                        type="text"
                        value={bannerSettings.description}
                        onChange={(e) => setBannerSettings(prev => ({ ...prev, description: e.target.value }))}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                        placeholder="ดีลสุดคุ้ม ประจำเดือนนี้..."
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={handleSaveBannerSettings}
                        className="btn-wow"
                        disabled={savingSettings}
                        style={{ flex: 1, padding: '0.75rem', background: '#0F172A' }}
                    >
                        {savingSettings ? 'กำลังบันทึก...' : '💾 บันทึกหัวข้อ'}
                    </button>
                </div>
            </div>

            {/* Promotions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {isLoading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>กำลังโหลด...</div>
                ) : promotions.length === 0 ? (
                    <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</div>
                        <div style={{ color: '#94a3b8' }}>ยังไม่มีโปรโมชั่น</div>
                    </div>
                ) : (
                    promotions.map(promo => (
                        <div key={promo.id} style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: promo.is_active ? '2px solid #22c55e' : '1px solid #e2e8f0',
                            opacity: promo.is_active ? 1 : 0.6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            flexWrap: 'wrap'
                        }}>
                            {/* Order Handle */}
                            <div style={{ color: '#94a3b8', fontSize: '1.5rem' }}>⋮⋮</div>

                            {/* Promo Image Preview */}
                            <div style={{
                                width: '120px', height: '60px',
                                borderRadius: '8px', overflow: 'hidden',
                                background: '#f1f5f9', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                border: '1px solid #e2e8f0'
                            }}>
                                {promo.image_url ? (
                                    <img src={promo.image_url} alt={promo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <ImageIcon size={20} color="#cbd5e1" />
                                )}
                            </div>

                            {/* Promo Info */}
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontWeight: 700, color: '#1e293b', margin: 0 }}>{promo.title}</h3>
                                    {promo.discount_text && (
                                        <span style={{ background: '#fee2e2', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                            {promo.discount_text}
                                        </span>
                                    )}
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{promo.description}</p>
                                {(promo.start_date || promo.end_date) && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                        📅 {promo.start_date || '...'} ถึง {promo.end_date || '...'}
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <span style={{
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '50px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    background: promo.is_active ? '#ecfdf5' : '#f1f5f9',
                                    color: promo.is_active ? '#059669' : '#64748b'
                                }}>
                                    {promo.is_active ? '🟢 เปิดใช้งาน' : '⚪ ปิด'}
                                </span>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleToggleActive(promo.id, promo.is_active)}
                                    style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    {promo.is_active ? '⏸️ ปิด' : '▶️ เปิด'}
                                </button>
                                <button
                                    onClick={() => handleOpenModal(promo)}
                                    style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    ✏️ แก้ไข
                                </button>
                                <button
                                    onClick={() => handleDelete(promo.id)}
                                    style={{ padding: '0.5rem 1rem', border: '1px solid #fecaca', borderRadius: '8px', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    🗑️
                                </button>
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
                            {editingPromo ? '✏️ แก้ไขโปรโมชั่น' : '🎉 เพิ่มโปรโมชั่นใหม่'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Image Upload Area */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#334155' }}>รูปภาพโปรโมชั่น</label>
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
                                        width: '100%', height: '180px',
                                        border: '2px dashed #cbd5e1', borderRadius: '16px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', background: '#f8fafc',
                                        overflow: 'hidden', position: 'relative', transition: 'all 0.2s'
                                    }}
                                >
                                    {uploading ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#0A84FF' }}>
                                            <Loader2 size={32} className="animate-spin" />
                                            <span>กำลังอัปโหลด...</span>
                                        </div>
                                    ) : formData.image_url ? (
                                        <>
                                            <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                            <div style={{ marginBottom: '1rem', background: '#e0f2fe', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem auto' }}>
                                                <Upload size={24} color="#0A84FF" />
                                            </div>
                                            <div style={{ fontWeight: 500 }}>คลิกเพื่ออัปโหลดรูปภาพ</div>
                                            <div style={{ fontSize: '0.8rem', marginTop: '0.2rem', color: '#94a3b8' }}>แนะนำรูปแนวนอน 2:1</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ชื่อโปรโมชั่น *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="เช่น ลดสูงสุด 40% ต้อนรับหน้าร้อน"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>รายละเอียด</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="อธิบายโปรโมชั่น..."
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ข้อความส่วนลด (Badge)</label>
                                <input
                                    type="text"
                                    value={formData.discount_text}
                                    onChange={(e) => setFormData({ ...formData, discount_text: e.target.value })}
                                    placeholder="เช่น 40% OFF, ฟรีติดตั้ง"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Link ปุ่มคลิก</label>
                                <input
                                    type="text"
                                    value={formData.link_url}
                                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                    placeholder="/products"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>วันเริ่มต้น</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>วันสิ้นสุด</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    เปิดใช้งานโปรโมชั่น
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
                                ยกเลิก
                            </button>
                            <button onClick={handleSave} className="btn-wow" style={{ flex: 1, padding: '0.8rem' }}>
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
