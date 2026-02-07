"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function GalleryPage() {
    // Mock Gallery Data
    const projects = [
        {
            id: 1,
            title: "ติดตั้งแอร์ 4 ทิศทาง - คอนโดหรูสุขุมวิท",
            category: "Commercial",
            image: "🏢", // Placeholder for now, can be replaced with real images
            size: "large",
            desc: "การติดตั้งระบบ VRV สำหรับ Penthouse ขนาด 300 ตร.ม.",
        },
        {
            id: 2,
            title: "บ้านเดี่ยว Modern Loft - แอร์เปลือย",
            category: "Residential",
            image: "🏠",
            size: "medium",
            desc: "เดินท่อลอยสไตล์ Loft งานเนี๊ยบทุกจุด",
        },
        {
            id: 3,
            title: "Renovate ร้านกาแฟ - แอร์ Cassette",
            category: "Commercial",
            image: "☕",
            size: "small",
            desc: "ติดตั้งกลางคืน จบงานไวใน 6 ชั่วโมง",
        },
        {
            id: 4,
            title: "หมู่บ้านเศรษฐสิริ - Daikin Inverter",
            category: "Residential",
            image: "❄️",
            size: "large",
            desc: "ติดตั้งพร้อมกัน 5 เครื่อง เก็บงานสะอาด",
        },
        {
            id: 5,
            title: "Office ขนาดเล็ก - Wall Type",
            category: "Commercial",
            image: "💼",
            size: "medium",
            desc: "ประหยัดงบ แต่ได้ความเย็นทั่วถึง",
        },
        {
            id: 6,
            title: "ล้างใหญ่ประจำปี - โรงแรมบูทีค",
            category: "Service",
            image: "🚿",
            size: "small",
            desc: "บริการล้างแอร์ 50 เครื่อง พร้อมอบโอโซน",
        },
        {
            id: 7,
            title: "ติดตั้งห้อง Server - ควบคุมอุณหภูมิ",
            category: "Commercial",
            image: "🖥️",
            size: "medium",
            desc: "แอร์ Precision Control เปิด 24 ชม.",
        },
        {
            id: 8,
            title: "บ้านพักตากอากาศ - เขาใหญ่",
            category: "Residential",
            image: "⛰️",
            size: "large",
            desc: "ติดตั้งระบบ Multi-split ซ่อนคอมเพรสเซอร์",
        },
    ];

    const [filter, setFilter] = useState("All");

    const filteredProjects =
        filter === "All"
            ? projects
            : projects.filter((p) => p.category === filter);

    return (
        <main className="bg-aurora" style={{ minHeight: "100vh" }}>
            <Navbar />

            <div className="container" style={{ paddingTop: "120px", paddingBottom: "4rem" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                    <span style={{
                        color: "var(--color-primary-blue)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "2px",
                        fontSize: "0.9rem"
                    }}>
                        Our Masterpieces
                    </span>
                    <h1
                        style={{
                            fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                            fontWeight: 800,
                            marginTop: "1rem",
                            marginBottom: "1.5rem",
                            background: "linear-gradient(135deg, #0F172A 0%, #334155 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        ผลงานที่น่าภูมิใจ
                    </h1>
                    <p style={{ maxWidth: "600px", margin: "0 auto", color: "var(--color-text-sub)" }}>
                        เราใส่ใจทุกรายละเอียด ทุกหน้างานคือความรับผิดชอบของเรา
                        ชมตัวอย่างผลงานการติดตั้งจริงจากทีมงานมืออาชีพ
                    </p>
                </div>

                {/* Filter Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                    {['All', 'Residential', 'Commercial', 'Service'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            style={{
                                padding: '0.6rem 1.5rem',
                                borderRadius: '99px',
                                border: '1px solid',
                                borderColor: filter === cat ? 'var(--color-primary-blue)' : '#e2e8f0',
                                background: filter === cat ? 'var(--color-primary-blue)' : 'white',
                                color: filter === cat ? 'white' : 'var(--color-text-sub)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: filter === cat ? '0 4px 12px rgba(10, 132, 255, 0.3)' : 'none'
                            }}
                        >
                            {cat === 'All' && 'ทั้งหมด'}
                            {cat === 'Residential' && 'บ้านพักอาศัย'}
                            {cat === 'Commercial' && 'เชิงพาณิชย์'}
                            {cat === 'Service' && 'งานบริการ/ซ่อม'}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid (Masonry-ish) */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "2rem",
                    gridAutoFlow: "dense"
                }}>
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className="animate-fade-in card-glass"
                            style={{
                                position: "relative",
                                borderRadius: "24px",
                                overflow: "hidden",
                                cursor: "pointer",
                                gridRow: project.size === "large" ? "span 2" : "span 1",
                                transition: "transform 0.4s ease",
                                height: project.size === 'large' ? '500px' : '300px'
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-10px)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                            }}
                        >
                            {/* Image Placeholder Background */}
                            <div style={{
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '5rem'
                            }}>
                                {project.image}
                            </div>

                            {/* Overlay Content */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '1.5rem',
                                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0) 100%)',
                                color: 'white'
                            }}>
                                <div style={{
                                    fontSize: '0.8rem',
                                    background: 'var(--color-action-orange)',
                                    display: 'inline-block',
                                    padding: '0.2rem 0.8rem',
                                    borderRadius: '4px',
                                    marginBottom: '0.5rem',
                                    fontWeight: 700
                                }}>
                                    {project.category}
                                </div>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{project.title}</h3>
                                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{project.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </main>
    );
}
