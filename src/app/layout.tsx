import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "مولّد العناوين العقارية — صدى العقار",
  description:
    "أنشئ عنواناً تسويقياً احترافياً لعقارك في ثوانٍ — مجاناً بالكامل. أدخل بيانات عقارك واحصل على عنوان تسويقي يجذب المشترين في أقل من 10 ثوانٍ.",
  keywords: [
    "تسويق عقاري",
    "عناوين عقارية",
    "مولد عناوين",
    "صدى العقار",
    "تسويق عقارات الخليج",
    "عقارات السعودية",
    "عقارات الإمارات",
  ],
  authors: [{ name: "صدى العقار" }],
  openGraph: {
    title: "مولّد العناوين العقارية المجاني — صدى العقار",
    description:
      "أدخل بيانات عقارك واحصل على عنوان تسويقي يجذب المشترين — في أقل من 10 ثوانٍ",
    type: "website",
    locale: "ar_AR",
    siteName: "صدى العقار",
  },
  twitter: {
    card: "summary_large_image",
    title: "مولّد العناوين العقارية المجاني — صدى العقار",
    description:
      "أدخل بيانات عقارك واحصل على عنوان تسويقي يجذب المشترين — في أقل من 10 ثوانٍ",
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
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#f5f6fa] text-[#0f1117] font-[Cairo]">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
