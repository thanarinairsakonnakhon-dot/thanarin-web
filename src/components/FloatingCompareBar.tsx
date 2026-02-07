"use client";

import { useCompare } from '@/context/CompareContext';
import Link from 'next/link';

export default function FloatingCompareBar() {
    const { selectedProducts, removeFromCompare } = useCompare();

    if (selectedProducts.length === 0) return null;

    return (
        <div className="animate-fade-in" style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(10px)',
            padding: '1rem 2rem',
            borderRadius: '99px',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            width: '90%',
            maxWidth: '600px'
        }}>
            <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                {selectedProducts.map(p => (
                    <div key={p.id} style={{ position: 'relative' }}>
                        <img
                            src={p.image}
                            alt={p.name}
                            style={{ width: '50px', height: '50px', objectFit: 'contain', background: 'white', borderRadius: '8px' }}
                        />
                        <button
                            onClick={() => removeFromCompare(p.id)}
                            style={{
                                position: 'absolute', top: '-5px', right: '-5px',
                                background: '#ef4444', color: 'white',
                                width: '18px', height: '18px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: 'none', cursor: 'pointer', fontSize: '0.7rem'
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
                <div style={{ color: 'white', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                    {selectedProducts.length}/3 รุ่น
                </div>
            </div>

            <Link href="/compare" className="btn-wow" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                เปรียบเทียบเลย ({selectedProducts.length})
            </Link>
        </div>
    );
}
