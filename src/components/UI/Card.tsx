import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  tagName?: 'div' | 'section' | 'article' | 'aside';
  onClick?: () => void;
  tabIndex?: number;
  role?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  tagName: Tag = 'div',
  onClick,
  tabIndex,
  role
}) => {
  const isInteractive = !!onClick;
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Tag
      className={`card ${isInteractive ? 'card-interactive' : ''} ${className}`}
      onClick={onClick}
      tabIndex={isInteractive ? (tabIndex ?? 0) : tabIndex}
      role={role ?? (isInteractive ? 'button' : undefined)}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
    >
      {children}
    </Tag>
  );
};
