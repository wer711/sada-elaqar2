import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "مولّد العناوين العقارية — صدى العقار",
  description:
    "أنشئ عناوين تسويقية احترافية لعقارك في ثوانٍ — مجاناً بالكامل. أدخل بيانات عقارك واحصل على عناوين مخصصة لكل منصة في أقل من 7 ثوانٍ.",
  keywords: [
    "تسويق عقاري",
    "عناوين عقارية",
    "مولد عناوين",
    "صدى العقار",
    "تسويق عقارات الخليج",
    "عقارات السعودية",
    "عقارات الإمارات",
    "عناوين تسويقية",
    "هاشتاقات عقارية",
  ],
  authors: [{ name: "صدى العقار" }],
  icons: {
    icon: "/favicon-32.png",
    apple: "/logo-icon.png",
  },
  openGraph: {
    title: "مولّد العناوين العقارية المجاني — صدى العقار",
    description:
      "أدخل بيانات عقارك واحصل على عناوين تسويقية احترافية مخصصة لكل منصة — في أقل من 7 ثوانٍ",
    type: "website",
    locale: "ar_AR",
    siteName: "صدى العقار",
    images: ["/logo-icon.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "مولّد العناوين العقارية المجاني — صدى العقار",
    description:
      "أدخل بيانات عقارك واحصل على عناوين تسويقية احترافية مخصصة لكل منصة — في أقل من 7 ثوانٍ",
    images: ["/logo-icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#FBF8F2] text-[#211F1A] font-[Tajawal]">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
