import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaBullseye,
  FaCode,
  FaCompass,
  FaGithub,
  FaHandsHelping,
  FaHeart,
  FaLeaf,
  FaRocket,
  FaUsers,
} from 'react-icons/fa';

const VALUES = [
  {
    icon: FaCompass,
    title: 'Clarity over cleverness',
    body: 'A planner should reduce decisions, not add them. If a feature makes you think harder about the tool, it is not finished.',
  },
  {
    icon: FaHeart,
    title: 'Calm by default',
    body: 'No red badges begging for attention, no streak guilt-trips. Nudges are gentle and always dismissible.',
  },
  {
    icon: FaUsers,
    title: 'Built with real schedules',
    body: 'Every feature ships because someone with a genuinely messy week asked for it — freelancers, parents, team leads.',
  },
  {
    icon: FaLeaf,
    title: 'Fast and light',
    body: 'A small app that loads instantly on a train with one bar of signal beats a hundred dashboards that cannot.',
  },
];

const ROADMAP = [
  { when: 'Shipped', title: 'Unified planner', body: 'Tasks, events and email in a single daily view with AI triage.', done: true },
  { when: 'Shipped', title: 'Themes & accents', body: 'Five themes, six accents, compact mode and dark mode everywhere.', done: true },
  { when: 'Shipped', title: 'Offline PWA', body: 'Install it, work offline, sync automatically when you reconnect.', done: true },
  { when: 'In progress', title: 'Deeper calendar sync', body: 'Two-way Google and Outlook sync with conflict-aware imports.', done: false },
  { when: 'Next', title: 'Team load balancing', body: 'See who is over-committed before you assign one more thing.', done: false },
  { when: 'Exploring', title: 'Voice-first capture', body: 'Log the day hands-free while walking between meetings.', done: false },
];

const TEAM = [
  { name: 'Dev Techs', role: 'Founder & engineering', blurb: 'Builds the product, breaks the product, fixes the product.', initials: 'DT' },
  { name: 'The community', role: 'Product direction', blurb: 'Beta users whose weekly feedback shapes the roadmap.', initials: 'BC' },
  { name: 'Where we build', role: 'Nairobi, Kenya', blurb: 'Designed and shipped across EAT time zones — we schedule hard.', initials: 'NK' },
];

const About = () => {
  useEffect(() => {
    document.title = 'About — SchedAI';
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh opacity-60" aria-hidden="true" />
        <div className="section py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">Our story</span>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              We built the planner we kept <span className="gradient-text">hunting for</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-content-muted sm:text-lg">
              SchedAI started as a spreadsheet, three calendar apps and a very tired engineer. It is
              now a calm, AI-assisted home for tasks, meetings and the email that creates both.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { value: '2024', label: 'First prototype built' },
              { value: '6', label: 'Themes and accent palettes' },
              { value: '1', label: 'Place for everything that matters' },
            ].map((stat) => (
              <div key={stat.label} className="card card-pad text-center">
                <p className="font-display text-3xl font-bold text-content">{stat.value}</p>
                <p className="mt-1 text-xs text-content-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5 text-base leading-relaxed text-content-muted">
            <h2 className="text-2xl font-bold text-content sm:text-3xl">The problem we kept hitting</h2>
            <p>
              Work does not arrive in one place. A request lands in email, a deadline lives in a
              calendar, the actual work sits in a task tool and the follow-up is in a chat thread.
              Keeping those four worlds in sync is a job on its own — and most of us do it
              unpaid, several times a day.
            </p>
            <p>
              The tools that promise to fix this usually add a fifth place to check. So we went the
              other way: one screen, one plan, and an assistant that handles the reconciliation you
              would have done manually.
            </p>
            <p>
              SchedAI is deliberately small. It does not try to be your company wiki or your CRM. It
              takes your day, puts it in a sane order, and gets out of the way.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/register" className="btn btn-primary">
                Try it free <FaArrowRight size={11} />
              </Link>
              <a
                href="https://github.com/devTechs001/schedule-manager"
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-outline"
              >
                <FaGithub size={14} /> See the code
              </a>
            </div>
          </div>

          <div className="space-y-3">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="card card-pad flex gap-4">
                <span className="feature-icon h-10 w-10 shrink-0 rounded-xl">
                  <Icon size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-content">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-content-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission strip */}
      <section className="border-y border-line bg-surface/60">
        <div className="section grid gap-6 py-14 md:grid-cols-3">
          {[
            { icon: FaBullseye, title: 'Mission', body: 'Give every person a plan they can actually follow.' },
            { icon: FaRocket, title: 'Approach', body: 'Automate triage, keep humans in control of the final call.' },
            { icon: FaHandsHelping, title: 'Promise', body: 'No dark patterns, no data selling, no surprise pricing.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon className="text-primary-500" size={18} />
              <p className="mt-3 text-sm font-semibold text-content">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-content-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="section scroll-mt-28 py-16">
        <div className="mb-10 max-w-2xl">
          <span className="eyebrow">Roadmap</span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">What we are building next</h2>
          <p className="mt-2 text-content-muted">
            Shipped items are live in the app today. The rest is our public list — tell us what to
            move to the top.
          </p>
        </div>

        <div className="relative space-y-3 before:absolute before:left-[0.72rem] before:top-3 before:h-[calc(100%-1.5rem)] before:w-px before:bg-line md:before:left-1/2">
          {ROADMAP.map((item, index) => (
            <div
              key={item.title}
              className={`relative flex gap-4 md:w-1/2 ${
                index % 2 === 0 ? 'md:ml-0 md:pr-10' : 'md:ml-auto md:pl-10'
              }`}
            >
              <span
                className={`absolute left-0 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-surface-raised ${
                  item.done ? 'border-emerald-500 text-emerald-500' : 'border-line text-content-subtle'
                } ${index % 2 === 0 ? 'md:-right-3 md:left-auto' : 'md:-left-3'}`}
              >
                <span className={`h-2 w-2 rounded-full ${item.done ? 'bg-emerald-500' : 'bg-current'}`} />
              </span>
              <div className="card card-pad ml-10 flex-1 md:ml-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-content">{item.title}</p>
                  <span className={`badge ${item.done ? 'badge-success' : 'badge-neutral'}`}>
                    {item.when}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-content-muted">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-line bg-surface/60">
        <div className="section py-16">
          <div className="mb-10 text-center">
            <span className="eyebrow">Who is behind it</span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Small team, sharp focus</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {TEAM.map((member) => (
              <div key={member.name} className="card card-pad text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-gradient text-base font-bold text-white">
                  {member.initials}
                </span>
                <p className="mt-4 text-sm font-semibold text-content">{member.name}</p>
                <p className="text-xs font-medium text-primary-600 dark:text-primary-300">{member.role}</p>
                <p className="mt-2 text-sm leading-relaxed text-content-muted">{member.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section py-16">
        <div className="card card-pad flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="feature-icon shrink-0">
              <FaCode size={16} />
            </span>
            <div>
              <h2 className="text-xl font-bold">Have an opinion about where this goes?</h2>
              <p className="mt-1 text-sm text-content-muted">
                We read every message. Bugs, feature ideas, or just a better way to plan a Tuesday.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/contact" className="btn btn-primary">
              Get in touch
            </Link>
            <Link to="/features" className="btn btn-outline">
              See features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
