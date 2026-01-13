import { supabase } from '../utils/supabase';
import { User, ApiResponse } from '../types';

// 获取用户信息
export const getUserById = async (id: string): Promise<ApiResponse<User | null>> => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return {
                code: 404,
                message: '用户不存在',
                data: null
            };
        }

        // Map supabase data (snake_case) to app types (CamelCase)
        const user: User = {
            id: data.id,
            username: data.username,
            name: data.name,
            phone: data.phone,
            avatar: data.avatar,
            email: data.email,
            status: data.status,
            createdAt: data.created_at,
            totalOrders: data.total_orders,
            totalSpent: data.total_spent,
            departmentId: data.department_id
        };

        return {
            code: 200,
            message: '获取成功',
            data: user
        };
    } catch (error: any) {
        console.error('Error fetching user:', error);
        return {
            code: 500,
            message: error.message || '获取用户信息失败',
            data: null
        };
    }
};

// 更新用户信息
export const updateUser = async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
        // Convert camelCase to snake_case for database
        const snakeCaseData: any = {
            name: userData.name,
            phone: userData.phone,
            avatar: userData.avatar,
            email: userData.email
        };

        // Filter out undefined values
        Object.keys(snakeCaseData).forEach(key => {
            if (snakeCaseData[key] === undefined) {
                delete snakeCaseData[key];
            }
        });

        const { data, error } = await supabase
            .from('users')
            .update(snakeCaseData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Map supabase data (snake_case) to app types (CamelCase)
        const updatedUser: User = {
            id: data.id,
            username: data.username,
            name: data.name,
            phone: data.phone,
            avatar: data.avatar,
            email: data.email,
            status: data.status,
            createdAt: data.created_at,
            totalOrders: data.total_orders,
            totalSpent: data.total_spent,
            departmentId: data.department_id
        };

        return {
            code: 200,
            message: '用户信息更新成功',
            data: updatedUser
        };
    } catch (error: any) {
        console.error('Error updating user:', error);
        return {
            code: 500,
            message: error.message || '更新用户信息失败',
            data: {} as User
        };
    }
};

// 获取用户地址列表
export const getUserAddresses = async (userId: string): Promise<ApiResponse<any[]>> => {
    try {
        const { data, error } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Map supabase data (snake_case) to app types (CamelCase)
        const addresses = data.map((item: any) => ({
            id: item.id,
            contactName: item.contact_name,
            phone: item.phone,
            area: item.area,
            detail: item.detail,
            tag: item.tag,
            isDefault: item.is_default,
            userId: item.user_id,
            createdAt: item.created_at,
            updatedAt: item.updated_at
        }));

        return {
            code: 200,
            message: '获取地址列表成功',
            data: addresses
        };
    } catch (error: any) {
        console.error('Error fetching user addresses:', error);
        return {
            code: 500,
            message: error.message || '获取地址列表失败',
            data: []
        };
    }
};

// 创建用户地址
export const createUserAddress = async (addressData: any): Promise<ApiResponse<any>> => {
    try {
        // If this is the default address, set all other addresses to non-default
        if (addressData.isDefault) {
            await supabase
                .from('user_addresses')
                .update({ is_default: false })
                .eq('user_id', addressData.userId);
        }

        const { data, error } = await supabase
            .from('user_addresses')
            .insert([{
                user_id: addressData.userId,
                contact_name: addressData.contactName,
                phone: addressData.phone,
                area: addressData.area,
                detail: addressData.detail,
                tag: addressData.tag,
                is_default: addressData.isDefault
            }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Map supabase data (snake_case) to app types (CamelCase)
        const address = {
            id: data.id,
            contactName: data.contact_name,
            phone: data.phone,
            area: data.area,
            detail: data.detail,
            tag: data.tag,
            isDefault: data.is_default,
            userId: data.user_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };

        return {
            code: 200,
            message: '地址创建成功',
            data: address
        };
    } catch (error: any) {
        console.error('Error creating user address:', error);
        return {
            code: 500,
            message: error.message || '创建地址失败',
            data: null
        };
    }
};

// 更新用户地址
export const updateUserAddress = async (id: string, addressData: any): Promise<ApiResponse<any>> => {
    try {
        // If this is the default address, set all other addresses to non-default
        if (addressData.isDefault) {
            await supabase
                .from('user_addresses')
                .update({ is_default: false })
                .eq('user_id', addressData.userId)
                .neq('id', id);
        }

        const { data, error } = await supabase
            .from('user_addresses')
            .update({
                contact_name: addressData.contactName,
                phone: addressData.phone,
                area: addressData.area,
                detail: addressData.detail,
                tag: addressData.tag,
                is_default: addressData.isDefault
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Map supabase data (snake_case) to app types (CamelCase)
        const address = {
            id: data.id,
            contactName: data.contact_name,
            phone: data.phone,
            area: data.area,
            detail: data.detail,
            tag: data.tag,
            isDefault: data.is_default,
            userId: data.user_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };

        return {
            code: 200,
            message: '地址更新成功',
            data: address
        };
    } catch (error: any) {
        console.error('Error updating user address:', error);
        return {
            code: 500,
            message: error.message || '更新地址失败',
            data: null
        };
    }
};

// 删除用户地址
export const deleteUserAddress = async (id: string): Promise<ApiResponse<any>> => {
    try {
        const { error } = await supabase
            .from('user_addresses')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return {
            code: 200,
            message: '地址删除成功',
            data: null
        };
    } catch (error: any) {
        console.error('Error deleting user address:', error);
        return {
            code: 500,
            message: error.message || '删除地址失败',
            data: null
        };
    }
};
