"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  Phone,
  Users,
  Clock,
  Globe,
  Star,
  ArrowLeft,
  Zap,
  Shield,
  TrendingUp,
  MessageCircle,
  Building2,
  PartyPopper,
  Lightbulb,
  Twitter,
  Link2,
  Send,
  Target,
  Rocket,
  ThumbsUp,
  Hash,
  Megaphone,
  Frown,
  Eye,
  CheckCircle2,
  PenTool,
  BarChart3,
  Heart,
  ArrowUpRight,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────
interface TitleResult {
  platform: string;
  title: string;
  tip?: string;
  hashtags?: string[];
}

interface FormData {
  propType: string;
  purpose: string;
  city: string;
  area: string;
  space: string;
  rooms: string;
  feature: string;
  price: string;
}

// ─── Tracking Helper ────────────────────────────────────────
const MAIN_CTA_BASE = "https://sada-elaqar.vercel.app";
const TOOL_URL = "https://sada-elaqar26.vercel.app";

function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
  };
}

function trackedUrl(path: string, utmContent: string): string {
  const utm = getUtmParams();
  const url = new URL(path, MAIN_CTA_BASE);
  url.searchParams.set("utm_source", utm.utm_source || "title-tool");
  url.searchParams.set("utm_medium", utm.utm_medium || "free-tool");
  url.searchParams.set("utm_campaign", utm.utm_campaign || "landing");
  url.searchParams.set("utm_content", utmContent);
  return url.toString();
}

function trackEvent(event: string, data?: Record<string, string>) {
  const utm = getUtmParams();
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, ...utm, ...data, timestamp: new Date().toISOString() }),
  }).catch(() => {});
}

// ─── Constants ─────────────────────────────────────────────
const INITIAL_FORM: FormData = {
  propType: "",
  purpose: "",
  city: "",
  area: "",
  space: "",
  rooms: "",
  feature: "",
  price: "",
};

const PLATFORM_COLORS: Record<string, string> = {
  واتساب: "#25D366",
  إنستغرام: "#E1306C",
  "تويتر / X": "#000000",
  فيسبوك: "#1877F2",
  "سناب شات": "#FFFC00",
  لينكدإن: "#0A66C2",
};

const PLATFORM_TEXT_DARK: Record<string, boolean> = {
  "سناب شات": true,
};

// ─── Pain Points ────────────────────────────────────────────
const PAIN_POINTS = [
  {
    icon: "😔",
    title: "إعلانك يموت بلا تفاعل",
    desc: "تكتب وصفاً طويلاً — وصفر تعليق. عقارك يضيع بين آلاف الإعلانات المتشابهة.",
  },
  {
    icon: "⏰",
    title: "ساعات على وصف واحد",
    desc: "45 دقيقة لوصف عقار — وتعيد كتابته 6 مرات لكل منصة. 3-4 ساعات يومياً على الكتابة فقط.",
  },
  {
    icon: "💸",
    title: "وكالات بلا ضمان",
    desc: "$500+ شهرياً لوكالة تسويق — والنتيجة محتوى عام لا يعكس قيمة عقارك.",
  },
  {
    icon: "📉",
    title: "هاشتاقات عشوائية",
    desc: "لا تعرف أي هاشتاقات تجلب المشترين — فتضيع فرص الوصول للجمهور المناسب.",
  },
];

const HOW_IT_WORKS = [
  { step: "١", title: "أدخل بيانات العقار", desc: "نوع العقار، المدينة، الميزات، والسعر", icon: <PenTool className="w-7 h-7" /> },
  { step: "٢", title: "الذكاء يصيغ لك", desc: "عناوين احترافية مخصصة لكل منصة في 7 ثوانٍ", icon: <Sparkles className="w-7 h-7" /> },
  { step: "٣", title: "انسخ وانشر", desc: "عناوين + هاشتاقات + نصائح نشر جاهزة", icon: <Rocket className="w-7 h-7" /> },
];

const BEFORE_AFTER = [
  { label: "كتابة وصف عقار", before: "45 دقيقة", after: "7 ثوانٍ" },
  { label: "تكييف لكل منصة", before: "إعادة كتابة 6 مرات", after: "تلقائي" },
  { label: "اختيار هاشتاقات", before: "بحث يدوي", after: "ذكي ومدروس" },
  { label: "التكلفة الشهرية", before: "$500+ وكالة", after: "مجاناً" },
];

const TESTIMONIALS = [
  {
    name: "أحمد الرشيدي",
    role: "وكيل عقاري · الرياض",
    text: "كنت أقضي ساعة على وصف كل عقار، الآن أنشر لـ٥ عقارات في نفس الوقت بجودة أفضل.",
    avatar: "👨‍💼",
  },
  {
    name: "نورة الشامسي",
    role: "مستثمرة عقارية · دبي",
    text: "المحتوى يطلع بلهجة الإمارات وبأسلوب يستهدف المستثمر تحديداً. الواتساب صار يرنّ أكثر!",
    avatar: "👩‍💼",
  },
  {
    name: "خالد العتيبي",
    role: "مسؤول تسويق · الدوحة",
    text: "كل منصة مظبوطة لها — تويتر قصير، لينكدين رسمي، واتساب تفصيلي. أداة لا أستغني عنها.",
    avatar: "👨‍💻",
  },
];

// ─── Cities ────────────────────────────────────────────────
const CITIES: Record<string, string[]> = {
  "🇸🇦 السعودية": ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الطائف", "تبوك", "أبها", "نجران"],
  "🇦🇪 الإمارات": ["دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة", "العين", "الفجيرة"],
  "🇶🇦 قطر": ["الدوحة", "الوكرة", "الخور"],
  "🇰🇼 الكويت": ["الكويت العاصمة", "حولي", "الأحمدي", "الفروانية"],
  "🇧🇭 البحرين": ["المنامة", "المحرق", "الرفاع"],
  "🇴🇲 عُمان": ["مسقط", "صلالة", "صحار", "نزوى"],
  "🇪🇬 مصر": ["القاهرة", "الإسكندرية", "الجيزة", "المنصورة", "أسيوط", "الأقصر"],
  "🇯🇴 الأردن": ["عمّان", "إربد", "العقبة", "الزرقاء"],
  "🇮🇶 العراق": ["بغداد", "أربيل", "البصرة", "النجف", "كربلاء", "السليمانية"],
  "🇱🇧 لبنان": ["بيروت", "طرابلس", "صيدا", "جونيه"],
  "🇱🇾 ليبيا": ["طرابلس", "بنغازي", "مصراتة"],
  "🇹🇳 تونس": ["تونس العاصمة", "صفاقس", "سوسة"],
  "🇩🇿 الجزائر": ["الجزائر العاصمة", "وهران", "قسنطينة", "عنابة", "باتنة", "سطيف", "تلمسان", "البليدة"],
  "🇲🇦 المغرب": ["الدار البيضاء", "الرباط", "مراكش", "فاس", "طنجة", "أغادير", "مكناس"],
  "🇸🇩 السودان": ["الخرطوم", "أم درمان", "بورتسودان"],
  "🇾🇪 اليمن": ["صنعاء", "عدن", "تعز"],
  "🇵🇸 فلسطين": ["رام الله", "غزة", "نابلس", "الخليل"],
  "🇹🇷 تركيا": ["إسطنبول", "أنقرة", "أنطاليا", "بورصة"],
};

const PROP_TYPES = {
  سكني: ["شقة", "فيلا", "استوديو", "بنتهاوس", "دوبلكس", "شاليه", "عمارة سكنية"],
  تجاري: ["محل تجاري", "مكتب تجاري", "مستودع", "مصنع"],
  أراضي: ["أرض سكنية", "أرض تجارية", "أرض زراعية", "أرض صناعية"],
};

const FEATURES = [
  "إطلالة بحرية", "إطلالة على الحديقة", "موقع مميز", "تشطيب فاخر",
  "قريب من المسجد", "قريب من المدارس", "مسبح خاص", "فرصة استثمارية",
  "تسليم فوري", "نظام ذكي", "حديقة خاصة", "موقف سيارات",
  "أمن وحراسة 24 ساعة", "قريب من المترو",
];

// ─── Hooks ─────────────────────────────────────────────────
function useUserCounter() {
  const [count, setCount] = useState(2847);
  const mountedRef = useRef(false);
  const increment = useCallback(
    () => setCount((prev) => prev + 1 + Math.floor(Math.random() * 2)),
    []
  );
  useEffect(() => {
    mountedRef.current = true;
    const delay = 8000 + Math.floor(Math.random() * 12000);
    const interval = setInterval(increment, delay);
    return () => clearInterval(interval);
  }, [increment]);
  return count;
}

function useCountdown() {
  const STORAGE_KEY = "sada_countdown_end";
  const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
  const INITIAL = { days: 10, hours: 0, minutes: 0, seconds: 0 };

  const calcRemaining = useCallback((target: number) => {
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  }, []);

  const [timeLeft, setTimeLeft] = useState(INITIAL);
  const targetRef = useRef<number | null>(null);

  useEffect(() => {
    let target: number;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const end = parseInt(stored, 10);
      if (end > Date.now()) {
        target = end;
      } else {
        target = Date.now() + TEN_DAYS_MS;
        localStorage.setItem(STORAGE_KEY, String(target));
      }
    } else {
      target = Date.now() + TEN_DAYS_MS;
      localStorage.setItem(STORAGE_KEY, String(target));
    }
    targetRef.current = target;

    const raf = requestAnimationFrame(() => {
      setTimeLeft(calcRemaining(target));
    });

    const timer = setInterval(() => {
      if (targetRef.current) {
        setTimeLeft(calcRemaining(targetRef.current));
      }
    }, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
    };
  }, [calcRemaining]);

  return timeLeft;
}

// ─── Share Helpers ─────────────────────────────────────────
function shareOnWhatsApp(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

function shareOnTwitter(text: string) {
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ─── Main Page ─────────────────────────────────────────────
export default function SadaLandingPage() {
  const [formStep, setFormStep] = useState<"form" | "loading" | "results">("form");
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [titles, setTitles] = useState<TitleResult[]>([]);
  const [generalTips, setGeneralTips] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedHashtags, setCopiedHashtags] = useState<number | null>(null);
  const [toolLinkCopied, setToolLinkCopied] = useState(false);
  const [busyMessage, setBusyMessage] = useState("");

  const userCount = useUserCounter();
  const countdown = useCountdown();

  useEffect(() => {
    trackEvent("page_view");
  }, []);

  const handleFormChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setError("");
    },
    []
  );

  const validateForm = (): boolean => {
    if (!formData.propType || !formData.purpose || !formData.city) {
      setError("يرجى اختيار نوع العقار والغرض والمدينة على الأقل");
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;
    setFormStep("loading");
    setError("");
    setBusyMessage("");
    trackEvent("generate_attempt", { propType: formData.propType, city: formData.city });

    try {
      const utm = getUtmParams();
      const res = await fetch("/api/generate-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, ...utm }),
      });

      const data = await res.json();

      if (data.message && (!data.titles || data.titles.length === 0)) {
        setBusyMessage(data.message);
        setFormStep("form");
        trackEvent("busy_message_shown", { city: formData.city });
        return;
      }

      if (!res.ok && data.error) {
        throw new Error(data.error || "حدث خطأ");
      }

      setTitles(data.titles || []);
      setGeneralTips(data.generalTips || []);
      setFormStep("results");
      trackEvent("generate_success", { propType: formData.propType, city: formData.city });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء التوليد";
      setError(message);
      setFormStep("form");
    }
  };

  const handleCopy = async (text: string, idx: number) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2200);
      trackEvent("copy_title", { platform: titles[idx]?.platform || "" });
    }
  };

  const handleCopyHashtags = async (hashtags: string[], idx: number) => {
    const text = hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ');
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedHashtags(idx);
      setTimeout(() => setCopiedHashtags(null), 2200);
      trackEvent("copy_hashtags", { platform: titles[idx]?.platform || "" });
    }
  };

  const handleShareTitle = (platform: string, title: string, hashtags: string[] = []) => {
    const fullText = hashtags.length > 0
      ? `${title}\n\n${hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}`
      : title;
    if (platform === "واتساب") shareOnWhatsApp(fullText);
    else if (platform === "تويتر / X") shareOnTwitter(fullText);
    else copyToClipboard(fullText);
    trackEvent("share_title", { platform });
  };

  const handleShareTool = (method: string) => {
    const toolShareText = `🏠 جرّبت أداة مجانية تكتب عناوين تسويقية احترافية لأي عقار في 7 ثوانٍ!\n\n✅ 6 منصات مختلفة\n✅ نصائح نشر مجانية\n✅ هاشتاقات ذكية\n\nجرّبها مجاناً 👇\n${TOOL_URL}`;
    if (method === "whatsapp") shareOnWhatsApp(toolShareText);
    else if (method === "twitter") shareOnTwitter(`🏠 أداة مجانية تكتب عناوين تسويقية احترافية لأي عقار في 7 ثوانٍ! جرّبها 👇\n${TOOL_URL}`);
    else if (method === "copy") {
      copyToClipboard(toolShareText).then((ok) => {
        if (ok) { setToolLinkCopied(true); setTimeout(() => setToolLinkCopied(false), 2500); }
      });
    }
    trackEvent("share_tool", { method });
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setTitles([]);
    setGeneralTips([]);
    setFormStep("form");
    setError("");
    setBusyMessage("");
  };

  const countryCount = Object.keys(CITIES).length;
  const totalCities = Object.values(CITIES).reduce((a, b) => a + b.length, 0);

  // ─── Shared input class ───
  const inputCls = "w-full text-sm bg-white border border-[#E8E1D2] rounded-xl py-3 px-3.5 appearance-none focus:border-[#0D7C66] focus:shadow-[0_0_0_3px_rgba(13,124,102,0.15)] focus:bg-white transition-all font-[Tajawal] outline-none";
  const selectCls = inputCls + " cursor-pointer";

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" dir="rtl">

      {/* ════════════════ NAVIGATION ════════════════ */}
      <nav className="fixed top-0 right-0 left-0 z-50 bg-[#FBF8F2]/90 backdrop-blur-md border-b border-[#E8E1D2]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <a
            href={trackedUrl("/", "header-logo")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 no-underline"
            onClick={() => trackEvent("click_header_logo")}
          >
            <div className="w-9 h-9 bg-[#0D7C66] rounded-lg flex items-center justify-center flex-shrink-0">
              <Home className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="text-[#211F1A] font-bold text-base leading-tight">صدى العقار</div>
              <div className="text-[#5B564C] text-[11px]">مساعد التسويق العقاري</div>
            </div>
          </a>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-[#5B564C] text-xs">
              <Users className="w-3.5 h-3.5 text-[#0D7C66]" />
              <span>{userCount.toLocaleString("ar-SA")} مستخدم</span>
            </div>
            <a
              href={trackedUrl("/", "header-cta")}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0D7C66] hover:bg-[#0a6b58] text-white font-bold text-sm px-5 py-2.5 rounded-full no-underline transition-colors whitespace-nowrap flex items-center gap-1.5 min-h-[40px]"
              onClick={() => trackEvent("click_header_cta")}
            >
              جرّب النسخة الكاملة
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </nav>

      {/* ════════════════ HERO ════════════════ */}
      <section className="bg-[#FBF8F2] pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] left-1/4 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-[#0D7C66]/[0.04] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-60px] right-1/4 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-[#D4A853]/[0.05] rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Badge */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-[#0D7C66]/10 rounded-full px-5 py-2 text-sm font-medium text-[#0D7C66] mb-6">
              <Zap className="w-4 h-4" />
              <span>مساعد التسويق العقاري للسوق العربي</span>
              <span className="text-[#5B564C]">•</span>
              <span>مجاناً بالكامل</span>
            </div>

            {/* Countdown */}
            <div className="flex items-center justify-center gap-1.5 mb-6">
              <span className="text-[#5B564C] text-xs">العرض ينتهي خلال</span>
              <div className="flex gap-1 items-center">
                <span className="bg-[#0D7C66] text-white px-2 py-0.5 rounded text-[11px] font-black">{countdown.days}</span>
                <span className="text-[#5B564C] text-[10px]">يوم</span>
                <span className="text-[#E8E1D2]">:</span>
                <span className="bg-[#0D7C66] text-white px-1.5 py-0.5 rounded text-[11px] font-black">{String(countdown.hours).padStart(2, "0")}</span>
                <span className="text-[#E8E1D2]">:</span>
                <span className="bg-[#0D7C66] text-white px-1.5 py-0.5 rounded text-[11px] font-black">{String(countdown.minutes).padStart(2, "0")}</span>
                <span className="text-[#E8E1D2]">:</span>
                <span className="bg-[#0D7C66] text-white px-1.5 py-0.5 rounded text-[11px] font-black">{String(countdown.seconds).padStart(2, "0")}</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[3.2rem] font-extrabold leading-tight text-[#211F1A] max-w-3xl mx-auto mb-5">
              عقارك يستاهل أفضل من
              <br />
              <span className="bg-gradient-to-l from-[#0D7C66] to-[#D4A853] bg-clip-text text-transparent">إعلان مكتوب على السريع</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg leading-relaxed text-[#5B564C] max-w-xl mx-auto mb-8">
              أدخل بيانات عقارك واحصل على <span className="text-[#0D7C66] font-bold">عناوين تسويقية احترافية</span> مخصصة لكل منصة — مع هاشتاقات ونصائح نشر — في 7 ثوانٍ فقط
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
              <a
                href="#demo"
                className="bg-[#0D7C66] hover:bg-[#0a6b58] text-white font-bold text-base px-8 py-3 rounded-full no-underline transition-colors flex items-center gap-2 min-h-[48px] shadow-sm"
                onClick={() => trackEvent("click_hero_cta")}
              >
                <Sparkles className="w-5 h-5" />
                جرّب الآن مجاناً
              </a>
              <a
                href={trackedUrl("/", "hero-secondary")}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#E8E1D2] hover:border-[#0D7C66] hover:text-[#0D7C66] text-[#211F1A] font-bold text-base px-8 py-3 rounded-full no-underline transition-colors flex items-center gap-2 min-h-[48px]"
                onClick={() => trackEvent("click_hero_secondary")}
              >
                جرّب النسخة الكاملة
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {[
                { icon: <CheckCircle2 className="w-4 h-4 text-[#0D7C66]" />, text: "بدون تسجيل" },
                { icon: <Clock className="w-4 h-4 text-[#0D7C66]" />, text: "7 ثوانٍ للنتيجة" },
                { icon: <Globe className="w-4 h-4 text-[#0D7C66]" />, text: `${countryCount} دولة عربية` },
                { icon: <Shield className="w-4 h-4 text-[#0D7C66]" />, text: "مجاني بالكامل" },
              ].map((item, idx) => (
                <span key={idx} className="flex items-center gap-1.5 text-sm font-medium text-[#5B564C]">
                  {item.icon} {item.text}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ PAIN POINTS ════════════════ */}
      <section className="bg-gradient-to-b from-[#FBF8F2] via-[#F5F0E8] to-[#FBF8F2] py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <span className="text-sm font-bold tracking-wide text-[#D4A853]">المشكلة</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#211F1A] mt-2 mb-3">
              هل يبدو لك هذا مألوفاً؟
            </h2>
            <p className="text-[#5B564C] text-sm">أغلب وكلاء العقارات يعانون من نفس الشيء</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {PAIN_POINTS.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group rounded-2xl border border-[#E8E1D2] bg-white p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="h-1 absolute top-0 right-0 left-0 rounded-t-2xl bg-gradient-to-l from-[#0D7C66] to-[#D4A853] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="h-12 w-12 rounded-xl bg-[#FBF8F2] text-2xl flex items-center justify-center mb-4 group-hover:bg-[#0D7C66]/10 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-[#211F1A] mb-2">{item.title}</h3>
                <p className="text-sm text-[#5B564C] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Solution Bridge */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-[#0D7C66] text-white rounded-full px-5 py-2.5 text-sm font-bold">
              <Lightbulb className="w-4 h-4" />
              ماذا لو كان بإمكانك حل كل هذا في 7 ثوانٍ؟
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="bg-[#FBF8F2] py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <span className="text-sm font-bold tracking-wide text-[#D4A853]">كيف يعمل</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#211F1A] mt-2">
              3 خطوات فقط
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {HOW_IT_WORKS.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative rounded-2xl border border-[#E8E1D2] bg-white p-8 shadow-sm text-center"
              >
                <div className="absolute -top-4 right-6 text-[5rem] font-black leading-none text-[#E8E1D2]/50 pointer-events-none">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="h-14 w-14 rounded-xl bg-[#0D7C66]/10 text-[#0D7C66] flex items-center justify-center mx-auto mb-4 text-3xl">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#211F1A] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#5B564C]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ INTERACTIVE DEMO TOOL ════════════════ */}
      <section className="bg-gradient-to-b from-[#FBF8F2] via-[#F5F0E8] to-[#FBF8F2] py-16 md:py-20 px-4 sm:px-6" id="demo">
        <div className="max-w-[760px] w-full mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-8">
            <span className="text-sm font-bold tracking-wide text-[#D4A853]">جرّب بنفسك</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#211F1A] mt-2 mb-3">
              شاهد النتيجة <span className="bg-gradient-to-l from-[#0D7C66] to-[#D4A853] bg-clip-text text-transparent">بعينيك</span>
            </h2>
            <p className="text-[#5B564C] text-sm">أدخل بيانات أي عقار واحصل على عناوين تسويقية احترافية لمنصات مختلفة</p>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-[#E8E1D2] bg-white shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Card Header */}
            <div className="bg-[#FBF8F2] border-b border-[#E8E1D2] px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0D7C66] rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#211F1A]">مولّد العناوين العقارية</h3>
                <p className="text-[11px] text-[#5B564C]">بيانات العقار → عناوين احترافية + نصائح نشر + هاشتاقات</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#0D7C66] bg-[#0D7C66]/10 px-2.5 py-1 rounded-full font-semibold">
                <Zap className="w-3 h-3" />
                مجاني
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* ── FORM ── */}
              {formStep === "form" && (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#211F1A]">نوع العقار <span className="text-[#DC3545]">*</span></label>
                      <div className="relative">
                        <select value={formData.propType} onChange={(e) => handleFormChange("propType", e.target.value)} className={selectCls}>
                          <option value="">— اختر —</option>
                          {Object.entries(PROP_TYPES).map(([group, types]) => (
                            <optgroup key={group} label={group}>
                              {types.map((t) => <option key={t} value={t}>{t}</option>)}
                            </optgroup>
                          ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B564C] pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#211F1A]">الغرض <span className="text-[#DC3545]">*</span></label>
                      <div className="relative">
                        <select value={formData.purpose} onChange={(e) => handleFormChange("purpose", e.target.value)} className={selectCls}>
                          <option value="">— اختر —</option>
                          <option value="للبيع">للبيع</option>
                          <option value="للإيجار">للإيجار</option>
                          <option value="للاستثمار">للاستثمار</option>
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B564C] pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#211F1A]">المدينة <span className="text-[#DC3545]">*</span></label>
                      <div className="relative">
                        <select value={formData.city} onChange={(e) => handleFormChange("city", e.target.value)} className={selectCls}>
                          <option value="">— اختر —</option>
                          {Object.entries(CITIES).map(([country, cities]) => (
                            <optgroup key={country} label={country}>
                              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                            </optgroup>
                          ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B564C] pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#211F1A]">الحي / المنطقة</label>
                      <input type="text" value={formData.area} onChange={(e) => handleFormChange("area", e.target.value)} placeholder="مثال: حي النرجس" className={inputCls} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 my-5 text-[#5B564C] text-xs font-semibold">
                    <span className="flex-1 h-px bg-[#E8E1D2]" />
                    تفاصيل إضافية (اختياري)
                    <span className="flex-1 h-px bg-[#E8E1D2]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#211F1A]">المساحة (م²)</label>
                      <input type="text" value={formData.space} onChange={(e) => handleFormChange("space", e.target.value)} placeholder="مثال: 150" className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#211F1A]">عدد الغرف</label>
                      <div className="relative">
                        <select value={formData.rooms} onChange={(e) => handleFormChange("rooms", e.target.value)} className={selectCls}>
                          <option value="">—</option>
                          <option>استوديو</option><option>غرفة واحدة</option><option>غرفتان</option>
                          <option>3 غرف</option><option>4 غرف</option><option>5 غرف وأكثر</option>
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B564C] pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#211F1A]">ميزة بارزة</label>
                      <div className="relative">
                        <select value={formData.feature} onChange={(e) => handleFormChange("feature", e.target.value)} className={selectCls}>
                          <option value="">— اختر إن وجد —</option>
                          {FEATURES.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B564C] pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[#211F1A]">السعر</label>
                      <input type="text" value={formData.price} onChange={(e) => handleFormChange("price", e.target.value)} placeholder="مثال: 850,000 ريال" className={inputCls} />
                    </div>
                  </div>

                  {busyMessage && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-4 rounded-xl px-4 py-3 text-sm text-center bg-[#0D7C66]/10 border border-[#0D7C66]/20 text-[#0D7C66]">
                      <span className="flex items-center justify-center gap-2"><Clock className="w-4 h-4" />{busyMessage}</span>
                    </motion.div>
                  )}
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-4 rounded-xl px-4 py-3 text-sm text-center bg-red-50 border border-red-200 text-red-700">
                      ⚠️ {error}
                    </motion.div>
                  )}

                  <button
                    onClick={handleGenerate}
                    className="w-full mt-6 bg-[#0D7C66] hover:bg-[#0a6b58] text-white font-bold text-base py-3.5 rounded-full cursor-pointer flex items-center justify-center gap-2.5 transition-all hover:shadow-lg active:translate-y-0 shadow-sm min-h-[48px]"
                  >
                    <Zap className="w-5 h-5" />
                    أنشئ العناوين التسويقية الآن
                  </button>
                </motion.div>
              )}

              {/* ── LOADING ── */}
              {formStep === "loading" && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-16 px-5 gap-4">
                  <div className="w-12 h-12 border-[3px] border-[#E8E1D2] border-t-[#0D7C66] rounded-full animate-spin" />
                  <div className="text-[#211F1A] font-bold text-sm">صدى العقار يصيغ لك عناوين احترافية...</div>
                  <div className="text-[#5B564C] text-xs">يحلّل بيانات العقار ويختار أفضل الأساليب لكل منصة</div>
                  <div className="flex items-center gap-2 text-[10px] text-[#0D7C66] mt-2">
                    <Target className="w-3.5 h-3.5" />
                    <span>يستخدم تقنيات نفسية مثبتة لجذب المشترين</span>
                  </div>
                </motion.div>
              )}

              {/* ── RESULTS ── */}
              {formStep === "results" && (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5 sm:p-6">
                  {/* Success header */}
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 bg-[#0D7C66] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-[#0D7C66]">تم توليد العناوين بنجاح!</span>
                    <span className="flex-1 h-px bg-[#E8E1D2]" />
                  </div>

                  {/* Title cards */}
                  <div className="flex flex-col gap-3">
                    {titles.map((item, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
                        className={`group rounded-xl border bg-[#FBF8F2] p-4 transition-all ${
                          copiedIdx === idx ? "border-[#0D7C66] shadow-[0_0_0_3px_rgba(13,124,102,0.15)]" : "border-[#E8E1D2] hover:border-[#0D7C66]/30"
                        }`}>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="inline-block text-[10px] font-bold rounded-md px-2.5 py-1"
                            style={{ background: PLATFORM_COLORS[item.platform] || "#333", color: PLATFORM_TEXT_DARK[item.platform] ? "#333" : "#fff" }}>
                            {item.platform}
                          </span>
                          <button onClick={() => handleCopy(item.title, idx)} className="flex items-center gap-1 text-[10px] cursor-pointer bg-transparent border-none">
                            {copiedIdx === idx ? (
                              <span className="text-[#0D7C66] font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> تم النسخ</span>
                            ) : (
                              <span className="text-[#5B564C] flex items-center gap-1 hover:text-[#0D7C66] transition-colors"><Copy className="w-3.5 h-3.5" /> انقر للنسخ</span>
                            )}
                          </button>
                        </div>
                        <div className="text-sm font-bold text-[#211F1A] leading-relaxed mb-2">{item.title}</div>
                        {item.hashtags && item.hashtags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap mb-2">
                            <Hash className="w-3 h-3 text-[#D4A853] flex-shrink-0" />
                            {item.hashtags.map((tag, tIdx) => (
                              <span key={tIdx} className="text-[10px] text-[#D4A853] bg-[#D4A853]/10 px-2 py-0.5 rounded-full font-semibold">
                                {tag.startsWith('#') ? tag : `#${tag}`}
                              </span>
                            ))}
                            <button onClick={() => handleCopyHashtags(item.hashtags || [], idx)}
                              className="text-[9px] text-[#5B564C] hover:text-[#0D7C66] cursor-pointer bg-transparent border-none transition-colors mr-1">
                              {copiedHashtags === idx ? <span className="text-[#0D7C66]">✓</span> : <Copy className="w-2.5 h-2.5" />}
                            </button>
                          </div>
                        )}
                        {item.tip && (
                          <div className="flex items-start gap-2 bg-[#0D7C66]/5 rounded-lg px-3 py-2 mt-1">
                            <Lightbulb className="w-3.5 h-3.5 text-[#0D7C66] mt-0.5 flex-shrink-0" />
                            <span className="text-[11px] text-[#0D7C66] leading-relaxed">{item.tip}</span>
                          </div>
                        )}
                        {/* Share buttons */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E8E1D2]/60">
                          <span className="text-[10px] text-[#5B564C] ml-1">مشاركة:</span>
                          <button onClick={() => handleShareTitle("واتساب", item.title, item.hashtags)}
                            className="flex items-center gap-1 bg-[#25D366] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity border-none">
                            <Send className="w-3 h-3" /> واتساب
                          </button>
                          {(item.platform === "تويتر / X" || item.platform === "إنستغرام") && (
                            <button onClick={() => handleShareTitle("تويتر / X", item.title, item.hashtags)}
                              className="flex items-center gap-1 bg-[#1DA1F2] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity border-none">
                              <Twitter className="w-3 h-3" /> تويتر
                            </button>
                          )}
                          <button onClick={() => {
                            const fullText = item.hashtags?.length ? `${item.title}\n${item.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}` : item.title;
                            copyToClipboard(fullText).then(() => { setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 2000); });
                          }}
                            className="flex items-center gap-1 bg-white border border-[#E8E1D2] text-[#211F1A] text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:border-[#0D7C66] transition-colors">
                            <Link2 className="w-3 h-3" /> نسخ الكل
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* General Marketing Tips */}
                  {generalTips.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                      className="mt-5 bg-[#FBF8F2] border border-[#E8E1D2] rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Megaphone className="w-5 h-5 text-[#D4A853]" />
                        <h4 className="text-sm font-bold text-[#211F1A]">نصائح تسويقية مجانية</h4>
                      </div>
                      <div className="flex flex-col gap-2">
                        {generalTips.map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <ThumbsUp className="w-3.5 h-3.5 text-[#0D7C66] mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-[#5B564C] leading-relaxed">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Share the tool */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="mt-5 bg-gradient-to-br from-[#0D7C66] to-[#0a6b58] rounded-2xl p-6 text-center relative overflow-hidden shadow-xl">
                    <div className="absolute top-[-20px] right-[-20px] w-[80px] h-[80px] bg-[rgba(212,168,83,0.15)] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Rocket className="w-5 h-5 text-[#D4A853]" />
                        <h4 className="text-white text-sm font-extrabold">ساعد زملاءك — شارك الأداة!</h4>
                      </div>
                      <p className="text-white/50 text-[11px] leading-relaxed mb-4 max-w-sm mx-auto">
                        أغلب وكلاء العقارات لا يعرفون عن هذه الأداة بعد. شاركها وساعدهم يوفّرون وقتهم
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button onClick={() => handleShareTool("whatsapp")}
                          className="flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-5 py-2.5 rounded-full cursor-pointer hover:opacity-90 transition-opacity border-none min-h-[40px]">
                          <MessageCircle className="w-4 h-4" /> واتساب
                        </button>
                        <button onClick={() => handleShareTool("twitter")}
                          className="flex items-center gap-1.5 bg-[#1DA1F2] text-white text-xs font-bold px-5 py-2.5 rounded-full cursor-pointer hover:opacity-90 transition-opacity border-none min-h-[40px]">
                          <Twitter className="w-4 h-4" /> تويتر
                        </button>
                        <button onClick={() => handleShareTool("copy")}
                          className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-bold px-5 py-2.5 rounded-full cursor-pointer hover:bg-white/20 transition-all border border-white/20 min-h-[40px]">
                          {toolLinkCopied ? (<><Check className="w-4 h-4 text-[#D4A853]" /><span className="text-[#D4A853]">تم النسخ!</span></>)
                            : (<><Link2 className="w-4 h-4" /> نسخ الرابط</>)}
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Upsell */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                    className="mt-5 bg-gradient-to-br from-[#0D7C66] to-[#0a6b58] rounded-2xl p-6 text-center relative overflow-hidden shadow-xl">
                    <div className="absolute top-[-30px] right-[-30px] w-[120px] h-[120px] bg-[rgba(212,168,83,0.15)] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <PartyPopper className="w-5 h-5 text-[#D4A853]" />
                        <h3 className="text-white text-base font-extrabold">أعجبتك النتيجة؟ النسخة الكاملة تعطيك أكثر بكثير</h3>
                      </div>
                      <p className="text-white/50 text-sm leading-relaxed mb-4 max-w-sm mx-auto">
                        وصف عقاري كامل · هاشتاقات احترافية · محتوى لكل منصة · تصاميم جاهزة · نشر فوري
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 mb-5">
                        {["📝 وصف تسويقي كامل", "# هاشتاقات ذكية", "📱 6 منصات", "🎨 تصاميم جاهزة", "💬 واتساب جاهز", "📊 تحليلات"].map((feat) => (
                          <span key={feat} className="bg-[rgba(212,168,83,0.12)] border border-[rgba(212,168,83,0.3)] text-[#D4A853] text-xs font-semibold px-3 py-1.5 rounded-full">
                            {feat}
                          </span>
                        ))}
                      </div>
                      <a href={trackedUrl("/", "upsell-banner")} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#D4A853] hover:bg-[#c4974a] text-white font-bold text-sm px-7 py-3 rounded-full no-underline transition-colors shadow-lg"
                        onClick={() => trackEvent("click_upsell_banner", { city: formData.city })}>
                        جرّب النسخة الكاملة مجاناً <ArrowLeft className="w-4 h-4" />
                      </a>
                    </div>
                  </motion.div>

                  <button onClick={handleReset}
                    className="w-full mt-4 border border-[#E8E1D2] text-[#211F1A] font-bold text-sm py-3 rounded-full cursor-pointer hover:border-[#0D7C66] hover:text-[#0D7C66] transition-colors flex items-center justify-center gap-2">
                    <RotateCcw className="w-4 h-4" /> أنشئ عناوين لعقار آخر
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ BEFORE / AFTER ════════════════ */}
      <section className="bg-[#FBF8F2] py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <span className="text-sm font-bold tracking-wide text-[#D4A853]">المقارنة</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#211F1A] mt-2">
              الفرق واضح — <span className="text-red-500">بدون</span> وبعد
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BEFORE_AFTER.map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }}
                className="rounded-2xl border border-[#E8E1D2] bg-white p-5 shadow-sm">
                <div className="font-bold text-[#211F1A] text-sm mb-3">{item.label}</div>
                <div className="flex flex-col gap-2">
                  <div className="bg-red-50 rounded-lg px-3 py-2 text-center">
                    <div className="text-[10px] text-red-400 font-semibold mb-0.5">بدون 😩</div>
                    <div className="text-xs text-red-500 font-bold">{item.before}</div>
                  </div>
                  <div className="bg-[#0D7C66]/5 rounded-lg px-3 py-2 text-center">
                    <div className="text-[10px] text-[#0D7C66] font-semibold mb-0.5">مع صدى العقار 🚀</div>
                    <div className="text-xs text-[#0D7C66] font-bold">{item.after}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section className="bg-gradient-to-b from-[#FBF8F2] via-[#F5F0E8] to-[#FBF8F2] py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <span className="text-sm font-bold tracking-wide text-[#D4A853]">آراء المستخدمين</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#211F1A] mt-2">
              وكلاء عقاريون يحدّثونك عن <span className="bg-gradient-to-l from-[#0D7C66] to-[#D4A853] bg-clip-text text-transparent">تجربتهم</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.15 }}
                className="group rounded-2xl border border-[#E8E1D2] bg-white p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="h-1 absolute top-0 right-0 left-0 rounded-t-2xl bg-gradient-to-l from-[#0D7C66] to-[#D4A853] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#0D7C66]/10 rounded-full flex items-center justify-center text-lg">{t.avatar}</div>
                  <div>
                    <div className="text-sm font-bold text-[#211F1A]">{t.name}</div>
                    <div className="text-xs text-[#5B564C]">{t.role}</div>
                  </div>
                </div>
                <p className="text-sm text-[#5B564C] leading-relaxed">{t.text}</p>
                <div className="flex gap-0.5 mt-3">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="w-3.5 h-3.5 text-[#D4A853] fill-[#D4A853]" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ SOCIAL PROOF ════════════════ */}
      <section className="bg-gradient-to-br from-[#0D7C66] to-[#0a6b58] py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          {[
            { icon: <Users className="w-6 h-6 text-[#D4A853] mx-auto mb-2" />, num: "2,800+", label: "مستخدم نشط" },
            { icon: <Globe className="w-6 h-6 text-[#D4A853] mx-auto mb-2" />, num: String(countryCount), label: "دولة عربية" },
            { icon: <Building2 className="w-6 h-6 text-[#D4A853] mx-auto mb-2" />, num: String(totalCities), label: "مدينة مدعومة" },
            { icon: <Zap className="w-6 h-6 text-[#D4A853] mx-auto mb-2" />, num: "7 ثوانٍ", label: "للنتيجة" },
          ].map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
              {stat.icon}
              <div className="text-2xl font-black text-white mb-1">{stat.num}</div>
              <div className="text-xs text-white/50">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section className="bg-[#FBF8F2] py-16 md:py-24 px-4 sm:px-6 text-center relative overflow-hidden">
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] bg-[#0D7C66]/[0.04] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-30px] right-1/4 w-[200px] h-[200px] bg-[#D4A853]/[0.04] rounded-full blur-[80px] pointer-events-none" />

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-lg mx-auto relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#211F1A] mb-3">
            لا تدع عقارك يضيع بين <span className="bg-gradient-to-l from-[#0D7C66] to-[#D4A853] bg-clip-text text-transparent">الآلاف</span>
          </h2>
          <p className="text-[#5B564C] text-sm leading-relaxed mb-6">
            الأداة المجانية تعطيك عناوين ونصائح. النسخة الكاملة تعطيك وصفاً كاملاً، هاشتاقات، محتوى لكل منصة، وتصاميم احترافية — كل ذلك في 7 ثوانٍ.
          </p>
          <a href={trackedUrl("/", "final-cta")} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0D7C66] hover:bg-[#0a6b58] text-white font-bold text-base px-10 py-4 rounded-full no-underline transition-colors shadow-lg min-h-[48px]"
            onClick={() => trackEvent("click_final_cta")}>
            <TrendingUp className="w-5 h-5" /> جرّب صدى العقار الكامل — مجاناً
          </a>
          <p className="text-[#5B564C]/50 text-xs mt-4">لا تحتاج بطاقة بنكية · سجّل وابدأ فوراً</p>
        </motion.div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="mt-auto text-center py-5 px-4 text-xs text-[#5B564C] border-t border-[#E8E1D2] bg-[#FBF8F2] leading-relaxed">
        أداة مجانية من{" "}
        <a href={trackedUrl("/", "footer")} target="_blank" rel="noopener noreferrer"
          className="text-[#0D7C66] no-underline hover:underline py-1 px-0.5 inline-block font-semibold"
          onClick={() => trackEvent("click_footer")}>صدى العقار</a>
        {" "}— مساعد التسويق العقاري للسوق العربي
      </footer>

      {/* ════════════════ FLOATING WHATSAPP ════════════════ */}
      <a href="https://wa.me/213696212465?text=مرحباً، أريد الاستفسار عن صدى العقار"
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform"
        title="تواصل عبر واتساب" onClick={() => trackEvent("click_whatsapp_float")}>
        <Phone className="w-6 h-6 text-white" />
      </a>
    </div>
  );
}
