// 商品分类
export const Category = {
  POPULAR: '人气热销',
  MAINS: '主食',
  SNACKS: '小吃',
  DRINKS: '饮品',
  COMBOS: '套餐',
} as const;
export type Category = typeof Category[keyof typeof Category];

// 订单状态
export const OrderStatus = {
  PENDING: 'PENDING',
  PREPARING: 'PREPARING',
  DELIVERING: 'DELIVERING',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// 订单状态中文映射
export const OrderStatusText = {
  PENDING: '待接单',
  PREPARING: '备餐中',
  DELIVERING: '配送中',
  READY_FOR_PICKUP: '待取餐',
  COMPLETED: '已完成',
  CANCELLED: '已取消'
} as const;

// 配送方式
export type DeliveryMethod = 'PICKUP' | 'DELIVERY';

// 商品状态
export type ProductStatus = 'ACTIVE' | 'INACTIVE';

// 套餐子项
export interface ComboItem {
  id: string;
  name: string;
  quantity: string;
  price: number;
}

// 商品
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Category;
  image: string;
  images?: string[];
  stock: number;
  stockAlert?: number;
  sales: number;
  tags?: string[];
  status: ProductStatus;
  isRecommended?: boolean;
  isFeatured?: boolean;
  isCombo?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  canteenId?: string;
  canteen?: Canteen;
  comboItems?: ComboItem[];
}

// 购物车商品
export interface CartItem extends Product {
  quantity: number;
}

// 用户
export interface User {
  id: string;
  username: string;
  name: string;
  phone: string;
  avatar: string;
  email?: string;
  status: 'ACTIVE' | 'BANNED' | 'INACTIVE';
  createdAt: string;
  totalOrders?: number;
  totalSpent?: number;
  departmentId?: string | null;
}

// 地址
export interface Address {
  id: string;
  userId?: string;
  contactName: string;
  phone: string;
  area: string;
  detail: string;
  isDefault: boolean;
  tag: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 订单项
export interface OrderItem {
  id: number;
  orderId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  createdAt: string;
}

// 订单
export interface Order {
  id: string;
  userId: string;
  user?: User;
  canteenId: string;
  canteen?: Canteen;
  orderItems?: OrderItem[];
  subtotal?: number;
  packagingFee?: number;
  deliveryFee: number;
  discountAmount?: number;
  total: number;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  addressId?: string;
  addressDetail?: string;
  remark?: string;
  cancelReason?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// 食堂
export interface Canteen {
    id: string;
    name: string;
    address: string;
    distance?: string;
    latitude: number;
    longitude: number;
    status: 'OPEN' | 'CLOSED' | 'BUSY';
    contactPhone?: string;
    manager?: string;
    capacity?: number;
    currentOrders?: number;
    isAutoAcceptOrders: boolean;
    autoAcceptDelay?: number;
    weekdayOpenTime: string;
    weekdayCloseTime: string;
    weekendOpenTime: string;
    weekendCloseTime: string;
    stockAlertThreshold: number;
    isLowStockNotification: boolean;
    notificationPhones?: string[];
    isDeliveryActive: boolean;
    deliveryRadius: number;
    minDeliveryAmount: number;
    deliveryFee: number;
    freeDeliveryThreshold: number;
    defaultPackagingFee: number;
    createdAt?: string;
  updatedAt?: string;
}

// API响应
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页响应
export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 优惠券定义
export interface Coupon {
  id: string;
  canteen_id: string;
  name: string;
  description?: string;
  type: 'FIXED' | 'PERCENT';
  value: number;
  min_spend: number;
  start_at: string;
  end_at: string;
  total_stock: number;
  used_count: number;
  received_count: number;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

// 用户持有的优惠券
export interface UserCoupon {
  id: string;
  user_id: string;
  coupon_id: string;
  coupon?: Coupon;
  status: 'UNUSED' | 'USED' | 'EXPIRED';
  received_at: string;
  used_at?: string;
  expires_at: string;
}

// 营销海报
export interface MarketingBanner {
  id: string;
  canteen_id?: string | null;
  image_url: string;
  title?: string;
  subtitle?: string;
  action_type: 'PRODUCT' | 'CATEGORY' | 'URL' | 'NONE';
  action_value?: string;
  status: 'ACTIVE' | 'INACTIVE';
  sort_order: number;
  created_at: string;
}