"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Brand {
    id: string;
    name: string;
    logo_url: string;
    color: string;
    is_active: boolean;
}

interface Series {
    id: string;
    brand_id: string;
    name: string;
    is_active: boolean;
}

interface Model {
    id: string;
    series_id: string;
    model_name: string;
    btu: string;
    price: number;
    is_active: boolean;
}

export default function PriceTablePage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [seriesMap, setSeriesMap] = useState<{ [key: string]: Series[] }>({});
    const [modelsMap, setModelsMap] = useState<{ [key: string]: Model[] }>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);

        // Load brands
        const { data: brandsData } = await supabase
            .from('ac_brands')
            .select('*')
            .eq('is_active', true)
            .order('display_order');

        if (brandsData && brandsData.length > 0) {
            setBrands(brandsData);

            // Load series for all brands
            const seriesObj: { [key: string]: Series[] } = {};
            const modelsObj: { [key: string]: Model[] } = {};

            for (const brand of brandsData) {
                const { data: seriesData } = await supabase
                    .from('ac_series')
                    .select('*')
                    .eq('brand_id', brand.id)
                    .eq('is_active', true)
                    .order('display_order');

                if (seriesData) {
                    seriesObj[brand.id] = seriesData;

                    // Load models for each series
                    for (const series of seriesData) {
                        const { data: modelsData } = await supabase
                            .from('ac_models')
                            .select('*')
                            .eq('series_id', series.id)
                            .eq('is_active', true)
                            .order('display_order');

                        if (modelsData) {
                            modelsObj[series.id] = modelsData;
                        }
                    }
                }
            }

            setSeriesMap(seriesObj);
            setModelsMap(modelsObj);
        }

        setIsLoading(false);
    };

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
                        Price List 2025
                    </span>
                    <h1 style={{
                        fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                        fontWeight: 800,
                        marginTop: "1rem",
                        marginBottom: "1.5rem",
                        background: "linear-gradient(135deg, #0F172A 0%, #334155 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}>
                        ตารางราคาแอร์
                    </h1>
                    <p style={{ maxWidth: "600px", margin: "0 auto", color: "var(--color-text-sub)" }}>
                        ราคาพร้อมติดตั้ง รวมอุปกรณ์มาตรฐาน ท่อทองแดง 4 เมตร
                        <br />
                        <span style={{ color: 'var(--color-primary-blue)', fontWeight: 600 }}>
                            ✅ รับประกันงานติดตั้ง 1 ปีเต็ม
                        </span>
                    </p>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>❄️</div>
                        กำลังโหลดข้อมูล...
                    </div>
                ) : brands.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
                        <p>ยังไม่มีข้อมูลตารางราคา</p>
                        <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>กรุณาติดต่อสอบถามราคาได้</p>
                    </div>
                ) : (
                    /* Price Cards Grid */
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                        gap: "2rem"
                    }}>
                        {brands.map((brand) => (
                            <div
                                key={brand.id}
                                style={{
                                    background: "white",
                                    borderRadius: "20px",
                                    overflow: "hidden",
                                    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                                    transition: "transform 0.3s, box-shadow 0.3s"
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.15)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
                                }}
                            >
                                {/* Brand Header */}
                                <div style={{
                                    background: `linear-gradient(135deg, ${brand.color} 0%, ${brand.color}CC 100%)`,
                                    padding: "1.5rem",
                                    textAlign: "center",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "1rem"
                                }}>
                                    {brand.logo_url ? (
                                        <img
                                            src={brand.logo_url}
                                            alt={brand.name}
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
                                        {brand.name}
                                    </h2>
                                </div>

                                {/* Series Tables */}
                                <div style={{ padding: "1.5rem" }}>
                                    {seriesMap[brand.id]?.map((series, sIdx) => (
                                        <div key={series.id} style={{ marginBottom: sIdx < (seriesMap[brand.id]?.length || 0) - 1 ? "1.5rem" : 0 }}>
                                            {/* Series Title */}
                                            <h3 style={{
                                                fontSize: "1rem",
                                                fontWeight: 700,
                                                color: brand.color,
                                                marginBottom: "0.8rem",
                                                paddingBottom: "0.5rem",
                                                borderBottom: `2px solid ${brand.color}20`
                                            }}>
                                                {series.name}
                                            </h3>

                                            {/* Table */}
                                            {modelsMap[series.id]?.length > 0 ? (
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
                                                        {modelsMap[series.id]?.map((model) => (
                                                            <tr key={model.id} style={{
                                                                borderBottom: "1px solid #f1f5f9"
                                                            }}>
                                                                <td style={{
                                                                    padding: "0.6rem",
                                                                    fontWeight: 500,
                                                                    color: "#1e293b"
                                                                }}>
                                                                    {model.model_name}
                                                                </td>
                                                                <td style={{
                                                                    padding: "0.6rem",
                                                                    textAlign: "center",
                                                                    color: brand.color,
                                                                    fontWeight: 600
                                                                }}>
                                                                    {model.btu}
                                                                </td>
                                                                <td style={{
                                                                    padding: "0.6rem",
                                                                    textAlign: "right",
                                                                    fontWeight: 700,
                                                                    color: "#1e293b"
                                                                }}>
                                                                    ฿{Number(model.price).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div style={{ color: "#94a3b8", fontSize: "0.9rem", padding: "1rem 0" }}>
                                                    ติดต่อสอบถามราคา
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* CTA Button */}
                                    <Link
                                        href="/products"
                                        style={{
                                            display: "block",
                                            width: "100%",
                                            padding: "0.8rem",
                                            background: `linear-gradient(135deg, ${brand.color} 0%, ${brand.color}CC 100%)`,
                                            color: "white",
                                            textAlign: "center",
                                            borderRadius: "10px",
                                            fontWeight: 600,
                                            textDecoration: "none",
                                            marginTop: "1rem",
                                            transition: "opacity 0.3s"
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.opacity = '0.9';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.opacity = '1';
                                        }}
                                    >
                                        ดูสินค้า →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Additional Info */}
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

                {/* CTA */}
                <div style={{ textAlign: "center", marginTop: "3rem" }}>
                    <Link
                        href="/booking"
                        className="btn-wow"
                        style={{
                            padding: "1rem 2.5rem",
                            fontSize: "1.1rem"
                        }}
                    >
                        📞 สนใจติดต่อเลย
                    </Link>
                </div>
            </div>
        </main>
    );
}
