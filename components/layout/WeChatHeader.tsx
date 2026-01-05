import React from 'react';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';

interface WeChatHeaderProps {
    title?: string;
    dark?: boolean;
    onBack?: () => void;
    className?: string;
}

export const WeChatHeader: React.FC<WeChatHeaderProps> = ({
    title = "",
    dark = false,
    onBack,
    className = ""
}) => (
    <div className={`shrink-0 z-50 pt-safe ${dark ? 'bg-transparent text-white' : 'bg-white text-black'} ${className}`}>
        {/* Navigation Bar */}
        <div className="relative h-[44px] flex items-center justify-center px-4">
            {onBack && (
                <button onClick={onBack} className="absolute left-2 p-2 active:opacity-60 z-10">
                    <ChevronLeft size={24} />
                </button>
            )}

            <div className="font-bold text-[17px]">{title}</div>

            {/* Capsule Button Simulation */}
            <div className={`absolute right-[7px] top-1/2 -translate-y-1/2 h-[32px] w-[87px] border rounded-full flex items-center justify-evenly bg-opacity-60 backdrop-blur-sm ${dark ? 'bg-black/20 border-white/20' : 'bg-white/60 border-gray-200'}`}>
                <MoreHorizontal size={16} className={dark ? 'text-white' : 'text-black'} />
                <div className={`w-[1px] h-[14px] ${dark ? 'bg-white/20' : 'bg-gray-200'}`}></div>
                <div className={`w-[16px] h-[16px] rounded-full border-2 ${dark ? 'border-white' : 'border-black'}`}></div>
            </div>
        </div>
    </div>
);
