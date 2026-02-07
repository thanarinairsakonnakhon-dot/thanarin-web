"use client";

import { useCompare } from '@/context/CompareContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ComparePage() {
    const { selectedProducts, removeFromCompare } = useCompare();

    return (
        <main className="bg-aurora" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '120px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>
                    เปรียบเทียบรุ่นแอร์ ({selectedProducts.length})
                </h1>

                {selectedProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.5)', borderRadius: '24px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚖️</div>
                        <h3>ยังไม่ได้เลือกรุ่นเปรียบเทียบ</h3>
                        <p style={{ marginBottom: '2rem', color: '#64748b' }}>กรุณากลับไปที่หน้ารายการสินค้าเพื่อเลือกแอร์ที่ต้องการเปรียบเทียบ</p>
                        <Link href="/products" className="btn-wow">
                            กลับไปเลือกสินค้า
                        </Link>
                    </div>
                ) : (
                    <div className="card-glass" style={{ overflowX: 'auto', padding: '2rem' }}>
                        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '150px' }}></th>
                                    {selectedProducts.map(p => (
                                        <th key={p.id} style={{ padding: '1rem', verticalAlign: 'top', width: `${85 / selectedProducts.length}%` }}>
                                            <div style={{ position: 'relative' }}>
                                                <button
                                                    onClick={() => removeFromCompare(p.id)}
                                                    style={{
                                                        position: 'absolute', top: 0, right: 0,
                                                        color: '#ef4444', background: 'transparent', border: 'none',
                                                        cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700
                                                    }}
                                                >
                                                    ×
                                                </button>
                                                <img src={p.image} alt={p.name} style={{ width: '100%', height: '150px', objectFit: 'contain', marginBottom: '1rem' }} />
                                                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{p.brand}</div>
                                                <h3 style={{ fontSize: '1.1rem' }}>{p.name}</h3>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginTop: '0.5rem' }}>
                                                    ฿{p.price.toLocaleString()}
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                    {/* Fill empty cells if needed */}
                                    {Array.from({ length: 3 - selectedProducts.length }).map((_, i) => (
                                        <th key={`empty-${i}`} style={{ padding: '1rem', verticalAlign: 'middle', textAlign: 'center', opacity: 0.5 }}>
                                            <Link href="/products" style={{
                                                display: 'inline-block', width: '50px', height: '50px',
                                                borderRadius: '50%', border: '2px dashed #cbd5e1',
                                                lineHeight: '46px', color: '#cbd5e1', fontSize: '1.5rem', textDecoration: 'none'
                                            }}>
                                                +
                                            </Link>
                                            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.5rem' }}>เพิ่มรุ่น</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1.5rem', fontWeight: 700 }}>BTU</td>
                                    {selectedProducts.map(p => (
                                        <td key={p.id} style={{ padding: '1.5rem', textAlign: 'center', fontSize: '1.1rem' }}>
                                            {p.btu.toLocaleString()}
                                        </td>
                                    ))}
                                    <td colSpan={3 - selectedProducts.length}></td>
                                </tr>
                                <tr style={{ borderTop: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.3)' }}>
                                    <td style={{ padding: '1.5rem', fontWeight: 700 }}>SEER (ประหยัดไฟ)</td>
                                    {selectedProducts.map(p => (
                                        <td key={p.id} style={{ padding: '1.5rem', textAlign: 'center', fontSize: '1.1rem', color: '#22c55e', fontWeight: 600 }}>
                                            {p.seer}
                                        </td>
                                    ))}
                                    <td colSpan={3 - selectedProducts.length}></td>
                                </tr>
                                <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1.5rem', fontWeight: 700 }}>ระบบ</td>
                                    {selectedProducts.map(p => (
                                        <td key={p.id} style={{ padding: '1.5rem', textAlign: 'center' }}>
                                            {p.inverter ? 'Inverterแท้' : 'ธรรมดา'}
                                        </td>
                                    ))}
                                    <td colSpan={3 - selectedProducts.length}></td>
                                </tr>
                                <tr style={{ borderTop: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.3)' }}>
                                    <td style={{ padding: '1.5rem', fontWeight: 700, verticalAlign: 'top' }}>คุณสมบัติ</td>
                                    {selectedProducts.map(p => (
                                        <td key={p.id} style={{ padding: '1.5rem', verticalAlign: 'top' }}>
                                            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', textAlign: 'left' }}>
                                                {p.features.map(f => (
                                                    <li key={f} style={{ marginBottom: '0.5rem' }}>• {f}</li>
                                                ))}
                                            </ul>
                                        </td>
                                    ))}
                                    <td colSpan={3 - selectedProducts.length}></td>
                                </tr>
                                <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1.5rem', fontWeight: 700 }}></td>
                                    {selectedProducts.map(p => (
                                        <td key={p.id} style={{ padding: '1.5rem', textAlign: 'center' }}>
                                            <Link href="/booking" className="btn-wow" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                                เลือกติดตั้งรุ่นนี้
                                            </Link>
                                        </td>
                                    ))}
                                    <td colSpan={3 - selectedProducts.length}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
