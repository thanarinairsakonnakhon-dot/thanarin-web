"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Portfolio {
    id: string;
    title: string;
    description: string;
    category: string;
    image_url: string;
}

interface GalleryImage {
    id: string;
    image_url: string;
    caption: string;
    display_order: number;
}

export default function PortfolioGalleryAdmin() {
    const params = useParams();
    const router = useRouter();
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingCaption, setEditingCaption] = useState<string | null>(null);
    const [captionText, setCaptionText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, [params.id]);

    const loadData = async () => {
        const portfolioId = params.id as string;

        const { data: portfolioData } = await supabase
            .from('portfolios')
            .select('*')
            .eq('id', portfolioId)
            .single();

        if (portfolioData) {
            setPortfolio(portfolioData);
        }

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

                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Could not create blob'));
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Could not load image'));
            img.src = URL.createObjectURL(file);
        });
    };

    const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const resizedBlob = await resizeImage(file, 1200, 900, 0.85);

                const fileName = `gallery_${Date.now()}_${i}.jpg`;
                const filePath = `portfolios/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, resizedBlob, {
                        contentType: 'image/jpeg'
                    });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('images')
                    .getPublicUrl(filePath);

                // Insert to database
                await supabase.from('portfolio_images').insert({
                    portfolio_id: params.id,
                    image_url: urlData.publicUrl,
                    display_order: images.length + i
                });
            }

            loadData();
        } catch (error) {
            console.error('Upload error:', error);
            alert('อัปโหลดรูปไม่สำเร็จ');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ลบรูปนี้?')) return;
        await supabase.from('portfolio_images').delete().eq('id', id);
        loadData();
    };

    const handleSaveCaption = async (id: string) => {
        await supabase.from('portfolio_images')
            .update({ caption: captionText })
            .eq('id', id);
        setEditingCaption(null);
        loadData();
    };

    if (isLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>กำลังโหลด...</div>;
    }

    if (!portfolio) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>ไม่พบผลงาน</p>
                <Link href="/admin/portfolios" style={{ color: 'var(--color-primary-blue)' }}>
                    กลับ
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <button
                        onClick={() => router.back()}
                        style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginBottom: '0.5rem'
                        }}
                    >
                        ← กลับ
                    </button>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                        📸 คลังภาพ: {portfolio.title}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        จัดการภาพการติดตั้งเพิ่มเติม ({images.length} รูป)
                    </p>
                </div>
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={fileInputRef}
                        onChange={handleUploadImages}
                        style={{ display: 'none' }}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-wow"
                        style={{ padding: '0.8rem 1.5rem' }}
                        disabled={uploading}
                    >
                        {uploading ? 'กำลังอัปโหลด...' : '+ อัปโหลดรูป'}
                    </button>
                </div>
            </div>

            {/* Gallery Grid */}
            {images.length === 0 ? (
                <div style={{
                    background: 'white',
                    padding: '4rem',
                    borderRadius: '16px',
                    textAlign: 'center',
                    border: '2px dashed #e2e8f0'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📷</div>
                    <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>ยังไม่มีภาพในคลัง</p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            background: 'var(--color-primary-blue)',
                            color: 'white',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        อัปโหลดรูปแรก
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    {images.map((img) => (
                        <div
                            key={img.id}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
                            }}
                        >
                            <div style={{
                                height: '150px',
                                background: `url(${img.image_url}) center/cover`
                            }} />

                            <div style={{ padding: '0.8rem' }}>
                                {editingCaption === img.id ? (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={captionText}
                                            onChange={(e) => setCaptionText(e.target.value)}
                                            placeholder="คำอธิบาย..."
                                            style={{
                                                flex: 1,
                                                padding: '0.4rem',
                                                borderRadius: '6px',
                                                border: '1px solid #e2e8f0',
                                                fontSize: '0.85rem'
                                            }}
                                        />
                                        <button
                                            onClick={() => handleSaveCaption(img.id)}
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                background: 'var(--color-primary-blue)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            ✓
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => {
                                            setEditingCaption(img.id);
                                            setCaptionText(img.caption || '');
                                        }}
                                        style={{
                                            fontSize: '0.85rem',
                                            color: img.caption ? '#1e293b' : '#94a3b8',
                                            cursor: 'pointer',
                                            minHeight: '1.5rem'
                                        }}
                                    >
                                        {img.caption || '(คลิกเพื่อเพิ่มคำอธิบาย)'}
                                    </div>
                                )}

                                <button
                                    onClick={() => handleDelete(img.id)}
                                    style={{
                                        marginTop: '0.5rem',
                                        width: '100%',
                                        padding: '0.4rem',
                                        background: '#fef2f2',
                                        color: '#ef4444',
                                        border: '1px solid #fecaca',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    🗑️ ลบ
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
