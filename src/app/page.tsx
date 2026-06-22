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
  HandCoins,
  Eye,
  BarChart3,
  ExternalLink,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────
interface TitleResult {
  platform: string;
  title: string;
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
  لينكدإن: "#0A66C2",
};

const PAIN_POINTS = [
  {
    icon: <Clock className="w-6 h-6 text-red-400" />,
    title: "ساعات مهدورة",
    desc: "تقضي ساعة في كتابة وصف واحد — والمنافسون ينشرون 10 إعلانات في نفس الوقت",
  },
  {
    icon: <HandCoins className="w-6 h-6 text-red-400" />,
    title: "تكاليف عالية بلا ضمان",
    desc: "وكالات التسويق تأخذ مبالغ شهرية ثابتة — بلا ضمان جودة أو نتيجة",
  },
  {
    icon: <Eye className="w-6 h-6 text-red-400" />,
    title: "إعلانات لا يراها أحد",
    desc: "محتوى ضعيف = صفر تفاعل = عقارك يضيع بين آلاف الإعلانات",
  },
];

const BEFORE_AFTER = [
  { label: "كتابة وصف عقار", before: "45 دقيقة", after: "7 ثوانٍ" },
  { label: "تكييف لكل منصة", before: "إعادة كتابة 4 مرات", after: "تلقائي" },
  { label: "اختيار هاشتاجات", before: "بحث يدوي", after: "ذكي ومدروس" },
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

const CITIES = {
  السعودية: ["الرياض", "جدة", "مكة المكرمة", "الدمام", "المدينة المنورة", "الخبر"],
  الإمارات: ["دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة"],
  الخليج: ["الدوحة", "الكويت", "مسقط", "المنامة"],
  أخرى: ["القاهرة", "عمّان", "بيروت", "الدار البيضاء"],
};

const PROP_TYPES = {
  سكني: ["شقة", "فيلا", "استوديو", "بنتهاوس", "دوبلكس", "شاليه", "عمارة سكنية"],
  تجاري: ["محل تجاري", "مكتب تجاري"],
  أراضي: ["أرض سكنية", "أرض تجارية"],
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

    // Use requestAnimationFrame to defer setState out of sync effect body
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

// ─── Main Page ─────────────────────────────────────────────
export default function SadaLandingPage() {
  const [formStep, setFormStep] = useState<"form" | "loading" | "results">("form");
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [titles, setTitles] = useState<TitleResult[]>([]);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [remainingUses, setRemainingUses] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const userCount = useUserCounter();
  const countdown = useCountdown();

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
    if (limitReached) {
      window.open("https://sada-elaqar.vercel.app", "_blank");
      return;
    }

    setFormStep("loading");
    setError("");

    try {
      const res = await fetch("/api/generate-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      // Handle rate limit
      if (res.status === 429) {
        setLimitReached(true);
        setError(data.message || "تم الوصول للحد اليومي");
        setFormStep("form");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ");
      }

      setTitles(data.titles);
      if (data._meta?.remaining !== undefined) {
        setRemainingUses(data._meta.remaining);
      }
      setFormStep("results");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء التوليد";
      setError(message);
      setFormStep("form");
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2200);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setTitles([]);
    setFormStep("form");
    setError("");
  };

  const MAIN_CTA_URL = "https://sada-elaqar.vercel.app";

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── HEADER ── */}
      <header className="bg-[#0f1117] px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <a
          href={MAIN_CTA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 no-underline"
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
            href={MAIN_CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#c9a84c] text-[#0f1117] font-bold text-sm px-4 py-2 rounded-lg no-underline hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-1.5"
          >
            جرّب النسخة الكاملة
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* ── HERO: THE HOOK ── */}
      <section className="bg-[#0f1117] pt-10 pb-20 px-5 text-center relative overflow-hidden">
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[rgba(201,168,76,0.15)] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] rounded-full px-4 py-1.5 text-xs font-bold mb-5">
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
            هل تعاني من تسويق عقاراتك
            <br />
            <span className="text-[#c9a84c]">يدوياً وبجهد كبير؟</span>
          </h1>

          {/* Sub-hook */}
          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-6">
            جرّب الآن — أدخل بيانات عقارك وشاهد كيف يحوّلها الذكاء الاصطناعي إلى عناوين تسويقية محترفة في <span className="text-[#c9a84c] font-bold">7 ثوانٍ فقط</span>
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
              <Globe className="w-3.5 h-3.5 text-[#c9a84c]" /> بلهجة بلدك
            </span>
          </div>
        </motion.div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="bg-[#fef2f2] py-10 px-5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-xl sm:text-2xl font-black text-[#7f1d1d] mb-2">
              قبل صدى العقار — هل تعاني من هذه المشاكل؟
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PAIN_POINTS.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm"
              >
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <h3 className="font-bold text-[#991b1b] text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-[#7f1d1d]/70 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO TOOL ── */}
      <section className="bg-[#f5f6fa] py-10 px-5" id="demo">
        <div className="max-w-[680px] w-full mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] rounded-full px-3 py-1 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              جرّب بنفسك الآن
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0f1117] mb-2">
              شاهد النتيجة <span className="text-[#c9a84c]">بعينيك</span> — مجاناً
            </h2>
            <p className="text-xs text-[#3a3d4a]">أدخل بيانات أي عقار واحصل على 4 عناوين تسويقية جاهزة للنشر</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-[20px] shadow-[0_12px_48px_rgba(15,17,23,0.14)] overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Card Header */}
            <div className="bg-gradient-to-bl from-[#f5edda] to-[#fff8e8] border-b border-[#edddb0] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#c9a84c] rounded-[10px] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0f1117]">مولّد العناوين العقارية</h3>
                  <p className="text-[11px] text-[#3a3d4a]">بيانات العقار → 4 عناوين فورية</p>
                </div>
              </div>
              {remainingUses !== null && remainingUses > 0 && (
                <span className="text-[10px] text-[#3a3d4a] bg-[#f5f6fa] px-2.5 py-1 rounded-full font-semibold">
                  متبقي {remainingUses} محاولات اليوم
                </span>
              )}
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
                    {/* Property Type */}
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

                    {/* Purpose */}
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

                    {/* City */}
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
                          {Object.entries(CITIES).map(([group, cities]) => (
                            <optgroup key={group} label={group}>
                              {cities.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a3d4a] pointer-events-none" />
                      </div>
                    </div>

                    {/* Area */}
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

                  {/* Step Divider */}
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

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 rounded-xl px-4 py-3 text-sm text-center ${
                        limitReached
                          ? "bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c]"
                          : "bg-red-50 border border-red-200 text-red-700"
                      }`}
                    >
                      {limitReached ? (
                        <span className="flex items-center justify-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {error}
                          <a
                            href={MAIN_CTA_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-bold"
                          >
                            جرّب النسخة الكاملة ←
                          </a>
                        </span>
                      ) : (
                        `⚠️ ${error}`
                      )}
                    </motion.div>
                  )}

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    className="w-full mt-6 bg-[#c9a84c] text-[#0f1117] font-black text-base py-4 rounded-[14px] cursor-pointer flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(201,168,76,0.45)] active:translate-y-0 shadow-[0_4px_20px_rgba(201,168,76,0.35)]"
                  >
                    <Zap className="w-5 h-5" />
                    {limitReached ? "جرّب النسخة الكاملة — بدون حدود" : "أنشئ العناوين التسويقية الآن"}
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
                  className="flex flex-col items-center py-12 px-5 gap-4"
                >
                  <div className="w-11 h-11 border-[3px] border-[#e2e4ed] border-t-[#c9a84c] rounded-full animate-spin" />
                  <div className="text-[#3a3d4a] font-semibold text-sm">صدى العقار يكتب لك...</div>
                  <div className="text-[#aaa] text-xs">يحلّل البيانات ويصيغ أفضل العناوين</div>
                </motion.div>
              )}

              {/* ── RESULTS ── */}
              {formStep === "results" && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold text-[#c9a84c] tracking-wider uppercase">
                      العناوين التسويقية الجاهزة
                    </span>
                    <span className="flex-1 h-px bg-[#edddb0]" />
                  </div>

                  <div className="flex flex-col gap-3">
                    {titles.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => handleCopy(item.title, idx)}
                        className={`relative bg-[#f5f6fa] border-[1.5px] rounded-[14px] p-4 cursor-pointer transition-all hover:border-[#c9a84c] hover:shadow-[0_0_0_3px_rgba(201,168,76,0.18)] ${
                          copiedIdx === idx
                            ? "border-green-400 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
                            : "border-[#e2e4ed]"
                        }`}
                      >
                        <span
                          className="inline-block text-[10px] font-bold text-white rounded-md px-2.5 py-1 mb-2.5"
                          style={{ background: PLATFORM_COLORS[item.platform] || "#333" }}
                        >
                          {item.platform}
                        </span>
                        <div className="text-sm font-bold text-[#0f1117] leading-relaxed">
                          {item.title}
                        </div>
                        <div className="absolute left-3.5 top-3.5 flex items-center gap-1 text-[#aaa] text-[10px]">
                          {copiedIdx === idx ? (
                            <span className="text-green-500 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> تم النسخ
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Copy className="w-3.5 h-3.5" /> انقر للنسخ
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Upsell Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 bg-gradient-to-bl from-[#0f1117] to-[#1e2235] rounded-2xl p-6 text-center relative overflow-hidden"
                  >
                    <div className="absolute top-[-30px] right-[-30px] w-[120px] h-[120px] bg-[rgba(201,168,76,0.15)] rounded-full pointer-events-none" />
                    <h3 className="text-white text-base font-extrabold mb-2">
                      🚀 أعجبتك النتيجة؟ النسخة الكاملة تفعل أكثر بكثير
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-4 max-w-sm mx-auto">
                      وصف عقاري كامل · هاشتاجات احترافية · محتوى لكل منصة · منشور واتساب جاهز · تصاميم احترافية
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mb-5">
                      {["📝 وصف تسويقي كامل", "# هاشتاجات ذكية", "📱 منشور إنستغرام", "💬 رسالة واتساب", "💼 منشور لينكدإن", "🎨 تصاميم جاهزة"].map((feat) => (
                        <span key={feat} className="bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] text-[#c9a84c] text-xs font-semibold px-3 py-1.5 rounded-full">
                          {feat}
                        </span>
                      ))}
                    </div>
                    <a
                      href={MAIN_CTA_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#0f1117] font-black text-sm px-7 py-3 rounded-[14px] no-underline transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(201,168,76,0.45)] shadow-[0_4px_20px_rgba(201,168,76,0.35)]"
                    >
                      جرّب النسخة الكاملة مجاناً
                      <ArrowLeft className="w-4 h-4" />
                    </a>
                  </motion.div>

                  {/* Share + Try Again */}
                  <div className="flex items-center justify-center gap-3 mt-5 pt-5 border-t border-[#e2e4ed]">
                    <span className="text-xs text-[#3a3d4a] font-semibold">أعجبتك الأداة؟ شارك زملاءك:</span>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `🏠 جرّبت أداة مجانية تكتب عناوين تسويقية لأي عقار في 7 ثوانٍ!\n\nجرّبها مجاناً 👇\n${MAIN_CTA_URL}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-4 py-2.5 rounded-xl no-underline hover:opacity-90 transition-opacity"
                    >
                      <MessageCircle className="w-4 h-4" />
                      شارك عبر واتساب
                    </a>
                  </div>

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
              الفرق <span className="text-red-500">بدون</span> صدى العقار وبعده
            </h2>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-[#e2e4ed]">
                  <th className="py-3 px-4 text-right text-[#3a3d4a] font-semibold">المهمة</th>
                  <th className="py-3 px-4 text-center text-red-500 font-semibold">قبل 😩</th>
                  <th className="py-3 px-4 text-center text-[#0D7C66] font-semibold">بعد 🚀</th>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: <Users className="w-6 h-6 text-[#c9a84c] mx-auto mb-2" />, num: "2,800+", label: "مستخدم نشط" },
            { icon: <Building2 className="w-6 h-6 text-[#c9a84c] mx-auto mb-2" />, num: "11", label: "دولة عربية" },
            { icon: <Zap className="w-6 h-6 text-[#c9a84c] mx-auto mb-2" />, num: "7 ثوانٍ", label: "للنتيجة" },
            { icon: <BarChart3 className="w-6 h-6 text-[#c9a84c] mx-auto mb-2" />, num: "4", label: "منصات مدعومة" },
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
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[rgba(201,168,76,0.08)] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto relative z-10"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            جاهز لتسويق عقاري <span className="text-[#c9a84c]">أسرع وأقنع</span>؟
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-6">
            الأداة المجانية تعطيك عناوين فقط. النسخة الكاملة تعطيك وصفاً كاملاً، هاشتاجات، محتوى لكل منصة، وتصاميم احترافية — كل ذلك في 7 ثوانٍ.
          </p>

          <a
            href={MAIN_CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#0f1117] font-black text-base px-10 py-4 rounded-[14px] no-underline transition-all hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(201,168,76,0.5)] shadow-[0_4px_20px_rgba(201,168,76,0.35)] mb-4"
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
      <footer className="mt-auto text-center py-5 px-5 text-xs text-[#aaa] border-t border-[#e2e4ed] bg-white">
        أداة مجانية من{" "}
        <a href={MAIN_CTA_URL} target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] no-underline">
          صدى العقار
        </a>{" "}
        — مساعد التسويق العقاري للسوق العربي |{" "}
        <a href={`${MAIN_CTA_URL}/privacy`} target="_blank" rel="noopener noreferrer" className="text-[#aaa] no-underline hover:text-[#c9a84c]">
          سياسة الخصوصية
        </a>
      </footer>

      {/* ── FLOATING WHATSAPP BUTTON ── */}
      <a
        href="https://wa.me/213696212465?text=مرحباً، أريد الاستفسار عن صدى العقار"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform"
        title="تواصل عبر واتساب"
      >
        <Phone className="w-6 h-6 text-white" />
      </a>
    </div>
  );
}
