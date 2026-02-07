"use client";

import { useState, useEffect } from "react";

const reviews = [
    {
        id: 1,
        name: "คุณวิชัย (สุขุมวิท 39)",
        role: "เจ้าของกิจการ",
        avatar: "👨🏻‍💼",
        rating: 5,
        comment: "ทีมงานเป็นมืออาชีพมาก เข้ามาตรงเวลา ปูผ้ากันเปื้อนอย่างดี ติดตั้งเสร็จเก็บกวาดเรียบร้อย แอร์เย็นฉ่ำถูกใจครับ",
        date: "2 วันที่แล้ว"
    },
    {
        id: 2,
        name: "คุณหมอแนน (รพ.จุฬา)",
        role: "แพทย์",
        avatar: "👩🏻‍⚕️",
        rating: 5,
        comment: "ประทับใจบริการคำนวณ BTU ค่ะ ไม่ยัดเยียดขายของ แพงกว่าเจ้าอื่นนิดหน่อยแต่คุ้มค่าความสบายใจ แนะนำเลยค่ะ",
        date: "1 สัปดาห์ที่แล้ว"
    },
    {
        id: 3,
        name: "พี่ต้น (หมู่บ้านเศรษฐสิริ)",
        role: "วิศวกร",
        avatar: "👷🏻‍♂️",
        rating: 5,
        comment: "งานเดินท่อสวยมาก เข้ามุมเนี๊ยบ ผมเป็นวิศวกรยังยอมรับฝีมือ ช่างมีความรู้จริง ถามอะไรตอบได้หมด",
        date: "2 สัปดาห์ที่แล้ว"
    },
    {
        id: 4,
        name: "ร้านกาแฟ Good Day",
        role: "Commercial",
        avatar: "☕",
        rating: 4.5,
        comment: "เรียกมาล้างแอร์ 4 ตัว สะอาดเหมือนใหม่ ลมแรงขึ้นชัดเจน พนักงานสุภาพมากครับ",
        date: "3 สัปดาห์ที่แล้ว"
    }
];

export default function Testimonials() {
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto-scroll effect
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % reviews.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

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
                    display: 'flex',
                    gap: '2rem',
                    transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    transform: `translateX(calc(-${activeIndex * 100}% - ${activeIndex * 2}rem))`, // Simple sliding logic (needs adjustment for desktop centering ideally, but works for basic carousel)
                    // For a more robust responsive centered carousel, we'd need more complex calculation or a library.
                    // Let's keep it simple: On desktop, maybe show 2-3? 
                    // Let's try a different approach: CSS Grid with Scroll Snap for mobile-friendliness without complex JS math
                }} className="review-scroll-container">

                    {/* We will over-ride the inline style above with a better CSS class approach in globals if needed, 
                    but for now, let's just make it a horizontal scroll container */}
                </div>

                {/* Actually, let's do a CSS Grid Scroll Snap. It's much smoother and less bug-prone */}
                <div style={{
                    display: 'grid',
                    gridAutoFlow: 'column',
                    gridAutoColumns: 'min(100%, 400px)', // Mobile 100%, Desktop 400px cards
                    gap: '2rem',
                    overflowX: 'auto',
                    padding: '1rem 1rem 3rem', // Bottom padding for shadow clipping
                    scrollSnapType: 'x mandatory',
                    scrollbarWidth: 'none', // Hide scrollbar Firefox
                    msOverflowStyle: 'none', // Hide scrollbar IE
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
                                background: index % 2 === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(240, 249, 255, 0.8)' // Alternate colors slightly
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '3rem', lineHeight: 1 }}>{review.avatar}</div>
                                    <div style={{ fontSize: '1.2rem', color: '#F59E0B' }}>
                                        {"★".repeat(Math.floor(review.rating))}
                                        {review.rating % 1 !== 0 && "½"}
                                    </div>
                                </div>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--color-text-main)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                                    "{review.comment}"
                                </p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '1px', background: '#CBD5E1' }}></div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{review.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)' }}>{review.role} • {review.date}</div>
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
