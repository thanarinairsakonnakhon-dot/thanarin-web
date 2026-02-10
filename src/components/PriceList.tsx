"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Product } from '@/types';

interface BrandGroup {
    brand: string;
    products: Product[];
    color: string;
    logo_url?: string;
}

// Brand colors mapping
const brandColors: { [key: string]: string } = {
    'Mitsubishi': '#E60012',
    'Daikin': '#007DC5',
    'Carrier': '#003087',
    'Haier': '#C41230',
    'Midea': '#00A0E9',
    'AUX': '#FF6600',
    'Samsung': '#1428A0',
    'LG': '#A50034',
    'Panasonic': '#0066CC',
    'Fujitsu': '#E60027',
    'Toshiba': '#FF0000',
    'Sharp': '#FF0000',
    'TCL': '#009CDE',
    'Hisense': '#66BB6A',
    'default': '#0A84FF'
};

interface PriceListProps {
    showConditions?: boolean;
}

export default function PriceList({ showConditions = true }: PriceListProps) {
    const [brandGroups, setBrandGroups] = useState<BrandGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const logoMap: { [key: string]: string } = {};

        // Load products from products table
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .order('brand')
            .order('btu');

        // Load brand logos from ac_brands table
        const { data: acBrands } = await supabase
            .from('ac_brands')
            .select('name, logo_url, color');

        if (acBrands) {
            acBrands.forEach(b => {
                if (b.name) {
                    const normalizedName = b.name.toLowerCase().trim();
                    if (b.logo_url) logoMap[normalizedName] = b.logo_url;
                    if (b.color) brandColors[normalizedName] = b.color;
                }
            });
        }

        if (products && products.length > 0) {
            // Group products by brand
            const grouped: { [key: string]: Product[] } = {};
            products.forEach(product => {
                const brand = product.brand || 'อื่นๆ';
                if (!grouped[brand]) grouped[brand] = [];
                grouped[brand].push(product);
            });

            // Convert to array and sort
            const groups: BrandGroup[] = Object.keys(grouped).map(brand => {
                const normalizedBrand = brand.toLowerCase().trim();
                return {
                    brand,
                    products: grouped[brand],
                    color: brandColors[normalizedBrand] || brandColors[brand] || brandColors['default'],
                    logo_url: logoMap[normalizedBrand]
                };
            });

            // Sort by number of products (most first)
            groups.sort((a, b) => b.products.length - a.products.length);

            setBrandGroups(groups);
        }

        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>❄️</div>
                กำลังโหลดข้อมูล...
            </div>
        );
    }

    if (brandGroups.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
                <p>ยังไม่มีสินค้าในระบบ</p>
            </div>
        );
    }

    return (
        <>
            {/* Price Cards Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "2rem"
            }}>
                {brandGroups.map((group) => (
                    <div
                        key={group.brand}
                        style={{
                            background: "white",
                            borderRadius: "20px",
                            overflow: "hidden",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                            transition: "transform 0.3s, box-shadow 0.3s",
                            border: "1px solid #e2e8f0"
                        }}
                        className="hover-card"
                    >
                        {/* Brand Header */}
                        <div style={{
                            background: `linear-gradient(135deg, ${group.color} 0%, ${group.color}CC 100%)`,
                            padding: "1.5rem",
                            textAlign: "center",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "1rem"
                        }}>
                            {group.logo_url ? (
                                <img
                                    src={group.logo_url}
                                    alt={group.brand}
                                    style={{
                                        height: "40px",
                                        maxWidth: "120px",
                                        objectFit: "contain",
                                        background: "white",
                                        borderRadius: "8px",
                                        padding: "4px"
                                    }}
                                />
                            ) : (
                                <div style={{ fontSize: "2rem" }}>❄️</div>
                            )}
                            <h2 style={{
                                fontSize: "1.3rem",
                                fontWeight: 700,
                                margin: 0,
                                color: "white"
                            }}>
                                {group.brand}
                            </h2>
                        </div>

                        {/* Products Table */}
                        <div style={{ padding: "1.5rem" }}>
                            {/* Group by Inverter/Non-Inverter */}
                            {[true, false].map(isInverter => {
                                const filtered = group.products.filter(p => p.inverter === isInverter);
                                if (filtered.length === 0) return null;

                                return (
                                    <div key={isInverter ? 'inverter' : 'normal'} style={{ marginBottom: "1.5rem" }}>
                                        <h3 style={{
                                            fontSize: "1rem",
                                            fontWeight: 700,
                                            color: group.color,
                                            marginBottom: "0.8rem",
                                            paddingBottom: "0.5rem",
                                            borderBottom: `2px solid ${group.color}20`
                                        }}>
                                            {isInverter ? '⚡ Inverter' : '🔄 ธรรมดา'}
                                        </h3>

                                        <table style={{
                                            width: "100%",
                                            borderCollapse: "collapse",
                                            fontSize: "0.9rem"
                                        }}>
                                            <thead>
                                                <tr style={{
                                                    background: "#f8fafc",
                                                    color: "#64748b",
                                                    fontWeight: 600
                                                }}>
                                                    <td style={{ padding: "0.6rem", textAlign: "left" }}>รุ่น</td>
                                                    <td style={{ padding: "0.6rem", textAlign: "center" }}>BTU</td>
                                                    <td style={{ padding: "0.6rem", textAlign: "right" }}>ราคา</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filtered.map((product) => (
                                                    <tr key={product.id} style={{
                                                        borderBottom: "1px solid #f1f5f9",
                                                        cursor: "pointer",
                                                        transition: 'background 0.2s'
                                                    }}
                                                        className="hover:bg-slate-50"
                                                        onClick={() => window.location.href = `/products/${product.id}`}
                                                    >
                                                        <td style={{
                                                            padding: "0.6rem",
                                                            fontWeight: 500,
                                                            color: "#1e293b"
                                                        }}>
                                                            {product.name}
                                                        </td>
                                                        <td style={{
                                                            padding: "0.6rem",
                                                            textAlign: "center",
                                                            color: group.color,
                                                            fontWeight: 600
                                                        }}>
                                                            {product.btu?.toLocaleString()}
                                                        </td>
                                                        <td style={{
                                                            padding: "0.6rem",
                                                            textAlign: "right",
                                                            fontWeight: 700,
                                                            color: "#1e293b"
                                                        }}>
                                                            ฿{product.price?.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })}

                            {/* CTA Button */}
                            <Link
                                href={`/products?brand=${encodeURIComponent(group.brand)}`}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    padding: "0.8rem",
                                    background: `linear-gradient(135deg, ${group.color} 0%, ${group.color}CC 100%)`,
                                    color: "white",
                                    textAlign: "center",
                                    borderRadius: "10px",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    marginTop: "1rem",
                                    transition: "opacity 0.3s"
                                }}
                                className="hover:opacity-90"
                            >
                                ดูสินค้า {group.brand} ทั้งหมด →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Info (Conditions) */}
            {showConditions && (
                <div style={{
                    marginTop: "4rem",
                    background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                    borderRadius: "20px",
                    padding: "2.5rem",
                    color: "white"
                }}>
                    <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "white" }}>
                        📋 เงื่อนไขราคาพิเศษ
                    </h3>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "1.5rem"
                    }}>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
                            <span style={{ fontSize: "1.5rem" }}>✅</span>
                            <div>
                                <strong>รวมติดตั้งมาตรฐาน</strong>
                                <p style={{ opacity: 0.8, fontSize: "0.9rem", margin: "0.3rem 0 0" }}>
                                    ท่อทองแดง 4 เมตร + สายไฟ + ขาแขวน
                                </p>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
                            <span style={{ fontSize: "1.5rem" }}>🔧</span>
                            <div>
                                <strong>รับประกันงานติดตั้ง 1 ปี</strong>
                                <p style={{ opacity: 0.8, fontSize: "0.9rem", margin: "0.3rem 0 0" }}>
                                    ซ่อมฟรีไม่มีค่าใช้จ่าย
                                </p>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
                            <span style={{ fontSize: "1.5rem" }}>📍</span>
                            <div>
                                <strong>พื้นที่ให้บริการ</strong>
                                <p style={{ opacity: 0.8, fontSize: "0.9rem", margin: "0.3rem 0 0" }}>
                                    สกลนคร และพื้นที่ใกล้เคียง
                                </p>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
                            <span style={{ fontSize: "1.5rem" }}>💳</span>
                            <div>
                                <strong>ผ่อน 0% นานสูงสุด 10 เดือน</strong>
                                <p style={{ opacity: 0.8, fontSize: "0.9rem", margin: "0.3rem 0 0" }}>
                                    บัตรเครดิตที่ร่วมรายการ
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
