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
  AlertTriangle,
  Building2,
  Eye,
  BarChart3,
  ExternalLink,
  Frown,
  PartyPopper,
  Lightbulb,
  Share2,
  Twitter,
  Link2,
  Send,
  Target,
  Rocket,
  ThumbsUp,
  Hash,
  Megaphone,
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

const PLATFORM_SHARE_URLS: Record<string, (text: string) => string> = {
  واتساب: (text) => `https://wa.me/?text=${encodeURIComponent(text)}`,
  "تويتر / X": (text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  فيسبوك: (text) => `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`,
  لينكدإن: (text) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(TOOL_URL)}`,
};

// ─── Pain → Solution Flow ──────────────────────────────────
const PAIN_SECTIONS = [
  {
    icon: <Frown className="w-6 h-6" />,
    question: "هل تشعر أن إعلاناتك العقارية لا تجذب أحداً؟",
    pain: "تكتب وصفاً طويلاً لمشغّلك العقاري — وينتهي الأمر بصفر تفاعل. عقارك يضيع بين آلاف الإعلانات المتشابهة، والمشتري الجادّ لا يلاحظه أبداً.",
    feeling: "الإحباط عندما ترى إعلانك يموت بلا تعليق ولا اتصال",
  },
  {
    question: "هل تقضي ساعات في كتابة وصف واحد فقط؟",
    pain: "تقضي 45 دقيقة على وصف عقار واحد — وتعيد كتابته لكل منصة. واتساب، إنستغرام، فيسبوك... كل واحدة أسلوب مختلف. في اليوم تضيع 3-4 ساعات فقط على الكتابة.",
    feeling: "الإرهاق من تكرار نفس العمل يومياً بلا نهاية",
  },
  {
    question: "هل تدفع لوكالات تسويق بلا ضمان نتيجة؟",
    pain: "وكالة التسويق تأخذ $500+ شهرياً — والنتيجة؟ محتوى عام لا يعكس قيمة عقارك. لا تخصيص، لا لهجة محلية، ولا أسلوب يقنع المشتري الجادّ.",
    feeling: "الشعور بأن أموالك تذهب سُداً بلا عائد حقيقي",
  },
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
    text: "كنت أقضي ساعة على وصف كل عقار، الآن أنشر لـ٥ عقارات في نفس الوقت بجودة أفضل. وفّر عليّ تكلفة مصمم ومونتاج.",
    avatar: "👨‍💼",
  },
  {
    name: "نورة الشامسي",
    role: "مستثمرة عقارية · دبي",
    text: "المحتوى يطلع بلهجة الإمارات وبأسلوب يستهدف المستثمر تحديداً. الواتساب صار يرنّ أكثر بعد كل منشور!",
    avatar: "👩‍💼",
  },
  {
    name: "خالد العتيبي",
    role: "مسؤول تسويق · الدوحة",
    text: "جربنا كتابة محتوى لـ٣ منصات بنفس العقار — كل وحدة مظبوطة للمنصة. تويتر قصير، لينكدين رسمي، واتساب تفصيلي.",
    avatar: "👨‍💻",
  },
];

// ─── Expanded Cities ────────────────────────────────────────
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
  "إطلالة بحرية",
  "إطلالة على الحديقة",
  "موقع مميز",
  "تشطيب فاخر",
  "قريب من المسجد",
  "قريب من المدارس",
  "مسبح خاص",
  "فرصة استثمارية",
  "تسليم فوري",
  "نظام ذكي",
  "حديقة خاصة",
  "موقف سيارات",
  "أمن وحراسة 24 ساعة",
  "قريب من المترو",
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

function shareOnLinkedIn() {
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(TOOL_URL)}`, "_blank");
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
  const [sharedPlatform, setSharedPlatform] = useState<string | null>(null);
  const [showShareTooltip, setShowShareTooltip] = useState<string | null>(null);
  const [toolLinkCopied, setToolLinkCopied] = useState(false);
  const [busyMessage, setBusyMessage] = useState("");

  const userCount = useUserCounter();
  const countdown = useCountdown();

  // Track page view on mount
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

      // Handle busy message (invisible rate limit)
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

    if (platform === "واتساب") {
      shareOnWhatsApp(fullText);
    } else if (platform === "تويتر / X") {
      shareOnTwitter(fullText);
    } else {
      copyToClipboard(fullText);
    }

    setSharedPlatform(platform);
    setTimeout(() => setSharedPlatform(null), 2500);
    trackEvent("share_title", { platform });
    setShowShareTooltip(platform);
    setTimeout(() => setShowShareTooltip(null), 2000);
  };

  const handleShareTool = (method: string) => {
    const toolShareText = `🏠 جرّبت أداة مجانية تكتب عناوين تسويقية احترافية لأي عقار في 7 ثوانٍ!\n\n✅ 6 منصات مختلفة\n✅ نصائح نشر مجانية\n✅ هاشتاقات ذكية\n\nجرّبها مجاناً 👇\n${TOOL_URL}`;

    if (method === "whatsapp") {
      shareOnWhatsApp(toolShareText);
    } else if (method === "twitter") {
      shareOnTwitter(`🏠 أداة مجانية تكتب عناوين تسويقية احترافية لأي عقار في 7 ثوانٍ! جرّبها 👇\n${TOOL_URL}`);
    } else if (method === "copy") {
      copyToClipboard(toolShareText).then((ok) => {
        if (ok) {
          setToolLinkCopied(true);
          setTimeout(() => setToolLinkCopied(false), 2500);
        }
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

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" dir="rtl">
      {/* ── HEADER ── */}
      <header className="bg-[#0f1117] px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <a
          href={trackedUrl("/", "header-logo")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 no-underline"
          onClick={() => trackEvent("click_header_logo")}
        >
          <div className="w-9 h-9 bg-[#c9a84c] rounded-full flex items-center justify-center flex-shrink-0">
            <Home className="w-4 h-4 text-[#0f1117]" />
          </div>
          <div>
            <div className="text-white font-bold text-base leading-tight">صدى العقار</div>
            <div className="text-white/40 text-xs font-light">مساعد التسويق العقاري</div>
          </div>
        </a>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-white/50 text-xs">
            <Users className="w-3.5 h-3.5" />
            <span>{userCount.toLocaleString("ar-SA")} مستخدم</span>
          </div>
          <a
            href={trackedUrl("/", "header-cta")}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#c9a84c] text-[#0f1117] font-bold text-sm px-4 py-2.5 rounded-lg no-underline hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-1.5 min-h-[44px]"
            onClick={() => trackEvent("click_header_cta")}
          >
            جرّب النسخة الكاملة
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* ── HERO: THE HOOK ── */}
      <section className="bg-[#0f1117] pt-10 pb-20 px-5 text-center relative overflow-hidden">
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-[rgba(201,168,76,0.15)] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Urgency Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] rounded-full px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold mb-5">
            <Zap className="w-3.5 h-3.5" />
            <span>عرض لفترة محدودة — مجاناً بالكامل</span>
            <div className="flex gap-1 mr-1 items-center">
              <span className="bg-[#c9a84c] text-[#0f1117] px-2 py-0.5 rounded text-[10px] font-black">
                {countdown.days}
              </span>
              <span className="text-[#c9a84c] text-[9px]">يوم</span>
              <span className="text-[#c9a84c]">:</span>
              <span className="bg-[#c9a84c] text-[#0f1117] px-1.5 py-0.5 rounded text-[10px] font-black">
                {String(countdown.hours).padStart(2, "0")}
              </span>
              <span className="text-[#c9a84c]">:</span>
              <span className="bg-[#c9a84c] text-[#0f1117] px-1.5 py-0.5 rounded text-[10px] font-black">
                {String(countdown.minutes).padStart(2, "0")}
              </span>
              <span className="text-[#c9a84c]">:</span>
              <span className="bg-[#c9a84c] text-[#0f1117] px-1.5 py-0.5 rounded text-[10px] font-black">
                {String(countdown.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Hook Headline */}
          <h1 className="text-white text-2xl sm:text-4xl lg:text-5xl font-black leading-snug max-w-2xl mx-auto mb-4">
            عقارك يستاهل أفضل من
            <br />
            <span className="text-[#c9a84c]">إعلان مكتوب على السريع</span>
          </h1>

          {/* Sub-hook */}
          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-6">
            جرّب الآن — أدخل بيانات عقارك واحصل على <span className="text-[#c9a84c] font-bold">عناوين تسويقية احترافية</span> مخصصة لكل منصة في 7 ثوانٍ فقط
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-white/40 text-xs">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#c9a84c]" /> بدون تسجيل
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#c9a84c]" /> نتيجة فورية
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#c9a84c]" /> {countryCount} دولة عربية
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c9a84c]" /> مجاني بالكامل
            </span>
          </div>
        </motion.div>
      </section>

      {/* ── PAIN → FEEL → SOLUTION ── */}
      <section className="bg-[#fef2f2] py-10 px-5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-xl sm:text-2xl font-black text-[#7f1d1d] mb-1">
              هل يبدو لك هذا مألوفاً؟
            </h2>
            <p className="text-xs text-[#991b1b]/60">لا تقلق — أغلب وكلاء العقارات يعانون من نفس الشيء</p>
          </motion.div>

          <div className="flex flex-col gap-5">
            {PAIN_SECTIONS.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
                className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm"
              >
                <h3 className="font-black text-[#991b1b] text-base mb-2">
                  {item.question}
                </h3>
                <p className="text-sm text-[#7f1d1d]/70 leading-relaxed mb-3">
                  {item.pain}
                </p>
                <div className="bg-[#fef2f2] rounded-xl px-4 py-2.5 flex items-start gap-2">
                  <Frown className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[#991b1b] font-semibold italic">
                    {item.feeling}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Solution Bridge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-[#0D7C66] text-white rounded-full px-5 py-2 text-sm font-bold">
              <Lightbulb className="w-4 h-4" />
              ماذا لو كان بإمكانك حل كل هذا في 7 ثوانٍ؟
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO TOOL ── */}
      <section className="bg-[#f5f6fa] py-10 px-5" id="demo">
        <div className="max-w-[720px] w-full mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] rounded-full px-3 py-1 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              جرّب بنفسك الآن — بدون تسجيل
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0f1117] mb-2">
              شاهد النتيجة <span className="text-[#c9a84c]">بعينيك</span>
            </h2>
            <p className="text-xs text-[#3a3d4a]">أدخل بيانات أي عقار واحصل على عناوين تسويقية احترافية لمنصات مختلفة</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-[20px] shadow-[0_12px_48px_rgba(15,17,23,0.14)] overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Card Header */}
            <div className="bg-gradient-to-bl from-[#f5edda] to-[#fff8e8] border-b border-[#edddb0] px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#c9a84c] rounded-[10px] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#0f1117]">مولّد العناوين العقارية</h3>
                <p className="text-[11px] text-[#3a3d4a]">بيانات العقار → عناوين احترافية + نصائح نشر + هاشتاقات</p>
              </div>
              {/* NO remaining attempts counter - invisible rate limiting */}
              <div className="flex items-center gap-1 text-[10px] text-[#0D7C66] bg-[#0D7C66]/10 px-2.5 py-1 rounded-full font-semibold">
                <Zap className="w-3 h-3" />
                مجاني
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* ── FORM ── */}
              {formStep === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3a3d4a] flex items-center gap-1.5">
                        نوع العقار <span className="text-[#c9a84c]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.propType}
                          onChange={(e) => handleFormChange("propType", e.target.value)}
                          className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-[14px] py-3 px-3.5 appearance-none cursor-pointer focus:border-[#c9a84c] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.18)] focus:bg-white transition-all font-[Cairo]"
                        >
                          <option value="">— اختر —</option>
                          {Object.entries(PROP_TYPES).map(([group, types]) => (
                            <optgroup key={group} label={group}>
                              {types.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a3d4a] pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3a3d4a] flex items-center gap-1.5">
                        الغرض <span className="text-[#c9a84c]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.purpose}
                          onChange={(e) => handleFormChange("purpose", e.target.value)}
                          className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-[14px] py-3 px-3.5 appearance-none cursor-pointer focus:border-[#c9a84c] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.18)] focus:bg-white transition-all font-[Cairo]"
                        >
                          <option value="">— اختر —</option>
                          <option value="للبيع">للبيع</option>
                          <option value="للإيجار">للإيجار</option>
                          <option value="للاستثمار">للاستثمار</option>
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a3d4a] pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3a3d4a] flex items-center gap-1.5">
                        المدينة <span className="text-[#c9a84c]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.city}
                          onChange={(e) => handleFormChange("city", e.target.value)}
                          className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-[14px] py-3 px-3.5 appearance-none cursor-pointer focus:border-[#c9a84c] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.18)] focus:bg-white transition-all font-[Cairo]"
                        >
                          <option value="">— اختر —</option>
                          {Object.entries(CITIES).map(([country, cities]) => (
                            <optgroup key={country} label={country}>
                              {cities.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a3d4a] pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3a3d4a]">الحي / المنطقة</label>
                      <input
                        type="text"
                        value={formData.area}
                        onChange={(e) => handleFormChange("area", e.target.value)}
                        placeholder="مثال: حي النرجس"
                        className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-[14px] py-3 px-3.5 focus:border-[#c9a84c] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.18)] focus:bg-white transition-all font-[Cairo] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 my-5 text-[#3a3d4a] text-xs font-semibold">
                    <span className="flex-1 h-px bg-[#e2e4ed]" />
                    تفاصيل إضافية (اختياري)
                    <span className="flex-1 h-px bg-[#e2e4ed]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3a3d4a]">المساحة (م²)</label>
                      <input
                        type="text"
                        value={formData.space}
                        onChange={(e) => handleFormChange("space", e.target.value)}
                        placeholder="مثال: 150"
                        className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-[14px] py-3 px-3.5 focus:border-[#c9a84c] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.18)] focus:bg-white transition-all font-[Cairo] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3a3d4a]">عدد الغرف</label>
                      <div className="relative">
                        <select
                          value={formData.rooms}
                          onChange={(e) => handleFormChange("rooms", e.target.value)}
                          className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-[14px] py-3 px-3.5 appearance-none cursor-pointer focus:border-[#c9a84c] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.18)] focus:bg-white transition-all font-[Cairo]"
                        >
                          <option value="">—</option>
                          <option>استوديو</option>
                          <option>غرفة واحدة</option>
                          <option>غرفتان</option>
                          <option>3 غرف</option>
                          <option>4 غرف</option>
                          <option>5 غرف وأكثر</option>
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a3d4a] pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3a3d4a]">ميزة بارزة</label>
                      <div className="relative">
                        <select
                          value={formData.feature}
                          onChange={(e) => handleFormChange("feature", e.target.value)}
                          className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-[14px] py-3 px-3.5 appearance-none cursor-pointer focus:border-[#c9a84c] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.18)] focus:bg-white transition-all font-[Cairo]"
                        >
                          <option value="">— اختر إن وجد —</option>
                          {FEATURES.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a3d4a] pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3a3d4a]">السعر</label>
                      <input
                        type="text"
                        value={formData.price}
                        onChange={(e) => handleFormChange("price", e.target.value)}
                        placeholder="مثال: 850,000 ريال"
                        className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-[14px] py-3 px-3.5 focus:border-[#c9a84c] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.18)] focus:bg-white transition-all font-[Cairo] outline-none"
                      />
                    </div>
                  </div>

                  {/* Busy message (invisible rate limit) */}
                  {busyMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 rounded-xl px-4 py-3 text-sm text-center bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c]"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        {busyMessage}
                      </span>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 rounded-xl px-4 py-3 text-sm text-center bg-red-50 border border-red-200 text-red-700"
                    >
                      ⚠️ {error}
                    </motion.div>
                  )}

                  <button
                    onClick={handleGenerate}
                    className="w-full mt-6 bg-[#c9a84c] text-[#0f1117] font-black text-base py-4 rounded-[14px] cursor-pointer flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(201,168,76,0.45)] active:translate-y-0 shadow-[0_4px_20px_rgba(201,168,76,0.35)]"
                  >
                    <Zap className="w-5 h-5" />
                    أنشئ العناوين التسويقية الآن
                  </button>
                </motion.div>
              )}

              {/* ── LOADING ── */}
              {formStep === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-14 px-5 gap-4"
                >
                  <div className="w-12 h-12 border-[3px] border-[#e2e4ed] border-t-[#c9a84c] rounded-full animate-spin" />
                  <div className="text-[#0f1117] font-bold text-sm">صدى العقار يصيغ لك عناوين احترافية...</div>
                  <div className="text-[#aaa] text-xs">يحلّل بيانات العقار ويختار أفضل الأساليب لكل منصة</div>
                  <div className="flex items-center gap-2 text-[10px] text-[#c9a84c] mt-2">
                    <Target className="w-3.5 h-3.5" />
                    <span>يستخدم تقنيات نفسية مثبتة لجذب المشترين</span>
                  </div>
                </motion.div>
              )}

              {/* ── RESULTS ── */}
              {formStep === "results" && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-5 sm:p-6"
                >
                  {/* Success header */}
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 bg-[#0D7C66] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-black text-[#0D7C66]">تم توليد العناوين بنجاح!</span>
                    <span className="flex-1 h-px bg-[#edddb0]" />
                  </div>

                  {/* Title cards */}
                  <div className="flex flex-col gap-3">
                    {titles.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className={`bg-[#f5f6fa] border-[1.5px] rounded-[14px] p-4 transition-all ${
                          copiedIdx === idx
                            ? "border-green-400 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
                            : "border-[#e2e4ed] hover:border-[#c9a84c]"
                        }`}
                      >
                        {/* Platform badge + copy button row */}
                        <div className="flex items-center justify-between mb-2.5">
                          <span
                            className="inline-block text-[10px] font-bold rounded-md px-2.5 py-1"
                            style={{
                              background: PLATFORM_COLORS[item.platform] || "#333",
                              color: PLATFORM_TEXT_DARK[item.platform] ? "#333" : "#fff",
                            }}
                          >
                            {item.platform}
                          </span>
                          <button
                            onClick={() => handleCopy(item.title, idx)}
                            className="flex items-center gap-1 text-[10px] cursor-pointer bg-transparent border-none"
                          >
                            {copiedIdx === idx ? (
                              <span className="text-green-500 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> تم النسخ
                              </span>
                            ) : (
                              <span className="text-[#aaa] flex items-center gap-1 hover:text-[#c9a84c] transition-colors">
                                <Copy className="w-3.5 h-3.5" /> انقر للنسخ
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Title text */}
                        <div className="text-sm font-bold text-[#0f1117] leading-relaxed mb-2">
                          {item.title}
                        </div>

                        {/* Hashtags */}
                        {item.hashtags && item.hashtags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap mb-2">
                            <Hash className="w-3 h-3 text-[#c9a84c] flex-shrink-0" />
                            {item.hashtags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] text-[#c9a84c] bg-[#c9a84c]/10 px-2 py-0.5 rounded-full font-semibold"
                              >
                                {tag.startsWith('#') ? tag : `#${tag}`}
                              </span>
                            ))}
                            <button
                              onClick={() => handleCopyHashtags(item.hashtags || [], idx)}
                              className="text-[9px] text-[#aaa] hover:text-[#c9a84c] cursor-pointer bg-transparent border-none transition-colors mr-1"
                              title="نسخ الهاشتاقات"
                            >
                              {copiedHashtags === idx ? (
                                <span className="text-green-500">✓</span>
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Tip */}
                        {item.tip && (
                          <div className="flex items-start gap-2 bg-[#0D7C66]/5 rounded-lg px-3 py-2 mt-1">
                            <Lightbulb className="w-3.5 h-3.5 text-[#0D7C66] mt-0.5 flex-shrink-0" />
                            <span className="text-[11px] text-[#0D7C66] leading-relaxed">{item.tip}</span>
                          </div>
                        )}

                        {/* Share buttons for this title */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#e2e4ed]">
                          <span className="text-[10px] text-[#aaa] ml-1">مشاركة:</span>
                          <button
                            onClick={() => handleShareTitle("واتساب", item.title, item.hashtags)}
                            className="flex items-center gap-1 bg-[#25D366] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity border-none"
                          >
                            <Send className="w-3 h-3" />
                            واتساب
                          </button>
                          {(item.platform === "تويتر / X" || item.platform === "إنستغرام") && (
                            <button
                              onClick={() => handleShareTitle("تويتر / X", item.title, item.hashtags)}
                              className="flex items-center gap-1 bg-[#000] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity border-none"
                            >
                              <Twitter className="w-3 h-3" />
                              تويتر
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const fullText = item.hashtags?.length
                                ? `${item.title}\n${item.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}`
                                : item.title;
                              copyToClipboard(fullText).then(() => {
                                setCopiedIdx(idx);
                                setTimeout(() => setCopiedIdx(null), 2000);
                              });
                            }}
                            className="flex items-center gap-1 bg-[#f5f6fa] border border-[#e2e4ed] text-[#3a3d4a] text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:border-[#c9a84c] transition-colors"
                          >
                            <Link2 className="w-3 h-3" />
                            نسخ الكل
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* General Marketing Tips */}
                  {generalTips.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-5 bg-gradient-to-bl from-[#f5edda] to-[#fff8e8] border border-[#edddb0] rounded-2xl p-5"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Megaphone className="w-5 h-5 text-[#c9a84c]" />
                        <h4 className="text-sm font-black text-[#0f1117]">نصائح تسويقية مجانية</h4>
                      </div>
                      <div className="flex flex-col gap-2">
                        {generalTips.map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <ThumbsUp className="w-3.5 h-3.5 text-[#c9a84c] mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-[#3a3d4a] leading-relaxed">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* ── VIRAL: Share the tool section ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-5 bg-[#0f1117] rounded-2xl p-5 text-center relative overflow-hidden"
                  >
                    <div className="absolute top-[-20px] right-[-20px] w-[80px] h-[80px] bg-[rgba(201,168,76,0.15)] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Rocket className="w-5 h-5 text-[#c9a84c]" />
                        <h4 className="text-white text-sm font-extrabold">ساعد زملاءك — شارك الأداة!</h4>
                      </div>
                      <p className="text-white/40 text-[11px] leading-relaxed mb-4 max-w-sm mx-auto">
                        أغلب وكلاء العقارات لا يعرفون عن هذه الأداة بعد. شاركها وساعدهم يوفّرون وقتهم
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          onClick={() => handleShareTool("whatsapp")}
                          className="flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:opacity-90 transition-opacity border-none min-h-[40px]"
                        >
                          <MessageCircle className="w-4 h-4" />
                          واتساب
                        </button>
                        <button
                          onClick={() => handleShareTool("twitter")}
                          className="flex items-center gap-1.5 bg-[#1DA1F2] text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:opacity-90 transition-opacity border-none min-h-[40px]"
                        >
                          <Twitter className="w-4 h-4" />
                          تويتر
                        </button>
                        <button
                          onClick={() => handleShareTool("copy")}
                          className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-white/20 transition-all border border-white/20 min-h-[40px]"
                        >
                          {toolLinkCopied ? (
                            <>
                              <Check className="w-4 h-4 text-green-400" />
                              <span className="text-green-400">تم النسخ!</span>
                            </>
                          ) : (
                            <>
                              <Link2 className="w-4 h-4" />
                              نسخ الرابط
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Upsell Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-5 bg-gradient-to-bl from-[#0f1117] to-[#1e2235] rounded-2xl p-6 text-center relative overflow-hidden"
                  >
                    <div className="absolute top-[-30px] right-[-30px] w-[120px] h-[120px] bg-[rgba(201,168,76,0.15)] rounded-full pointer-events-none" />
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <PartyPopper className="w-5 h-5 text-[#c9a84c]" />
                      <h3 className="text-white text-base font-extrabold">
                        أعجبتك النتيجة؟ النسخة الكاملة تعطيك أكثر بكثير
                      </h3>
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed mb-4 max-w-sm mx-auto">
                      وصف عقاري كامل · هاشتاقات احترافية · محتوى لكل منصة · تصاميم جاهزة · نشر فوري
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mb-5">
                      {["📝 وصف تسويقي كامل", "# هاشتاقات ذكية", "📱 6 منصات", "🎨 تصاميم جاهزة", "💬 واتساب جاهز", "📊 تحليلات"].map((feat) => (
                        <span key={feat} className="bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] text-[#c9a84c] text-xs font-semibold px-3 py-1.5 rounded-full">
                          {feat}
                        </span>
                      ))}
                    </div>
                    <a
                      href={trackedUrl("/", "upsell-banner")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#0f1117] font-black text-sm px-7 py-3 rounded-[14px] no-underline transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(201,168,76,0.45)] shadow-[0_4px_20px_rgba(201,168,76,0.35)]"
                      onClick={() => trackEvent("click_upsell_banner", { city: formData.city })}
                    >
                      جرّب النسخة الكاملة مجاناً
                      <ArrowLeft className="w-4 h-4" />
                    </a>
                  </motion.div>

                  {/* Reset */}
                  <button
                    onClick={handleReset}
                    className="w-full mt-4 border-[1.5px] border-[#e2e4ed] text-[#3a3d4a] font-bold text-sm py-3 rounded-[14px] cursor-pointer hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    أنشئ عناوين لعقار آخر
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="bg-white py-14 px-5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-xl sm:text-2xl font-black text-[#0f1117] mb-2">
              الفرق واضح — <span className="text-red-500">بدون</span> وبعد
            </h2>
          </motion.div>

          {/* Desktop: Table | Mobile: Cards */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-[#e2e4ed]">
                  <th className="py-3 px-4 text-right text-[#3a3d4a] font-semibold">المهمة</th>
                  <th className="py-3 px-4 text-center text-red-500 font-semibold">بدون 😩</th>
                  <th className="py-3 px-4 text-center text-[#0D7C66] font-semibold">مع صدى العقار 🚀</th>
                </tr>
              </thead>
              <tbody>
                {BEFORE_AFTER.map((item, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className="border-b border-[#e2e4ed]"
                  >
                    <td className="py-3 px-4 font-semibold text-[#0f1117]">{item.label}</td>
                    <td className="py-3 px-4 text-center text-red-400 text-xs">{item.before}</td>
                    <td className="py-3 px-4 text-center text-[#0D7C66] font-bold text-xs">{item.after}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Stacked cards */}
          <div className="sm:hidden flex flex-col gap-3">
            {BEFORE_AFTER.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white rounded-xl p-4 border border-[#e2e4ed]"
              >
                <div className="font-bold text-[#0f1117] text-sm mb-2">{item.label}</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-red-50 rounded-lg px-3 py-2 text-center">
                    <div className="text-[10px] text-red-400 font-semibold mb-0.5">بدون 😩</div>
                    <div className="text-xs text-red-500 font-bold">{item.before}</div>
                  </div>
                  <div className="flex-1 bg-[#0D7C66]/5 rounded-lg px-3 py-2 text-center">
                    <div className="text-[10px] text-[#0D7C66] font-semibold mb-0.5">مع صدى العقار 🚀</div>
                    <div className="text-xs text-[#0D7C66] font-bold">{item.after}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-[#f5f6fa] py-14 px-5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-xl sm:text-2xl font-black text-[#0f1117] mb-2">
              وكلاء عقاريون يحدّثونك عن <span className="text-[#c9a84c]">تجربتهم</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="bg-white rounded-2xl p-5 border border-[#e2e4ed]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#c9a84c]/10 rounded-full flex items-center justify-center text-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#0f1117]">{t.name}</div>
                    <div className="text-xs text-[#3a3d4a]">{t.role}</div>
                  </div>
                </div>
                <p className="text-sm text-[#3a3d4a] leading-relaxed">{t.text}</p>
                <div className="flex gap-0.5 mt-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-[#c9a84c] fill-[#c9a84c]" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF NUMBERS ── */}
      <section className="bg-[#0f1117] py-12 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center">
          {[
            { icon: <Users className="w-6 h-6 text-[#c9a84c] mx-auto mb-2" />, num: "2,800+", label: "مستخدم نشط" },
            { icon: <Globe className="w-6 h-6 text-[#c9a84c] mx-auto mb-2" />, num: String(countryCount), label: "دولة عربية" },
            { icon: <Building2 className="w-6 h-6 text-[#c9a84c] mx-auto mb-2" />, num: String(totalCities), label: "مدينة مدعومة" },
            { icon: <Zap className="w-6 h-6 text-[#c9a84c] mx-auto mb-2" />, num: "7 ثوانٍ", label: "للنتيجة" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              {stat.icon}
              <div className="text-2xl font-black text-white mb-1">{stat.num}</div>
              <div className="text-xs text-white/40">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-gradient-to-b from-[#0f1117] to-[#1a1c2e] py-16 px-5 text-center relative overflow-hidden">
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] bg-[rgba(201,168,76,0.08)] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto relative z-10"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            لا تدع عقارك يضيع بين <span className="text-[#c9a84c]">الآلاف</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-6">
            الأداة المجانية تعطيك عناوين ونصائح. النسخة الكاملة تعطيك وصفاً كاملاً، هاشتاقات، محتوى لكل منصة، وتصاميم احترافية — كل ذلك في 7 ثوانٍ.
          </p>

          <a
            href={trackedUrl("/", "final-cta")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#0f1117] font-black text-base px-10 py-4 rounded-[14px] no-underline transition-all hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(201,168,76,0.5)] shadow-[0_4px_20px_rgba(201,168,76,0.35)] mb-4"
            onClick={() => trackEvent("click_final_cta")}
          >
            <TrendingUp className="w-5 h-5" />
            جرّب صدى العقار الكامل — مجاناً
          </a>

          <p className="text-white/30 text-xs mt-3">
            لا تحتاج بطاقة بنكية · سجّل وابدأ فوراً
          </p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mt-auto text-center py-5 px-5 text-xs text-[#aaa] border-t border-[#e2e4ed] bg-white leading-relaxed">
        أداة مجانية من{" "}
        <a
          href={trackedUrl("/", "footer")}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#c9a84c] no-underline py-1 px-1 inline-block"
          onClick={() => trackEvent("click_footer")}
        >
          صدى العقار
        </a>{" "}
        — مساعد التسويق العقاري للسوق العربي |{" "}
        <a
          href={trackedUrl("/privacy", "footer-privacy")}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#aaa] no-underline hover:text-[#c9a84c] py-1 px-1 inline-block"
        >
          سياسة الخصوصية
        </a>
      </footer>

      {/* ── FLOATING WHATSAPP ── */}
      <a
        href="https://wa.me/213696212465?text=مرحباً، أريد الاستفسار عن صدى العقار"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform"
        title="تواصل عبر واتساب"
        onClick={() => trackEvent("click_whatsapp_float")}
      >
        <Phone className="w-6 h-6 text-white" />
      </a>
    </div>
  );
}
