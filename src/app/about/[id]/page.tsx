"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Portfolio {
    id: string;
    title: string;
    description: string;
    category: string;
    image_url: string;
}

interface PortfolioImage {
    id: string;
    image_url: string;
    caption: string;
    display_order: number;
}

export default function PortfolioDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [images, setImages] = useState<PortfolioImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const portfolioId = params.id as string;

            // Load portfolio
            const { data: portfolioData } = await supabase
                .from('portfolios')
                .select('*')
                .eq('id', portfolioId)
                .single();

            if (portfolioData) {
                setPortfolio(portfolioData);
            }

            // Load gallery images
            const { data: imagesData } = await supabase
                .from('portfolio_images')
                .select('*')
                .eq('portfolio_id', portfolioId)
                .order('display_order');

            if (imagesData) {
                setImages(imagesData);
            }

            setIsLoading(false);
        };

        if (params.id) {
            loadData();
        }
    }, [params.id]);

    if (isLoading) {
        return (
            <main className="bg-aurora" style={{ minHeight: "100vh" }}>
                <Navbar />
                <div style={{ paddingTop: '150px', textAlign: 'center', color: '#64748b' }}>
                    กำลังโหลด...
                </div>
            </main>
        );
    }

    if (!portfolio) {
        return (
            <main className="bg-aurora" style={{ minHeight: "100vh" }}>
                <Navbar />
                <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>ไม่พบผลงาน</h1>
                    <Link href="/about" style={{ color: 'var(--color-primary-blue)' }}>
                        ← กลับไปหน้าผลงาน
                    </Link>
                </div>
            </main>
        );
    }

    // Combine main image with gallery images
    const allImages = portfolio.image_url
        ? [{ id: 'main', image_url: portfolio.image_url, caption: 'ภาพหลัก', display_order: -1 }, ...images]
        : images;

    return (
        <main className="bg-aurora" style={{ minHeight: "100vh" }}>
            <Navbar />

            <div className="container" style={{ paddingTop: "120px", paddingBottom: "4rem" }}>
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    style={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem'
                    }}
                >
                    ← กลับ
                </button>

                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <span style={{
                        background: 'var(--color-action-orange)',
                        color: 'white',
                        padding: '0.3rem 1rem',
                        borderRadius: '50px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                    }}>
                        {portfolio.category}
                    </span>
                    <h1 style={{
                        fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                        fontWeight: 800,
                        marginTop: '1rem',
                        marginBottom: '1rem',
                        color: '#0F172A'
                    }}>
                        {portfolio.title}
                    </h1>
                    {portfolio.description && (
                        <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '700px' }}>
                            {portfolio.description}
                        </p>
                    )}
                </div>

                {/* Main Featured Image */}
                {portfolio.image_url && (
                    <div
                        onClick={() => setSelectedImage(portfolio.image_url)}
                        style={{
                            width: '100%',
                            height: '400px',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            marginBottom: '2rem',
                            cursor: 'pointer',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                        }}
                    >
                        <img
                            src={portfolio.image_url}
                            alt={portfolio.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s'
                            }}
                        />
                    </div>
                )}

                {/* Gallery Grid */}
                {images.length > 0 && (
                    <>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            marginBottom: '1.5rem',
                            color: '#0F172A'
                        }}>
                            📸 ภาพการติดตั้งเพิ่มเติม ({images.length} รูป)
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '1rem'
                        }}>
                            {images.map((img) => (
                                <div
                                    key={img.id}
                                    onClick={() => setSelectedImage(img.image_url)}
                                    style={{
                                        position: 'relative',
                                        height: '200px',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                                        transition: 'transform 0.3s, box-shadow 0.3s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                                    }}
                                >
                                    <img
                                        src={img.image_url}
                                        alt={img.caption || 'Gallery image'}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    {img.caption && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '0.8rem',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                            color: 'white',
                                            fontSize: '0.85rem'
                                        }}>
                                            {img.caption}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {images.length === 0 && (
                    <div style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '16px',
                        textAlign: 'center',
                        color: '#94a3b8'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                        <p>ยังไม่มีภาพเพิ่มเติมสำหรับผลงานนี้</p>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    onClick={() => setSelectedImage(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        cursor: 'zoom-out',
                        padding: '2rem'
                    }}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'white',
                            border: 'none',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ✕
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full size"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90vh',
                            borderRadius: '12px',
                            cursor: 'default'
                        }}
                    />

                    {/* Thumbnail Navigation */}
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '0.5rem',
                        maxWidth: '90%',
                        overflowX: 'auto',
                        padding: '0.5rem'
                    }}>
                        {allImages.map((img) => (
                            <img
                                key={img.id}
                                src={img.image_url}
                                alt=""
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage(img.image_url);
                                }}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    border: selectedImage === img.image_url ? '3px solid white' : '3px solid transparent',
                                    opacity: selectedImage === img.image_url ? 1 : 0.6,
                                    transition: 'all 0.2s'
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
