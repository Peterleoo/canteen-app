import React from 'react';
import { X, MapPin } from 'lucide-react';
import { Canteen } from '../../types';

interface LocationModalProps {
    selectedCanteen: Canteen;
    canteens: Canteen[];
    onSelect: (canteen: Canteen) => void;
    onClose: () => void;
}

import { motion } from 'framer-motion';

export const LocationModal: React.FC<LocationModalProps> = ({ selectedCanteen, canteens, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 z-[1000] flex flex-col justify-end overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white w-full rounded-t-2xl max-h-[70vh] flex flex-col relative z-10 pb-safe"
            >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 className="font-bold text-lg text-gray-800">选择就餐点</h3>
                    <button onClick={onClose} className="p-1"><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="p-4 overflow-y-auto space-y-3 smooth-scroll">
                    <div className="text-xs text-gray-500 font-medium">当前定位附近</div>
                    {canteens.map(canteen => (
                        <div
                            key={canteen.id}
                            onClick={() => onSelect(canteen)}
                            className={`flex justify-between items-center p-4 rounded-xl border transition-colors active:scale-[0.99] ${selectedCanteen.id === canteen.id ? 'border-primary-600 bg-primary-50' : 'border-gray-100 bg-white'}`}
                        >
                            <div className="flex-1">
                                <div className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                    {canteen.name}
                                    {selectedCanteen.id === canteen.id && <span className="text-primary-600 text-[10px] border border-primary-600 px-1 rounded">当前</span>}
                                    {canteen.status === 'CLOSED' && <span className="text-red-500 text-[10px] border border-red-500 px-1 rounded">关停</span>}
                                    {canteen.status === 'BUSY' && <span className="text-yellow-500 text-[10px] border border-yellow-500 px-1 rounded">繁忙</span>}
                                    {canteen.status === 'OPEN' && <span className="text-green-500 text-[10px] border border-green-500 px-1 rounded">开启</span>}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{canteen.address}</div>
                            </div>
                            <div className="text-xs font-medium text-gray-600 flex items-center gap-1 shrink-0 ml-4">
                                <MapPin size={12} /> {canteen.distance}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};
