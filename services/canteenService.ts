import { supabase } from '../utils/supabase';
import { Canteen, ApiResponse } from '../types';

// 获取食堂列表
export const getCanteens = async (sortByDistance = false, userCoords?: { latitude: number; longitude: number } | null): Promise<ApiResponse<Canteen[]>> => {
    try {
        // 尝试从数据库获取食堂列表
        try {
            const { data, error } = await supabase
                .from('canteens')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                throw error;
            }

            // Map supabase data (snake_case) to app types (CamelCase)
            let canteens = data.map((item: any) => ({
                id: String(item.id),
                name: item.name,
                address: item.address,
                distance: item.distance,
                latitude: item.latitude,
                longitude: item.longitude,
                status: item.status,
                contactPhone: item.contact_phone,
                manager: item.manager,
                capacity: item.capacity,
                currentOrders: item.current_orders,
                isAutoAcceptOrders: item.is_auto_accept_orders,
                autoAcceptDelay: item.auto_accept_delay,
                weekdayOpenTime: item.weekday_open_time,
                weekdayCloseTime: item.weekday_close_time,
                weekendOpenTime: item.weekend_open_time,
                weekendCloseTime: item.weekend_close_time,
                stockAlertThreshold: item.stock_alert_threshold,
                isLowStockNotification: item.is_low_stock_notification,
                notificationPhones: item.notification_phones,
                isDeliveryActive: item.is_delivery_active,
                deliveryRadius: item.delivery_radius,
                minDeliveryAmount: item.min_delivery_amount,
                deliveryFee: item.delivery_fee,
                freeDeliveryThreshold: item.free_delivery_threshold,
                defaultPackagingFee: item.default_packaging_fee,
                createdAt: item.created_at,
                updatedAt: item.updated_at
            }));

            // 如果需要按距离排序且用户已同意定位（userCoords不为null）
            if (sortByDistance && userCoords) {
                // 使用数据库中存储的实际食堂坐标计算距离
                // 计算每个食堂到用户的距离并排序
                canteens = canteens
                    .map(canteen => {
                        // 使用食堂实际的经纬度坐标
                        const coords = {
                            latitude: canteen.latitude,
                            longitude: canteen.longitude
                        };
                        
                        // 计算距离（单位：公里）
                        const R = 6371;
                        const dLat = (coords.latitude - userCoords.latitude) * Math.PI / 180;
                        const dLon = (coords.longitude - userCoords.longitude) * Math.PI / 180;
                        const a = 
                            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                            Math.cos(userCoords.latitude * Math.PI / 180) * Math.cos(coords.latitude * Math.PI / 180) *
                            Math.sin(dLon / 2) * Math.sin(dLon / 2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        const distance = R * c;
                        
                        // 更新食堂的距离显示
                        let distanceStr;
                        if (distance < 1) {
                            distanceStr = `${Math.round(distance * 1000)}m`;
                        } else {
                            distanceStr = `${distance.toFixed(1)}km`;
                        }
                        
                        return {
                            ...canteen,
                            distance: distanceStr
                        };
                    })
                    .sort((a, b) => {
                        // 按距离排序，近的在前
                        const aDist = parseFloat(a.distance.replace('m', '').replace('km', ''));
                        const bDist = parseFloat(b.distance.replace('m', '').replace('km', ''));
                        const aUnit = a.distance.includes('km') ? 1000 : 1;
                        const bUnit = b.distance.includes('km') ? 1000 : 1;
                        return (aDist * aUnit) - (bDist * bUnit);
                    });
            }

            return {
                code: 200,
                message: '获取成功',
                data: canteens
            };
        } catch (dbError) {
            // 数据库连接失败时，返回模拟数据
            console.warn('Database connection failed, using mock canteens data:', dbError);
            
            // 模拟食堂数据
            let mockCanteens: Canteen[] = [
                {
                    id: '1',
                    name: '万科滨河道店 (当前定位)',
                    address: '滨河道1号',
                    distance: '0m',
                    latitude: 39.9042,
                    longitude: 116.4074,
                    status: 'OPEN',
                    contactPhone: '13800138000',
                    manager: '张经理',
                    capacity: 200,
                    currentOrders: 0,
                    isAutoAcceptOrders: false,
                    autoAcceptDelay: 30,
                    weekdayOpenTime: '08:00',
                    weekdayCloseTime: '20:00',
                    weekendOpenTime: '09:00',
                    weekendCloseTime: '18:00',
                    stockAlertThreshold: 10,
                    isLowStockNotification: false,
                    notificationPhones: [],
                    isDeliveryActive: true,
                    deliveryRadius: 5,
                    minDeliveryAmount: 20,
                    deliveryFee: 2.5,
                    freeDeliveryThreshold: 50,
                    defaultPackagingFee: 0.5,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '2',
                    name: '一食堂 (A区)',
                    address: '教学楼A区东侧',
                    distance: '150m',
                    latitude: 39.9043,
                    longitude: 116.4075,
                    status: 'OPEN',
                    contactPhone: '13800138001',
                    manager: '李经理',
                    capacity: 300,
                    currentOrders: 0,
                    isAutoAcceptOrders: false,
                    autoAcceptDelay: 30,
                    weekdayOpenTime: '08:00',
                    weekdayCloseTime: '20:00',
                    weekendOpenTime: '09:00',
                    weekendCloseTime: '18:00',
                    stockAlertThreshold: 10,
                    isLowStockNotification: false,
                    notificationPhones: [],
                    isDeliveryActive: true,
                    deliveryRadius: 5,
                    minDeliveryAmount: 20,
                    deliveryFee: 2.5,
                    freeDeliveryThreshold: 50,
                    defaultPackagingFee: 0.5,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '3',
                    name: '二食堂 (B区)',
                    address: '宿舍楼B区南侧',
                    distance: '800m',
                    latitude: 39.9044,
                    longitude: 116.4076,
                    status: 'OPEN',
                    contactPhone: '13800138002',
                    manager: '王经理',
                    capacity: 250,
                    currentOrders: 0,
                    isAutoAcceptOrders: false,
                    autoAcceptDelay: 30,
                    weekdayOpenTime: '08:00',
                    weekdayCloseTime: '20:00',
                    weekendOpenTime: '09:00',
                    weekendCloseTime: '18:00',
                    stockAlertThreshold: 10,
                    isLowStockNotification: false,
                    notificationPhones: [],
                    isDeliveryActive: true,
                    deliveryRadius: 5,
                    minDeliveryAmount: 20,
                    deliveryFee: 2.5,
                    freeDeliveryThreshold: 50,
                    defaultPackagingFee: 0.5,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            // 如果需要按距离排序且用户已同意定位（userCoords不为null），计算距离并排序
            if (sortByDistance && userCoords) {
                // 使用模拟数据中食堂的实际坐标计算距离
                // 计算每个食堂到用户的距离并排序
                mockCanteens = mockCanteens
                    .map(canteen => {
                        // 使用模拟数据中食堂的实际经纬度坐标
                        const coords = {
                            latitude: canteen.latitude,
                            longitude: canteen.longitude
                        };
                        
                        // 计算距离（单位：公里）
                        const R = 6371;
                        const dLat = (coords.latitude - userCoords.latitude) * Math.PI / 180;
                        const dLon = (coords.longitude - userCoords.longitude) * Math.PI / 180;
                        const a = 
                            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                            Math.cos(userCoords.latitude * Math.PI / 180) * Math.cos(coords.latitude * Math.PI / 180) *
                            Math.sin(dLon / 2) * Math.sin(dLon / 2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        const distance = R * c;
                        
                        // 更新食堂的距离显示
                        let distanceStr;
                        if (distance < 1) {
                            distanceStr = `${Math.round(distance * 1000)}m`;
                        } else {
                            distanceStr = `${distance.toFixed(1)}km`;
                        }
                        
                        return {
                            ...canteen,
                            distance: distanceStr
                        };
                    })
                    .sort((a, b) => {
                        // 按距离排序，近的在前
                        const aDist = parseFloat(a.distance.replace('m', '').replace('km', ''));
                        const bDist = parseFloat(b.distance.replace('m', '').replace('km', ''));
                        const aUnit = a.distance.includes('km') ? 1000 : 1;
                        const bUnit = b.distance.includes('km') ? 1000 : 1;
                        return (aDist * aUnit) - (bDist * bUnit);
                    });
            }

            return {
                code: 200,
                message: '获取成功（模拟数据）',
            data: mockCanteens
            };
        }
    } catch (error: any) {
        console.error('Error fetching canteens:', error);
        return {
            code: 500,
            message: error.message || '获取食堂列表失败',
            data: []
        };
    }
};

// 获取食堂详情
export const getCanteenById = async (id: string): Promise<ApiResponse<Canteen | null>> => {
    try {
        const { data, error } = await supabase
            .from('canteens')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return {
                code: 404,
                message: '食堂不存在',
                data: null
            };
        }

        // Map supabase data (snake_case) to app types (CamelCase)
        const canteen: Canteen = {
            id: String(data.id),
            name: data.name,
            address: data.address,
            distance: data.distance,
            latitude: data.latitude,
            longitude: data.longitude,
            status: data.status,
            contactPhone: data.contact_phone,
            manager: data.manager,
            capacity: data.capacity,
            currentOrders: data.current_orders,
            isAutoAcceptOrders: data.is_auto_accept_orders,
            autoAcceptDelay: data.auto_accept_delay,
            weekdayOpenTime: data.weekday_open_time,
            weekdayCloseTime: data.weekday_close_time,
            weekendOpenTime: data.weekend_open_time,
            weekendCloseTime: data.weekend_close_time,
            stockAlertThreshold: data.stock_alert_threshold,
            isLowStockNotification: data.is_low_stock_notification,
            notificationPhones: data.notification_phones,
            isDeliveryActive: data.is_delivery_active,
            deliveryRadius: data.delivery_radius,
            minDeliveryAmount: data.min_delivery_amount,
            deliveryFee: data.delivery_fee,
            freeDeliveryThreshold: data.free_delivery_threshold,
            defaultPackagingFee: data.default_packaging_fee,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };

        return {
            code: 200,
            message: '获取成功',
            data: canteen
        };
    } catch (error: any) {
        console.error('Error fetching canteen:', error);
        return {
            code: 500,
            message: error.message || '获取食堂详情失败',
            data: null
        };
    }
};

// 获取当前定位附近的食堂
export const getNearbyCanteens = async (): Promise<ApiResponse<Canteen[]>> => {
    try {
        // 尝试从数据库获取附近食堂列表
        try {
            // Note: This is a simplified implementation. In a real app, you would use a spatial database query
            // to calculate actual distances based on latitude and longitude.
            const { data, error } = await supabase
                .from('canteens')
                .select('*')
                .order('distance', { ascending: true });

            if (error) {
                throw error;
            }

            // Map supabase data (snake_case) to app types (CamelCase)
            const canteens = data.map((item: any) => ({
                id: String(item.id),
                name: item.name,
                address: item.address,
                distance: item.distance,
                latitude: item.latitude,
                longitude: item.longitude,
                status: item.status,
                contactPhone: item.contact_phone,
                manager: item.manager,
                capacity: item.capacity,
                currentOrders: item.current_orders,
                isAutoAcceptOrders: item.is_auto_accept_orders,
                autoAcceptDelay: item.auto_accept_delay,
                weekdayOpenTime: item.weekday_open_time,
                weekdayCloseTime: item.weekday_close_time,
                weekendOpenTime: item.weekend_open_time,
                weekendCloseTime: item.weekend_close_time,
                stockAlertThreshold: item.stock_alert_threshold,
                isLowStockNotification: item.is_low_stock_notification,
                notificationPhones: item.notification_phones,
                isDeliveryActive: item.is_delivery_active,
                deliveryRadius: item.delivery_radius,
                minDeliveryAmount: item.min_delivery_amount,
                deliveryFee: item.delivery_fee,
                freeDeliveryThreshold: item.free_delivery_threshold,
                defaultPackagingFee: item.default_packaging_fee,
                createdAt: item.created_at,
                updatedAt: item.updated_at
            }));

            return {
                code: 200,
                message: '获取成功',
                data: canteens
            };
        } catch (dbError) {
            // 数据库连接失败时，返回模拟数据
            console.warn('Database connection failed, using mock nearby canteens data:', dbError);
            
            // 模拟附近食堂数据（按距离排序）
            const mockNearbyCanteens: Canteen[] = [
                {
                    id: '1',
                    name: '万科滨河道店 (当前定位)',
                    address: '滨河道1号',
                    distance: '0m',
                    latitude: 39.9042,
                    longitude: 116.4074,
                    status: 'OPEN',
                    contactPhone: '13800138000',
                    manager: '张经理',
                    capacity: 200,
                    currentOrders: 0,
                    isAutoAcceptOrders: false,
                    autoAcceptDelay: 30,
                    weekdayOpenTime: '08:00',
                    weekdayCloseTime: '20:00',
                    weekendOpenTime: '09:00',
                    weekendCloseTime: '18:00',
                    stockAlertThreshold: 10,
                    isLowStockNotification: false,
                    notificationPhones: [],
                    isDeliveryActive: true,
                    deliveryRadius: 5,
                    minDeliveryAmount: 20,
                    deliveryFee: 2.5,
                    freeDeliveryThreshold: 50,
                    defaultPackagingFee: 0.5,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '2',
                    name: '一食堂 (A区)',
                    address: '教学楼A区东侧',
                    distance: '150m',
                    latitude: 39.9043,
                    longitude: 116.4075,
                    status: 'OPEN',
                    contactPhone: '13800138001',
                    manager: '李经理',
                    capacity: 300,
                    currentOrders: 0,
                    isAutoAcceptOrders: false,
                    autoAcceptDelay: 30,
                    weekdayOpenTime: '08:00',
                    weekdayCloseTime: '20:00',
                    weekendOpenTime: '09:00',
                    weekendCloseTime: '18:00',
                    stockAlertThreshold: 10,
                    isLowStockNotification: false,
                    notificationPhones: [],
                    isDeliveryActive: true,
                    deliveryRadius: 5,
                    minDeliveryAmount: 20,
                    deliveryFee: 2.5,
                    freeDeliveryThreshold: 50,
                    defaultPackagingFee: 0.5,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '3',
                    name: '二食堂 (B区)',
                    address: '宿舍楼B区南侧',
                    distance: '800m',
                    latitude: 39.9044,
                    longitude: 116.4076,
                    status: 'OPEN',
                    contactPhone: '13800138002',
                    manager: '王经理',
                    capacity: 250,
                    currentOrders: 0,
                    isAutoAcceptOrders: false,
                    autoAcceptDelay: 30,
                    weekdayOpenTime: '08:00',
                    weekdayCloseTime: '20:00',
                    weekendOpenTime: '09:00',
                    weekendCloseTime: '18:00',
                    stockAlertThreshold: 10,
                    isLowStockNotification: false,
                    notificationPhones: [],
                    isDeliveryActive: true,
                    deliveryRadius: 5,
                    minDeliveryAmount: 20,
                    deliveryFee: 2.5,
                    freeDeliveryThreshold: 50,
                    defaultPackagingFee: 0.5,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            return {
                code: 200,
                message: '获取成功（模拟数据）',
                data: mockNearbyCanteens
            };
        }
    } catch (error: any) {
        console.error('Error fetching nearby canteens:', error);
        return {
            code: 500,
            message: error.message || '获取附近食堂失败',
            data: []
        };
    }
};
