import { supabase } from '../utils/supabase';
import type { MarketingBanner, Coupon, UserCoupon } from '../types';

export const marketingService = {
  // 获取当前食堂的海报（包含全局海报）
  async getBanners(canteenId?: string): Promise<MarketingBanner[]> {
    let query = supabase
      .from('marketing_banners')
      .select('*')
      .eq('status', 'ACTIVE');
    
    if (canteenId) {
      // 获取全局的 (null) 或当前食堂的
      query = query.or(`canteen_id.is.null,canteen_id.eq.${canteenId}`);
    } else {
      query = query.is('canteen_id', null);
    }

    const { data, error } = await query.order('sort_order', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // 获取可领取的优惠券列表
  async getAvailableCoupons(canteenId: string): Promise<Coupon[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('marketing_coupons')
      .select('*')
      .or(`canteen_id.eq.${canteenId},canteen_id.is.null`)
      .eq('status', 'ACTIVE')
      .lte('start_at', now)
      .gte('end_at', now)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    const list = data || [];
    // 过滤已领完的券 (total_stock 为 -1 表示不限量)
    return list.filter(item => item.total_stock === -1 || item.received_count < item.total_stock);
  },

  // 用户领券
  async receiveCoupon(userId: string, couponId: string): Promise<UserCoupon> {
    // 1. 简单校验是否存在以及库存 (更严谨的做法应在 DB Function 或 Transaction 中)
    const { data: coupon, error: couponError } = await supabase
      .from('marketing_coupons')
      .select('*')
      .eq('id', couponId)
      .single();

    if (couponError || !coupon) throw new Error('优惠券不存在');
    if (coupon.total_stock !== -1 && coupon.received_count >= coupon.total_stock) {
      throw new Error('优惠券已领完');
    }

    // 2. 校验用户是否已领过 (假设每人限领一张，根据业务可调整)
    const { data: existing } = await supabase
      .from('user_coupons')
      .select('id')
      .eq('user_id', userId)
      .eq('coupon_id', couponId)
      .maybeSingle();
    
    if (existing) throw new Error('您已经领过这张券了');

    // 3. 插入记录
    const { data, error } = await supabase
      .from('user_coupons')
      .insert([
        {
          user_id: userId,
          coupon_id: couponId,
          status: 'UNUSED',
          expires_at: coupon.end_at // 默认跟随定义表过期时间
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // 4. 更新发放数量计数 (非原子操作，仅作演示，高并发需用 rpc)
    await supabase.rpc('increment_coupon_received', { coupon_id_param: couponId });

    return data;
  },

  // 获取用户持有的优惠券
  async getUserCoupons(userId: string, status: 'UNUSED' | 'USED' | 'EXPIRED' = 'UNUSED'): Promise<UserCoupon[]> {
    const { data, error } = await supabase
      .from('user_coupons')
      .select(`
        *,
        coupon:marketing_coupons(*)
      `)
      .eq('user_id', userId)
      .eq('status', status)
      .order('received_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // 核销优惠券 (下单成功后调用)
  async consumeCoupon(userCouponId: string, orderId: number): Promise<void> {
    const { error } = await supabase.rpc('use_marketing_coupon', {
      user_coupon_id_param: userCouponId,
      order_id_param: orderId
    });
    if (error) throw error;
  }
};
