import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaGithub,
  FaHeadset,
  FaLightbulb,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaShieldAlt,
} from 'react-icons/fa';
import client from '@services/api/client';

const TOPICS = [
  { id: 'general', label: 'General question' },
  { id: 'support', label: 'Help with my account' },
  { id: 'bug', label: 'Report a bug' },
  { id: 'feature', label: 'Feature request' },
  { id: 'partnership', label: 'Partnership' },
];

const CHANNELS = [
  {
    icon: FaEnvelope,
    title: 'Email us',
    body: 'hello@schedai.app',
    hint: 'Replies within one business day',
    href: 'mailto:hello@schedai.app',
  },
  {
    icon: FaGithub,
    title: 'Open an issue',
    body: 'github.com/devTechs001',
    hint: 'Best for bugs with reproduction steps',
    href: 'https://github.com/devTechs001/schedule-manager/issues',
  },
  {
    icon: FaMapMarkerAlt,
    title: 'Where we are',
    body: 'Nairobi, Kenya (EAT)',
    hint: 'Remote-first, meeting-friendly',
  },
];

const SUPPORT_ITEMS = [
  { icon: FaHeadset, title: 'Account & billing', body: 'Login issues, plan changes, data export.' },
  { icon: FaLightbulb, title: 'Feature requests', body: 'Tell us the chore you want gone; we triage weekly.' },
  { icon: FaShieldAlt, title: 'Security reports', body: 'Responsible disclosure gets a same-day reply.' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', topic: 'general', message: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = 'Contact — SchedAI';
  }, []);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Please tell us your name';
    if (!form.email.trim()) next.email = 'We need an email to reply to';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'That email looks incomplete';
    if (form.message.trim().length < 12) next.message = 'A little more detail helps us help you';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSending(true);
    try {
      // Best effort: deliver through the API when it is reachable, otherwise
      // fall back to a mailto so the message is never silently lost.
      await client.post('/feedback/contact', {
        name: form.name,
        email: form.email,
        topic: form.topic,
        message: form.message,
        source: 'marketing-site',
      });
      setSent(true);
      toast.success('Message sent — we will be in touch soon');
    } catch {
      const subject = encodeURIComponent(`[${form.topic}] Message from ${form.name}`);
      const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
      window.location.href = `mailto:hello@schedai.app?subject=${subject}&body=${body}`;
      setSent(true);
      toast.success('Opening your email app to finish sending');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="hero-art hero-art--compact relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh opacity-25" aria-hidden="true" />
        <div className="section py-16 text-center sm:py-20">
          <span className="eyebrow">
            <FaPaperPlane size={10} /> Contact
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Let's talk about your week
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-content-muted sm:text-lg">
            Questions, bugs, ideas or a demo for your team — send a note and a real person will
            reply.
          </p>
        </div>
      </section>

      <section className="section py-14">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Form */}
          <div className="card overflow-hidden">
            <div className="border-b border-line px-6 py-4">
              <h2 className="text-lg font-semibold text-content">Send us a message</h2>
              <p className="mt-0.5 text-sm text-content-muted">
                Fields marked with <span className="text-rose-500">*</span> are required.
              </p>
            </div>

            {sent ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <FaCheckCircle size={22} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-content">Message on its way</h3>
                <p className="mt-1.5 max-w-sm text-sm text-content-muted">
                  Thanks {form.name.split(' ')[0] || 'there'} — we usually reply within one business
                  day. In the meantime, feel free to explore the app.
                </p>
                <div className="mt-6 flex gap-3">
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Start free
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setForm({ name: '', email: '', topic: 'general', message: '' });
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    Send another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="label">
                      Full name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`input ${errors.name ? 'input-error' : ''}`}
                      placeholder="Amara Otieno"
                      autoComplete="name"
                    />
                    {errors.name && <p className="error-text">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="label">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`input ${errors.email ? 'input-error' : ''}`}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    {errors.email && <p className="error-text">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <span className="label">What is this about?</span>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, topic: topic.id }))}
                        className={`chip ${form.topic === topic.id ? 'chip-active' : ''}`}
                        aria-pressed={form.topic === topic.id}
                      >
                        {topic.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="label">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    className={`input resize-y ${errors.message ? 'input-error' : ''}`}
                    placeholder="Tell us what you are trying to do, what happened, or what would make SchedAI better…"
                  />
                  <div className="mt-1 flex items-center justify-between">
                    {errors.message ? (
                      <p className="error-text">{errors.message}</p>
                    ) : (
                      <p className="hint">The more context, the faster we can help.</p>
                    )}
                    <span className="text-[0.68rem] text-content-subtle">{form.message.length}/1200</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-1.5 text-xs text-content-subtle">
                    <FaShieldAlt size={10} /> We never share your email. Ever.
                  </p>
                  <button type="submit" className="btn btn-primary" disabled={sending || form.message.length > 1200}>
                    {sending ? 'Sending…' : 'Send message'} <FaPaperPlane size={11} />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Side info */}
          <div className="space-y-4">
            {CHANNELS.map((channel) => {
              const content = (
                <>
                  <span className="feature-icon h-10 w-10 shrink-0 rounded-xl">
                    <channel.icon size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-content">{channel.title}</p>
                    <p className="truncate text-sm text-primary-600 dark:text-primary-300">{channel.body}</p>
                    <p className="mt-0.5 text-xs text-content-subtle">{channel.hint}</p>
                  </div>
                </>
              );
              return channel.href ? (
                <a
                  key={channel.title}
                  href={channel.href}
                  target={channel.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer noopener"
                  className="card card-pad card-hover flex items-start gap-3.5"
                >
                  {content}
                </a>
              ) : (
                <div key={channel.title} className="card card-pad flex items-start gap-3.5">
                  {content}
                </div>
              );
            })}

            <div id="support" className="card card-pad scroll-mt-28">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-content-subtle">
                Support hours
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-content-muted">
                <FaClock size={11} className="text-primary-500" /> Mon–Fri · 09:00–18:00 EAT
              </p>
              <div className="divider my-4" />
              <div className="space-y-3">
                {SUPPORT_ITEMS.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex items-start gap-2.5">
                    <Icon size={11} className="mt-1 shrink-0 text-primary-500" />
                    <div>
                      <p className="text-xs font-semibold text-content">{title}</p>
                      <p className="text-xs text-content-muted">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-accent-gradient p-5 text-white shadow-glow">
              <p className="text-sm font-semibold">Prefer to just try it?</p>
              <p className="mt-1 text-xs leading-relaxed text-white/85">
                You do not need a demo call. Create an account and explore in under two minutes.
              </p>
              <Link to="/register" className="btn btn-sm mt-4 bg-white text-primary-700 hover:bg-white/90">
                Create free account <FaArrowRight size={10} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
