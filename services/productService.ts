import { supabase } from '../utils/supabase';
import { Product, Category } from '../types';

export const getProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'ACTIVE'); // Only fetch active products

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    // Map supabase data (snake_case) to app types (CamelCase)
    return data.map((item: any) => ({
        id: String(item.id),
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category as Category,
        image: item.image,
        stock: item.stock,
        sales: item.sales,
        tags: item.tags || [],
        comboItems: item.combo_items // If combo items exist
    }));
};

export const getProductById = async (id: string): Promise<Product | null> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', Number(id)) // Database uses number ID
        .single();

    if (error) {
        console.error('Error fetching product:', error);
        return null;
    }

    return {
        id: String(data.id),
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category as Category,
        image: data.image,
        stock: data.stock,
        sales: data.sales,
        tags: data.tags || [],
        comboItems: data.combo_items
    };
};
