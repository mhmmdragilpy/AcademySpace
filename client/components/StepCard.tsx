"use client";

import { ReactNode } from "react";
import { CheckCircle, Circle } from "lucide-react";

interface StepCardProps {
    stepNumber: number;
    title: string;
    description: string;
    icon?: ReactNode;
    isActive?: boolean;
    isComplete?: boolean;
    variant?: "default" | "compact" | "horizontal";
    className?: string;
}

export function StepCard({
    stepNumber,
    title,
    description,
    icon,
    isActive = false,
    isComplete = false,
    variant = "default",
    className = "",
}: StepCardProps) {
    const getStepIndicator = () => {
        if (isComplete) {
            return (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-md">
                    <CheckCircle className="h-5 w-5" />
                </div>
            );
        }

        if (isActive) {
            return (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#FA7436] flex items-center justify-center text-white shadow-md animate-pulse">
                    {icon || <span className="font-bold text-lg">{stepNumber}</span>}
                </div>
            );
        }

        return (
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#E6F0F9] flex items-center justify-center text-[#FA7436] group-hover:bg-[#FA7436] group-hover:text-white transition-colors duration-300 shadow-sm">
                {icon || <span className="font-bold text-lg">{stepNumber}</span>}
            </div>
        );
    };

    if (variant === "compact") {
        return (
            <div
                className={`flex items-center gap-3 p-3 rounded-lg ${isActive
                        ? "bg-[#FA7436]/10 border border-[#FA7436]/30"
                        : isComplete
                            ? "bg-green-50 border border-green-200"
                            : "bg-gray-50 hover:bg-gray-100"
                    } transition-all duration-200 group ${className}`}
            >
                <div
                    className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${isComplete
                            ? "bg-green-500 text-white"
                            : isActive
                                ? "bg-[#FA7436] text-white"
                                : "bg-white text-[#FA7436] border border-[#FA7436]/30 group-hover:bg-[#FA7436] group-hover:text-white"
                        } transition-colors`}
                >
                    {isComplete ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                </div>
                <div className="flex-1 min-w-0">
                    <h4
                        className={`font-medium text-sm truncate ${isComplete ? "text-green-700" : isActive ? "text-[#FA7436]" : "text-gray-700"
                            }`}
                    >
                        {title}
                    </h4>
                </div>
            </div>
        );
    }

    if (variant === "horizontal") {
        return (
            <div
                className={`flex items-start gap-4 group ${className}`}
            >
                {getStepIndicator()}
                <div className="flex-1">
                    <h4
                        className={`font-semibold text-base ${isComplete
                                ? "text-green-700"
                                : isActive
                                    ? "text-[#FA7436]"
                                    : "text-gray-900"
                            }`}
                    >
                        {title}
                    </h4>
                    <p
                        className={`text-sm mt-1 ${isComplete ? "text-green-600" : "text-gray-500"
                            }`}
                    >
                        {description}
                    </p>
                </div>
            </div>
        );
    }

    // Default variant
    return (
        <div
            className={`flex items-start gap-4 p-4 rounded-xl ${isActive
                    ? "bg-gradient-to-r from-[#FA7436]/10 to-orange-50 border-2 border-[#FA7436]/30 shadow-lg"
                    : isComplete
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200"
                        : "bg-white border border-gray-100 hover:border-[#FA7436]/30 hover:shadow-md"
                } transition-all duration-300 group ${className}`}
        >
            {getStepIndicator()}
            <div className="flex-1">
                <h4
                    className={`font-semibold text-lg ${isComplete
                            ? "text-green-700"
                            : isActive
                                ? "text-[#FA7436]"
                                : "text-[#07294B] group-hover:text-[#FA7436]"
                        } transition-colors`}
                >
                    {title}
                </h4>
                <p
                    className={`text-sm mt-2 leading-relaxed ${isComplete ? "text-green-600" : "text-gray-600"
                        }`}
                >
                    {description}
                </p>
            </div>
        </div>
    );
}

// Progress indicator component for showing step progression
interface StepProgressProps {
    steps: Array<{
        title: string;
        description: string;
        icon?: ReactNode;
    }>;
    currentStep: number;
    className?: string;
}

export function StepProgress({ steps, currentStep, className = "" }: StepProgressProps) {
    return (
        <div className={`space-y-4 ${className}`}>
            {/* Progress Bar */}
            <div className="relative">
                <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 rounded-full">
                    <div
                        className="h-full bg-[#FA7436] rounded-full transition-all duration-500"
                        style={{
                            width: `${Math.min(((currentStep - 1) / (steps.length - 1)) * 100, 100)}%`,
                        }}
                    />
                </div>
                <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isComplete = stepNumber < currentStep;
                        const isActive = stepNumber === currentStep;

                        return (
                            <div key={index} className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 ${isComplete
                                            ? "bg-green-500 text-white"
                                            : isActive
                                                ? "bg-[#FA7436] text-white shadow-lg"
                                                : "bg-white border-2 border-gray-300 text-gray-400"
                                        } transition-all duration-300`}
                                >
                                    {isComplete ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                                </div>
                                <div className="mt-2 text-center">
                                    <div
                                        className={`text-sm font-medium ${isActive ? "text-[#FA7436]" : isComplete ? "text-green-600" : "text-gray-500"
                                            }`}
                                    >
                                        {step.title}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Numbered list component using StepCards
interface StepListProps {
    steps: Array<{
        title: string;
        description: string;
        icon?: ReactNode;
    }>;
    variant?: "default" | "compact" | "horizontal";
    className?: string;
}

export function StepList({ steps, variant = "default", className = "" }: StepListProps) {
    return (
        <div className={`space-y-4 ${className}`}>
            {steps.map((step, index) => (
                <StepCard
                    key={index}
                    stepNumber={index + 1}
                    title={step.title}
                    description={step.description}
                    icon={step.icon}
                    variant={variant}
                />
            ))}
        </div>
    );
}

export default StepCard;
