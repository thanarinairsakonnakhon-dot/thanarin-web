"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

                {/* Reusable Price List Component */}
                <PriceList showConditions={true} />

                {/* Calculator CTA */}
                <div style={{
                    marginTop: "2rem",
                    background: "linear-gradient(135deg, #0A84FF 0%, #5856d6 100%)",
                    borderRadius: "16px",
                    padding: "2rem",
                    color: "white",
                    textAlign: "center"
                }}>
                    <h3 style={{ marginBottom: "1rem", color: "white" }}>🧮 ไม่แน่ใจว่าต้องใช้แอร์ขนาดไหน?</h3>
                    <p style={{ opacity: 0.9, marginBottom: "1.5rem" }}>ใช้เครื่องมือคำนวณ BTU ฟรี คำนวณจากขนาดห้องให้อัตโนมัติ</p>
                    <Link
                        href="/calculator"
                        className="btn-wow"
                        style={{
                            background: "white",
                            color: "#0A84FF",
                            padding: "0.8rem 2rem"
                        }}
                    >
                        คำนวณ BTU ฟรี →
                    </Link>
                </div>

                {/* Main CTA */}
                <div style={{ textAlign: "center", marginTop: "2rem" }}>
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
            <Footer />
        </main>
    );
}
