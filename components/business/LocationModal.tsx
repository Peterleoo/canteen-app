import React from 'react';
import { X, MapPin } from 'lucide-react';
import { Canteen } from '../../types';
import { CANTEENS } from '../../constants';

interface LocationModalProps {
    selectedCanteen: Canteen;
    onSelect: (canteen: Canteen) => void;
    onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ selectedCanteen, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 z-[1000] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-in-bottom pb-safe">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 className="font-bold text-lg text-gray-800">选择就餐点</h3>
                    <button onClick={onClose} className="p-1"><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="p-4 overflow-y-auto space-y-3">
                    <div className="text-xs text-gray-500 font-medium">当前定位附近</div>
                    {CANTEENS.map(canteen => (
                        <div
                            key={canteen.id}
                            onClick={() => onSelect(canteen)}
                            className={`flex justify-between items-center p-4 rounded-xl border transition-colors active:scale-[0.99] ${selectedCanteen.id === canteen.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white'}`}
                        >
                            <div>
                                <div className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                    {canteen.name}
                                    {selectedCanteen.id === canteen.id && <span className="text-blue-600 text-[10px] border border-blue-600 px-1 rounded">当前</span>}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{canteen.address}</div>
                            </div>
                            <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                <MapPin size={12} /> {canteen.distance}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
