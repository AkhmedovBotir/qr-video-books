import { useEffect, useRef, useState } from 'react'
import { submitOrder } from './submitOrder.js'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Smartphone, Target, Sparkles, Home, Hash,
  Image, ScrollText, Puzzle, PenLine, Scissors, Sprout,
  Handshake, Send, Loader2, X,
  CheckCircle, ChevronDown, MessageSquare, Rocket,
  ArrowRight, Star, Calculator, QrCode, Video,
  BookMarked, Users, Zap, Award, PlayCircle, FileText,
  ChevronRight, Globe, Phone,
  BadgeCheck, Library, ShieldCheck, Printer, Building2,
  Hash as HashIcon, Barcode, FileCheck, BookCopy
} from 'lucide-react'

/* ── Animation helpers ─────────────────────────────── */
const fadeUp  = { hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0, transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] } } }
const stagger = (d = 0.1) => ({ hidden: {}, show: { transition: { staggerChildren: d } } })

function Reveal({ children, className = '', delay = 0 }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className}
      initial="hidden" animate={inView ? 'show' : 'hidden'} variants={fadeUp}
      transition={{ delay }}>
      {children}
    </motion.div>
  )
}

/* ── ORDER MODAL ───────────────────────────────────── */
function OrderModal({ open, onClose }) {
  const [form,     setForm]     = useState({ name: '', phone: '' })
  const [errors,   setErrors]   = useState({})
  const [sent,     setSent]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState('')

  function handlePhone(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 9)
    let fmt = ''
    if (raw.length > 0) fmt = raw.slice(0, 2)
    if (raw.length > 2) fmt += ' ' + raw.slice(2, 5)
    if (raw.length > 5) fmt += ' ' + raw.slice(5, 7)
    if (raw.length > 7) fmt += ' ' + raw.slice(7, 9)
    setForm(f => ({ ...f, phone: fmt }))
    setErrors(er => ({ ...er, phone: '' }))
    setApiError('')
  }

  function validate() {
    const errs = {}
    if (!form.name.trim())                         errs.name  = 'Ism familiyangizni kiriting'
    if (form.phone.replace(/\D/g, '').length < 9)  errs.phone = "To'liq telefon raqamini kiriting"
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setLoading(true)
    setApiError('')
    const phoneFull = `+998 ${form.phone}`.replace(/\s+/g, ' ').trim()
    try {
      await submitOrder({ name: form.name.trim(), phone: phoneFull })
      setSent(true)
    } catch (err) {
      setApiError(err.message || "Yuborishda xato. Internetni tekshirib qayta urinib ko'ring.")
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    onClose()
    setTimeout(() => {
      setForm({ name: '', phone: '' })
      setErrors({})
      setSent(false)
      setApiError('')
    }, 400)
  }

  function onBackdrop(e) { if (e.target === e.currentTarget) handleClose() }

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={onBackdrop}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl shadow-2xl shadow-slate-900/30 w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-7 pt-7 pb-6 relative">
              <button onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer border-0">
                <X size={16} />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
                <BookOpen size={24} className="text-white" />
              </div>
              <h2 className="font-display font-900 text-xl text-white leading-tight">
                Kitobni buyurtma qiling
              </h2>
              <p className="text-indigo-200 text-sm mt-1">
                Ma'lumotlaringizni qoldiring — tez orada bog'lanamiz
              </p>
            </div>

            {/* Body */}
            <div className="px-7 py-6">
              {!sent ? (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-800 text-slate-700 mb-1.5">
                      Ism Familiya
                    </label>
                    <div className={`flex rounded-xl border-2 overflow-hidden transition-colors
                      ${errors.name ? 'border-red-400' : 'border-slate-200 focus-within:border-indigo-500'}`}>
                      <div className="flex items-center px-3.5 bg-slate-50 border-r-2 border-inherit flex-shrink-0">
                        <Users size={16} className="text-slate-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Masalan: Alisher Karimov"
                        value={form.name}
                        onChange={e => {
                          setForm(f => ({ ...f, name: e.target.value }))
                          setErrors(er => ({ ...er, name: '' }))
                          setApiError('')
                        }}
                        className="flex-1 px-3.5 py-3 text-slate-800 text-sm font-600 outline-none bg-slate-50 focus:bg-white transition-colors placeholder:text-slate-300"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs font-700 mt-1.5 flex items-center gap-1">
                        <X size={11} /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-800 text-slate-700 mb-1.5">
                      Telefon raqam
                    </label>
                    <div className={`flex rounded-xl border-2 overflow-hidden transition-colors
                      ${errors.phone ? 'border-red-400' : 'border-slate-200 focus-within:border-indigo-500'}`}>
                      <div className="flex items-center gap-2 px-3.5 bg-indigo-50 border-r-2 border-inherit flex-shrink-0">
                        <span className="text-base leading-none">🇺🇿</span>
                        <span className="text-sm font-800 text-indigo-700 whitespace-nowrap">+998</span>
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="90 123 45 67"
                        value={form.phone}
                        onChange={handlePhone}
                        className="flex-1 px-3.5 py-3 text-slate-800 text-sm font-600 outline-none bg-slate-50 focus:bg-white transition-colors placeholder:text-slate-300"
                      />
                    </div>
                    {errors.phone
                      ? <p className="text-red-500 text-xs font-700 mt-1.5 flex items-center gap-1"><X size={11} /> {errors.phone}</p>
                      : <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1"><Phone size={11} /> Format: +998 90 123 45 67</p>
                    }
                  </div>

                  {apiError && (
                    <p className="text-red-600 text-sm font-700 leading-snug flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                      <X size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                      {apiError}
                    </p>
                  )}

                  {/* Submit */}
                  <motion.button
                    type="submit" whileTap={{ scale: 0.97 }} disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-800 text-base rounded-xl py-3.5 cursor-pointer border-0 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Yuborilmoqda...</>
                    ) : (
                      <><Send size={17} /> Buyurtma berish</>
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-slate-400 leading-relaxed">
                    Ma'lumotlaringiz faqat buyurtma uchun ishlatiladi
                  </p>
                </form>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 flex flex-col items-center gap-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 280 }}
                    className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle size={40} className="text-emerald-500" />
                  </motion.div>
                  <h3 className="font-display font-900 text-xl text-slate-800">Buyurtmangiz qabul qilindi!</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                    <strong className="text-slate-700">{form.name}</strong>, tez orada{' '}
                    <strong className="text-indigo-600">+998 {form.phone}</strong> raqamiga bog'lanamiz.
                  </p>
                  <button onClick={handleClose}
                    className="mt-2 bg-indigo-600 text-white font-800 rounded-xl px-6 py-3 cursor-pointer border-0 hover:bg-indigo-700 transition-colors">
                    Yopish
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── NAV ───────────────────────────────────────────── */
function Nav({ onOrder }) {
  const [scrolled, setScrolled] = useState(false)
  const [open,     setOpen]     = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const links = [
    ['Loyiha haqida',  '#mission'],
    ['Xususiyatlar',   '#features'],
    ['Qanday ishlaydi','#how'],
    ['Maqollar',       '#maqol'],
    ['Mualliflar',     '#authors'],
  ]

  return (
    <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/92 backdrop-blur-xl shadow-lg shadow-slate-100/60' : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <BookOpen size={18} className="text-white" />
          </div>
          <span className="font-display font-900 text-xl text-slate-800">
            Video-Books<span className="text-orange-500">.uz</span>
          </span>
        </a>

        <ul className="hidden lg:flex gap-7 list-none m-0 p-0">
          {links.map(([l, h]) => (
            <li key={h}>
              <a href={h} className="text-slate-500 hover:text-indigo-600 font-700 text-sm no-underline transition-colors">{l}</a>
            </li>
          ))}
        </ul>

        <button onClick={onOrder}
          className="hidden lg:inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-800 text-sm rounded-full px-5 py-2.5 border-0 cursor-pointer shadow-lg shadow-indigo-200 hover:-translate-y-0.5 hover:shadow-indigo-300 transition-all duration-200">
          Kitobni olish <ArrowRight size={14} />
        </button>

        <button onClick={() => setOpen(v => !v)}
          className="lg:hidden w-9 h-9 flex flex-col justify-center items-center gap-1.5 rounded-lg hover:bg-slate-100 transition-colors border-0 bg-transparent cursor-pointer">
          {[0,1,2].map(i => (
            <span key={i} className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300
              ${i===0&&open ? 'rotate-45 translate-y-2' : ''}
              ${i===1&&open ? 'opacity-0' : ''}
              ${i===2&&open ? '-rotate-45 -translate-y-2' : ''}`}/>
          ))}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
            exit={{ opacity:0, height:0 }} className="lg:hidden bg-white border-t border-slate-100 overflow-hidden">
            <div className="px-5 py-4 flex flex-col gap-3">
              {links.map(([l, h]) => (
                <a key={h} href={h} onClick={() => setOpen(false)}
                  className="text-slate-600 font-700 text-base no-underline hover:text-indigo-600 transition-colors flex items-center gap-2">
                  <ChevronRight size={14} className="text-indigo-400" /> {l}
                </a>
              ))}
              <button onClick={() => { setOpen(false); onOrder() }}
                className="mt-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-800 rounded-full py-3 border-0 cursor-pointer">
                <BookOpen size={16} /> Kitobni olish
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

/* ── HERO ──────────────────────────────────────────── */
function Hero({ onOrder }) {
  return (
    <section className="hero-bg min-h-screen flex items-center justify-center pt-24 pb-16 px-5 overflow-hidden relative">
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

        <motion.div variants={stagger(0.11)} initial="hidden" animate="show" className="flex flex-col">
          <motion.div variants={fadeUp}
            className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-xs font-800 w-fit mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
            Birinchi loyiha muvaffaqiyatli ishga tushdi!
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="font-display font-900 text-4xl sm:text-5xl xl:text-[3.4rem] leading-[1.1] text-slate-900 mb-5">
            <span className="text-indigo-600">Zamonaviy ta'lim</span><br/>
            <span className="shimmer-text">Aqlli bolalar</span> uchun
          </motion.h1>

          <motion.p variants={fadeUp} className="text-slate-500 text-lg leading-relaxed mb-8 max-w-xl">
            Video-Books.uz — bolalarning savodxonligini{' '}
            <strong className="text-slate-700">maqol, matematika, husnihat</strong> va
            interaktiv QR-videolar yordamida oshiradigan innovatsion platforma.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-10">
            <button onClick={onOrder}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-800 text-base rounded-full px-7 py-3.5 border-0 cursor-pointer shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all duration-200">
              <Rocket size={18} /> Buyurtma berish
            </button>
            <a href="#features"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 border-2 border-indigo-200 font-800 text-base rounded-full px-6 py-3 no-underline hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:-translate-y-0.5 transition-all duration-200">
              <BookOpen size={17} /> Xususiyatlar
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-6">
            {[
              { n:'40',   l:'Bet',        Icon: BookMarked },
              { n:'6',    l:"Yo'nalish",  Icon: Target     },
              { n:'5000', l:'Nusxa',      Icon: Printer    },
              { n:'3–7',  l:'Yosh',       Icon: Users      },
            ].map(({ n, l, Icon }) => (
              <div key={l} className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Icon size={13} className="text-indigo-400" />
                  <div className="font-display font-900 text-3xl text-indigo-600 leading-none">{n}</div>
                </div>
                <div className="text-xs font-700 text-slate-400">{l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Book cover */}
        <div className="flex justify-center items-center relative">
          <motion.div
            initial={{ opacity:0, scale:0.88, y:40 }} animate={{ opacity:1, scale:1, y:0 }}
            transition={{ duration:0.85, delay:0.3, ease:[0.22,1,0.36,1] }}
            className="animate-float relative">
            <img src="/cover.png" alt="Aqlli Bolajon kitob muqovasi"
              className="rounded-2xl shadow-2xl shadow-slate-400/40"
              style={{ width:300, height:'auto', maxHeight:420, objectFit:'contain' }} />
          </motion.div>

          {[
            { Icon: BadgeCheck, t:'Milliy kutubxona',      cls:'top-2 -right-4 lg:-right-16', d:0.85, c:'text-emerald-500' },
            { Icon: QrCode,     t:'QR → Video',            cls:'bottom-28 -left-4 lg:-left-16', d:1.05, c:'text-indigo-500' },
            { Icon: Barcode,    t:'ISBN: 978-9910-257-41-4', cls:'bottom-2 -right-4 lg:-right-12', d:1.2, c:'text-violet-500' },
          ].map(({ Icon, t, cls, d, c }) => (
            <motion.div key={t}
              initial={{ opacity:0, scale:0.6 }} animate={{ opacity:1, scale:1 }}
              transition={{ delay:d, duration:0.4, type:'spring', stiffness:270 }}
              className={`absolute hidden sm:flex items-center gap-2 bg-white rounded-2xl px-3.5 py-2.5 shadow-xl shadow-slate-200/80 font-700 text-xs text-slate-700 ${cls}`}>
              <Icon size={14} className={c} /> {t}
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 text-xs font-700">
        <span>Pastga aylantiring</span>
        <motion.div animate={{ y:[0,6,0] }} transition={{ repeat:Infinity, duration:1.4 }}>
          <ChevronDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ── INTRO ─────────────────────────────────────────── */
function Intro() {
  return (
    <section className="bg-gradient-to-r from-indigo-600 to-violet-700 py-14 px-5 overflow-hidden relative">
      <div className="absolute inset-0 opacity-10"
        style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}/>
      <div className="max-w-4xl mx-auto relative z-10">
        <Reveal className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={28} className="text-white" />
          </div>
          <blockquote className="text-white text-lg sm:text-xl leading-relaxed font-600 italic max-w-3xl mx-auto">
            "Hurmatli ota-onalar, <strong className="not-italic font-800">Aqlli bolajon</strong> mashqlar to'plami
            farzandingizning ilk matematik tushunchalarini shakllantirish,
            tafakkurini rivojlantirish va diqqatini jamlashga yordam beradi.
            Topshiriqlar oddiydan murakkabga qarab tuzilgan bo'lib, qiziqarli
            rasmlar va hayotiy misollar bilan boyitilgan."
          </blockquote>
          <p className="text-indigo-200 text-sm mt-4 font-700">— Mualliflardan</p>
        </Reveal>
      </div>
    </section>
  )
}

/* ── MISSION ───────────────────────────────────────── */
function Mission() {
  const cards = [
    { Icon: Target,      bg:'bg-indigo-50',  title:'Maqsadli yondashuv',    ic:'text-indigo-500',  desc:"Topshiriqlar oddiydan murakkabga — har bola o'z sur'atida o'rganadi, shoshirish yo'q." },
    { Icon: QrCode,      bg:'bg-emerald-50', title:'QR-Video texnologiyasi', ic:'text-emerald-500', desc:"Har sahifada QR-kod: telefon kamerasini yo'naltiring — darhol video-dars ochiladi." },
    { Icon: Sparkles,    bg:'bg-orange-50',  title:"Ko'p qirrali ta'lim",   ic:'text-orange-500',  desc:"Matematika, maqol, husnihat va topishmoqlar bir sahifada — doim yangi narsa." },
    { Icon: Home,        bg:'bg-violet-50',  title:"Oilaviy o'rganish",     ic:'text-violet-500',  desc:"To'g'ri javob emas — fikrlash jarayoni muhim. Ota-ona bilan birga ishlash rag'batlantiriladi." },
  ]
  return (
    <section className="bg-white py-20 lg:py-28 px-5" id="mission">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        <Reveal>
          <span className="inline-block bg-indigo-50 text-indigo-600 rounded-full px-4 py-1 text-xs font-800 mb-4">Bizning maqsad</span>
          <h2 className="font-display font-900 text-3xl sm:text-4xl xl:text-5xl text-slate-900 leading-tight mb-5">
            Kitob va texnologiyani <span className="text-indigo-600">birlashtiramiz</span>
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-4">
            Zamonaviy dunyo o'zgarmoqda. Biz bolalarni nafaqat kitob o'qishga, balki raqamli
            ko'nikmalarni rivojlantirishga, maqollar orqali milliy qadriyatlarni o'rganishga
            undaymiz — bularning barchasini <strong className="text-slate-700">bir sahifada</strong> jamlagan holda.
          </p>
          <p className="text-slate-500 text-lg leading-relaxed">
            Video-Books.uz platformasi har bir kitob sahifasiga mos QR-kodli video darsliklar
            bilan ta'lim jarayonini yanada qiziqarli qiladi.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show"
            viewport={{ once:true, margin:'-60px' }} className="flex flex-col gap-4">
            {cards.map(c => (
              <motion.div key={c.title} variants={fadeUp}
                className={`${c.bg} rounded-2xl p-5 flex items-start gap-4 card-lift cursor-default`}>
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <c.Icon size={22} className={c.ic} />
                </div>
                <div>
                  <h4 className="font-800 text-slate-800 text-base mb-1">{c.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}

/* ── FEATURES ──────────────────────────────────────── */
function Features() {
  const feats = [
    { n:'01', Icon: Calculator, bg:'bg-indigo-50',  cls:'f1', ic:'text-indigo-500',  title:'Matematika mashqlari',    desc:"Qo'shish va ayirish misollari (2+1+1 dan 7+8 gacha). Rasmli savollar orqali bolalar sanashni hayotiy misolda o'rganadi." },
    { n:'02', Icon: Image,      bg:'bg-emerald-50', cls:'f2', ic:'text-emerald-500', title:'Rasmli savollar',         desc:"Ayiq sharlari, cho'pon qo'ylari, Karlson bankalari... 28+ turli rasmdan sonni sanash ko'nikmasini rivojlantiradi." },
    { n:'03', Icon: ScrollText, bg:'bg-orange-50',  cls:'f3', ic:'text-orange-500',  title:"O'zbek maqollari",        desc:'"Yetti o\'lchab bir kes", "Birni kessen o\'nni ek", "Bir mayizni qirq kishi bo\'lib yer" — 3 ta milliy maqol.' },
    { n:'04', Icon: Puzzle,     bg:'bg-violet-50',  cls:'f4', ic:'text-violet-500',  title:'Topishmoqlar',            desc:"Barmoqlar, Oyoqlar, Piyoz — 3 ta topishmoq. Mantiqiy fikrlash va lisoniy rivojlanishga yordam beradi." },
    { n:'05', Icon: QrCode,     bg:'bg-sky-50',     cls:'f5', ic:'text-sky-500',     title:'QR-Video darslar',        desc:"Har sahifada \"Skanerlang\" QR kodi. Telefon kamerasini yo'naltiring — darhol mavzuga mos video ochiladi." },
    { n:'06', Icon: PenLine,    bg:'bg-rose-50',    cls:'f6', ic:'text-rose-500',    title:'Husnihat & Ketma-ketlik', desc:"Chiroyli yozuv sahifalari + son ketma-ketligini to'ldirish + katta-kichik belgilarini (<>=) qo'yish." },
  ]
  return (
    <section className="bg-gradient-to-br from-slate-50 to-indigo-50/40 py-20 lg:py-28 px-5" id="features">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-14">
          <span className="inline-block bg-indigo-50 text-indigo-600 rounded-full px-4 py-1 text-xs font-800 mb-4">Aqlli Bolajon — Asosiy xususiyatlar</span>
          <h2 className="font-display font-900 text-3xl sm:text-4xl xl:text-5xl text-slate-900 leading-tight mb-4">
            Bir kitobda — <span className="text-indigo-600">olti yo'nalish</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            40 betlik "Aqlli Bolajon" — faqat matematika emas, balki to'liq ta'lim tizimi.
          </p>
        </Reveal>
        <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show"
          viewport={{ once:true, margin:'-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {feats.map(f => (
            <motion.div key={f.n} variants={fadeUp}
              className={`${f.bg} ${f.cls} relative rounded-2xl p-7 card-lift cursor-default border border-white/80 overflow-hidden grad-border-top`}>
              <span className="absolute top-4 right-5 font-display font-900 text-5xl text-slate-900/[0.04] select-none">{f.n}</span>
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5">
                <f.Icon size={26} className={f.ic} />
              </div>
              <h3 className="font-800 text-slate-800 text-lg mb-2.5">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ── HOW IT WORKS ──────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n:1, Icon: BookOpen,   bg:'bg-indigo-50 border-indigo-100',   ic:'text-indigo-500',  title:'Kitobni oling',       desc:'40 betlik "Aqlli Bolajon" kitobini buyurtma bering.' },
    { n:2, Icon: Target,     bg:'bg-emerald-50 border-emerald-100', ic:'text-emerald-500', title:'Sahifani oching',     desc:"Har sahifada matematika, maqol yoki topishmoq topshirig'i bor." },
    { n:3, Icon: QrCode,     bg:'bg-orange-50 border-orange-100',   ic:'text-orange-500',  title:'QR ni skaner qiling', desc:"Telefon kamerasini QR-kodga yo'naltiring — video ochiladi." },
    { n:4, Icon: Award,      bg:'bg-violet-50 border-violet-100',   ic:'text-violet-500',  title:"O'rganing!",          desc:"Video ko'ring, topshiriqni bajaring, bilimni mustahkamlang." },
  ]
  return (
    <section className="bg-gradient-to-br from-slate-50 to-indigo-50/30 py-20 lg:py-28 px-5" id="how">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-14">
          <span className="inline-block bg-indigo-50 text-indigo-600 rounded-full px-4 py-1 text-xs font-800 mb-4">Qanday ishlaydi?</span>
          <h2 className="font-display font-900 text-3xl sm:text-4xl xl:text-5xl text-slate-900 leading-tight mb-4">
            To'rt qadam — <span className="text-indigo-600">cheksiz bilim</span>
          </h2>
        </Reveal>
        <div className="relative">
          <div className="hidden lg:block step-connector" />
          <motion.div variants={stagger(0.15)} initial="hidden" whileInView="show"
            viewport={{ once:true, margin:'-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative">
            {steps.map(s => (
              <motion.div key={s.n} variants={fadeUp}
                className="flex flex-col items-center text-center px-2 relative z-10">
                <div className={`relative w-20 h-20 rounded-full border-2 ${s.bg} flex items-center justify-center mb-5 shadow-lg`}>
                  <s.Icon size={32} className={s.ic} />
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-600 text-white rounded-full text-xs font-900 flex items-center justify-center">{s.n}</span>
                </div>
                <h4 className="font-800 text-slate-800 text-base mb-2">{s.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ── MAQOL SECTION ─────────────────────────────────── */
function MaqolSection() {
  const maqollar = [
    { Icon: Scissors, ic:'text-indigo-300', text:"Yetti o'lchab bir kes",             sub:"Har qanday ishni qilishdan oldin yaxshilab o'ylab ko'r — ehtiyotkorlikni o'rgatadi.", bet:18 },
    { Icon: Sprout,   ic:'text-emerald-300', text:"Birni kessen o'nni ek",            sub:"Tabiatga va insonlarga yaxshilik qil, ko'payib qaytadi — saxiylikni o'rgatadi.",       bet:23 },
    { Icon: Handshake,ic:'text-violet-300',  text:"Bir mayizni qirq kishi bo'lib yer",sub:"Hamjihatlikda kichik ne'mat ham yetarli bo'ladi — birlikni o'rgatadi.",               bet:28 },
  ]
  return (
    <section className="bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 py-20 lg:py-28 px-5 relative overflow-hidden" id="maqol">
      <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal className="text-center mb-14">
          <span className="inline-block bg-white/20 text-white rounded-full px-4 py-1 text-xs font-800 mb-4">Milliy qadriyatlar</span>
          <h2 className="font-display font-900 text-3xl sm:text-4xl xl:text-5xl text-white leading-tight mb-4">
            O'zbek maqollari — bolalar uchun
          </h2>
          <p className="text-indigo-200 text-lg max-w-xl mx-auto leading-relaxed">
            Kitobdagi 3 ta milliy maqol — bola bolaligidan ezgu qadriyatlarni o'zlashtiradi.
          </p>
        </Reveal>
        <motion.div variants={stagger(0.12)} initial="hidden" whileInView="show"
          viewport={{ once:true, margin:'-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {maqollar.map(m => (
            <motion.div key={m.text} variants={fadeUp} whileHover={{ y:-5 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-7 cursor-default">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                  <m.Icon size={24} className={m.ic} />
                </div>
                <span className="text-xs text-indigo-300 font-700 bg-white/10 rounded-full px-2.5 py-1">Bet {m.bet}</span>
              </div>
              <h3 className="font-display font-800 text-xl text-white mb-3 leading-tight">"{m.text}"</h3>
              <p className="text-indigo-200 text-sm leading-relaxed mb-3">{m.sub}</p>
              <div className="text-indigo-300 text-xs font-700">O'zbek xalq maqoli</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ── AUTHORS ───────────────────────────────────────── */
function Authors() {
  const authors = [
    {
      photo: '/Botir.png',
      name: 'Akhmedov Botir',
      role: 'Loyiha muallifi',
      bio: 'IT sohasida koʻp qirrali mutaxassis: dasturlash, mahsulot dizayni va kontentni birlashtirish bo‘yicha tajribaga ega. «Aqlli Bolajon» loyihasida kitob tuzilmasi, veb-ilova va vizual dizayn yo‘nalishlarida asosiy hissa qoʻshgan.',
      page: 1,
      side: 'left',
      badge: 'bg-indigo-50 text-indigo-600',
      betColor: 'text-indigo-400',
    },
    {
      photo: '/Juratali.png',
      name: "Muhammadkarimov Jur'atali",
      role: 'Loyiha muallifi',
      bio: "Muhammad al-Xorazmiy nomidagi ixtisoslashtirilgan maktabining Andijon filialida 6-A sinfida oʻqiydi. Loyihada g'oyalar bilan ishtirok etgan, kitob va materiallar uchun chizma va tasviriy qismni tayyorlashda yordam bergan.",
      page: 2,
      side: 'right',
      badge: 'bg-violet-50 text-violet-600',
      betColor: 'text-violet-400',
    },
  ]

  return (
    <section className="bg-gradient-to-br from-slate-50 to-indigo-50/30 py-16 lg:py-24 px-5 overflow-hidden" id="authors">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 rounded-full px-4 py-1 text-xs font-800 mb-4">
            <BookOpen size={13} /> Loyiha mualliflari
          </span>
          <h2 className="font-display font-900 text-3xl sm:text-4xl xl:text-5xl text-slate-900 leading-tight mb-3">Kim yaratdi?</h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Har bir muallif — kitobning alohida beti kabi. Ochib o‘qing.
          </p>
        </Reveal>

        <motion.div variants={stagger(0.12)} initial="hidden" whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="author-book-spread flex-col md:flex-row w-full items-stretch">
          <div className="author-book-spine" aria-hidden="true" />

          {authors.map(a => (
            <motion.div key={a.name} variants={fadeUp}
              className={`author-book-page author-book-page--${a.side} flex flex-col items-center text-center`}>
              <div className={`absolute top-4 ${a.side === 'left' ? 'left-4 sm:left-5' : 'right-4 sm:right-5'} flex items-center gap-1.5`}>
                <span className={`text-[10px] font-800 uppercase tracking-widest ${a.betColor}`}>Bet</span>
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-xs font-900 flex items-center justify-center shadow-sm">
                  {a.page}
                </span>
              </div>

              <div className="author-photo-frame w-32 h-32 sm:w-36 sm:h-36 mt-6 mb-4 flex-shrink-0">
                <img src={a.photo} alt={a.name} className="w-full h-full rounded-full object-cover object-top bg-white" />
              </div>

              <h3 className="font-display font-900 text-base sm:text-lg text-slate-900 mb-1.5 leading-snug px-1">{a.name}</h3>
              <span className={`inline-block ${a.badge} rounded-full px-3 py-0.5 text-[11px] font-800 mb-3`}>{a.role}</span>
              <p className="text-slate-500 text-sm leading-relaxed px-3 sm:px-6 lg:px-8 flex-1 max-w-md mx-auto">{a.bio}</p>

              <div className={`mt-4 pt-3 border-t border-indigo-100/80 w-full flex items-center justify-center gap-1.5 ${a.betColor}`}>
                <PenLine size={12} />
                <span className="text-[10px] font-700 uppercase tracking-wider">Muallif {a.page}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ── OFFICIAL DOCS ─────────────────────────────────── */
function OfficialDocs() {
  const [lightboxSrc, setLightboxSrc] = useState(null)

  useEffect(() => {
    if (!lightboxSrc) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxSrc(null)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [lightboxSrc])

  return (
    <section className="bg-gradient-to-br from-slate-50 to-indigo-50/30 py-20 lg:py-28 px-5" id="docs">
      <div className="max-w-5xl mx-auto">

        <Reveal className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-full px-4 py-1 text-xs font-800 mb-4">
            <BadgeCheck size={13} /> Rasmiy hujjatlar bilan tasdiqlangan
          </span>
          <h2 className="font-display font-900 text-3xl sm:text-4xl text-slate-900 leading-tight mb-3">
            Davlat tomonidan <span className="text-emerald-600">tasdiqlangan</span>
          </h2>
          <p className="text-slate-500 text-base max-w-lg mx-auto leading-relaxed">
            "Aqlli Bolajon" O'zbekiston Milliy kutubxonasi va ISBN tizimida rasmiy ro'yxatdan o'tgan kitob.
          </p>
        </Reveal>

        <motion.div
          variants={stagger(0.15)} initial="hidden" whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* ─── CARD 1: Kutubxona klassifikatsiya ─── */}
          <motion.div variants={fadeUp}
            className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden card-lift">

            {/* Doc header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <Library size={15} className="text-white" />
                  </div>
                  <span className="text-white/80 text-xs font-700">my.gov.uz</span>
                </div>
                <span className="text-white/60 text-[10px] font-600">2026-05-18 · 14:41</span>
              </div>
              <h3 className="text-white font-display font-800 text-sm leading-snug">
                Nashrlarga kutubxona klassifikatsiya indekslarini berish
              </h3>
              <div className="mt-1 text-indigo-200 text-[11px] font-600">
                O'zbekiston Milliy kutubxonasi
              </div>
            </div>

            {/* Doc body — faqat to'liq hujjat rasmi (bosilganda to'liq ekran) */}
            <div className="bg-slate-50/80">
              <button
                type="button"
                onClick={() => setLightboxSrc('/1.png')}
                className="group relative w-full cursor-zoom-in border-0 bg-transparent p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                aria-label="Ma'lumotnomani to'liq ekranda ochish"
              >
                <motion.img
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  src="/1.png"
                  alt="Kutubxona klassifikatsiya indekslari bo'yicha my.gov.uz ma'lumotnomasi"
                  className="pointer-events-none w-full h-auto block transition-opacity group-hover:opacity-95"
                  loading="lazy"
                  draggable={false}
                />
                <span className="pointer-events-none absolute bottom-2 right-2 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-800 text-white opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                  Kattalashtirish
                </span>
              </button>
            </div>

            {/* Footer badge */}
            <div className="flex items-center gap-2 bg-emerald-50 rounded-b-3xl px-5 py-3 border-t border-emerald-100/80">
              <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
              <span className="text-emerald-700 text-xs font-800">Davlat organlari tomonidan tasdiqlangan</span>
            </div>
          </motion.div>

          {/* ─── CARD 2: ISBN ─── */}
          <motion.div variants={fadeUp}
            className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden card-lift">

            {/* Doc header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <Barcode size={15} className="text-white" />
                  </div>
                  <span className="text-white/80 text-xs font-700">my.gov.uz</span>
                </div>
                <span className="text-white/60 text-[10px] font-600">2026-05-18 · 10:56</span>
              </div>
              <h3 className="text-white font-display font-800 text-sm leading-snug">
                Nashrlarga kitobning ISBN xalqaro standart tartib raqamini berish
              </h3>
              <div className="mt-1 text-violet-200 text-[11px] font-600">
                O'zbekiston Milliy kutubxonasi
              </div>
            </div>

            {/* Doc body — faqat to'liq hujjat rasmi (bosilganda to'liq ekran) */}
            <div className="bg-slate-50/80">
              <button
                type="button"
                onClick={() => setLightboxSrc('/2.png')}
                className="group relative w-full cursor-zoom-in border-0 bg-transparent p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                aria-label="Ma'lumotnomani to'liq ekranda ochish"
              >
                <motion.img
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  src="/2.png"
                  alt="ISBN xalqaro tartib raqami berilganligi to'g'risidagi my.gov.uz ma'lumotnomasi"
                  className="pointer-events-none w-full h-auto block transition-opacity group-hover:opacity-95"
                  loading="lazy"
                  draggable={false}
                />
                <span className="pointer-events-none absolute bottom-2 right-2 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-800 text-white opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                  Kattalashtirish
                </span>
              </button>
            </div>

            {/* Footer badge */}
            <div className="flex items-center gap-2 bg-emerald-50 rounded-b-3xl px-5 py-3 border-t border-emerald-100/80">
              <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
              <span className="text-emerald-700 text-xs font-800">Davlat organlari tomonidan tasdiqlangan</span>
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {lightboxSrc && (
            <motion.div
              key={lightboxSrc}
              role="dialog"
              aria-modal="true"
              aria-label="Hujjat rasmi"
              className="fixed inset-0 z-[220] flex items-center justify-center bg-black/90 p-3 sm:p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLightboxSrc(null)}
            >
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.05 }}
                className="absolute right-3 top-3 z-[221] flex h-11 w-11 items-center justify-center rounded-full border-0 bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Yopish"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxSrc(null)
                }}
              >
                <X size={22} strokeWidth={2.25} />
              </motion.button>
              <motion.img
                src={lightboxSrc}
                alt={
                  lightboxSrc === '/1.png'
                    ? 'Kutubxona klassifikatsiya indekslari bo\'yicha my.gov.uz ma\'lumotnomasi'
                    : 'ISBN xalqaro tartib raqami berilganligi to\'g\'risidagi my.gov.uz ma\'lumotnomasi'
                }
                className="max-h-[100dvh] max-w-full object-contain shadow-2xl"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                draggable={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* my.gov.uz verification strip */}
        <Reveal className="mt-7">
          <div className="flex flex-wrap items-center gap-3 justify-center bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm">
            <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <div className="text-sm font-800 text-slate-700">
                Hujjatlar <span className="text-indigo-600">my.gov.uz</span> — Yagona interaktiv davlat xizmatlari portalida tasdiqlangan
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Haqiqiyligini <span className="text-indigo-500 font-700">repo.gov.uz</span> veb-saytida hujjat noyob raqamini kiritib tekshirish mumkin
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  )
}

/* ── CTA ───────────────────────────────────────────── */
function CTA({ onOrder }) {
  return (
    <section className="relative py-24 px-5 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950" id="cta">
      <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-600/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <Reveal className="max-w-2xl mx-auto text-center relative z-10">
        <span className="inline-block bg-white/10 text-white rounded-full px-4 py-1 text-xs font-800 mb-6">Hoziroq boshlang</span>
        <h2 className="font-display font-900 text-3xl sm:text-4xl xl:text-5xl text-white leading-tight mb-5">
          Farzandingiz uchun<br/>eng yaxshi boshlang'ich
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed mb-10">
          "Aqlli Bolajon" — matematika, maqol, husnihat va video-darslarni birlashtirgan
          40 betlik interaktiv mashqlar to'plami. Hoziroq buyurtma bering!
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <motion.button onClick={onOrder} whileHover={{ scale:1.04, y:-3 }} whileTap={{ scale:0.97 }}
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-800 text-base rounded-full px-8 py-4 border-0 cursor-pointer shadow-2xl shadow-black/20">
            <BookOpen size={19} /> Kitobni buyurtma qiling
          </motion.button>
          <motion.a href="#features" whileHover={{ scale:1.04, y:-3 }} whileTap={{ scale:0.97 }}
            className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/30 font-800 text-base rounded-full px-7 py-4 no-underline hover:bg-white/20 transition-colors">
            <Sparkles size={17} /> Ko'proq ma'lumot
          </motion.a>
        </div>
      </Reveal>
    </section>
  )
}

/* ── FOOTER ────────────────────────────────────────── */
function Footer({ onOrder }) {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-14 pb-8 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <BookOpen size={16} className="text-white" />
              </div>
              <span className="font-display font-900 text-lg text-white">Video-Books.uz</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs mb-4">
              Bolalarning savodxonligini maqol, matematika, husnihat va zamonaviy
              video-darslar yordamida oshiradigan innovatsion platforma.
            </p>
            {/* Official badges */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Barcode size={13} className="text-violet-400 flex-shrink-0" />
                <span>ISBN: <span className="text-slate-300 font-700">978-9910-257-41-4</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Building2 size={13} className="text-sky-400 flex-shrink-0" />
                <span>Nashriyot: <span className="text-slate-300 font-700">ILM-ZIYO-ZAKOVAT MChJ</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <BadgeCheck size={13} className="text-emerald-400 flex-shrink-0" />
                <span>O'zbekiston Milliy kutubxonasi ro'yxatida</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-800 text-sm mb-4">Platforma</h4>
            <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
              {[
                ['Loyiha haqida', '#mission'],
                ['Xususiyatlar',  '#features'],
                ['Qanday ishlaydi','#how'],
                ['Mualliflar',    '#authors'],
              ].map(([l, h]) => (
                <li key={h}>
                  <a href={h} className="text-sm no-underline hover:text-white transition-colors flex items-center gap-1.5">
                    <ChevronRight size={12} className="text-indigo-500" /> {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-800 text-sm mb-4">Aqlli Bolajon</h4>
            <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
              <li>
                <button onClick={onOrder}
                  className="text-sm hover:text-white transition-colors bg-transparent border-0 cursor-pointer text-slate-400 p-0 flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-indigo-500" /> Kitobni buyurtma qiling
                </button>
              </li>
              {[['QR-Videolar','#'],['Maqollar','#maqol'],["Bog'lanish",'#']].map(([l, h]) => (
                <li key={l}>
                  <a href={h} className="text-sm no-underline hover:text-white transition-colors flex items-center gap-1.5">
                    <ChevronRight size={12} className="text-indigo-500" /> {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 text-xs text-slate-500 text-center">
          © 2026 <span className="text-indigo-400 font-800">Video-Books.uz</span> — Barcha huquqlar himoyalangan
        </div>
      </div>
    </footer>
  )
}

/* ── ROOT ──────────────────────────────────────────── */
export default function App() {
  const [orderOpen, setOrderOpen] = useState(false)
  const openOrder  = () => setOrderOpen(true)
  const closeOrder = () => setOrderOpen(false)

  return (
    <>
      <OrderModal open={orderOpen} onClose={closeOrder} />
      <Nav      onOrder={openOrder} />
      <Hero     onOrder={openOrder} />
      <Intro />
      <Mission />
      <Features />
      <HowItWorks />
      <MaqolSection />
      <Authors />
      <OfficialDocs />
      <CTA      onOrder={openOrder} />
      <Footer   onOrder={openOrder} />
    </>
  )
}
