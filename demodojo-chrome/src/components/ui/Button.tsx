import React from "react"
import type { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger"
    size?: "sm" | "md" | "lg"
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = "",
    variant = "primary",
    size = "md",
    ...props
}) => {
    const baseClasses =
        "plasmo-inline-flex plasmo-items-center plasmo-justify-center plasmo-font-medium plasmo-rounded-lg focus:plasmo-outline-none focus:plasmo-ring-2 focus:plasmo-ring-offset-2 disabled:plasmo-opacity-50 disabled:plasmo-cursor-not-allowed"

    const variantClasses = {
        primary:
            "plasmo-bg-purple-600 plasmo-text-white hover:plasmo-bg-purple-700 focus:plasmo-ring-purple-500",
        secondary:
            "plasmo-bg-gray-200 plasmo-text-gray-900 hover:plasmo-bg-gray-300 focus:plasmo-ring-gray-500",
        danger:
            "plasmo-bg-red-600 plasmo-text-white hover:plasmo-bg-red-700 focus:plasmo-ring-red-500"
    }

    const sizeClasses = {
        sm: "plasmo-px-3 plasmo-py-1.5 plasmo-text-sm",
        md: "plasmo-px-4 plasmo-py-2 plasmo-text-base",
        lg: "plasmo-px-6 plasmo-py-3 plasmo-text-lg"
    }

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}>
            {children}
        </button>
    )
} 