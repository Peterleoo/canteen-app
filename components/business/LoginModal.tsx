import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '../Button';
import { useUserStore } from '../../stores/useUserStore';
import { motion } from 'framer-motion';

interface LoginModalProps {
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const { login } = useUserStore();

    const handleLogin = () => {
        login();
        // Modal will be closed by store effect or parent update
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-[80%] max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10"
            >
                <div className="p-6 flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-green-200 shadow-lg">
                        <MessageSquare size={32} fill="currentColor" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">欢迎使用 Canteen</h3>
                    <p className="text-sm text-gray-500 text-center mb-6">登录后可享受更便捷的点餐服务，查看历史订单及优惠券。</p>
                    <Button fullWidth onClick={handleLogin} className="bg-[#07c160] hover:bg-[#06ad56] active:bg-[#05964b] shadow-lg shadow-green-100">
                        微信一键登录
                    </Button>
                    <button onClick={onClose} className="mt-4 text-sm text-gray-400 hover:text-gray-600">暂不登录</button>
                </div>
            </motion.div>
        </div>
    );
};
