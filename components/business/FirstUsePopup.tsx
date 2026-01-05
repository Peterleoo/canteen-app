import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '../Button';

interface FirstUsePopupProps {
    onConfirm: () => void;
}

export const FirstUsePopup: React.FC<FirstUsePopupProps> = ({ onConfirm }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-[85%] max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
                <div className="p-6 flex flex-col">
                    <div className="text-center mb-4">
                        <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
                            <Clock size={24} className="text-blue-600" />
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 mb-2">温馨提示</h3>
                    </div>
                    <div className="text-sm text-gray-600 mb-6 leading-relaxed">
                        <p className="mb-3">感谢您使用我们的点餐APP！</p>
                        <p className="font-medium">为了确保您能及时享用美食，请提前 <span className="text-red-500 font-bold">2-3小时</span> 预下单。</p>
                        <p className="mt-3 text-xs text-gray-500">我们将根据您的下单时间安排制作和配送，确保您在期望的时间享用美味餐食。</p>
                    </div>
                    <Button
                        fullWidth
                        onClick={onConfirm}
                        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-200"
                    >
                        我知道了
                    </Button>
                </div>
            </div>
        </div>
    );
};
