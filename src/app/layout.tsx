import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import FloatingCompareBar from "@/components/FloatingCompareBar";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
    title: "Thanarin Air - Professional Cooling Solutions",
    description: "The best air conditioner shop in town.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="th">
            <body suppressHydrationWarning={true}>
                <Providers>
                    {children}
                    <FloatingCompareBar />
                    <ChatWidget />
                </Providers>
            </body>
        </html>
    );
}
