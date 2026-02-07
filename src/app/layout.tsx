import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import FloatingCompareBar from "@/components/FloatingCompareBar";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
    title: "TH.AIR - ธนรินทร์แอร์ | ขายและติดตั้งแอร์",
    description: "ร้านขายและติดตั้งแอร์ คุณภาพดี ราคาประหยัด บริการครบวงจร",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "TH.AIR",
    },
    formatDetection: {
        telephone: true,
    },
};

export const viewport: Viewport = {
    themeColor: "#2563EB",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="th">
            <head>
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            </head>
            <body suppressHydrationWarning={true}>
                <Providers>
                    {children}
                    <FloatingCompareBar />
                    <ChatWidget />
                </Providers>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js')
                                        .then(function(registration) {
                                            console.log('SW registered: ', registration);
                                        })
                                        .catch(function(error) {
                                            console.log('SW registration failed: ', error);
                                        });
                                });
                            }
                        `,
                    }}
                />
            </body>
        </html>
    );
}
