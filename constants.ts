import { Category, Product, Canteen } from './types';

export const CANTEENS: Canteen[] = [
  { id: '1', name: '万科滨河道店 (当前定位)', distance: '0m', address: '滨河道1号' },
  { id: '2', name: '一食堂 (A区)', distance: '150m', address: '教学楼A区东侧' },
  { id: '3', name: '二食堂 (B区)', distance: '800m', address: '宿舍楼B区南侧' },
  { id: '4', name: '教工餐厅', distance: '1.2km', address: '行政楼顶层' },
  { id: '5', name: '南门外卖柜', distance: '500m', address: '南门入口处' },
];

export const PICKUP_LOCATIONS = CANTEENS.map(c => c.name);

export const HOME_CATEGORIES = [
  { name: '水果鲜花', id: 'fruit' },
  { name: '蔬菜豆制品', id: 'veg' },
  { name: '肉禽蛋品', id: 'meat' },
  { name: '海鲜水产', id: 'seafood' },
  { name: '乳品烘焙', id: 'dairy' },
  { name: '餐饮熟食', id: 'cooked' },
  { name: '快手菜', id: 'quick' },
  { name: '酒水饮料', id: 'drinks' },
  { name: '休闲零食', id: 'snacks' },
  { name: '粮油调味', id: 'oil' },
];

// Helper to generate reliable SVG placeholders (No external network required)
const getPlaceholder = (text: string, bgColor: string) => {
  const svg = `
  <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="${bgColor}"/>
    <text x="50%" y="50%" font-family="sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle" dy=".3em">${text}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: '川味宫保鸡丁',
    description: '精选鸡胸肉，搭配花生米与干辣椒，香辣过瘾。',
    price: 12.50,
    category: Category.MAINS,
    image: getPlaceholder('宫保鸡丁', '#FFB000'), // Orange
    stock: 50,
    sales: 1205,
    tags: ['香辣', '招牌']
  },
  {
    id: '2',
    name: '秘制卤肉饭',
    description: '慢火炖煮五花肉，肥而不腻，配半个卤蛋。',
    price: 15.00,
    category: Category.MAINS,
    image: getPlaceholder('卤肉饭', '#FF8C00'), // Dark Orange
    stock: 30,
    sales: 890,
    tags: ['销量王']
  },
  {
    id: '3',
    name: '清炒时蔬',
    description: '当季新鲜蔬菜，大火快炒，保留营养。',
    price: 9.00,
    category: Category.MAINS,
    image: getPlaceholder('时蔬', '#87CEEB'), // Sky Blue
    stock: 100,
    sales: 450,
    tags: ['素食', '健康']
  },
  {
    id: '4',
    name: '红烧牛肉面',
    description: '牛骨熬制高汤，大块牛肉，面条劲道。',
    price: 14.00,
    category: Category.MAINS,
    image: getPlaceholder('牛肉面', '#D2691E'), // Chocolate
    stock: 25,
    sales: 2100,
    tags: ['热销']
  },
  {
    id: '5',
    name: '脆皮春卷 (3个)',
    description: '外皮酥脆，内馅丰富，素菜精选。',
    price: 5.00,
    category: Category.SNACKS,
    image: getPlaceholder('春卷', '#FFD700'), // Gold
    stock: 80,
    sales: 600,
    tags: ['酥脆']
  },
  {
    id: '6',
    name: '香酥炸鸡翅',
    description: '金黄酥脆，鲜嫩多汁，秘制腌料。',
    price: 8.00,
    category: Category.SNACKS,
    image: getPlaceholder('炸鸡翅', '#FFA07A'), // Light Salmon
    stock: 40,
    sales: 320,
    tags: ['美味']
  },
  {
    id: '7',
    name: '港式冻柠茶',
    description: '新鲜柠檬手打，茶味浓郁，解暑神器。',
    price: 4.00,
    category: Category.DRINKS,
    image: getPlaceholder('冻柠茶', '#20B2AA'), // Light Sea Green
    stock: 200,
    sales: 1500,
    tags: ['冰镇']
  },
  {
    id: '8',
    name: '珍珠奶茶',
    description: '经典奶茶，搭配软糯Q弹的黑糖珍珠。',
    price: 6.00,
    category: Category.DRINKS,
    image: getPlaceholder('奶茶', '#DEB887'), // Burlywood
    stock: 150,
    sales: 980,
    tags: ['甜蜜']
  },
  {
    id: '9',
    name: '泰国香米',
    description: '进口香米，软糯香甜。',
    price: 88.00,
    category: Category.MAINS,
    image: getPlaceholder('泰国香米', '#F0E68C'), // Khaki
    stock: 10,
    sales: 56,
    tags: ['进口']
  },
  {
    id: '10',
    name: '车厘子 (500g)',
    description: '智利进口车厘子，个大饱满。',
    price: 39.90,
    category: Category.SNACKS,
    image: getPlaceholder('车厘子', '#DC143C'), // Crimson
    stock: 20,
    sales: 120,
    tags: ['生鲜', '特价']
  },
  // 添加套餐数据
  {
    id: '11',
    name: '经典午餐套餐',
    description: '包含主食+小吃+饮品，营养均衡，性价比高。',
    price: 22.00,
    category: Category.COMBOS,
    image: getPlaceholder('午餐套餐', '#4682B4'), // Steel Blue
    stock: 50,
    sales: 1800,
    tags: ['热销', '划算'],
    comboItems: [
      { id: 'c11-1', name: '红烧牛肉面', quantity: '1份', price: 14.00 },
      { id: 'c11-2', name: '脆皮春卷', quantity: '2个', price: 3.00 },
      { id: 'c11-3', name: '港式冻柠茶', quantity: '1杯', price: 4.00 }
    ]
  },
  {
    id: '12',
    name: '豪华晚餐套餐',
    description: '包含主菜+汤+小吃+饮品，丰盛美味。',
    price: 35.00,
    category: Category.COMBOS,
    image: getPlaceholder('晚餐套餐', '#8B4513'), // Saddle Brown
    stock: 30,
    sales: 1200,
    tags: ['豪华', '美味'],
    comboItems: [
      { id: 'c12-1', name: '川味宫保鸡丁', quantity: '1份', price: 12.50 },
      { id: 'c12-2', name: '番茄蛋汤', quantity: '1份', price: 5.00 },
      { id: 'c12-3', name: '香酥炸鸡翅', quantity: '2个', price: 5.00 },
      { id: 'c12-4', name: '珍珠奶茶', quantity: '1杯', price: 6.00 }
    ]
  },
  {
    id: '13',
    name: '素食主义套餐',
    description: '全素食套餐，营养丰富，健康美味。',
    price: 18.00,
    category: Category.COMBOS,
    image: getPlaceholder('素食套餐', '#32CD32'), // Lime Green
    stock: 40,
    sales: 900,
    tags: ['素食', '健康'],
    comboItems: [
      { id: 'c13-1', name: '清炒时蔬', quantity: '1份', price: 9.00 },
      { id: 'c13-2', name: '蔬菜沙拉', quantity: '1份', price: 6.00 },
      { id: 'c13-3', name: '豆浆', quantity: '1杯', price: 2.00 }
    ]
  },
  {
    id: '14',
    name: '儿童营养套餐',
    description: '专为儿童设计，营养均衡，口感清淡。',
    price: 15.00,
    category: Category.COMBOS,
    image: getPlaceholder('儿童套餐', '#FF69B4'), // Hot Pink
    stock: 60,
    sales: 1500,
    tags: ['儿童', '营养'],
    comboItems: [
      { id: 'c14-1', name: '蒸蛋羹', quantity: '1份', price: 5.00 },
      { id: 'c14-2', name: '白米饭', quantity: '1份', price: 2.00 },
      { id: 'c14-3', name: '清炒西兰花', quantity: '1份', price: 6.00 },
      { id: 'c14-4', name: '苹果汁', quantity: '1杯', price: 4.00 }
    ]
  },
  {
    id: '15',
    name: '情侣双人套餐',
    description: '包含两份主菜+两份饮品+一份小吃，适合情侣分享。',
    price: 58.00,
    category: Category.COMBOS,
    image: getPlaceholder('情侣套餐', '#FF1493'), // Deep Pink
    stock: 25,
    sales: 800,
    tags: ['情侣', '浪漫'],
    comboItems: [
      { id: 'c15-1', name: '红烧牛肉面', quantity: '1份', price: 14.00 },
      { id: 'c15-2', name: '秘制卤肉饭', quantity: '1份', price: 15.00 },
      { id: 'c15-3', name: '香酥炸鸡翅', quantity: '4个', price: 12.00 },
      { id: 'c15-4', name: '珍珠奶茶', quantity: '2杯', price: 12.00 }
    ]
  }
];