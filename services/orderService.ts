import { supabase } from '../utils/supabase';
import { Order, OrderStatus, ApiResponse } from '../types';

// 获取订单列表
export const getOrders = async (params: {
    userId: string;
    status?: OrderStatus;
}): Promise<ApiResponse<Order[]>> => {
    try {
        let query = supabase
            .from('orders')
            .select('*, order_items(*), users(*), canteens(*)')
            .eq('user_id', params.userId);

        if (params.status) {
            query = query.eq('status', params.status);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Map supabase data (snake_case) to app types (CamelCase)
        const orders = data.map((item: any) => ({
            id: String(item.id),
            userId: item.user_id,
            canteenId: item.canteen_id,
            user: item.users ? {
                id: item.users.id,
                username: item.users.username,
                name: item.users.name,
                phone: item.users.phone,
                avatar: item.users.avatar,
                email: item.users.email,
                status: item.users.status,
                createdAt: item.users.created_at,
                totalOrders: item.users.total_orders,
                totalSpent: item.users.total_spent,
                departmentId: item.users.department_id
            } : undefined,
            canteen: item.canteens ? {
                id: item.canteens.id,
                name: item.canteens.name,
                address: item.canteens.address,
                distance: item.canteens.distance,
                status: item.canteens.status,
                contactPhone: item.canteens.contact_phone,
                manager: item.canteens.manager,
                capacity: item.canteens.capacity,
                currentOrders: item.canteens.current_orders,
                isAutoAcceptOrders: item.canteens.is_auto_accept_orders,
                autoAcceptDelay: item.canteens.auto_accept_delay,
                weekdayOpenTime: item.canteens.weekday_open_time,
                weekdayCloseTime: item.canteens.weekday_close_time,
                weekendOpenTime: item.canteens.weekend_open_time,
                weekendCloseTime: item.canteens.weekend_close_time,
                stockAlertThreshold: item.canteens.stock_alert_threshold,
                isLowStockNotification: item.canteens.is_low_stock_notification,
                notificationPhones: item.canteens.notification_phones,
                isDeliveryActive: item.canteens.is_delivery_active,
                deliveryRadius: item.canteens.delivery_radius,
                minDeliveryAmount: item.canteens.min_delivery_amount,
                deliveryFee: item.canteens.delivery_fee,
                freeDeliveryThreshold: item.canteens.free_delivery_threshold,
                defaultPackagingFee: item.canteens.default_packaging_fee,
                createdAt: item.canteens.created_at,
                updatedAt: item.canteens.updated_at
            } : undefined,
            orderItems: item.order_items ? item.order_items.map((orderItem: any) => ({
                id: orderItem.id,
                orderId: orderItem.order_id,
                productName: orderItem.product_name,
                price: orderItem.price,
                quantity: orderItem.quantity,
                createdAt: orderItem.created_at
            })) : undefined,
            subtotal: item.subtotal,
            packagingFee: item.packaging_fee,
            deliveryFee: item.delivery_fee,
            discountAmount: item.discount_amount,
            total: item.total,
            status: item.status as OrderStatus,
            deliveryMethod: item.delivery_method,
            addressId: item.address_id,
            addressDetail: item.address_detail,
            remark: item.remark,
            cancelReason: item.cancel_reason,
            date: new Date(item.created_at).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }),
            createdAt: item.created_at,
            updatedAt: item.updated_at
        }));

        return {
            code: 200,
            message: '获取成功',
            data: orders
        };
    } catch (error: any) {
        console.error('Error fetching orders:', error);
        return {
            code: 500,
            message: error.message || '获取订单列表失败',
            data: []
        };
    }
};

// 获取订单详情
export const getOrderById = async (id: string): Promise<ApiResponse<Order | null>> => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*), users(*), canteens(*)')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return {
                code: 404,
                message: '订单不存在',
                data: null
            };
        }

        // Map supabase data (snake_case) to app types (CamelCase)
        const order: Order = {
            id: String(data.id),
            userId: data.user_id,
            canteenId: data.canteen_id,
            user: data.users ? {
                id: data.users.id,
                username: data.users.username,
                name: data.users.name,
                phone: data.users.phone,
                avatar: data.users.avatar,
                email: data.users.email,
                status: data.users.status,
                createdAt: data.users.created_at,
                totalOrders: data.users.total_orders,
                totalSpent: data.users.total_spent,
                departmentId: data.users.department_id
            } : undefined,
            canteen: data.canteens ? {
                id: data.canteens.id,
                name: data.canteens.name,
                address: data.canteens.address,
                distance: data.canteens.distance,
                status: data.canteens.status,
                contactPhone: data.canteens.contact_phone,
                manager: data.canteens.manager,
                capacity: data.canteens.capacity,
                currentOrders: data.canteens.current_orders,
                isAutoAcceptOrders: data.canteens.is_auto_accept_orders,
                autoAcceptDelay: data.canteens.auto_accept_delay,
                weekdayOpenTime: data.canteens.weekday_open_time,
                weekdayCloseTime: data.canteens.weekday_close_time,
                weekendOpenTime: data.canteens.weekend_open_time,
                weekendCloseTime: data.canteens.weekend_close_time,
                stockAlertThreshold: data.canteens.stock_alert_threshold,
                isLowStockNotification: data.canteens.is_low_stock_notification,
                notificationPhones: data.canteens.notification_phones,
                isDeliveryActive: data.canteens.is_delivery_active,
                deliveryRadius: data.canteens.delivery_radius,
                minDeliveryAmount: data.canteens.min_delivery_amount,
                deliveryFee: data.canteens.delivery_fee,
                freeDeliveryThreshold: data.canteens.free_delivery_threshold,
                defaultPackagingFee: data.canteens.default_packaging_fee,
                createdAt: data.canteens.created_at,
                updatedAt: data.canteens.updated_at
            } : undefined,
            orderItems: data.order_items ? data.order_items.map((orderItem: any) => ({
                id: orderItem.id,
                orderId: orderItem.order_id,
                productName: orderItem.product_name,
                price: orderItem.price,
                quantity: orderItem.quantity,
                createdAt: orderItem.created_at
            })) : undefined,
            subtotal: data.subtotal,
            packagingFee: data.packaging_fee,
            deliveryFee: data.delivery_fee,
            discountAmount: data.discount_amount,
            total: data.total,
            status: data.status as OrderStatus,
            deliveryMethod: data.delivery_method,
            addressId: data.address_id,
            addressDetail: data.address_detail,
            remark: data.remark,
            cancelReason: data.cancel_reason,
            date: new Date(data.created_at).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }),
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };

        return {
            code: 200,
            message: '获取成功',
            data: order
        };
    } catch (error: any) {
        console.error('Error fetching order:', error);
        return {
            code: 500,
            message: error.message || '获取订单详情失败',
            data: null
        };
    }
};

// 创建订单
export const createOrder = async (orderData: any): Promise<ApiResponse<Order>> => {
    try {
        // Start a transaction
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_id: orderData.userId,
                canteen_id: orderData.canteenId,
                total: orderData.total,
                subtotal: orderData.subtotal,
                delivery_fee: orderData.deliveryFee,
                packaging_fee: orderData.packagingFee,
                discount_amount: orderData.discountAmount || 0,
                status: orderData.status,
                delivery_method: orderData.deliveryMethod,
                address_id: orderData.addressId,
                address_detail: orderData.addressDetail,
                remark: orderData.remark
            }])
            .select()
            .single();

        if (orderError) {
            throw orderError;
        }

        // Insert order items
        const orderItems = orderData.items.map((item: any) => ({
            order_id: order.id,
            product_name: item.name,
            price: item.price,
            quantity: item.quantity
        }));

        const { error: orderItemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (orderItemsError) {
            throw orderItemsError;
        }

        // Update product sales and stock
        for (const item of orderData.items) {
            // Get current product data
            const { data: productData } = await supabase
                .from('products')
                .select('sales, stock')
                .eq('id', item.id)
                .single();
            
            if (productData) {
                await supabase
                    .from('products')
                    .update({
                        sales: productData.sales + item.quantity,
                        stock: productData.stock - item.quantity
                    })
                    .eq('id', item.id);
            }
        }

        // Return the created order
        return {
            code: 200,
            message: '订单创建成功',
            data: {
                id: String(order.id),
                userId: order.user_id,
                canteenId: order.canteen_id,
                total: order.total,
                subtotal: order.subtotal,
                deliveryFee: order.delivery_fee,
                packagingFee: order.packaging_fee,
                discountAmount: order.discount_amount,
                status: order.status as OrderStatus,
                deliveryMethod: order.delivery_method,
                addressId: order.address_id,
                addressDetail: order.address_detail,
                remark: order.remark,
                date: new Date(order.created_at).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                createdAt: order.created_at,
                updatedAt: order.updated_at
            }
        };
    } catch (error: any) {
        console.error('Error creating order:', error);
        return {
            code: 500,
            message: error.message || '创建订单失败',
            data: {} as Order
        };
    }
};

// 更新订单状态
export const updateOrderStatus = async (params: {
    id: string;
    status: OrderStatus;
}): Promise<ApiResponse<Order>> => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .update({
                status: params.status
            })
            .eq('id', params.id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Map supabase data (snake_case) to app types (CamelCase)
        const order: Order = {
            id: String(data.id),
            userId: data.user_id,
            canteenId: data.canteen_id,
            total: data.total,
            subtotal: data.subtotal,
            deliveryFee: data.delivery_fee,
            packagingFee: data.packaging_fee,
            discountAmount: data.discount_amount,
            status: data.status as OrderStatus,
            deliveryMethod: data.delivery_method,
            addressId: data.address_id,
            addressDetail: data.address_detail,
            remark: data.remark,
            cancelReason: data.cancel_reason,
            date: new Date(data.created_at).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }),
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };

        return {
            code: 200,
            message: '订单状态更新成功',
            data: order
        };
    } catch (error: any) {
        console.error('Error updating order status:', error);
        return {
            code: 500,
            message: error.message || '更新订单状态失败',
            data: {} as Order
        };
    }
};
