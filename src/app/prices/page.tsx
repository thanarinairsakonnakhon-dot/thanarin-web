"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

// Brand data with pricing
const brands = [
    {
        name: "Mitsubishi Mr.Slim",
        logo: "🔺",
        color: "#E60012",
        bgGradient: "linear-gradient(135deg, #E60012 0%, #B30000 100%)",
        series: [
            {
                name: "Mitsubishi Mr.Slim",
                models: [
                    { model: "MSY-KY09", btu: "9,212", price: "14,900" },
                    { model: "MSY-KY13", btu: "12,283", price: "15,900" },
                ]
            }
        ]
    },
    {
        name: "Midea",
        logo: "⭕",
        color: "#00A0E9",
        bgGradient: "linear-gradient(135deg, #00A0E9 0%, #0066CC 100%)",
        series: [
            {
                name: "Midea Inverter 2025",
                models: [
                    { model: "Numen 09", btu: "9,360", price: "10,500" },
                    { model: "Numen 12", btu: "12,283", price: "15,900" },
                    { model: "Numen 18", btu: "18,000", price: "18,900" },
                    { model: "Numen 24", btu: "24,566", price: "23,500" },
                ]
            },
            {
                name: "Midea ธรรมดา 2025",
                models: [
                    { model: "Tornado 09", btu: "9,300", price: "10,500" },
                    { model: "Tornado 12", btu: "12,300", price: "11,400" },
                    { model: "Tornado 18", btu: "18,200", price: "18,500" },
                    { model: "Tornado 24", btu: "25,000", price: "22,500" },
                ]
            }
        ]
    },
    {
        name: "Haier",
        logo: "❄️",
        color: "#C41230",
        bgGradient: "linear-gradient(135deg, #C41230 0%, #8B0000 100%)",
        series: [
            {
                name: "Haier Inverter",
                models: [
                    { model: "HSU-09VQAC", btu: "9,200", price: "12,400" },
                    { model: "HSU-12VQAC", btu: "12,300", price: "12,800" },
                    { model: "HSU-18VQAC", btu: "18,000", price: "19,200" },
                    { model: "HSU-24VQAC", btu: "23,200", price: "23,500" },
                ]
            },
            {
                name: "Haier ธรรมดา",
                models: [
                    { model: "HSU-10CQRC", btu: "9,200", price: "12,400" },
                    { model: "HSU-13CQRC", btu: "12,000", price: "13,000" },
                ]
            }
        ]
    },
    {
        name: "Carrier",
        logo: "🌀",
        color: "#003087",
        bgGradient: "linear-gradient(135deg, #003087 0%, #001F5C 100%)",
        series: [
            {
                name: "Carrier Copper 10 Inverter",
                models: [
                    { model: "TVDA10", btu: "9,000", price: "13,400" },
                    { model: "TVDA13", btu: "12,100", price: "13,400" },
                    { model: "TVDA18", btu: "18,000", price: "21,200" },
                    { model: "TVDA28", btu: "25,200", price: "31,200" },
                ]
            },
            {
                name: "Carrier Copper 7 ธรรมดา",
                models: [
                    { model: "TSAA10", btu: "9,200", price: "13,800" },
                    { model: "TSAA13", btu: "12,000", price: "13,900" },
                ]
            }
        ]
    },
    {
        name: "Daikin",
        logo: "🔷",
        color: "#007DC5",
        bgGradient: "linear-gradient(135deg, #007DC5 0%, #005A8C 100%)",
        series: [
            {
                name: "Daikin 2025",
                models: [
                    { model: "FTKB09ZV2S", btu: "9,200", price: "13,900" },
                    { model: "FTKB12ZV2S", btu: "12,300", price: "14,600" },
                    { model: "FTKB18ZV2S", btu: "18,100", price: "21,900" },
                ]
            },
            {
                name: "Daikin 2024",
                models: [
                    { model: "FTKQ15YV2S", btu: "15,000", price: "18,500" },
                ]
            }
        ]
    },
    {
        name: "AUX",
        logo: "🅰️",
        color: "#FF6600",
        bgGradient: "linear-gradient(135deg, #FF6600 0%, #CC5200 100%)",
        series: [
            {
                name: "AUX Inverter 2025",
                models: [
                    { model: "ASW-12/DIMA", btu: "12,000", price: "11,500" },
                ]
            },
            {
                name: "AUX Inverter 2024",
                models: [
                    { model: "ASW-09/DIQE", btu: "9,000", price: "10,500" },
                    { model: "ASW-18/DIQE", btu: "18,000", price: "16,300" },
                    { model: "ASW-24/DIQE", btu: "25,000", price: "20,500" },
                ]
            }
        ]
    }
];

export default function PriceTablePage() {
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

                {/* Price Cards Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                    gap: "2rem"
                }}>
                    {brands.map((brand) => (
                        <div
                            key={brand.name}
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
                                background: brand.bgGradient,
                                padding: "1.5rem",
                                textAlign: "center",
                                color: "white"
                            }}>
                                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                                    {brand.logo}
                                </div>
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
                                {brand.series.map((series, sIdx) => (
                                    <div key={sIdx} style={{ marginBottom: sIdx < brand.series.length - 1 ? "1.5rem" : 0 }}>
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
                                                {series.models.map((model, mIdx) => (
                                                    <tr key={mIdx} style={{
                                                        borderBottom: "1px solid #f1f5f9"
                                                    }}>
                                                        <td style={{
                                                            padding: "0.6rem",
                                                            fontWeight: 500,
                                                            color: "#1e293b"
                                                        }}>
                                                            {model.model}
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
                                                            ฿{model.price}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}

                                {/* CTA Button */}
                                <Link
                                    href="/products"
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        padding: "0.8rem",
                                        background: brand.bgGradient,
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
