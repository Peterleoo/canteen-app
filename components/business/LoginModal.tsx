import React, { useState } from 'react';
import { MessageSquare, Loader2, Lock, Phone } from 'lucide-react';
import { Button } from '../Button';
import { useUserStore } from '../../stores/useUserStore';
import { motion } from 'framer-motion';

interface LoginModalProps {
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const { loginWithPhonePassword, isLoggingIn, error } = useUserStore();
    const [showError, setShowError] = useState(false);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            // 验证手机号和密码
            if (!phone || !password) {
                setShowError(true);
                // 3秒后自动隐藏错误提示
                setTimeout(() => setShowError(false), 3000);
                return;
            }
            
            // 调用手机号密码登录接口
            await loginWithPhonePassword(phone, password);
        } catch (err) {
            console.error('Login failed:', err);
            setShowError(true);
            // 3秒后自动隐藏错误提示
            setTimeout(() => setShowError(false), 3000);
        }
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
                    
                    {/* 错误提示 */}
                    {showError && error && (
                        <div className="w-full bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
                            {error}
                        </div>
                    )}
                    
                    {/* 手机号输入框 */}
                    <div className="w-full space-y-1 mb-4">
                        <label className="text-xs text-gray-500 text-left w-full">手机号</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                placeholder="请输入手机号"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                    </div>
                    
                    {/* 密码输入框 */}
                    <div className="w-full space-y-1 mb-6">
                        <label className="text-xs text-gray-500 text-left w-full">密码</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                placeholder="请输入密码"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                    </div>
                    
                    <Button 
                        fullWidth 
                        onClick={handleLogin} 
                        className="bg-[#07c160] hover:bg-[#06ad56] active:bg-[#05964b] shadow-lg shadow-green-100"
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? (
                            <>
                                <Loader2 size={16} className="animate-spin mr-2" />
                                登录中...
                            </>
                        ) : (
                            '登录'
                        )}
                    </Button>
                    <button onClick={onClose} className="mt-4 text-sm text-gray-400 hover:text-gray-600">暂不登录</button>
                </div>
            </motion.div>
        </div>
    );
};
