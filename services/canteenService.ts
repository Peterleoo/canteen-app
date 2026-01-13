import { supabase } from '../utils/supabase';
import { Canteen, ApiResponse } from '../types';

// 获取食堂列表
export const getCanteens = async (): Promise<ApiResponse<Canteen[]>> => {
    try {
        const { data, error } = await supabase
            .from('canteens')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            throw error;
        }

        // Map supabase data (snake_case) to app types (CamelCase)
        const canteens = data.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            address: item.address,
            distance: item.distance,
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
    } catch (error: any) {
        console.error('Error fetching nearby canteens:', error);
        return {
            code: 500,
            message: error.message || '获取附近食堂失败',
            data: []
        };
    }
};
