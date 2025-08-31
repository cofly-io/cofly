'use client';

import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  appName?: string;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = "", 
  appName = "",
  onClick 
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      alert(`Hello from ${appName || "UI package"}!`);
    }
  };

  return (
    <button
      className={className}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};