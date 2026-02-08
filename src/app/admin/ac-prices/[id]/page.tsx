"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Brand {
    id: string;
    name: string;
    color: string;
}

interface Series {
    id: string;
    brand_id: string;
    name: string;
    is_active: boolean;
    display_order: number;
}

interface Model {
    id: string;
    series_id: string;
    model_name: string;
    btu: string;
    price: number;
    is_active: boolean;
    display_order: number;
}

export default function BrandSeriesAdmin() {
    const params = useParams();
    const router = useRouter();
    const brandId = params.id as string;

    const [brand, setBrand] = useState<Brand | null>(null);
    const [seriesList, setSeriesList] = useState<Series[]>([]);
    const [models, setModels] = useState<{ [key: string]: Model[] }>({});
    const [isLoading, setIsLoading] = useState(true);

    // Series Modal
    const [showSeriesModal, setShowSeriesModal] = useState(false);
    const [editingSeries, setEditingSeries] = useState<Series | null>(null);
    const [seriesForm, setSeriesForm] = useState({ name: '', is_active: true, display_order: 0 });

    // Model Modal
    const [showModelModal, setShowModelModal] = useState(false);
    const [editingModel, setEditingModel] = useState<Model | null>(null);
    const [currentSeriesId, setCurrentSeriesId] = useState<string>('');
    const [modelForm, setModelForm] = useState({ model_name: '', btu: '', price: 0, is_active: true, display_order: 0 });

    useEffect(() => {
        loadData();
    }, [brandId]);

    const loadData = async () => {
        setIsLoading(true);

        // Load brand
        const { data: brandData } = await supabase
            .from('ac_brands')
            .select('*')
            .eq('id', brandId)
            .single();
        if (brandData) setBrand(brandData);

        // Load series
        const { data: seriesData } = await supabase
            .from('ac_series')
            .select('*')
            .eq('brand_id', brandId)
            .order('display_order');
        if (seriesData) {
            setSeriesList(seriesData);

            // Load models for each series
            const modelsObj: { [key: string]: Model[] } = {};
            for (const s of seriesData) {
                const { data: modelData } = await supabase
                    .from('ac_models')
                    .select('*')
                    .eq('series_id', s.id)
                    .order('display_order');
                if (modelData) modelsObj[s.id] = modelData;
            }
            setModels(modelsObj);
        }

        setIsLoading(false);
    };

    // SERIES HANDLERS
    const handleOpenSeriesModal = (series?: Series) => {
        if (series) {
            setEditingSeries(series);
            setSeriesForm({ name: series.name, is_active: series.is_active, display_order: series.display_order });
        } else {
            setEditingSeries(null);
            setSeriesForm({ name: '', is_active: true, display_order: seriesList.length });
        }
        setShowSeriesModal(true);
    };

    const handleSaveSeries = async () => {
        if (!seriesForm.name) { alert('กรุณาใส่ชื่อ Series'); return; }
        try {
            if (editingSeries) {
                await supabase.from('ac_series').update(seriesForm).eq('id', editingSeries.id);
            } else {
                await supabase.from('ac_series').insert({ ...seriesForm, brand_id: brandId });
            }
            setShowSeriesModal(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert('บันทึกไม่สำเร็จ กรุณาตรวจสอบว่าได้สร้างตาราง ac_series แล้ว');
        }
    };

    const handleDeleteSeries = async (id: string) => {
        if (!confirm('ลบ Series นี้? (รวมทุก Model ภายใน)')) return;
        await supabase.from('ac_series').delete().eq('id', id);
        loadData();
    };

    // MODEL HANDLERS
    const handleOpenModelModal = (seriesId: string, model?: Model) => {
        setCurrentSeriesId(seriesId);
        if (model) {
            setEditingModel(model);
            setModelForm({
                model_name: model.model_name,
                btu: model.btu,
                price: model.price,
                is_active: model.is_active,
                display_order: model.display_order
            });
        } else {
            setEditingModel(null);
            setModelForm({ model_name: '', btu: '', price: 0, is_active: true, display_order: (models[seriesId]?.length || 0) });
        }
        setShowModelModal(true);
    };

    const handleSaveModel = async () => {
        if (!modelForm.model_name) { alert('กรุณาใส่ชื่อรุ่น'); return; }
        try {
            if (editingModel) {
                await supabase.from('ac_models').update(modelForm).eq('id', editingModel.id);
            } else {
                await supabase.from('ac_models').insert({ ...modelForm, series_id: currentSeriesId });
            }
            setShowModelModal(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert('บันทึกไม่สำเร็จ กรุณาตรวจสอบว่าได้สร้างตาราง ac_models แล้ว');
        }
    };

    const handleDeleteModel = async (id: string) => {
        if (!confirm('ลบรุ่นนี้?')) return;
        await supabase.from('ac_models').delete().eq('id', id);
        loadData();
    };

    if (isLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>กำลังโหลด...</div>;
    }

    if (!brand) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>ไม่พบแบรนด์</div>;
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => router.back()}
                    style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '1rem' }}
                >
                    ← กลับ
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: brand.color }}>
                            📋 {brand.name} - จัดการ Series & ราคา
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>เพิ่ม Series และรุ่นพร้อมราคา</p>
                    </div>
                    <button onClick={() => handleOpenSeriesModal()} className="btn-wow" style={{ padding: '0.8rem 1.5rem' }}>
                        + เพิ่ม Series
                    </button>
                </div>
            </div>

            {/* Series List */}
            {seriesList.length === 0 ? (
                <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <div style={{ color: '#94a3b8' }}>ยังไม่มี Series</div>
                    <button onClick={() => handleOpenSeriesModal()} style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', background: brand.color, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        + เพิ่ม Series แรก
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {seriesList.map(series => (
                        <div key={series.id} style={{ background: 'white', borderRadius: '12px', border: `2px solid ${brand.color}40`, overflow: 'hidden' }}>
                            {/* Series Header */}
                            <div style={{
                                background: `linear-gradient(135deg, ${brand.color} 0%, ${brand.color}CC 100%)`,
                                padding: '1rem 1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                color: 'white'
                            }}>
                                <h3 style={{ fontWeight: 700, margin: 0, color: 'white' }}>{series.name}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleOpenModelModal(series.id)}
                                        style={{ padding: '0.4rem 0.8rem', background: 'white', color: brand.color, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                                    >
                                        + เพิ่มรุ่น
                                    </button>
                                    <button
                                        onClick={() => handleOpenSeriesModal(series)}
                                        style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSeries(series.id)}
                                        style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {/* Models Table */}
                            <div style={{ padding: '1rem' }}>
                                {(!models[series.id] || models[series.id].length === 0) ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                        ยังไม่มีรุ่น - กดปุ่ม "+ เพิ่มรุ่น"
                                    </div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
                                                <td style={{ padding: '0.8rem', textAlign: 'left' }}>รุ่น</td>
                                                <td style={{ padding: '0.8rem', textAlign: 'center' }}>BTU</td>
                                                <td style={{ padding: '0.8rem', textAlign: 'right' }}>ราคา</td>
                                                <td style={{ padding: '0.8rem', textAlign: 'center', width: '100px' }}>จัดการ</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {models[series.id].map(model => (
                                                <tr key={model.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.8rem', fontWeight: 500 }}>{model.model_name}</td>
                                                    <td style={{ padding: '0.8rem', textAlign: 'center', color: brand.color, fontWeight: 600 }}>{model.btu}</td>
                                                    <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: 700 }}>฿{Number(model.price).toLocaleString()}</td>
                                                    <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => handleOpenModelModal(series.id, model)}
                                                            style={{ padding: '0.3rem 0.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginRight: '0.3rem' }}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteModel(model.id)}
                                                            style={{ padding: '0.3rem 0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', color: '#ef4444' }}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Series Modal */}
            {showSeriesModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '400px', maxWidth: '90%' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingSeries ? '✏️ แก้ไข Series' : '📋 เพิ่ม Series ใหม่'}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ชื่อ Series *</label>
                                <input
                                    type="text"
                                    value={seriesForm.name}
                                    onChange={(e) => setSeriesForm({ ...seriesForm, name: e.target.value })}
                                    placeholder="เช่น Inverter 2025, ธรรมดา 2024"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ลำดับ</label>
                                    <input
                                        type="number"
                                        value={seriesForm.display_order}
                                        onChange={(e) => setSeriesForm({ ...seriesForm, display_order: parseInt(e.target.value) || 0 })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={seriesForm.is_active} onChange={(e) => setSeriesForm({ ...seriesForm, is_active: e.target.checked })} />
                                        เปิดใช้งาน
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowSeriesModal(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>ยกเลิก</button>
                            <button onClick={handleSaveSeries} className="btn-wow" style={{ flex: 1, padding: '0.8rem' }}>บันทึก</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Model Modal */}
            {showModelModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '400px', maxWidth: '90%' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingModel ? '✏️ แก้ไขรุ่น' : '❄️ เพิ่มรุ่นใหม่'}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ชื่อรุ่น *</label>
                                <input
                                    type="text"
                                    value={modelForm.model_name}
                                    onChange={(e) => setModelForm({ ...modelForm, model_name: e.target.value })}
                                    placeholder="เช่น MSY-KY09, FTKB12ZV2S"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>BTU</label>
                                    <input
                                        type="text"
                                        value={modelForm.btu}
                                        onChange={(e) => setModelForm({ ...modelForm, btu: e.target.value })}
                                        placeholder="9,000"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ราคา (บาท)</label>
                                    <input
                                        type="number"
                                        value={modelForm.price}
                                        onChange={(e) => setModelForm({ ...modelForm, price: parseFloat(e.target.value) || 0 })}
                                        placeholder="15900"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ลำดับ</label>
                                    <input
                                        type="number"
                                        value={modelForm.display_order}
                                        onChange={(e) => setModelForm({ ...modelForm, display_order: parseInt(e.target.value) || 0 })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={modelForm.is_active} onChange={(e) => setModelForm({ ...modelForm, is_active: e.target.checked })} />
                                        เปิดใช้งาน
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowModelModal(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>ยกเลิก</button>
                            <button onClick={handleSaveModel} className="btn-wow" style={{ flex: 1, padding: '0.8rem' }}>บันทึก</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
