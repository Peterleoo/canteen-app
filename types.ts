
export enum Category {
  POPULAR = '人气热销',
  MAINS = '主食',
  SNACKS = '小吃',
  DRINKS = '饮品',
  COMBOS = '套餐',
}

export interface ComboItem {
  id: string;
  name: string;
  quantity: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  stock: number;
  sales: number;
  tags?: string[];
  comboItems?: ComboItem[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
}

export enum OrderStatus {
  PENDING = '待接单',
  PREPARING = '准备中',
  DELIVERING = '配送中',
  READY_FOR_PICKUP = '待自提',
  COMPLETED = '已完成',
  CANCELLED = '已取消'
}

export type DeliveryMethod = 'PICKUP' | 'DELIVERY';

export interface Address {
  id: string;
  contactName: string;
  phone: string;
  area: string;
  detail: string;
  tag: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  status: OrderStatus;
  date: string;
  deliveryMethod: DeliveryMethod;
  locationInfo: string; // Canteen Name or User Address
  deliveryFee: number;
}

export interface Canteen {
  id: string;
  name: string;
  distance: string;
  address: string;
}

export type ViewState = 'HOME' | 'CART' | 'ORDERS' | 'PROFILE' | 'ADDRESS_LIST' | 'ADDRESS_EDIT' | 'PICKUP_EDIT';