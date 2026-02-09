"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AdminProvider } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();

    // Don't wrap login page with auth check
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <AdminProvider>
            <AuthGuard>
                <AdminLayoutContent>{children}</AdminLayoutContent>
            </AuthGuard>
        </AdminProvider>
    );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (!isLoading && !user && !isRedirecting) {
            setIsRedirecting(true);
            router.replace('/admin/login');
        }
    }, [user, isLoading, router, isRedirecting]);

    // Show loading while checking auth or redirecting
    if (isLoading || isRedirecting || !user) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f1f5f9'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #e2e8f0',
                        borderTopColor: '#2563EB',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }} />
                    <p style={{ color: '#64748b' }}>
                        {isLoading ? 'กำลังตรวจสอบสิทธิ์...' : 'กำลังนำทาง...'}
                    </p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

function AdminLayoutContent({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: '📊' },
        { name: 'จัดการสินค้า', path: '/admin/products', icon: '📦' },
        { name: 'คลังสินค้า', path: '/admin/inventory', icon: '🏭' },
        { name: 'จัดการแบรนด์', path: '/admin/ac-prices', icon: '💰' },
        { name: 'รายการจอง', path: '/admin/bookings', icon: '📅' },
        { name: 'รายการสั่งซื้อ', path: '/admin/orders', icon: '🛍️' },
        { name: 'โปรโมชั่น', path: '/admin/promotions', icon: '🎉' },
        { name: 'รีวิวลูกค้า', path: '/admin/reviews', icon: '⭐' },
        { name: 'แชทลูกค้า', path: '/admin/chat', icon: '💬' },
        { name: 'Hero Slides', path: '/admin/slides', icon: '🖼️' },
        { name: 'ผลงาน', path: '/admin/portfolios', icon: '🏆' },
        { name: 'ตั้งค่าเว็บ', path: '/admin/settings', icon: '⚙️' },
    ];

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 900) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', position: 'relative' }}>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40,
                        display: 'none' // Hidden by default, shown via CSS query if needed, or purely JS
                    }}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}
                style={{
                    width: isSidebarOpen ? '250px' : '80px',
                    background: '#0F172A',
                    color: 'white',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    zIndex: 50,
                    flexShrink: 0
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', overflow: 'hidden' }}>
                    <div style={{
                        minWidth: '40px', width: '40px', height: '40px',
                        background: 'var(--color-primary-blue)',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', fontWeight: 800,
                        flexShrink: 0
                    }}>
                        T
                    </div>
                    <div style={{
                        opacity: isSidebarOpen ? 1 : 0,
                        transition: 'opacity 0.2s',
                        whiteSpace: 'nowrap'
                    }}>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>TH.AIR</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Admin Console</div>
                    </div>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowX: 'hidden' }}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: isActive ? 'white' : '#94a3b8',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                    justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>{item.icon}</span>
                                <span style={{
                                    fontSize: '0.9rem',
                                    opacity: isSidebarOpen ? 1 : 0,
                                    width: isSidebarOpen ? 'auto' : 0,
                                    overflow: 'hidden',
                                    transition: 'all 0.2s'
                                }}>
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #1e293b' }}>
                    <LogoutButton isSidebarOpen={isSidebarOpen} />
                </div>
            </aside>

            {/* Main Content */}
            <main
                className="admin-content"
                style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '1.5rem', // Default desktop padding
                    overflowX: 'hidden'
                }}
            >
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        ☰
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="desktop-only" style={{ textAlign: 'right' }}> {/* Hide name on very small screens */}
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Admin User</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Super Admin</div>
                        </div>
                        <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '50%' }}></div>
                    </div>
                </header>

                <div className="animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}

function LogoutButton({ isSidebarOpen }: { isSidebarOpen: boolean }) {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/admin/login');
    };

    return (
        <button
            onClick={handleLogout}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.8rem',
                color: '#f87171',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                fontSize: '0.9rem'
            }}
        >
            <span style={{ minWidth: '24px', textAlign: 'center' }}>🚪</span>
            {isSidebarOpen && <span>ออกจากระบบ</span>}
        </button>
    );
}
