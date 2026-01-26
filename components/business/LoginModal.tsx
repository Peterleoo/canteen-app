import React, { useState } from 'react';
import { Loader2, Lock, Phone, ChevronRight, ShieldCheck, MessageSquare } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginModalProps {
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const { loginWithPhonePassword, isLoggingIn, error } = useUserStore();
    const [showError, setShowError] = useState(false);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [focusedField, setFocusedField] = useState<'phone' | 'password' | null>(null);

    const handleLogin = async () => {
        try {
            if (!phone || !password) {
                setShowError(true);
                setTimeout(() => setShowError(false), 3000);
                return;
            }
            await loginWithPhonePassword(phone, password);
        } catch (err) {
            console.error('Login failed:', err);
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end">
            {/* Backdrop with Blur */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Bottom Sheet Container */}
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-white w-full rounded-t-[32px] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-8"
                style={{ maxHeight: '85vh' }}
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

                {/* Handle Bar */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                </div>

                <div className="p-8 pb-10 relative z-10">
                    {/* Header Section */}
                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="w-20 h-20 bg-white rounded-[24px] shadow-lg flex items-center justify-center mb-6 border border-gray-50 bg-contain bg-no-repeat bg-center"
                        >
                            <img
                                src="/assets/images/logo.png"
                                alt="Logo"
                                className="w-12 h-12 object-contain"
                                onError={(e) => {
                                    // Fallback if image fails
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.classList.add('bg-green-500');
                                }}
                            />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">欢迎回到 Canteen 👋</h2>
                        <p className="text-sm text-gray-500">登录账号，开启美味之旅</p>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {(showError || error) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-6 flex items-center justify-center font-medium"
                            >
                                {error || '请输入手机号和密码'}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Input Fields */}
                    <div className="space-y-6 mb-8">
                        {/* Phone Input */}
                        <div className={`relative transition-all duration-300 ${focusedField === 'phone' ? 'scale-[1.02]' : ''}`}>
                            <label className="text-xs font-bold text-gray-400 ml-4 mb-1.5 block uppercase tracking-wider">手机号 Phone</label>
                            <div className={`flex items-center bg-gray-50 rounded-2xl px-5 py-4 border-2 transition-colors ${focusedField === 'phone' ? 'border-[#07c160] bg-white shadow-sm' : 'border-transparent'}`}>
                                <Phone size={20} className={focusedField === 'phone' ? 'text-[#07c160]' : 'text-gray-400'} />
                                <div className="w-px h-4 bg-gray-300 mx-4" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    onFocus={() => setFocusedField('phone')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="请输入手机号"
                                    className="flex-1 bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400 text-lg"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                            <label className="text-xs font-bold text-gray-400 ml-4 mb-1.5 block uppercase tracking-wider">密码 Password</label>
                            <div className={`flex items-center bg-gray-50 rounded-2xl px-5 py-4 border-2 transition-colors ${focusedField === 'password' ? 'border-[#07c160] bg-white shadow-sm' : 'border-transparent'}`}>
                                <Lock size={20} className={focusedField === 'password' ? 'text-[#07c160]' : 'text-gray-400'} />
                                <div className="w-px h-4 bg-gray-300 mx-4" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="请输入登录密码"
                                    className="flex-1 bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400 text-lg"
                                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                        className="w-full h-14 bg-[#07c160] text-white rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(7,193,96,0.25)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:shadow-none"
                    >
                        {isLoggingIn ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                <span className="opacity-90">登录中...</span>
                            </>
                        ) : (
                            <>
                                立即登录
                                <ChevronRight size={20} className="opacity-60" />
                            </>
                        )}
                    </motion.button>

                    {/* Footer Actions */}
                    <div className="mt-8 flex justify-between items-center text-sm px-2">
                        <button className="text-gray-400 hover:text-gray-600 font-medium transition-colors">忘记密码?</button>
                        <div className="w-1 h-1 bg-gray-300 rounded-full" />
                        <button className="text-[#07c160] font-bold hover:opacity-80 transition-opacity">注册新账号</button>
                    </div>

                    {/* Social Login Mockup */}
                    <div className="mt-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px bg-gray-100 flex-1" />
                            <span className="text-xs text-gray-400">其他登录方式</span>
                            <div className="h-px bg-gray-100 flex-1" />
                        </div>
                        <div className="flex justify-center gap-6">
                            <button className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:scale-110 transition-transform">
                                <MessageSquare size={20} />
                            </button>
                            <button className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:scale-110 transition-transform">
                                <ShieldCheck size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
