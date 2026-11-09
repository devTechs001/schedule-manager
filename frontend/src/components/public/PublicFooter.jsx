import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaEnvelope,
  FaHeart,
} from 'react-icons/fa';
import Brand from './Brand';

const columns = [
  {
    title: 'Product',
    links: [
      { to: '/features', label: 'Features' },
      { to: '/features#ai', label: 'AI assistants' },
      { to: '/features#calendar', label: 'Smart calendar' },
      { to: '/features#analytics', label: 'Analytics' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About us' },
      { to: '/contact', label: 'Contact' },
      { to: '/about#roadmap', label: 'Roadmap' },
      { to: '/contact#support', label: 'Support' },
    ],
  },
  {
    title: 'Get started',
    links: [
      { to: '/register', label: 'Create account' },
      { to: '/login', label: 'Sign in' },
      { to: '/welcome', label: 'Product tour' },
      { to: '/register', label: 'Free plan' },
    ],
  },
];

const socials = [
  { icon: FaGithub, label: 'GitHub', href: 'https://github.com/devTechs001/schedule-manager' },
  { icon: FaTwitter, label: 'Twitter', href: '#' },
  { icon: FaLinkedin, label: 'LinkedIn', href: '#' },
  { icon: FaEnvelope, label: 'Email', href: 'mailto:hello@schedai.app' },
];

const PublicFooter = () => (
  <footer className="border-t border-line bg-surface">
    <div className="section py-14">
      <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Brand />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-content-muted">
            The AI-powered schedule manager that turns your inbox, calendar and task list into one
            calm, focused plan.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer noopener' : undefined}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-content-subtle transition-colors hover:border-primary-300 hover:text-primary-600"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-content-subtle">
              {column.title}
            </h4>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-content-muted hover:text-primary-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-content-subtle sm:flex-row">
        <p>© {new Date().getFullYear()} SchedAI. All rights reserved.</p>
        <p className="flex items-center gap-1.5">
          Built with <FaHeart className="text-rose-500" size={11} /> for people who hate busywork
        </p>
      </div>
    </div>
  </footer>
);

export default PublicFooter;
