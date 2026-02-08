"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Portfolio {
    id: string;
    title: string;
    description: string;
    category: string;
    image_url: string;
    size: string;
}

export default function GalleryPage() {
    const [projects, setProjects] = useState<Portfolio[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("ทั้งหมด");

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setFilter(categoryParam);
        }

        const loadProjects = async () => {
            const { data } = await supabase
                .from('portfolios')
                .select('*')
                .eq('is_active', true)
                .order('display_order');

            if (data && data.length > 0) {
                setProjects(data);
            }
            setIsLoading(false);
        };

        loadProjects();
    }, []);

    const filteredProjects =
        filter === "ทั้งหมด"
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
                    {['ทั้งหมด', 'ล้างแอร์', 'ซ่อมแอร์', 'ติดตั้งแอร์', 'งานโครงการ', 'ขายส่ง'].map((cat) => (
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
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        กำลังโหลดผลงาน...
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        ยังไม่มีผลงานในหมวดหมู่นี้
                    </div>
                ) : (
                    /* Gallery Grid (Masonry-ish) */
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "2rem",
                        gridAutoFlow: "dense"
                    }}>
                        {filteredProjects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/about/${project.id}`}
                                className="animate-fade-in card-glass"
                                style={{
                                    position: "relative",
                                    borderRadius: "24px",
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    gridRow: project.size === "large" ? "span 2" : "span 1",
                                    transition: "transform 0.4s ease",
                                    height: project.size === 'large' ? '500px' : '300px',
                                    display: 'block',
                                    textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-10px)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                                }}
                            >
                                {/* Image Background */}
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    background: project.image_url
                                        ? `url(${project.image_url}) center/cover no-repeat`
                                        : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '5rem'
                                }}>
                                    {!project.image_url && '📷'}
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
                                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{project.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </div>
        </main>
    );
}
