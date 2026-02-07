import Link from 'next/link';

export default function Navbar() {
    return (
        <header className="fixed w-full top-0 z-50 transition-all duration-300"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
                {/* Logo Area */}
                <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary-blue)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--color-action-orange)' }}>⚡</span> TH.AIR
                </Link>

                {/* Desktop Menu */}
                <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link href="/" style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>หน้าแรก</Link>
                    <Link href="/products" style={{ fontWeight: 500, color: 'var(--color-text-sub)' }}>สินค้า</Link>
                    <Link href="/services" style={{ fontWeight: 500, color: 'var(--color-text-sub)' }}>บริการติดตั้ง</Link>
                    <Link href="/about" style={{ fontWeight: 500, color: 'var(--color-text-sub)' }}>ผลงาน</Link>
                </nav>

                {/* Action Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/booking" className="btn-wow" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
                        จองคิวช่าง
                    </Link>

                </div>
            </div>
        </header>
    );
}
