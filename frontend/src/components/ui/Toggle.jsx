import React, { useId } from 'react';

const SIZES = {
  sm: { track: 'h-4 w-8', thumb: 'h-3 w-3', on: 'translate-x-4', off: 'translate-x-0.5' },
  md: { track: 'h-5 w-9', thumb: 'h-4 w-4', on: 'translate-x-4', off: 'translate-x-0.5' },
  lg: { track: 'h-6 w-11', thumb: 'h-5 w-5', on: 'translate-x-5', off: 'translate-x-0.5' },
};

const TONES = {
  primary: 'bg-primary-600',
  accent: 'bg-secondary-600',
  success: 'bg-emerald-600',
  danger: 'bg-rose-600',
};

/**
 * Accessible switch.
 *
 * <Toggle checked={x} onChange={setX} label="Dark mode" description="…" />
 * Renders a real `button[role=switch]`; the visible label is wired via aria-labelledby.
 */
const Toggle = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label = '',
  description = '',
  color = 'primary',
  id,
}) => {
  const generatedId = useId();
  const labelId = `${id || generatedId}-label`;
  const descriptionId = `${id || generatedId}-description`;
  const { track, thumb, on, off } = SIZES[size] || SIZES.md;
  const tone = TONES[color] || TONES.primary;

  return (
    <div className={`flex items-start gap-3 ${disabled ? 'opacity-50' : ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        id={id}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={[
          'relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'focus-visible:ring-offset-surface',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          track,
          checked ? tone : 'bg-gray-300 dark:bg-gray-600',
        ].join(' ')}
      >
        <span
          className={[
            'pointer-events-none inline-block transform rounded-full bg-white shadow-sm transition-transform duration-200',
            thumb,
            checked ? on : off,
          ].join(' ')}
        />
      </button>

      {(label || description) && (
        <div className="min-w-0 flex-1">
          {label && (
            <span id={labelId} className="block text-sm font-medium text-content">
              {label}
            </span>
          )}
          {description && (
            <span id={descriptionId} className="mt-0.5 block text-xs leading-relaxed text-content-muted">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Toggle;
