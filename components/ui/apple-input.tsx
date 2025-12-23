import React from 'react';

interface AppleInputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export function AppleInput({ className = '', ...props }: AppleInputProps) {
    return (
        <input
            className={`w-full rounded-xl border border-apple-border bg-white/50 backdrop-blur-sm px-4 py-3 text-[15px] text-apple-text-primary placeholder:text-apple-text-secondary/60 focus:border-apple-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-apple-accent/10 transition-all duration-200 ${className}`}
            {...props}
        />
    );
}
