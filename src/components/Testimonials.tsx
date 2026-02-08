"use client";

import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';

interface Review {
    id: string;
    customer_name: string;
    customer_avatar: string;
    rating: number;
    review_text: string;
    service_type: string;
}

// Fallback reviews if database is empty
const defaultReviews = [
    {
        id: '1',
        customer_name: "คุณวิชัย",
        customer_avatar: "",
        rating: 5,
        review_text: "ทีมงานเป็นมืออาชีพมาก เข้ามาตรงเวลา ปูผ้ากันเปื้อนอย่างดี ติดตั้งเสร็จเก็บกวาดเรียบร้อย",
        service_type: "ติดตั้งแอร์"
    },
    {
        id: '2',
        customer_name: "คุณหมอแนน",
        customer_avatar: "",
        rating: 5,
        review_text: "ประทับใจบริการคำนวณ BTU ค่ะ ไม่ยัดเยียดขายของ แนะนำเลยค่ะ",
        service_type: "ซื้อแอร์"
    },
    {
        id: '3',
        customer_name: "พี่ต้น",
        customer_avatar: "",
        rating: 5,
        review_text: "งานเดินท่อสวยมาก เข้ามุมเนี๊ยบ ช่างมีความรู้จริง ถามอะไรตอบได้หมด",
        service_type: "ติดตั้งแอร์"
    }
];

export default function Testimonials() {
    const [reviews, setReviews] = useState<Review[]>(defaultReviews);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('is_visible', true)
            .order('created_at', { ascending: false })
            .limit(6);

        if (data && data.length > 0) {
            setReviews(data);
        }
        // If error or no data, keep default reviews
    };

    return (
        <section style={{ padding: '6rem 0', overflow: 'hidden', position: 'relative' }}>
            <div className="container">
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                    <span className="text-gradient-blue" style={{ fontWeight: 700, letterSpacing: "1px" }}>
                        VOICE OF TRUST
                    </span>
                    <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginTop: "0.5rem", color: "var(--color-text-main)" }}>
                        ลูกค้าตัวจริง... <br className="md:hidden" />
                        ยืนยันคุณภาพ
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '1rem', fontSize: '1.5rem', color: '#F59E0B' }}>
                        ★★★★★ <span style={{ fontSize: '1rem', color: 'var(--color-text-sub)', marginLeft: '10px', alignSelf: 'center' }}>(4.9/5 จาก 1,200+ รีวิว)</span>
                    </div>
                </div>

                {/* Reviews Carousel */}
                <div style={{
                    display: 'grid',
                    gridAutoFlow: 'column',
                    gridAutoColumns: 'min(100%, 400px)',
                    gap: '2rem',
                    overflowX: 'auto',
                    padding: '1rem 1rem 3rem',
                    scrollSnapType: 'x mandatory',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }} className="hide-scrollbar">

                    {reviews.map((review, index) => (
                        <div
                            key={review.id}
                            className="card-glass"
                            style={{
                                scrollSnapAlign: 'center',
                                padding: '2rem',
                                borderRadius: '24px',
                                minHeight: '250px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                border: '1px solid rgba(255,255,255,0.6)',
                                background: index % 2 === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(240, 249, 255, 0.8)'
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: '#e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem'
                                    }}>
                                        {review.customer_avatar ? (
                                            <img src={review.customer_avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : '👤'}
                                    </div>
                                    <div style={{ fontSize: '1.2rem', color: '#F59E0B' }}>
                                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                    </div>
                                </div>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--color-text-main)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                                    "{review.review_text}"
                                </p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '1px', background: '#CBD5E1' }}></div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{review.customer_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)' }}>{review.service_type}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <a href="https://facebook.com" target="_blank" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        color: '#3B82F6', fontWeight: 600, textDecoration: 'none'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>👍</span> ดูรีวิวลูกค้าจริงบน Facebook Fanpage
                    </a>
                </div>
            </div>
        </section>
    );
}
