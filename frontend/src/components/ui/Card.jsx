import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  action,
  footer,
  hoverable = false,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  onClick,
  as: Tag = 'div',
  ...props
}) => {
  return (
    <Tag
      onClick={onClick}
      className={`card ${hoverable ? 'card-hover cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className={`flex items-start justify-between gap-4 border-b border-line px-5 py-4 ${headerClassName}`}>
          <div className="min-w-0">
            {title && <h3 className="truncate text-base font-semibold text-content">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-content-muted">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={`card-pad ${bodyClassName}`}>{children}</div>

      {footer && <div className="border-t border-line px-5 py-3.5">{footer}</div>}
    </Tag>
  );
};

export default Card;
