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

    const navItems = [
        { path: '/', icon: Utensils, label: '点餐' },
        { path: '/orders', icon: FileText, label: '订单' },
        { path: '/profile', icon: UserIcon, label: '我的' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center z-50 pt-2 pb-[env(safe-area-inset-bottom,12px)] shadow-[0_-1px_10px_rgba(0,0,0,0.02)] min-h-[56px]">
            {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-[#0052D9]' : 'text-gray-400'}`}
                    >
                        <item.icon size={active ? 22 : 20} strokeWidth={active ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};
