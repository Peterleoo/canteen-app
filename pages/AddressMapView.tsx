import React, { useState, useEffect, useRef } from 'react';
import { AddressInfo } from '../utils/location';
import AMapLoader from '@amap/amap-jsapi-loader';

interface AddressMapViewProps {
    onSelect: (addressInfo: AddressInfo) => void;
    onBack: () => void;
}

export const AddressMapView: React.FC<AddressMapViewProps> = ({ onSelect, onBack }) => {
    const [selectedAddress, setSelectedAddress] = useState<AddressInfo | null>(null);
    const [poiList, setPoiList] = useState<any[]>([]); 
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    
    const mapInstanceRef = useRef<any>(null);
    const mapDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initMap = async () => {
            if (!mapDivRef.current) return;
            
            try {
                // 加载高德地图API（用于前端显示）
                await AMapLoader.load({
                    key: import.meta.env.VITE_AMAP_MAP_AK || '',
                    version: '2.0',
                    plugins: ['AMap.PlaceSearch']
                });

                // 初始化地图
                const map = new (window as any).AMap.Map(mapDivRef.current, {
                    center: [112.991201, 28.199110], // 初始中心点：长沙
                    zoom: 17,
                    viewMode: '3D'
                });
                mapInstanceRef.current = map;

                // 监听地图移动结束，自动获取新中心点的地址
                map.on('moveend', () => {
                    const newCenter = map.getCenter();
                    fetchNearbyPois(newCenter);
                });

                // 初始加载
                fetchNearbyPois({ lng: 112.991201, lat: 28.199110 });
            } catch (error) {
                console.error('地图初始化失败:', error);
            }
        };

        initMap();
    }, []);

    // 获取中心点周边的地址数据
    const fetchNearbyPois = async (center: any) => {
        setIsLoading(true);
        const lng = center.lng || (Array.isArray(center) ? center[0] : center.getLng?.());
        const lat = center.lat || (Array.isArray(center) ? center[1] : center.getLat?.());
        
        try {
            // 请求Supabase Edge Function，包含 extensions=all 以获取周边 POI
            const response = await fetch(
                `https://oydpsiutmuoaipieagid.supabase.co/functions/v1/reverse-geocode?lat=${lat}&lng=${lng}&radius=500&extensions=all`
            );
            const data = await response.json();
            
            // --- 情况 A: 处理高德地图数据 (当前你的后端返回格式) ---
            if (data.status === '1' && data.regeocode) {
                const res = data.regeocode;
                const component = res.addressComponent;
                
                // 1. 获取核心名称：优先取 AOI (小区名/院落名)
                const coreName = res.aois && res.aois.length > 0 
                    ? res.aois[0].name 
                    : (res.building?.name || res.formatted_address);

                const currentInfo: AddressInfo = {
                    fullAddress: res.formatted_address,
                    province: component.province || '',
                    city: component.city || '',
                    district: component.district || '',
                    street: typeof component.streetNumber?.street === 'string' ? component.streetNumber.street : '',
                    streetNumber: typeof component.streetNumber?.number === 'string' ? component.streetNumber.number : '',
                    coordinates: { latitude: lat, longitude: lng }
                };
                setSelectedAddress(currentInfo);

                // 2. 处理周边列表
                const formattedPois = (res.pois || []).map((poi: any) => ({
                    id: poi.id,
                    name: poi.name,
                    address: poi.address,
                    location: {
                        lng: parseFloat(poi.location.split(',')[0]),
                        lat: parseFloat(poi.location.split(',')[1])
                    }
                }));
                
                // 如果 POI 为空，塞入当前位置
                if (formattedPois.length === 0) {
                    formattedPois.push({ name: coreName, address: res.formatted_address, location: { lng, lat } });
                }
                setPoiList(formattedPois);

            } 
            // --- 情况 B: 处理百度地图数据 (兼容逻辑) ---
            else if (data.status === 0 && data.result) {
                const res = data.result;
                const component = res.addressComponent;
                
                setSelectedAddress({
                    fullAddress: res.formatted_address,
                    province: component.province || '',
                    city: component.city || '',
                    district: component.district || '',
                    street: component.street || '',
                    streetNumber: component.street_number || '',
                    coordinates: { latitude: lat, longitude: lng }
                });

                const formattedPois = (res.pois || []).map((poi: any) => ({
                    id: poi.uid,
                    name: poi.name,
                    address: poi.addr || poi.address,
                    location: {
                        lng: poi.point?.x || poi.location?.lng,
                        lat: poi.point?.y || poi.location?.lat
                    }
                }));
                setPoiList(formattedPois.length > 0 ? formattedPois : [{ name: res.formatted_address, address: res.formatted_address, location: { lng, lat } }]);
            }
        } catch (e) {
            console.error("查询周边失败", e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-[120] flex flex-col overflow-hidden font-sans">
            {/* 顶部搜索栏 */}
            <div className="bg-white shrink-0 z-30 px-2 py-2 flex items-center border-b border-gray-100">
                <button onClick={onBack} className="p-2 active:opacity-50">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div className="flex-1 bg-[#f2f3f5] rounded-lg flex items-center px-3 py-1.5 mx-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" className="mr-2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input 
                        className="bg-transparent text-sm flex-1 outline-none" 
                        placeholder="搜索收货地址"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>

            {/* 地图区域 */}
            <div className="relative h-[40vh] shrink-0 bg-gray-100">
                <div ref={mapDivRef} className="w-full h-full" />
                
                {/* 中心固定图钉 */}
                <div 
                    className="absolute top-1/2 left-1/2 z-20 pointer-events-none flex flex-col items-center"
                    style={{ transform: 'translate(-50%, -100%)', marginTop: '-2px' }}
                >
                    <svg width="36" height="36" viewBox="0 0 24 24">
                        <path fill="#1677ff" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                    </svg>
                    <div className="w-2 h-1 bg-black/20 rounded-full blur-[1px]"></div>
                </div>
            </div>

            {/* 周边地址列表 */}
            <div className="flex-1 bg-white flex flex-col overflow-hidden rounded-t-3xl -mt-5 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="flex-1 overflow-y-auto px-4 pt-4">
                    {isLoading && poiList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-gray-400 mt-2">正在定位周边...</span>
                        </div>
                    ) : (
                        poiList.map((poi, index) => (
                            <div 
                                key={poi.id || index}
                                className="py-4 border-b border-gray-50 flex items-start active:bg-gray-50 transition-colors"
                                onClick={() => {
                                    // 点击列表项，移动地图中心
                                    if (mapInstanceRef.current) {
                                        mapInstanceRef.current.panTo([poi.location.lng, poi.location.lat]);
                                    }
                                }}
                            >
                                <div className="mr-3 mt-1">
                                    <svg className={`w-4 h-4 ${index === 0 ? 'text-blue-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="text-[15px] font-bold text-gray-800 leading-tight">
                                        {poi.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                                        {poi.address || '暂无详细地址'}
                                    </div>
                                </div>
                                {index === 0 && (
                                    <div className="text-blue-500 self-center ml-2">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5"/></svg>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* 底部确认按钮 */}
                <div className="p-4 bg-white border-t border-gray-100 shrink-0 mb-safe">
                    <button 
                        disabled={!selectedAddress}
                        onClick={() => selectedAddress && onSelect(selectedAddress)}
                        className={`w-full py-3.5 rounded-2xl font-bold text-base transition-all ${
                            selectedAddress 
                            ? 'bg-[#1677ff] text-white active:scale-[0.98]' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        确认选择地址
                    </button>
                </div>
            </div>
        </div>
    );
};