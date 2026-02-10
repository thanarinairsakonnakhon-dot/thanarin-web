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
    review_image_url?: string;
    source?: 'google' | 'local';
    time?: number; // Unix timestamp for sorting
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
    const [stats, setStats] = useState({ avg: 4.9, total: 1200 });

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        let localReviews: Review[] = defaultReviews;

        // Fetch specific reviews for display
        const { data: displayData } = await supabase
            .from('reviews')
            .select('*')
            .eq('is_visible', true)
            .order('created_at', { ascending: false });

        if (displayData && displayData.length > 0) {
            localReviews = displayData.map(r => ({ ...r, source: 'local', time: new Date(r.created_at).getTime() / 1000 }));
        }

        // Fetch Google Reviews
        try {
            const res = await fetch('/api/reviews/google');
            if (res.ok) {
                const data = await res.json();
                if (data.reviews && Array.isArray(data.reviews)) {
                    const googleReviews = data.reviews.map((r: any) => ({
                        id: `google-${r.time}`,
                        customer_name: r.author_name,
                        customer_avatar: r.profile_photo_url,
                        rating: r.rating,
                        review_text: r.text,
                        service_type: 'Google Review',
                        source: 'google',
                        time: r.time
                    }));

                    // Merge and sort by newest
                    const allReviews = [...localReviews, ...googleReviews].sort((a, b) => (b.time || 0) - (a.time || 0));
                    setReviews(allReviews.slice(0, 10)); // Show top 10 recent reviews

                    // Update stats if available
                    if (data.total_ratings) {
                        // Weighted average validation could be complex, simple override or merge logic here
                        // For now, let's just use the Google stats as they are likely more authoritative if numerous
                        if (data.total_ratings > 10) {
                            setStats({ avg: data.rating, total: data.total_ratings });
                        }
                    }
                    return;
                }
            }
        } catch (error) {
            console.error('Failed to fetch Google reviews', error);
        }

        setReviews(localReviews);

        // Fetch all ratings to calculate accurate average and total
        const { data: allRatings } = await supabase
            .from('reviews')
            .select('rating')
            .eq('is_visible', true);

        if (allRatings && allRatings.length > 0) {
            const total = allRatings.length;
            const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
            const avg = parseFloat((sum / total).toFixed(1));
            setStats({ avg, total });
        }
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
                        {'★'.repeat(Math.round(stats.avg))}{'☆'.repeat(5 - Math.round(stats.avg))}
                        <span style={{ fontSize: '1rem', color: 'var(--color-text-sub)', marginLeft: '10px', alignSelf: 'center' }}>
                            ({stats.avg}/5 จาก {stats.total > 1000 ? stats.total.toLocaleString() + '+' : stats.total} รีวิว)
                        </span>
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
                                minHeight: '300px', // Increased height to accommodate image
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                border: '1px solid rgba(255,255,255,0.6)',
                                background: index % 2 === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(240, 249, 255, 0.8)'
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            overflow: 'hidden'
                                        }}>
                                            {review.customer_avatar ? (
                                                <img src={review.customer_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : '👤'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{review.customer_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {review.source === 'google' && (
                                                    <span style={{ display: 'inline-block', width: '12px', height: '12px' }}>
                                                        <svg viewBox="0 0 24 24" viewBox="0 0 48 48">
                                                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                                            <path fill="none" d="M0 0h48v48H0z"></path>
                                                        </svg>
                                                    </span>
                                                )}
                                                {review.service_type}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '1.2rem', color: '#F59E0B' }}>
                                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                    </div>
                                </div>

                                {review.review_image_url && (
                                    <div style={{ marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden', maxHeight: '200px' }}>
                                        <img
                                            src={review.review_image_url}
                                            alt="Customer Review"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}

                                <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--color-text-main)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                                    "{review.review_text}"
                                </p>
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
