"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function CalculatorPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        width: '',
        length: '',
        roomType: 'bedroom', // bedroom, living, office
        sunExposure: 'normal', // normal, sunny
    });
    const [result, setResult] = useState<null | { btu: number, min: number, max: number }>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateBTU = () => {
        const w = parseFloat(formData.width);
        const l = parseFloat(formData.length);
        let factor = 750; // Base factor

        // Adjust factor based on Room Type
        if (formData.roomType === 'living') factor = 850;
        if (formData.roomType === 'office') factor = 950;

        // Adjust factor based on Sun Exposure
        if (formData.sunExposure === 'sunny') factor += 100;

        const calculatedBTU = w * l * factor;

        // Round to nearest standard BTU size
        const standardSizes = [9000, 12000, 15000, 18000, 24000, 30000, 36000];
        let recommended = standardSizes[0];
        for (let size of standardSizes) {
            if (calculatedBTU <= size) {
                recommended = size;
                break;
            }
            recommended = size; // Fallback to largest if exceeds
        }

        setResult({
            btu: recommended,
            min: Math.round(calculatedBTU),
            max: Math.round(calculatedBTU * 1.1)
        });
        setStep(3);
    };

    const nextStep = () => {
        if (step === 1 && (!formData.width || !formData.length)) return;
        if (step === 2) {
            calculateBTU();
        } else {
            setStep(step + 1);
        }
    };

    return (
        <main className="bg-aurora" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <div className="container" style={{ flex: 1, padding: '120px 0 4rem' }}>
                <div className="grid-calculator">


                    {/* Left Column: Calculator Form */}
                    <div className="card-glass" style={{ padding: '3rem', position: 'relative' }}>
                        {/* Progress Indicator */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: step >= 1 ? 'var(--color-primary-blue)' : '#cbd5e1' }}></div>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: step >= 2 ? 'var(--color-primary-blue)' : '#cbd5e1' }}></div>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: step >= 3 ? 'var(--color-primary-blue)' : '#cbd5e1' }}></div>
                        </div>

                        <h1 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2rem' }}>
                            {step === 1 && 'ขนาดห้องของคุณ?'}
                            {step === 2 && 'สภาพแวดล้อม?'}
                            {step === 3 && 'BTU ที่แนะนำ'}
                        </h1>

                        {/* Step 1: Dimensions */}
                        {step === 1 && (
                            <div className="animate-fade-in">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>กว้าง (เมตร)</label>
                                        <input
                                            type="number"
                                            name="width"
                                            placeholder="0"
                                            value={formData.width}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%', padding: '1rem', borderRadius: '12px',
                                                border: '1px solid #e2e8f0', fontSize: '1.2rem', textAlign: 'center'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ยาว (เมตร)</label>
                                        <input
                                            type="number"
                                            name="length"
                                            placeholder="0"
                                            value={formData.length}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%', padding: '1rem', borderRadius: '12px',
                                                border: '1px solid #e2e8f0', fontSize: '1.2rem', textAlign: 'center'
                                            }}
                                        />
                                    </div>
                                </div>
                                <button onClick={nextStep} className="btn-wow" style={{ width: '100%' }}>
                                    ถัดไป →
                                </button>
                            </div>
                        )}

                        {/* Step 2: Environment */}
                        {step === 2 && (
                            <div className="animate-fade-in">
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ประเภทห้อง</label>
                                    <select
                                        name="roomType"
                                        value={formData.roomType}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white' }}
                                    >
                                        <option value="bedroom">ห้องนอน (เย็นสบาย)</option>
                                        <option value="living">ห้องนั่งเล่น (คนเยอะ)</option>
                                        <option value="office">ออฟฟิศ/ร้านค้า (เปิดบ่อย)</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>โดนแดดมากไหม?</label>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button
                                            onClick={() => setFormData({ ...formData, sunExposure: 'normal' })}
                                            style={{
                                                flex: 1, padding: '1rem', borderRadius: '12px', border: '2px solid',
                                                borderColor: formData.sunExposure === 'normal' ? 'var(--color-primary-blue)' : '#e2e8f0',
                                                background: formData.sunExposure === 'normal' ? '#eff6ff' : 'white',
                                                fontWeight: 600
                                            }}
                                        >
                                            ☁️ ปกติ
                                        </button>
                                        <button
                                            onClick={() => setFormData({ ...formData, sunExposure: 'sunny' })}
                                            style={{
                                                flex: 1, padding: '1rem', borderRadius: '12px', border: '2px solid',
                                                borderColor: formData.sunExposure === 'sunny' ? 'var(--color-action-orange)' : '#e2e8f0',
                                                background: formData.sunExposure === 'sunny' ? '#fff7ed' : 'white',
                                                color: formData.sunExposure === 'sunny' ? 'var(--color-action-orange)' : 'inherit',
                                                fontWeight: 600
                                            }}
                                        >
                                            ☀️ แดดส่อง
                                        </button>
                                    </div>
                                </div>

                                <button onClick={nextStep} className="btn-wow" style={{ width: '100%' }}>
                                    คำนวณเลย! 🚀
                                </button>
                            </div>
                        )}

                        {/* Step 3: Result */}
                        {step === 3 && result && (
                            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.2rem', color: 'var(--color-text-sub)', marginBottom: '1rem' }}>
                                    สำหรับห้องขนาด {formData.width} x {formData.length} เมตร
                                </div>

                                <div style={{
                                    background: 'linear-gradient(135deg, var(--color-primary-blue) 0%, var(--color-primary-dark) 100%)',
                                    padding: '2rem',
                                    borderRadius: '20px',
                                    color: 'white',
                                    marginBottom: '2rem',
                                    boxShadow: '0 20px 40px rgba(10, 132, 255, 0.3)'
                                }}>
                                    <div style={{ fontSize: '1rem', opacity: 0.9 }}>ขนาดแอร์ที่เหมาะสม</div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.2 }}>
                                        {result.btu.toLocaleString()} <span style={{ fontSize: '1.5rem' }}>BTU</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                    <Link href={`/products?btu=${result.btu}`} className="btn-wow" style={{ textDecoration: 'none' }}>
                                        ดูแอร์ {result.btu.toLocaleString()} BTU
                                    </Link>
                                    <button
                                        onClick={() => setStep(1)}
                                        className="btn"
                                        style={{ background: 'transparent', border: '1px solid #cbd5e1', color: 'var(--color-text-sub)' }}
                                    >
                                        คำนวณใหม่
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Knowledge / Tips */}
                    <div className="animate-float-delayed" style={{ paddingTop: '2rem' }}>
                        {/* General Tip */}
                        <div style={{
                            background: 'white', padding: '1.5rem', borderRadius: '20px',
                            marginBottom: '1.5rem', boxShadow: 'var(--shadow-card)', border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>💡</span>
                                <div style={{ fontWeight: 700, color: 'var(--color-primary-blue)' }}>Did you know?</div>
                            </div>
                            {step === 1 && (
                                <p style={{ color: 'var(--color-text-sub)', fontSize: '0.9rem' }}>
                                    การเลือก BTU ที่น้อยเกินไปจะทำให้คอมเพรสเซอร์ทำงานหนักตลอดเวลา (กินไฟ)
                                    แต่ถ้ามากเกินไปจะทำให้ห้องชื้นและแอร์ตัดบ่อย ร้อนๆ หนาวๆ ไม่สบายตัว
                                </p>
                            )}
                            {step === 2 && (
                                <p style={{ color: 'var(--color-text-sub)', fontSize: '0.9rem' }}>
                                    <strong style={{ color: 'var(--color-action-orange)' }}>ห้องที่โดนแดด</strong> หรือห้องที่มีกระจกเยอะ จะสะสมความร้อนสูงกว่าห้องทั่วไปประมาณ 10-20%
                                    ทำให้ต้องเผื่อขนาดแอร์มากขึ้นเพื่อให้เย็นฉ่ำสู้แดดไหว
                                </p>
                            )}
                            {step === 3 && (
                                <p style={{ color: 'var(--color-text-sub)', fontSize: '0.9rem' }}>
                                    <strong style={{ color: '#22c55e' }}>Inverter คุ้มกว่าจริงไหม?</strong> <br />
                                    ระบบ Inverter จะควบคุมรอบหมุนคอมเพรสเซอร์ให้คงที่ ทำให้ประหยัดไฟกว่าระบบธรรมดา 30-40%
                                    และที่สำคัญคือเสียงเงียบกว่ามาก เหมาะสำหรับห้องนอนสุดๆ
                                </p>
                            )}
                        </div>

                        {/* Static Advice */}
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>ทำไมต้อง ธนรินทร์แอร์?</h3>
                            <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                    <span style={{ color: '#22c55e' }}>✓</span> สำรวจหน้างานฟรี ก่อนติดตั้ง
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                    <span style={{ color: '#22c55e' }}>✓</span> รับประกันงานเดินท่อ 1 ปี
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                    <span style={{ color: '#22c55e' }}>✓</span> แถมรางครอบท่อ 4 เมตร มูลค่า 800.-
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
