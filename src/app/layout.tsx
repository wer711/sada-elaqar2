import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "مرآة العقار — عناوين تسويقية احترافية",
  description:
    "اكتب عناوين تسويقية احترافية لعقارك في ثوانٍ — مجاناً بالكامل. أدخل بيانات عقارك واحصل على عناوين مخصصة لكل منصة في أقل من 7 ثوانٍ.",
  keywords: [
    "تسويق عقاري",
    "عناوين عقارية",
    "مرآة العقار",
    "كاتب عناوين عقارية",
    "عناوين تسويقية",
    "تسويق عقارات الخليج",
    "عقارات السعودية",
    "عقارات الإمارات",
    "هاشتاقات عقارية",
  ],
  authors: [{ name: "مرآة العقار" }],
  icons: {
    icon: "/favicon-32.png",
    apple: "/logo-icon.png",
  },
  openGraph: {
    title: "مرآة العقار — عناوين تسويقية احترافية مجانية",
    description:
      "أدخل بيانات عقارك واحصل على عناوين تسويقية احترافية مخصصة لكل منصة — في أقل من 7 ثوانٍ",
    type: "website",
    locale: "ar_AR",
    siteName: "مرآة العقار",
    images: ["/logo-icon.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "مرآة العقار — عناوين تسويقية احترافية مجانية",
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
