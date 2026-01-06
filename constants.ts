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



export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: '川味宫保鸡丁',
    description: '精选嫩滑鸡粒，搭配酥脆花生与正宗川味干辣椒，酱香浓郁，回味微甜。',
    price: 12.50,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800&auto=format&fit=crop',
    stock: 50,
    sales: 1205,
    tags: ['香辣', '招牌']
  },
  {
    id: '2',
    name: '台式秘制卤肉饭',
    description: '慢火细熬手切五花肉，油亮肥美不松散，浸润每一粒精选香米。',
    price: 15.00,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800&auto=format&fit=crop',
    stock: 30,
    sales: 890,
    tags: ['销量王']
  },
  {
    id: '3',
    name: '田园清炒时蔬',
    description: '每日清晨直采时令鲜蔬，极致火候快炒，保留食材原本的清脆与鲜甜。',
    price: 9.00,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    stock: 100,
    sales: 450,
    tags: ['素食', '健康']
  },
  {
    id: '4',
    name: '私房红烧牛肉面',
    description: '12小时大骨高汤熬制，大块牛腩入口即化，手工宽面劲道十足。',
    price: 14.00,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop',
    stock: 25,
    sales: 2100,
    tags: ['能量餐']
  },
  {
    id: '5',
    name: '金黄脆皮春卷',
    description: '外皮金黄酥脆，咬下一口咔嚓作响，内馅包含木耳、香菇等多种鲜美菌菇。',
    price: 5.00,
    category: Category.SNACKS,
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?q=80&w=800&auto=format&fit=crop',
    stock: 80,
    sales: 600,
    tags: ['酥脆']
  },
  {
    id: '6',
    name: '新奥尔良炸鸡翅',
    description: '独家秘制腌料入味，外皮焦亮，肉质鲜美多汁，撕开即见诱人肉汁。',
    price: 8.00,
    category: Category.SNACKS,
    image: 'https://images.unsplash.com/photo-1567622445821-ff9680edaee7?q=80&w=800&auto=format&fit=crop',
    stock: 40,
    sales: 320,
    tags: ['人气']
  },
  {
    id: '7',
    name: '爆汁手打柠檬茶',
    description: '精选广东香水柠檬，暴力手打出汁，茶底醇厚，清爽解腻的最佳拍档。',
    price: 4.00,
    category: Category.DRINKS,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop',
    stock: 200,
    sales: 1500,
    tags: ['冰镇']
  },
  {
    id: '8',
    name: '经典醇香珍珠奶茶',
    description: '进口锡兰红茶底，混合新西兰牧场牛乳，珍珠Q弹软糯，甜而不腻。',
    price: 6.00,
    category: Category.DRINKS,
    image: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?q=80&w=800&auto=format&fit=crop',
    stock: 150,
    sales: 980,
    tags: ['甜蜜']
  },
  {
    id: '9',
    name: '泰国原产苏玛里香米',
    description: '原产地直供，米粒修长，烹饪后清香四溢，口感软糯。',
    price: 88.00,
    category: Category.MAINS,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800&auto=format&fit=crop',
    stock: 10,
    sales: 56,
    tags: ['高端']
  },
  {
    id: '10',
    name: '进口红钻车厘子',
    description: '果径超大，皮薄多汁，脆爽甘甜，富含多种花青素。',
    price: 39.90,
    category: Category.SNACKS,
    image: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?q=80&w=800&auto=format&fit=crop',
    stock: 20,
    sales: 120,
    tags: ['生鲜']
  },
  {
    id: '11',
    name: '元气职人午餐套餐',
    description: '包含私房牛肉面+脆皮春卷+手打柠檬茶。今日份的加油站！',
    price: 22.00,
    category: Category.COMBOS,
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=800&auto=format&fit=crop',
    stock: 50,
    sales: 1800,
    tags: ['热销', '推荐'],
    comboItems: [
      { id: 'c11-1', name: '红烧牛肉面', quantity: '1份', price: 14.00 },
      { id: 'c11-2', name: '脆皮春卷', quantity: '2个', price: 3.00 },
      { id: 'c11-3', name: '港式冻柠茶', quantity: '1杯', price: 4.00 }
    ]
  },
  {
    id: '12',
    name: '周末犒赏双人套餐',
    description: '秘制卤肉饭、宫保鸡丁双重满足，外加鸡翅与醇香奶茶，分享美味时光。',
    price: 58.00,
    category: Category.COMBOS,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
    stock: 25,
    sales: 800,
    tags: ['超值', '双人'],
    comboItems: [
      { id: 'c15-1', name: '红烧牛肉面', quantity: '1份', price: 14.00 },
      { id: 'c15-2', name: '秘制卤肉饭', quantity: '1份', price: 15.00 },
      { id: 'c15-3', name: '香酥炸鸡翅', quantity: '4个', price: 12.00 },
      { id: 'c15-4', name: '珍珠奶茶', quantity: '2杯', price: 12.00 }
    ]
  }
];