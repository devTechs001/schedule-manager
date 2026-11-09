import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaBolt,
  FaBrain,
  FaCalendarAlt,
  FaCheck,
  FaChevronDown,
  FaClock,
  FaEnvelope,
  FaLayerGroup,
  FaLock,
  FaMoon,
  FaRobot,
  FaSearch,
  FaStar,
  FaSyncAlt,
  FaUsers,
} from 'react-icons/fa';
import ProductPreview from '@components/public/ProductPreview';
import DemoLoginButton from '@components/public/DemoLoginButton';

const FEATURES = [
  {
    icon: FaBrain,
    title: 'AI that actually plans',
    body: 'Describe your week in plain language. SchedAI turns it into tasks, events and focus blocks — then keeps them in sync.',
  },
  {
    icon: FaCalendarAlt,
    title: 'One smart calendar',
    body: 'Meetings, deadlines and deep work live together. Conflicts are detected and suggested fixes are one tap away.',
  },
  {
    icon: FaEnvelope,
    title: 'Inbox → action items',
    body: 'Turn any email into a scheduled task with context, attachments and a due date. Smart replies included.',
  },
  {
    icon: FaLayerGroup,
    title: 'Plain-English capture',
    body: 'Type “send the deck friday !” and it lands as a high-priority task due Friday at 5pm. No forms, no fields.',
  },
  {
    icon: FaUsers,
    title: 'Built for teams',
    body: 'Shared workspaces, comments, meeting polls and approval flows — without another chat app to babysit.',
  },
  {
    icon: FaSyncAlt,
    title: 'A day you can see',
    body: 'The daily planner lays your whole day on one timeline and auto-fills the gaps with real tasks — 60, 45 or 30 minutes at a time.',
  },
  {
    icon: FaClock,
    title: 'Focus that sticks',
    body: 'A built-in pomodoro timer with automatic breaks, session history and a running total of deep-work hours.',
  },
  {
    icon: FaSearch,
    title: 'Search everything at once',
    body: 'One box across tasks, events, email and contacts — plus keyboard shortcuts and a command palette for everything else.',
  },
  {
    icon: FaSyncAlt,
    title: 'Offline-first PWA',
    body: 'Install it, lose signal, keep working. Everything syncs back the moment you reconnect.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Connect your day',
    body: 'Bring in tasks, calendar events and emails. No CSV wrangling, no migration project.',
  },
  {
    step: '02',
    title: 'Let AI triage',
    body: 'SchedAI scores priorities, finds the free slots and drafts the replies you would have written by hand.',
  },
  {
    step: '03',
    title: 'Work the plan',
    body: 'A single, calm daily view with focus timers, progress tracking and gentle nudges.',
  },
];

const STATS = [
  { value: '2.4h', label: 'average planning time saved weekly' },
  { value: '38%', label: 'fewer missed deadlines reported' },
  { value: '5×6', label: 'themes and accents to make it yours' },
  { value: '100%', label: 'usable offline, installable anywhere' },
];

const TESTIMONIALS = [
  {
    quote:
      'The AI actually understands "push everything after 4pm to tomorrow" and does it. That alone replaced three tools for me.',
    name: 'Amara O.',
    role: 'Product lead, fintech',
  },
  {
    quote:
      'I stopped living in a browser tab maze. Tasks, meetings and email turns into one page I can actually finish.',
    name: 'Daniel M.',
    role: 'Freelance consultant',
  },
  {
    quote:
      'The dark themes are gorgeous, but the part I did not expect is the analytics: it showed me where my afternoons disappear.',
    name: 'Priya R.',
    role: 'Engineering manager',
  },
];

const FAQS = [
  {
    q: 'Is SchedAI free to try?',
    a: 'Yes. Create an account and use the full planner free — no card required. AI features run in demo mode until you connect your own API key.',
  },
  {
    q: 'Does it work offline?',
    a: 'It is an installable progressive web app. Tasks and events are cached locally, edits are queued, and everything syncs as soon as you are back online.',
  },
  {
    q: 'Which tools does it connect to?',
    a: 'Google Calendar, Outlook, Gmail, Slack and generic webhooks. The integrations page walks you through each one.',
  },
  {
    q: 'Can I change how it looks?',
    a: 'Absolutely — six accent colours, five full themes including Midnight and Nord, light/dark mode and a compact density option. All saved to your device.',
  },
];

const SectionHeading = ({ eyebrow, title, description, center = true }) => (
  <div className={`${center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} mb-12`}>
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <h2 className="mt-4 text-3xl font-bold tracking-tight text-content sm:text-4xl">{title}</h2>
    {description && <p className="mt-3 text-base leading-relaxed text-content-muted">{description}</p>}
  </div>
);

const Home = () => {
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    document.title = 'SchedAI — The AI schedule manager that plans your day';
  }, []);

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-mesh opacity-70" />
          <div className="absolute inset-0 bg-grid-fade bg-grid opacity-[0.35] mask-fade-b" />
        </div>

        <div className="section pb-20 pt-16 sm:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
            <div className="animate-fade-up">
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                AI scheduling, reimagined
              </span>

              <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-content sm:text-5xl lg:text-[3.4rem]">
                Your day, <span className="gradient-text">planned by AI</span> — not by chaos.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-content-muted sm:text-lg">
                SchedAI unifies your tasks, calendar and inbox, then builds a realistic plan around
                your energy, deadlines and the meetings you cannot move.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to="/register" className="btn btn-primary btn-lg group">
                  Start free
                  <FaArrowRight className="transition-transform group-hover:translate-x-0.5" size={13} />
                </Link>
                <DemoLoginButton variant="outline" size="lg" label="Try the live demo" />
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-content-subtle">
                <span className="flex items-center gap-1.5">
                  <FaCheck className="text-emerald-500" size={11} /> No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <FaCheck className="text-emerald-500" size={11} /> Works offline
                </span>
                <span className="flex items-center gap-1.5">
                  <FaCheck className="text-emerald-500" size={11} /> Installable as an app
                </span>
              </div>

              <div className="mt-8 flex items-center gap-3 border-t border-line pt-6">
                <div className="flex -space-x-2">
                  {['AO', 'DM', 'PR', 'JK'].map((initials, index) => (
                    <span
                      key={initials}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface text-[0.6rem] font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, hsl(${index * 42 + 220} 70% 58%), hsl(${index * 42 + 275} 70% 52%))`,
                      }}
                    >
                      {initials}
                    </span>
                  ))}
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <FaStar key={star} size={10} />
                    ))}
                    <span className="ml-1 font-semibold text-content">4.9</span>
                  </div>
                  <p className="text-content-subtle">Loved by planners, founders and freelancers</p>
                </div>
              </div>
            </div>

            <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
              <ProductPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="border-y border-line bg-surface/60 backdrop-blur">
        <div className="section grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <p className="font-display text-3xl font-bold text-content">{stat.value}</p>
              <p className="mt-1 text-xs leading-relaxed text-content-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="section py-20 sm:py-24">
        <SectionHeading
          eyebrow="Everything in one place"
          title="Fewer tabs. Sharper decisions."
          description={'Each piece is useful on its own. Together they remove the daily "what should I do next" tax.'}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className="card card-hover card-pad animate-fade-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="feature-icon">
                <feature.icon size={18} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-content">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-content-muted">{feature.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/features" className="btn btn-outline">
            Explore all features <FaArrowRight size={11} />
          </Link>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="border-y border-line bg-surface/60">
        <div className="section py-20 sm:py-24">
          <SectionHeading
            eyebrow="How it works"
            title="From messy to mapped in three steps"
            description="No onboarding marathon. Most people have a usable plan in under two minutes."
          />

          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="card card-pad h-full">
                  <span className="font-display text-4xl font-bold text-primary-200 dark:text-primary-500/30">
                    {step.step}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-content">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-content-muted">{step.body}</p>
                </div>
                {index < STEPS.length - 1 && (
                  <FaArrowRight
                    className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-primary-300 md:block"
                    size={14}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HIGHLIGHT: AI ================= */}
      <section className="section py-20 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">
              <FaRobot size={11} /> AI assistant
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Say it. It is scheduled.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-content-muted">
              Type or speak natural language and SchedAI does the plumbing: it creates tasks,
              finds the right slot, warns you about conflicts and links everything back to the
              original email or meeting.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                '“Move my deep work to mornings and keep meetings after lunch.”',
                '“Turn this email into a task due Friday, 30 minutes of effort.”',
                '“Find 90 free minutes for the proposal before Thursday.”',
              ].map((example) => (
                <li key={example} className="flex items-start gap-3 rounded-xl border border-line bg-surface-raised px-4 py-3">
                  <FaBolt className="mt-0.5 shrink-0 text-primary-500" size={12} />
                  <span className="text-sm text-content-muted">{example}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex gap-3">
              <Link to="/register" className="btn btn-primary">
                Try the assistant <FaArrowRight size={11} />
              </Link>
              <Link to="/features#ai" className="btn btn-ghost">
                Learn more
              </Link>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-line bg-surface-sunken px-4 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-gradient text-white">
                <FaRobot size={12} />
              </span>
              <p className="text-xs font-semibold text-content">SchedAI assistant</p>
              <span className="badge badge-success ml-auto">online</span>
            </div>
            <div className="space-y-3 p-4">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary-600 px-3.5 py-2.5 text-xs leading-relaxed text-white">
                Reschedule everything I pushed today — I need tomorrow morning free for the pitch.
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-line bg-surface px-3.5 py-2.5 text-xs leading-relaxed text-content-muted">
                Done. I moved 3 tasks and 1 meeting:
                <ul className="mt-2 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500" size={9} /> “Q4 roadmap review” → Thu 10:00
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500" size={9} /> “Investor update” → tomorrow 16:30
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500" size={9} /> Morning 08:00–12:00 cleared
                  </li>
                </ul>
                <div className="mt-2.5 flex gap-2">
                  <button type="button" className="rounded-lg bg-primary-600 px-2.5 py-1 text-[0.65rem] font-semibold text-white">
                    Looks good
                  </button>
                  <button type="button" className="rounded-lg border border-line px-2.5 py-1 text-[0.65rem] font-semibold text-content-muted">
                    Undo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= THEMES ================= */}
      <section className="border-y border-line bg-surface/60">
        <div className="section py-20 sm:py-24">
          <SectionHeading
            eyebrow={<><FaMoon className="mr-1 inline" size={10} /> Make it yours</>}
            title="A workspace you actually enjoy opening"
            description="Five hand-tuned themes, six accents and a compact mode. Everything is remembered on this device."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Daylight', desc: 'Crisp, bright and focused', bg: 'bg-white', chip: 'bg-indigo-500', text: 'text-slate-900' },
              { name: 'Slate', desc: 'Soft dark, easy on the eyes', bg: 'bg-slate-900', chip: 'bg-indigo-400', text: 'text-slate-100' },
              { name: 'Midnight', desc: 'Deep contrast for late nights', bg: 'bg-[#0b1120]', chip: 'bg-sky-400', text: 'text-slate-200' },
              { name: 'Nord', desc: 'Cool, calm arctic palette', bg: 'bg-[#2e3440]', chip: 'bg-[#5e81ac]', text: 'text-[#eceff4]' },
              { name: 'Sand', desc: 'Warm paper-like reading mode', bg: 'bg-[#fdfbf7]', chip: 'bg-amber-600', text: 'text-[#2b241c]' },
              { name: 'Any accent', desc: 'Ocean, emerald, sunset, rose…', bg: 'bg-gradient-to-br from-cyan-500 to-emerald-500', chip: 'bg-white', text: 'text-white' },
            ].map((theme) => (
              <div
                key={theme.name}
                className={`overflow-hidden rounded-2xl border border-line ${theme.bg} ${theme.text} shadow-soft`}
              >
                <div className="space-y-2 p-4">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${theme.chip}`} />
                    <span className="h-1.5 w-10 rounded-full bg-current opacity-25" />
                  </div>
                  <div className="h-1.5 w-2/3 rounded-full bg-current opacity-15" />
                  <div className="flex gap-1.5 pt-1.5">
                    <span className={`h-6 flex-1 rounded-md ${theme.chip} opacity-90`} />
                    <span className="h-6 flex-1 rounded-md bg-current opacity-10" />
                    <span className="h-6 flex-1 rounded-md bg-current opacity-10" />
                  </div>
                </div>
                <div className="border-t border-current/10 px-4 py-2.5">
                  <p className="text-xs font-semibold">{theme.name}</p>
                  <p className="text-[0.65rem] opacity-60">{theme.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="section py-20 sm:py-24">
        <SectionHeading eyebrow="Loved by planners" title="What people say" />
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure key={testimonial.name} className="card card-pad flex h-full flex-col">
              <div className="flex gap-1 text-amber-400">
                {[0, 1, 2, 3, 4].map((star) => (
                  <FaStar key={star} size={11} />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-content-muted">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-gradient text-xs font-bold text-white">
                  {testimonial.name.split(' ').map((part) => part[0]).join('')}
                </span>
                <div>
                  <p className="text-sm font-semibold text-content">{testimonial.name}</p>
                  <p className="text-xs text-content-subtle">{testimonial.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="border-y border-line bg-surface/60">
        <div className="section grid gap-10 py-20 lg:grid-cols-[0.9fr_1.1fr] sm:py-24">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Questions, answered</h2>
            <p className="mt-3 text-content-muted">
              Still curious? <Link to="/contact" className="link">Talk to us</Link> — a human replies
              within one business day.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: FaLock, text: 'Your data stays private and encrypted' },
                { icon: FaClock, text: 'Set up in under two minutes' },
                { icon: FaEnvelope, text: 'Import from email and calendar in one click' },
              ].map(({ icon: Icon, text }) => (
                <p key={text} className="flex items-center gap-2.5 text-sm text-content-muted">
                  <Icon size={12} className="text-primary-500" /> {text}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div key={faq.q} className="card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-content">{faq.q}</span>
                    <FaChevronDown
                      size={11}
                      className={`shrink-0 text-content-subtle transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {open && (
                    <p className="border-t border-line px-5 py-4 text-sm leading-relaxed text-content-muted">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="section py-20 sm:py-24">
        <div className="relative overflow-hidden rounded-4xl border border-line bg-accent-gradient px-6 py-14 text-center text-white shadow-glow sm:px-12">
          <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
            <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
            <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-black/20 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Take back your week</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
              Create a free account and let SchedAI plan your next seven days. You can always
              override it — it just gives you a much better starting point.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="btn btn-lg bg-white text-primary-700 hover:bg-white/90"
              >
                Create free account <FaArrowRight size={12} />
              </Link>
              <Link
                to="/contact"
                className="btn btn-lg border border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
