"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Review {
    id: string;
    customer_name: string;
    customer_avatar: string;
    rating: number;
    review_text: string;
    service_type: string;
    is_visible: boolean;
    created_at: string;
    review_image_url?: string | null;
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_avatar: '',
        rating: 5,
        review_text: '',
        service_type: 'ติดตั้งแอร์',
        is_visible: true,
        review_image_url: ''
    });

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setReviews(data);
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (review?: Review) => {
        if (review) {
            setEditingReview(review);
            setFormData({
                customer_name: review.customer_name,
                customer_avatar: review.customer_avatar || '',
                rating: review.rating,
                review_text: review.review_text,
                service_type: review.service_type || '',
                is_visible: review.is_visible,
                review_image_url: review.review_image_url || ''
            });
        } else {
            setEditingReview(null);
            setFormData({
                customer_name: '',
                customer_avatar: '',
                rating: 5,
                review_text: '',
                service_type: 'ติดตั้งแอร์',
                is_visible: true,
                review_image_url: ''
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
                canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No blob')), 'image/jpeg', quality);
            };
            img.onerror = () => reject(new Error('Failed to load'));
            img.src = URL.createObjectURL(file);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Resize image to max 800x800 for optimization
            const resizedBlob = await resizeImage(file, 800, 800, 0.8);

            const fileName = `review_${Date.now()}.jpg`;
            const filePath = `reviews/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, resizedBlob, { contentType: 'image/jpeg' });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, review_image_url: data.publicUrl }));
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(`อัปโหลดรูปไม่สำเร็จ: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.customer_name || !formData.review_text) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            if (editingReview) {
                const { error } = await supabase
                    .from('reviews')
                    .update(formData)
                    .eq('id', editingReview.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('reviews')
                    .insert(formData);
                if (error) throw error;
            }

            setShowModal(false);
            loadReviews();
        } catch (error: any) {
            console.error('Error saving review:', error);
            alert(`บันทึกไม่สำเร็จ: ${error.message || 'Unknown error'}\n\nกรุณาตรวจสอบว่าได้สร้างตาราง reviews ใน Supabase หรือยังครับ`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ลบรีวิวนี้?')) return;
        await supabase.from('reviews').delete().eq('id', id);
        loadReviews();
    };

    const handleToggleVisibility = async (id: string, current: boolean) => {
        await supabase.from('reviews').update({ is_visible: !current }).eq('id', id);
        loadReviews();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>⭐ จัดการรีวิว</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>แสดงในหน้า Homepage</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn-wow" style={{ padding: '0.8rem 1.5rem' }}>
                    + เพิ่มรีวิว
                </button>
            </div>

            {/* Reviews Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {isLoading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>กำลังโหลด...</div>
                ) : reviews.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', gridColumn: '1/-1' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
                        <div>ยังไม่มีรีวิว</div>
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            opacity: review.is_visible ? 1 : 0.5
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {review.customer_avatar ? (
                                            <img src={review.customer_avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            <span>👤</span>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{review.customer_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{review.service_type}</div>
                                    </div>
                                </div>
                                <div style={{ color: '#f59e0b' }}>
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                            </div>

                            {review.review_image_url && (
                                <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', maxHeight: '150px' }}>
                                    <img src={review.review_image_url} alt="Review" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}

                            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                                "{review.review_text}"
                            </p>

                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => handleToggleVisibility(review.id, review.is_visible)}
                                    style={{ padding: '0.4rem 0.8rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
                                >
                                    {review.is_visible ? '👁️ ซ่อน' : '👁️ แสดง'}
                                </button>
                                <button
                                    onClick={() => handleOpenModal(review)}
                                    style={{ padding: '0.4rem 0.8rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
                                >
                                    ✏️ แก้ไข
                                </button>
                                <button
                                    onClick={() => handleDelete(review.id)}
                                    style={{ padding: '0.4rem 0.8rem', border: '1px solid #fecaca', borderRadius: '6px', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
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
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '450px', maxWidth: '90%', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
                            {editingReview ? '✏️ แก้ไขรีวิว' : '⭐ เพิ่มรีวิวใหม่'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ชื่อลูกค้า *</label>
                                <input
                                    type="text"
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>คะแนน</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            {star <= formData.rating ? '★' : '☆'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>บริการ</label>
                                <select
                                    value={formData.service_type}
                                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                >
                                    <option value="ติดตั้งแอร์">ติดตั้งแอร์</option>
                                    <option value="ล้างแอร์">ล้างแอร์</option>
                                    <option value="ซ่อมแอร์">ซ่อมแอร์</option>
                                    <option value="ซื้อแอร์">ซื้อแอร์</option>
                                </select>
                            </div>

                            {/* Review Image Upload */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>รูปรีวิว (เช่น รูปคู่ลูกค้า)</label>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        width: '100%',
                                        height: '100px',
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        background: formData.review_image_url ? 'white' : '#f8fafc',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}
                                >
                                    {uploading ? (
                                        <div style={{ color: '#64748b' }}>กำลังอัปโหลด...</div>
                                    ) : formData.review_image_url ? (
                                        <img src={formData.review_image_url} alt="Review" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                                            <div>📷 คลิกเพื่ออัปโหลดรูป</div>
                                        </div>
                                    )}
                                </div>
                                {formData.review_image_url && (
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, review_image_url: '' }))}
                                        style={{ marginTop: '0.5rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        ❌ ลบรูปภาพ
                                    </button>
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ข้อความรีวิว *</label>
                                <textarea
                                    value={formData.review_text}
                                    onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                                    rows={4}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_visible}
                                        onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                                    />
                                    แสดงในหน้าเว็บ
                                </label>
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
