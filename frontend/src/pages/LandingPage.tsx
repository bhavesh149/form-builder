import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Shield, ArrowRight, Zap, Layers, GitBranch, BarChart3,
  CheckCircle2, Sparkles, MousePointerClick, Send, Eye,
  ChevronRight, Github, Twitter, Globe,
  Type, Hash, ChevronDown, Users, Lock, FileCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── tiny reusable fade-in wrapper ─── */
function FadeIn({
  children,
  className,
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const dirs = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── data ─── */
const FEATURES = [
  {
    icon: Layers,
    title: 'Drag & Drop Builder',
    desc: 'Build complex safety forms visually — drag fields from the palette, reorder with ease, and preview in real time.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    ring: 'ring-blue-100',
  },
  {
    icon: GitBranch,
    title: 'Smart Logic Engine',
    desc: 'Conditional visibility, dynamic requirements, and highlight rules — your forms adapt based on field values.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    ring: 'ring-purple-100',
  },
  {
    icon: Zap,
    title: 'Dynamic Data Sources',
    desc: 'Connect dropdowns to live API endpoints like branches and sites. Always up-to-date, zero manual work.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    ring: 'ring-amber-100',
  },
  {
    icon: BarChart3,
    title: 'Submissions & Analytics',
    desc: 'Capture, validate, and review form responses with built-in versioning and CSV export.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
  },
  {
    icon: Users,
    title: 'Respondent Identity',
    desc: 'Optionally collect name and email from respondents for full accountability and follow-up.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    ring: 'ring-rose-100',
  },
  {
    icon: Lock,
    title: 'Server-Side Validation',
    desc: 'Every submission is validated against the schema — required fields, data types, and option lists.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    ring: 'ring-cyan-100',
  },
];

const STEPS = [
  {
    icon: MousePointerClick,
    title: 'Design Your Form',
    desc: 'Use the visual builder to add text inputs, dropdowns, radios, file uploads, and more.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Eye,
    title: 'Preview & Publish',
    desc: 'Preview your form live, tweak logic rules, then publish with a single click to get a shareable link.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Send,
    title: 'Collect & Review',
    desc: 'Respondents fill in the form from any device. Submissions are validated and stored for your review.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
];

const STATS = [
  { value: '10x', label: 'Faster form creation' },
  { value: '100%', label: 'Server-side validation' },
  { value: '∞', label: 'Custom logic rules' },
  { value: '0', label: 'Paper forms needed' },
];

const PALETTE_ITEMS = [
  { label: 'Text Input', color: 'bg-blue-500', icon: Type },
  { label: 'Number', color: 'bg-emerald-500', icon: Hash },
  { label: 'Dropdown', color: 'bg-purple-500', icon: ChevronDown },
  { label: 'File Upload', color: 'bg-rose-500', icon: FileCheck },
];

const CANVAS_FIELDS = [
  { label: 'Inspector Name', type: 'Text', accent: 'border-l-blue-400' },
  { label: 'Site Branch', type: 'Dropdown', accent: 'border-l-purple-400' },
  { label: 'Depth Level', type: 'Number', accent: 'border-l-emerald-400' },
  { label: 'Upload Evidence', type: 'File', accent: 'border-l-rose-400' },
];

/* ─── page ─── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold text-slate-900 tracking-tight">Safety Engine</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#features" className="transition-colors hover:text-slate-900">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-slate-900">How it works</a>
            <a href="#cta" className="transition-colors hover:text-slate-900">Get Started</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-md hover:shadow-primary/30"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute top-40 right-1/4 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
          <div className="absolute bottom-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-50/50 blur-3xl" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="mx-auto max-w-5xl px-5 sm:px-8 text-center"
        >
          <FadeIn>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Dynamic Safety Form Engine
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Build Safety Forms
              <br />
              <span style={{ background: 'linear-gradient(135deg, #d4b581 0%, #c48b3c 50%, #d4b581 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                That Think
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-slate-500 leading-relaxed">
              Design dynamic checklists with conditional logic, connect to live data sources,
              and capture validated responses — all from a beautiful drag-and-drop interface.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="group flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                Start Building Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="group flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
              >
                Sign In
                <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </FadeIn>

          {/* Hero visual — detailed form builder mockup */}
          <FadeIn delay={0.4}>
            <div className="relative mx-auto mt-14 sm:mt-18 max-w-4xl">
              <div className="absolute -inset-6 rounded-3xl bg-primary/6 blur-2xl" />
              <motion.div
                className="relative rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/40 overflow-hidden"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              >
                {/* Toolbar */}
                <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex items-center gap-2 ml-3 text-xs">
                    <span className="font-bold text-slate-700">Safety Inspection Form</span>
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">PUBLISHED</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">JSON</div>
                    <div className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">Logic</div>
                    <div className="rounded-md bg-primary px-2.5 py-1 text-[10px] font-bold text-white">Publish</div>
                  </div>
                </div>

                {/* 3-panel builder */}
                <div className="flex" style={{ height: 320 }}>
                  {/* Palette */}
                  <div className="w-40 sm:w-48 border-r border-slate-100 bg-slate-50/50 p-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 px-1">Field Types</p>
                    <div className="space-y-1.5">
                      {PALETTE_ITEMS.map((item, i) => (
                        <motion.div
                          key={i}
                          className={cn(
                            'flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-default',
                            i === 0 ? 'bg-white shadow-sm ring-1 ring-primary/20' : 'hover:bg-white/60'
                          )}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                        >
                          <div className={cn('h-6 w-6 rounded-md flex items-center justify-center', item.color)}>
                            <item.icon className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-600">{item.label}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/60">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">Settings</p>
                      <div className="flex items-center gap-2 px-1">
                        <div className="h-4 w-7 rounded-full bg-primary relative">
                          <div className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow-sm" />
                        </div>
                        <span className="text-[10px] font-medium text-slate-500">Collect ID</span>
                      </div>
                    </div>
                  </div>

                  {/* Canvas */}
                  <div className="flex-1 bg-slate-50/30 p-4 overflow-hidden">
                    <div className="space-y-2.5">
                      {CANVAS_FIELDS.map((field, i) => (
                        <motion.div
                          key={i}
                          className={cn(
                            'rounded-lg border bg-white p-3 border-l-[3px]',
                            field.accent,
                            i === 0 ? 'border-slate-300 ring-2 ring-primary/15 shadow-sm' : 'border-slate-200'
                          )}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.0 + i * 0.1, duration: 0.5 }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-slate-700">{field.label}</span>
                            <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{field.type}</span>
                          </div>
                          <div className="h-7 rounded-md bg-slate-50 border border-slate-100" />
                        </motion.div>
                      ))}
                      {/* Logic rule indicator */}
                      <motion.div
                        className="flex items-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50/60 px-3 py-2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.6, duration: 0.5 }}
                      >
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-[10px] font-semibold text-amber-700">IF Depth ≥ 4 → SHOW Upload Evidence</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Config panel */}
                  <div className="hidden sm:block w-44 border-l border-slate-100 bg-white p-3">
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Settings</p>
                    </div>
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.3, duration: 0.5 }}
                    >
                      <div>
                        <p className="text-[10px] font-medium text-slate-500 mb-1">Label</p>
                        <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700">Inspector Name</div>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-slate-500 mb-1">Field Key</p>
                        <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] font-mono text-slate-500">inspector_name</div>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-slate-500 mb-1">Placeholder</p>
                        <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-400">Enter name...</div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                        <span className="text-[10px] font-semibold text-slate-600">Required</span>
                        <div className="h-4 w-7 rounded-full bg-primary relative">
                          <div className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow-sm" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </motion.div>
      </section>

      {/* ── Trusted by strip ── */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-12 sm:py-14">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <FadeIn>
            <div className="text-center mb-14 sm:mb-20">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Features</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Everything You Need
              </h2>
              <p className="mt-4 mx-auto max-w-xl text-base text-slate-500">
                From drag-and-drop building to conditional logic — create safety forms
                that are smarter than spreadsheets.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {FEATURES.map((feat, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.25 } }}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm transition-shadow hover:shadow-lg h-full"
                >
                  <div className={cn('mb-4 flex h-11 w-11 items-center justify-center rounded-xl ring-1', feat.bg, feat.ring)}>
                    <feat.icon className={cn('h-5 w-5', feat.color)} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{feat.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                  <div className="absolute top-6 right-6 opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50 border-y border-slate-100">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <FadeIn>
            <div className="text-center mb-14 sm:mb-20">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Three Simple Steps
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {STEPS.map((step, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="text-center">
                  <div className="relative mx-auto mb-6 w-fit">
                    <motion.div
                      className={cn('flex h-16 w-16 items-center justify-center rounded-2xl shadow-md', step.bg)}
                      whileHover={{ scale: 1.08, rotate: 2 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <step.icon className={cn('h-7 w-7', step.color)} />
                    </motion.div>
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-md ring-2 ring-white">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Connecting visual for desktop */}
          <div className="hidden md:flex items-center justify-center mt-12 gap-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  'h-1.5 rounded-full',
                  i === 1 ? 'w-40 bg-primary/30' : 'w-24 bg-slate-200'
                )}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.2, duration: 0.6 }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Safety Engine ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <FadeIn direction="right">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Why Safety Engine</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
                  Replace paper checklists with intelligent digital forms
                </h2>
                <div className="space-y-4">
                  {[
                    'Conditional fields that adapt to user input',
                    'Backend validation ensures data integrity',
                    'Form versioning keeps a full audit trail',
                    'Respondent identity collection for accountability',
                    'Works on any device — desktop, tablet, mobile',
                    'One-click publish with shareable public links',
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600 leading-relaxed">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="left">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" />
                <div className="relative rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Safety Inspection</p>
                      <p className="text-xs text-slate-400">v2 &middot; Published</p>
                    </div>
                    <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">LIVE</span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Inspector Name', filled: 'Jane Cooper' },
                      { label: 'Site Branch', filled: 'HQ — New York' },
                      { label: 'Inspection Depth', filled: '6' },
                    ].map((f, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.12 }}
                      >
                        <p className="text-xs font-medium text-slate-500 mb-1">{f.label}</p>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                          {f.filled}
                        </div>
                      </motion.div>
                    ))}
                    <motion.div
                      className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 p-3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7 }}
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-700">
                          Logic: Depth ≥ 4 → Video evidence required
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 sm:px-16 sm:py-20 text-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-40 w-80 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

              <div className="relative">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  Ready to Build Smarter Forms?
                </h2>
                <p className="mt-4 mx-auto max-w-lg text-base text-slate-400 leading-relaxed">
                  Join teams using Safety Engine to digitize inspections, enforce compliance,
                  and capture validated data — no code required.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/register"
                    className="group flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Create Free Account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:-translate-y-0.5"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-sm font-bold text-slate-900">Safety Engine</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
              <Link to="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
            </div>
            <div className="flex items-center gap-4">
              {[Github, Twitter, Globe].map((Icon, i) => (
                <a key={i} href="#" className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} Safety Engine. Built with React, FastAPI &amp; Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
