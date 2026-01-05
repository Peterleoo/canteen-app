import React from 'react';
import { Utensils, FileText, User as UserIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const current = location.pathname;

    const isActive = (path: string) => {
        if (path === '/' && current === '/') return true;
        if (path !== '/' && current.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pt-2 pb-safe flex justify-around items-center z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] min-h-[calc(55px+env(safe-area-inset-bottom))]">
            <button onClick={() => navigate('/')} className={`flex flex-col items-center gap-1 p-1 transition-colors ${isActive('/') ? 'text-blue-600' : 'text-gray-400'}`}>
                <Utensils size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
                <span className="text-[10px] font-medium">点餐</span>
            </button>
            <button onClick={() => navigate('/orders')} className={`flex flex-col items-center gap-1 p-1 transition-colors ${isActive('/orders') ? 'text-blue-600' : 'text-gray-400'}`}>
                <FileText size={24} strokeWidth={isActive('/orders') ? 2.5 : 2} />
                <span className="text-[10px] font-medium">订单</span>
            </button>
            <button onClick={() => navigate('/profile')} className={`flex flex-col items-center gap-1 p-1 transition-colors ${isActive('/profile') ? 'text-blue-600' : 'text-gray-400'}`}>
                <UserIcon size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
                <span className="text-[10px] font-medium">我的</span>
            </button>
        </div>
    );
};
