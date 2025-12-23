import React from 'react';

interface AppleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export function AppleButton({ className = '', variant = 'primary', ...props }: AppleButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-[15px] font-medium leading-tight transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    const variants = {
        primary: "bg-apple-accent text-white hover:bg-[#0077ED] focus:ring-apple-accent/50 shadow-sm",
        secondary: "bg-apple-bg-secondary text-apple-text-primary hover:bg-[#eaeaea] focus:ring-apple-text-secondary/30",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50",
        ghost: "bg-transparent text-apple-accent hover:bg-apple-accent/10"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        />
    );
}
