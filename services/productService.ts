import { supabase } from '../utils/supabase';
import { Product, Category, ApiResponse, ProductStatus } from '../types';

// 获取商品列表
export const getProducts = async (params: {
    keyword?: string;
    category?: string;
    status?: string;
    canteenId?: string;
}): Promise<ApiResponse<Product[]>> => {
    try {
        // 尝试从数据库获取商品列表
        try {
            let query = supabase
                .from('products')
                .select('*, canteen:canteens(*)')
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (params.keyword) {
                query = query.ilike('name', `%${params.keyword}%`);
            }
            if (params.category) {
                query = query.eq('category', params.category);
            }
            if (params.status) {
                query = query.eq('status', params.status);
            }
            if (params.canteenId) {
                query = query.eq('canteen_id', params.canteenId);
            }

            const { data, error } = await query

            if (error) {
                throw error;
            }

            // Map supabase data (snake_case) to app types (CamelCase)
            const products = data.map((item: any) => ({
                id: String(item.id),
                name: item.name,
                description: item.description,
                price: item.price,
                originalPrice: item.original_price,
                category: item.category,
                image: item.image,
                images: item.images,
                stock: item.stock,
                stockAlert: item.stock_alert,
                sales: item.sales,
                tags: item.tags || [],
                status: item.status,
                isRecommended: item.is_recommended,
                isFeatured: item.is_featured,
                isCombo: item.is_combo,
                sortOrder: item.sort_order,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
                canteenId: String(item.canteen_id),
                canteen: item.canteen ? {
                    id: String(item.canteen.id),
                    name: item.canteen.name,
                    address: item.canteen.address,
                    distance: item.canteen.distance,
                    latitude: item.canteen.latitude,
                    longitude: item.canteen.longitude,
                    status: item.canteen.status,
                    contactPhone: item.canteen.contact_phone,
                    manager: item.canteen.manager,
                    weekdayOpenTime: item.canteen.weekday_open_time,
                    weekdayCloseTime: item.canteen.weekday_close_time,
                    weekendOpenTime: item.canteen.weekend_open_time,
                    weekendCloseTime: item.canteen.weekend_close_time,
                    isDeliveryActive: item.canteen.is_delivery_active,
                    deliveryRadius: item.canteen.delivery_radius,
                    deliveryFee: item.canteen.delivery_fee,
                    defaultPackagingFee: item.canteen.default_packaging_fee,
                    isAutoAcceptOrders: item.canteen.is_auto_accept_orders,
                    stockAlertThreshold: item.canteen.stock_alert_threshold,
                    isLowStockNotification: item.canteen.is_low_stock_notification,
                    minDeliveryAmount: item.canteen.min_delivery_amount,
                    freeDeliveryThreshold: item.canteen.free_delivery_threshold,
                } : undefined,
                comboItems: item.combo_items
            }));

            return {
                code: 200,
                message: '获取商品列表成功',
                data: products
            };
        } catch (dbError) {
            // 数据库连接失败时，返回模拟数据
            console.warn('Database connection failed, using mock products data:', dbError);

            // 模拟商品数据
            const mockProducts: Product[] = [
                {
                    id: '1',
                    name: '川味宫保鸡丁',
                    description: '精选嫩滑鸡粒，搭配酥脆花生与正宗川味干辣椒，酱香浓郁，回味微甜。',
                    price: 12.50,
                    originalPrice: 15.00,
                    category: 'MAINS' as any,
                    image: 'https://via.placeholder.com/800x800?text=川味宫保鸡丁',
                    images: [],
                    stock: 50,
                    stockAlert: 10,
                    sales: 1205,
                    tags: ['香辣', '招牌'],
                    status: 'ACTIVE',
                    isRecommended: true,
                    isFeatured: true,
                    isCombo: false,
                    sortOrder: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    canteenId: params.canteenId || '1',
                    comboItems: []
                },
                {
                    id: '2',
                    name: '台式秘制卤肉饭',
                    description: '慢火细熬手切五花肉，油亮肥美不松散，浸润每一粒精选香米。',
                    price: 15.00,
                    originalPrice: 18.00,
                    category: 'MAINS' as any,
                    image: 'https://via.placeholder.com/800x800?text=台式秘制卤肉饭',
                    images: [],
                    stock: 30,
                    stockAlert: 5,
                    sales: 890,
                    tags: ['销量王'],
                    status: 'ACTIVE',
                    isRecommended: true,
                    isFeatured: false,
                    isCombo: false,
                    sortOrder: 2,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    canteenId: params.canteenId || '1',
                    comboItems: []
                },
                {
                    id: '3',
                    name: '田园清炒时蔬',
                    description: '每日清晨直采时令鲜蔬，极致火候快炒，保留食材原本的清脆与鲜甜。',
                    price: 9.00,
                    originalPrice: 10.00,
                    category: 'MAINS' as any,
                    image: 'https://via.placeholder.com/800x800?text=田园清炒时蔬',
                    images: [],
                    stock: 100,
                    stockAlert: 20,
                    sales: 450,
                    tags: ['素食', '健康'],
                    status: 'ACTIVE',
                    isRecommended: false,
                    isFeatured: false,
                    isCombo: false,
                    sortOrder: 3,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    canteenId: params.canteenId || '1',
                    comboItems: []
                },
                {
                    id: '4',
                    name: '爆汁手打柠檬茶',
                    description: '精选广东香水柠檬，暴力手打出汁，茶底醇厚，清爽解腻的最佳拍档。',
                    price: 4.00,
                    originalPrice: 5.00,
                    category: 'DRINKS' as any,
                    image: 'https://via.placeholder.com/800x800?text=爆汁手打柠檬茶',
                    images: [],
                    stock: 200,
                    stockAlert: 50,
                    sales: 1500,
                    tags: ['冰镇'],
                    status: 'ACTIVE',
                    isRecommended: true,
                    isFeatured: true,
                    isCombo: false,
                    sortOrder: 4,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    canteenId: params.canteenId || '1',
                    comboItems: []
                },
                {
                    id: '5',
                    name: '经典醇香珍珠奶茶',
                    description: '进口锡兰红茶底，混合新西兰牧场牛乳，珍珠Q弹软糯，甜而不腻。',
                    price: 6.00,
                    originalPrice: 7.00,
                    category: 'DRINKS' as any,
                    image: 'https://via.placeholder.com/800x800?text=经典醇香珍珠奶茶',
                    images: [],
                    stock: 150,
                    stockAlert: 30,
                    sales: 980,
                    tags: ['甜蜜'],
                    status: 'ACTIVE',
                    isRecommended: false,
                    isFeatured: false,
                    isCombo: false,
                    sortOrder: 5,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    canteenId: params.canteenId || '1',
                    comboItems: []
                }
            ];

            // 根据参数过滤模拟数据
            let filteredProducts = [...mockProducts];
            if (params.keyword) {
                const keyword = params.keyword.toLowerCase();
                filteredProducts = filteredProducts.filter(p =>
                    p.name.toLowerCase().includes(keyword) ||
                    p.description.toLowerCase().includes(keyword)
                );
            }
            if (params.category) {
                filteredProducts = filteredProducts.filter(p => p.category === params.category);
            }
            if (params.status) {
                filteredProducts = filteredProducts.filter(p => p.status === params.status);
            }

            return {
                code: 200,
                message: '获取商品列表成功（模拟数据）',
                data: filteredProducts
            };
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        return {
            code: 500,
            message: '获取商品列表失败',
            data: []
        };
    }
};

// 获取商品详情
export const getProductById = async (id: string): Promise<ApiResponse<Product | null>> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*, canteen:canteens(*)')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return {
                code: 404,
                message: '商品不存在',
                data: null
            };
        }

        const product: Product = {
            id: String(data.id),
            name: data.name,
            description: data.description,
            price: data.price,
            originalPrice: data.original_price,
            category: data.category as Category,
            image: data.image,
            images: data.images,
            stock: data.stock,
            stockAlert: data.stock_alert,
            sales: data.sales,
            tags: data.tags || [],
            status: data.status as ProductStatus,
            isRecommended: data.is_recommended,
            isFeatured: data.is_featured,
            isCombo: data.is_combo,
            sortOrder: data.sort_order,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            canteenId: data.canteen_id,
            canteen: data.canteen ? {
                id: String(data.canteen.id),
                name: data.canteen.name,
                address: data.canteen.address,
                distance: data.canteen.distance,
                latitude: data.canteen.latitude,
                longitude: data.canteen.longitude,
                status: data.canteen.status,
                contactPhone: data.canteen.contact_phone,
                manager: data.canteen.manager,
                weekdayOpenTime: data.canteen.weekday_open_time,
                weekdayCloseTime: data.canteen.weekday_close_time,
                weekendOpenTime: data.canteen.weekend_open_time,
                weekendCloseTime: data.canteen.weekend_close_time,
                isDeliveryActive: data.canteen.is_delivery_active,
                deliveryRadius: data.canteen.delivery_radius,
                deliveryFee: data.canteen.delivery_fee,
                defaultPackagingFee: data.canteen.default_packaging_fee,
                isAutoAcceptOrders: data.canteen.is_auto_accept_orders,
                stockAlertThreshold: data.canteen.stock_alert_threshold,
                isLowStockNotification: data.canteen.is_low_stock_notification,
                minDeliveryAmount: data.canteen.min_delivery_amount,
                freeDeliveryThreshold: data.canteen.free_delivery_threshold,
            } : undefined,
            comboItems: data.combo_items
        };

        return {
            code: 200,
            message: '获取成功',
            data: product
        };
    } catch (error: any) {
        console.error('Error fetching product:', error);
        return {
            code: 500,
            message: error.message || '获取商品详情失败',
            data: null
        };
    }
};
