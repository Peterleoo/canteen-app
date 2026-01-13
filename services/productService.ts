import { supabase } from '../utils/supabase';
import { Product, Category, ApiResponse, ProductStatus } from '../types';

// 获取商品列表
export const getProducts = async (params: {
    keyword?: string;
    category?: Category;
    status?: ProductStatus;
}): Promise<ApiResponse<Product[]>> => {
    try {
        let query = supabase
            .from('products')
            .select('*', { count: 'exact' })
            .eq('status', 'ACTIVE');

        if (params.keyword) {
            query = query.ilike('name', `%${params.keyword}%`);
        }
        if (params.category) {
            query = query.eq('category', params.category);
        }
        if (params.status) {
            query = query.eq('status', params.status);
        }

        const { data, error } = await query
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false });

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
            category: item.category as Category,
            image: item.image,
            images: item.images,
            stock: item.stock,
            stockAlert: item.stock_alert,
            sales: item.sales,
            tags: item.tags || [],
            status: item.status as ProductStatus,
            isRecommended: item.is_recommended,
            isFeatured: item.is_featured,
            isCombo: item.is_combo,
            sortOrder: item.sort_order,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            canteenId: item.canteen_id,
            comboItems: item.combo_items
        }));

        return {
            code: 200,
            message: '获取成功',
            data: products
        };
    } catch (error: any) {
        console.error('Error fetching products:', error);
        return {
            code: 500,
            message: error.message || '获取商品列表失败',
            data: []
        };
    }
};

// 获取商品详情
export const getProductById = async (id: string): Promise<ApiResponse<Product | null>> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
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
