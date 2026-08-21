import React from 'react';

interface BadgeProps {
  variant?: 'pulse' | 'signal' | 'alert' | 'success' | 'warning' | 'muted';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'pulse',
  children,
  className = '',
  icon
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {icon && <span className="inline-flex items-center text-xs">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
