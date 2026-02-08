"use client";

import { useState, useEffect } from 'react';
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
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_avatar: '',
        rating: 5,
        review_text: '',
        service_type: 'ติดตั้งแอร์',
        is_visible: true
    });

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setReviews(data);
        setIsLoading(false);
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
                is_visible: review.is_visible
            });
        } else {
            setEditingReview(null);
            setFormData({
                customer_name: '',
                customer_avatar: '',
                rating: 5,
                review_text: '',
                service_type: 'ติดตั้งแอร์',
                is_visible: true
            });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.customer_name || !formData.review_text) return;

        if (editingReview) {
            await supabase
                .from('reviews')
                .update(formData)
                .eq('id', editingReview.id);
        } else {
            await supabase
                .from('reviews')
                .insert(formData);
        }

        setShowModal(false);
        loadReviews();
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
