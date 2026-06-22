"use client";

import { useState, useEffect, useCallback } from "react";
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
  Target,
  Star,
  ArrowLeft,
  Zap,
  Shield,
  TrendingUp,
  MessageCircle,
  X,
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

interface LeadData {
  name: string;
  whatsapp: string;
  email: string;
  country: string;
  role: string;
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

const INITIAL_LEAD: LeadData = {
  name: "",
  whatsapp: "",
  email: "",
  country: "",
  role: "",
};

const PLATFORM_COLORS: Record<string, string> = {
  واتساب: "#25D366",
  إنستغرام: "#E1306C",
  "تويتر / X": "#000000",
  لينكدإن: "#0A66C2",
};

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
    text: "جربنا كتابة محتوى لـ٣ منصات بنفس العقار — كل وحدة مظبوطة للمنصة. فرق حقيقي.",
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

const COUNTRIES = [
  "السعودية",
  "الإمارات",
  "قطر",
  "الكويت",
  "البحرين",
  "عُمان",
  "مصر",
  "الأردن",
  "العراق",
  "المغرب",
];

const ROLES = [
  "وكيل عقاري مستقل",
  "مكتب وساطة عقاري",
  "شركة تطوير عقاري",
  "مستثمر عقاري",
  "أخرى",
];

// ─── Simulated user counter ────────────────────────────────
function useUserCounter() {
  const [count, setCount] = useState(2847);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 8000 + Math.random() * 12000);
    return () => clearInterval(interval);
  }, []);
  return count;
}

// ─── Countdown Timer ───────────────────────────────────────
function useCountdown() {
  // 10-day countdown stored in localStorage so it persists across visits
  const STORAGE_KEY = "sada_countdown_end";
  const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

  const getTarget = (): number => {
    if (typeof window === "undefined") return Date.now() + TEN_DAYS_MS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const end = parseInt(stored, 10);
      if (end > Date.now()) return end;
    }
    const newEnd = Date.now() + TEN_DAYS_MS;
    localStorage.setItem(STORAGE_KEY, String(newEnd));
    return newEnd;
  };

  const calcRemaining = (target: number) => {
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(() => calcRemaining(getTarget()));

  useEffect(() => {
    const target = getTarget();
    const timer = setInterval(() => {
      const remaining = calcRemaining(target);
      setTimeLeft(remaining);
      if (remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return timeLeft;
}

// ─── Main Page ─────────────────────────────────────────────
export default function SadaLandingPage() {
  const [formStep, setFormStep] = useState<"form" | "lead_gate" | "loading" | "results">("form");
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [leadData, setLeadData] = useState<LeadData>(INITIAL_LEAD);
  const [titles, setTitles] = useState<TitleResult[]>([]);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadId, setLeadId] = useState<string>("");
  const [showWhatsAppChat, setShowWhatsAppChat] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  const userCount = useUserCounter();
  const countdown = useCountdown();

  // Track generation count from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("sada_gen_count");
    if (stored) setGenerationCount(parseInt(stored, 10));
  }, []);

  const handleFormChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setError("");
    },
    []
  );

  const handleLeadChange = useCallback(
    (field: keyof LeadData, value: string) => {
      setLeadData((prev) => ({ ...prev, [field]: value }));
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

    // After 1 free generation, show lead gate
    if (generationCount >= 1 && !leadSubmitted) {
      setFormStep("lead_gate");
      return;
    }

    await generateTitles();
  };

  const generateTitles = async () => {
    setFormStep("loading");
    setError("");

    try {
      const res = await fetch("/api/generate-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, leadId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ");
      }

      setTitles(data.titles);
      setFormStep("results");
      const newCount = generationCount + 1;
      setGenerationCount(newCount);
      localStorage.setItem("sada_gen_count", String(newCount));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء التوليد";
      setError(message);
      setFormStep("form");
    }
  };

  const handleLeadSubmit = async () => {
    if (!leadData.whatsapp && !leadData.email) {
      setError("يرجى إدخال رقم الواتساب أو البريد الإلكتروني");
      return;
    }

    try {
      const res = await fetch("/api/capture-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadData,
          propType: formData.propType,
          purpose: formData.purpose,
          city: formData.city,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ");
      }

      setLeadId(data.leadId);
      setLeadSubmitted(true);
      setShowLeadForm(false);
      await generateTitles();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ في حفظ البيانات";
      setError(message);
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

  const whatsappShareText = titles.length
    ? `🏠 جرّبت أداة مجانية تكتب عناوين تسويقية لأي عقار في 7 ثوانٍ!\n\nمثال لـ${formData.propType} ${formData.purpose} في ${formData.city}:\n\n"${titles[0]?.title}"\n\nجرّبها مجاناً بدون تسجيل 👇`
    : "";

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── HEADER ── */}
      <header className="bg-[#0f1117] px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <a
          href="https://sada-elaqar.vercel.app"
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
            href="https://sada-elaqar.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#c9a84c] text-[#0f1117] font-bold text-sm px-4 py-2 rounded-lg no-underline hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            جرّب النسخة الكاملة ←
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-[#0f1117] pt-12 pb-20 px-5 text-center relative overflow-hidden">
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

          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black leading-snug max-w-2xl mx-auto mb-4">
            أنشئ <span className="text-[#c9a84c]">عنواناً تسويقياً</span>
            <br />
            لعقارك في 7 ثوانٍ
          </h1>

          <p className="text-white/50 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            أدخل نوع العقار والمدينة — وسيكتب الذكاء الاصطناعي لك عناوين جاهزة للنشر على كل
            المنصات
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-white/40 text-xs">
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

      {/* ── MAIN CARD ── */}
      <div className="max-w-[680px] w-full mx-auto -mt-10 px-4 pb-12 relative z-10">
        <motion.div
          className="bg-white rounded-[20px] shadow-[0_12px_48px_rgba(15,17,23,0.14)] overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Card Header */}
          <div className="bg-gradient-to-bl from-[#f5edda] to-[#fff8e8] border-b border-[#edddb0] px-6 py-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c9a84c] rounded-[10px] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0f1117]">بيانات العقار</h2>
              <p className="text-xs text-[#3a3d4a] mt-0.5">خطوتان فقط — والعنوان جاهز</p>
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
                              <option key={t} value={t}>
                                {t}
                              </option>
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
                              <option key={c} value={c}>
                                {c}
                              </option>
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
                      placeholder="مثال: حي النرجس، وسط المدينة"
                      className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-[14px] py-3 px-3.5 focus:border-[#c9a84c] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.18)] focus:bg-white transition-all font-[Cairo] outline-none"
                    />
                  </div>
                </div>

                {/* Step Divider */}
                <div className="flex items-center gap-3 my-5 text-[#3a3d4a] text-xs font-semibold">
                  <span className="flex-1 h-px bg-[#e2e4ed]" />
                  تفاصيل إضافية (اختياري — تحسّن النتيجة)
                  <span className="flex-1 h-px bg-[#e2e4ed]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Space */}
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

                  {/* Rooms */}
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

                  {/* Feature */}
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
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a3d4a] pointer-events-none" />
                    </div>
                  </div>

                  {/* Price */}
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
                    className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm text-center"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  className="w-full mt-6 bg-[#c9a84c] text-[#0f1117] font-black text-base py-4 rounded-[14px] cursor-pointer flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(201,168,76,0.45)] active:translate-y-0 shadow-[0_4px_20px_rgba(201,168,76,0.35)]"
                >
                  <Zap className="w-5 h-5" />
                  أنشئ العناوين التسويقية الآن
                </button>
              </motion.div>
            )}

            {/* ── LEAD GATE ── */}
            {formStep === "lead_gate" && (
              <motion.div
                key="lead_gate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-[#c9a84c]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-7 h-7 text-[#c9a84c]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0f1117] mb-2">
                    استمتع بتجربة بدون حدود!
                  </h3>
                  <p className="text-sm text-[#3a3d4a] leading-relaxed">
                    أدخل بياناتك لمتابعة استخدام الأداة مجاناً — وسنرسل لك ميزات حصرية عند إطلاق
                    النسخة الكاملة
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-[#3a3d4a]">الاسم</label>
                    <input
                      type="text"
                      value={leadData.name}
                      onChange={(e) => handleLeadChange("name", e.target.value)}
                      placeholder="اسمك الكامل"
                      className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-[14px] py-3 px-3.5 focus:border-[#c9a84c] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.18)] focus:bg-white transition-all font-[Cairo] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3a3d4a] flex items-center gap-1.5">
                        رقم الواتساب <span className="text-[#c9a84c]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={leadData.whatsapp}
                        onChange={(e) => handleLeadChange("whatsapp", e.target.value)}
                        placeholder="+966 5XX XXX XXXX"
                        className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-[14px] py-3 px-3.5 focus:border-[#c9a84c] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.18)] focus:bg-white transition-all font-[Cairo] outline-none"
                        dir="ltr"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3a3d4a]">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        value={leadData.email}
                        onChange={(e) => handleLeadChange("email", e.target.value)}
                        placeholder="email@example.com"
                        className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-[14px] py-3 px-3.5 focus:border-[#c9a84c] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.18)] focus:bg-white transition-all font-[Cairo] outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3a3d4a]">الدولة</label>
                      <div className="relative">
                        <select
                          value={leadData.country}
                          onChange={(e) => handleLeadChange("country", e.target.value)}
                          className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-[14px] py-3 px-3.5 appearance-none cursor-pointer focus:border-[#c9a84c] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.18)] focus:bg-white transition-all font-[Cairo]"
                        >
                          <option value="">— اختر —</option>
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a3d4a] pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#3a3d4a]">صفتك</label>
                      <div className="relative">
                        <select
                          value={leadData.role}
                          onChange={(e) => handleLeadChange("role", e.target.value)}
                          className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-[14px] py-3 px-3.5 appearance-none cursor-pointer focus:border-[#c9a84c] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.18)] focus:bg-white transition-all font-[Cairo]"
                        >
                          <option value="">— اختر —</option>
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a3d4a] pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm text-center"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setFormStep("form")}
                    className="flex-1 border-[1.5px] border-[#e2e4ed] text-[#3a3d4a] font-bold text-sm py-3 rounded-[14px] cursor-pointer hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors"
                  >
                    رجوع
                  </button>
                  <button
                    onClick={handleLeadSubmit}
                    className="flex-[2] bg-[#c9a84c] text-[#0f1117] font-black text-sm py-3 rounded-[14px] cursor-pointer flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(201,168,76,0.45)] shadow-[0_4px_20px_rgba(201,168,76,0.35)]"
                  >
                    <Sparkles className="w-4 h-4" />
                    احصل على العناوين الآن
                  </button>
                </div>

                <p className="text-center text-[10px] text-[#aaa] mt-3">
                  🔒 بياناتك محفوظة بأمان ولن نشاركها مع أي طرف ثالث
                </p>
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
                {/* Result Label */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold text-[#c9a84c] tracking-wider uppercase">
                    العناوين التسويقية الجاهزة
                  </span>
                  <span className="flex-1 h-px bg-[#edddb0]" />
                </div>

                {/* Title Cards */}
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
                        style={{
                          background: PLATFORM_COLORS[item.platform] || "#333",
                        }}
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

                {/* Upgrade Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 bg-gradient-to-bl from-[#0f1117] to-[#1e2235] rounded-2xl p-6 text-center relative overflow-hidden"
                >
                  <div className="absolute top-[-30px] right-[-30px] w-[120px] h-[120px] bg-[rgba(201,168,76,0.15)] rounded-full pointer-events-none" />
                  <h3 className="text-white text-base font-extrabold mb-2">
                    🚀 هذا مجرد البداية — النسخة الكاملة تفعل أكثر
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-4 max-w-sm mx-auto">
                    وصف عقاري كامل · هاشتاجات احترافية · محتوى لكل منصة · منشور واتساب جاهز
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-5">
                    {[
                      "📝 وصف تسويقي كامل",
                      "# هاشتاجات ذكية",
                      "📱 منشور إنستغرام",
                      "💬 رسالة واتساب",
                      "💼 منشور لينكدإن",
                    ].map((feat) => (
                      <span
                        key={feat}
                        className="bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] text-[#c9a84c] text-xs font-semibold px-3 py-1.5 rounded-full"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                  <a
                    href="https://sada-elaqar.vercel.app#demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#0f1117] font-black text-sm px-7 py-3 rounded-[14px] no-underline transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(201,168,76,0.45)] shadow-[0_4px_20px_rgba(201,168,76,0.35)]"
                  >
                    جرّب النسخة الكاملة مجاناً
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                </motion.div>

                {/* Share Strip */}
                <div className="flex items-center justify-center gap-3 mt-5 pt-5 border-t border-[#e2e4ed]">
                  <span className="text-xs text-[#3a3d4a] font-semibold">أعجبتك الأداة؟ شارك زملاءك:</span>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(whatsappShareText + "\n\n" + (typeof window !== "undefined" ? window.location.href : ""))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-4 py-2.5 rounded-xl no-underline hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle className="w-4 h-4" />
                    شارك عبر واتساب
                  </a>
                </div>

                {/* Try Again */}
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

        {/* ── SOCIAL PROOF CARDS ── */}
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          {[
            {
              icon: <Clock className="w-5 h-5 text-[#c9a84c]" />,
              title: "7 ثوانٍ بدلاً من ساعة",
              desc: "وكلاء عقاريون يوفّرون ساعات يومياً باستخدام صدى العقار",
            },
            {
              icon: <Globe className="w-5 h-5 text-[#c9a84c]" />,
              title: "بلهجة بلدك تماماً",
              desc: "محتوى مخصّص للسعودية والإمارات وقطر والكويت وكل دول الخليج",
            },
            {
              icon: <Target className="w-5 h-5 text-[#c9a84c]" />,
              title: "لكل منصة أسلوبها",
              desc: "واتساب، إنستغرام، تويتر، لينكدإن — كل محتوى مضبوط لجمهوره",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="bg-white border border-[#e2e4ed] rounded-xl p-4 flex-1 min-w-[200px] max-w-[300px] flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
              <div>
                <div className="text-sm font-bold text-[#0f1117] mb-1">{item.title}</div>
                <div className="text-xs text-[#3a3d4a] leading-relaxed">{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── TESTIMONIALS SECTION ── */}
      <section className="bg-white py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-[#0f1117] mb-3">
              كيف يُستخدم <span className="text-[#c9a84c]">صدى العقار</span>؟
            </h2>
            <p className="text-sm text-[#3a3d4a]">تجارب واقعية لأنماط تسويقية مختلفة</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="bg-[#f5f6fa] rounded-2xl p-5 border border-[#e2e4ed]"
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

      {/* ── CTA SECTION ── */}
      <section className="bg-[#0f1117] py-16 px-5 text-center relative overflow-hidden">
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[rgba(201,168,76,0.1)] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto relative z-10"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
            جاهز لتسويق عقاري <span className="text-[#c9a84c]">أسرع وأقنع</span>؟
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            جرّب الأداة المجانية الآن — أو انتقل للنسخة الكاملة واحصل على محتوى تسويقي شامل
            لكل عقاراتك
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                document.querySelector("header")?.scrollIntoView({ behavior: "smooth" });
                setTimeout(() => handleReset(), 500);
              }}
              className="bg-[#c9a84c] text-[#0f1117] font-black text-sm px-8 py-3.5 rounded-[14px] cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(201,168,76,0.45)] shadow-[0_4px_20px_rgba(201,168,76,0.35)] flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              جرّب الأداة المجانية
            </button>
            <a
              href="https://sada-elaqar.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="border-[1.5px] border-white/20 text-white font-bold text-sm px-8 py-3.5 rounded-[14px] no-underline hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              النسخة الكاملة
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mt-auto text-center py-6 px-5 text-xs text-[#aaa] border-t border-[#e2e4ed] bg-white">
        أداة مجانية من{" "}
        <a
          href="https://sada-elaqar.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#c9a84c] no-underline"
        >
          صدى العقار
        </a>{" "}
        — مساعد التسويق العقاري للسوق العربي
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

      {/* ── LEAD POPUP (after scroll) ── */}
      <AnimatePresence>
        {showLeadForm && !leadSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowLeadForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full relative"
            >
              <button
                onClick={() => setShowLeadForm(false)}
                className="absolute top-4 left-4 text-[#aaa] hover:text-[#0f1117] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-center mb-5">
                <div className="w-12 h-12 bg-[#c9a84c]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-[#c9a84c]" />
                </div>
                <h3 className="text-lg font-bold text-[#0f1117] mb-1">
                  🎁 احصل على وصول مبكر مجاناً
                </h3>
                <p className="text-xs text-[#3a3d4a]">
                  سجّل الآن واحصل على شهر كامل مجاناً عند إطلاق النسخة الكاملة
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={leadData.name}
                  onChange={(e) => handleLeadChange("name", e.target.value)}
                  placeholder="الاسم الكامل"
                  className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-xl py-3 px-4 focus:border-[#c9a84c] focus:bg-white transition-all font-[Cairo] outline-none"
                />
                <input
                  type="tel"
                  value={leadData.whatsapp}
                  onChange={(e) => handleLeadChange("whatsapp", e.target.value)}
                  placeholder="رقم الواتساب *"
                  className="w-full text-sm bg-[#f5f6fa] border-[1.5px] border-[#e2e4ed] rounded-xl py-3 px-4 focus:border-[#c9a84c] focus:bg-white transition-all font-[Cairo] outline-none"
                  dir="ltr"
                />
                <button
                  onClick={async () => {
                    if (!leadData.whatsapp) return;
                    try {
                      const res = await fetch("/api/capture-lead", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          ...leadData,
                          propType: formData.propType,
                          purpose: formData.purpose,
                          city: formData.city,
                        }),
                      });
                      const data = await res.json();
                      if (data.leadId) {
                        setLeadId(data.leadId);
                        setLeadSubmitted(true);
                        setShowLeadForm(false);
                      }
                    } catch {
                      // silently fail
                    }
                  }}
                  className="w-full bg-[#c9a84c] text-[#0f1117] font-black text-sm py-3 rounded-xl cursor-pointer transition-all hover:shadow-[0_8px_28px_rgba(201,168,76,0.45)] shadow-[0_4px_20px_rgba(201,168,76,0.35)]"
                >
                  🚀 سجّل واحصل على وصول مبكر
                </button>
              </div>
              <p className="text-center text-[10px] text-[#aaa] mt-3">
                🔒 بياناتك محفوظة بأمان
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Exit-intent trigger (simplified: show lead popup after 30s on page) ── */}
      <ExitIntentTrigger onTrigger={() => setShowLeadForm(true)} leadSubmitted={leadSubmitted} />
    </div>
  );
}

// ─── Exit Intent Component ─────────────────────────────────
function ExitIntentTrigger({
  onTrigger,
  leadSubmitted,
}: {
  onTrigger: () => void;
  leadSubmitted: boolean;
}) {
  useEffect(() => {
    if (leadSubmitted) return;

    // Show popup after 45 seconds if not submitted
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem("sada_popup_dismissed");
      if (!dismissed) {
        onTrigger();
      }
    }, 45000);

    // Also trigger on mouse leave (desktop exit intent)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 0 && !leadSubmitted) {
        const dismissed = sessionStorage.getItem("sada_popup_dismissed");
        if (!dismissed) {
          onTrigger();
        }
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [onTrigger, leadSubmitted]);

  return null;
}
