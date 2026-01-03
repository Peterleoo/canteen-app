import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, 
  User as UserIcon, 
  Search, 
  MapPin, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Trash2,
  CheckCircle,
  History,
  Utensils,
  Wallet,
  Package,
  MessageSquare,
  RefreshCcw,
  X,
  Plus,
  Minus,
  Navigation,
  Headphones,
  FileText,
  Store,
  Bike,
  Edit2,
  Phone,
  MoreHorizontal,
  Smartphone,
  ChevronUp,
  LogOut,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { MOCK_PRODUCTS, CANTEENS } from './constants';
import { Product, CartItem, Category, ViewState, Order, OrderStatus, User, Canteen, DeliveryMethod, Address } from './types';
import { Button } from './components/Button';

// --- Helpers for formatting ---
const formatSales = (count: number) => count > 1000 ? '1000+' : count.toString();

const generateLocalAvatar = (name: string, backgroundColor: string = '2563eb', color: string = 'fff') => {
  const svg = `
  <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#${backgroundColor}"/>
    <text x="50%" y="50%" font-family="sans-serif" font-size="40" font-weight="bold" fill="#${color}" text-anchor="middle" dy=".3em">${name.charAt(0)}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

// --- Components ---

// Simulated WeChat Header
const WeChatHeader: React.FC<{ title?: string, dark?: boolean, onBack?: () => void, className?: string }> = ({ title = "", dark = false, onBack, className = "" }) => (
  <div className={`shrink-0 z-50 pt-safe ${dark ? 'bg-transparent text-white' : 'bg-white text-black'} ${className}`}>
    {/* Navigation Bar */}
    <div className="relative h-[44px] flex items-center justify-center px-4">
      {onBack && (
        <button onClick={onBack} className="absolute left-2 p-2 active:opacity-60 z-10">
          <ChevronLeft size={24} />
        </button>
      )}
      
      <div className="font-bold text-[17px]">{title}</div>
      
      {/* Capsule Button Simulation */}
      <div className={`absolute right-[7px] top-1/2 -translate-y-1/2 h-[32px] w-[87px] border rounded-full flex items-center justify-evenly bg-opacity-60 backdrop-blur-sm ${dark ? 'bg-black/20 border-white/20' : 'bg-white/60 border-gray-200'}`}>
         <MoreHorizontal size={16} className={dark ? 'text-white' : 'text-black'} />
         <div className={`w-[1px] h-[14px] ${dark ? 'bg-white/20' : 'bg-gray-200'}`}></div>
         <div className={`w-[16px] h-[16px] rounded-full border-2 ${dark ? 'border-white' : 'border-black'}`}></div>
      </div>
    </div>
  </div>
);

// --- Bottom Navigation Component ---
const BottomNav: React.FC<{ current: ViewState, onChange: (v: ViewState) => void }> = ({ current, onChange }) => (
  <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pb-safe pt-2 flex justify-around items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
    <button onClick={() => onChange('HOME')} className={`flex flex-col items-center gap-1 p-1 transition-colors ${current === 'HOME' ? 'text-blue-600' : 'text-gray-400'}`}>
      <Utensils size={24} strokeWidth={current === 'HOME' ? 2.5 : 2} />
      <span className="text-[10px] font-medium">点餐</span>
    </button>
    <button onClick={() => onChange('ORDERS')} className={`flex flex-col items-center gap-1 p-1 transition-colors ${current === 'ORDERS' ? 'text-blue-600' : 'text-gray-400'}`}>
      <FileText size={24} strokeWidth={current === 'ORDERS' ? 2.5 : 2} />
      <span className="text-[10px] font-medium">订单</span>
    </button>
    <button onClick={() => onChange('PROFILE')} className={`flex flex-col items-center gap-1 p-1 transition-colors ${current === 'PROFILE' ? 'text-blue-600' : 'text-gray-400'}`}>
      <UserIcon size={24} strokeWidth={current === 'PROFILE' ? 2.5 : 2} />
      <span className="text-[10px] font-medium">我的</span>
    </button>
  </div>
);

// --- New Component: PickupEditView ---
// Extracted to avoid hook rules violation when rendered conditionally inside App
const PickupEditView: React.FC<{
  initialName: string;
  initialPhone: string;
  onSave: (name: string, phone: string) => void;
  onBack: () => void;
}> = ({ initialName, initialPhone, onSave, onBack }) => {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);

  return (
    <div className="absolute inset-0 bg-[#f3f4f6] z-[120] flex flex-col animate-slide-in">
        <WeChatHeader title="自提信息" onBack={onBack} />
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
           <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center p-4 border-b border-gray-50">
                 <label className="w-24 text-sm font-medium text-gray-900">自提人姓名</label>
                 <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="请输入姓名" 
                    className="flex-1 outline-none text-sm"
                 />
              </div>
              <div className="flex items-center p-4">
                 <label className="w-24 text-sm font-medium text-gray-900">联系电话</label>
                 <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="请输入手机号" 
                    className="flex-1 outline-none text-sm"
                 />
              </div>
           </div>
           <Button fullWidth onClick={() => onSave(name, phone)} className="mt-4 py-3 rounded-xl shadow-lg shadow-blue-100">保存</Button>
        </div>
      </div>
  );
};

export const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<ViewState | 'SEARCH'>('HOME');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  
  // Checkout State
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'confirm'>('cart');
  const [isCheckoutView, setIsCheckoutView] = useState(false);

  // Default to DELIVERY
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('DELIVERY');
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen>(CANTEENS[0]);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([
    { id: '1', contactName: 'Peter女士', phone: '181****0809', area: '万科·滨河道', detail: '12栋', tag: '家', isDefault: true },
    { id: '2', contactName: '李同学', phone: '13800000001', area: '第二教学楼', detail: '302教室', tag: '学校', isDefault: false },
  ]);
  const [currentAddress, setCurrentAddress] = useState<Partial<Address>>({});

  // Pickup Contact State
  const [pickupContact, setPickupContact] = useState<{name: string, phone: string}>({ name: '', phone: '' });
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // First use popup state
  const [showFirstUsePopup, setShowFirstUsePopup] = useState(false);

  // --- Refs ---
  const categoryRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // --- useEffect for first use popup ---
  useEffect(() => {
    // 检查用户是否是首次使用
    const hasSeenFirstUsePopup = localStorage.getItem('hasSeenFirstUsePopup');
    if (!hasSeenFirstUsePopup) {
      // 延迟显示弹窗，让应用加载完成
      const timer = setTimeout(() => {
        setShowFirstUsePopup(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // --- Helpers ---
  const addToCart = (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
         return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const getCartQuantity = (productId: string) => {
    return cart.find(item => item.id === productId)?.quantity || 0;
  };

  const clearCart = () => {
    if(window.confirm("确定清空购物车吗？")) {
      setCart([]);
      setShowCartModal(false);
    }
  };

  const cartItemTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = deliveryMethod === 'DELIVERY' ? 2.5 : 0;
  const finalTotal = cartItemTotal + deliveryFee;

  const handleLoginSubmit = () => {
    const mockUser = {
      id: 'u123',
      name: '微信用户',
      phone: '138****8888',
      avatar: generateLocalAvatar('微')
    };
    setUser(mockUser);
    // Auto-fill pickup contact from user info if empty
    if (!pickupContact.name) {
      setPickupContact({ name: '微信用户', phone: '13800008888' });
    }
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    if(window.confirm("确定要退出登录吗？")) {
      setUser(null);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowCartModal(false); // Close the cart modal
    setIsCheckoutView(true); // Show Checkout Full Screen
    setCheckoutStep('confirm');
    setSelectedProduct(null); // Ensure we leave the details view
  };

  const placeOrder = () => {
    const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
    const deliveryLocation = defaultAddress ? `${defaultAddress.area} ${defaultAddress.detail}` : '请选择地址';

    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-8)}`,
      items: [...cart],
      total: finalTotal,
      subtotal: cartItemTotal,
      status: deliveryMethod === 'DELIVERY' ? OrderStatus.DELIVERING : OrderStatus.READY_FOR_PICKUP,
      date: new Date().toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      deliveryMethod,
      locationInfo: deliveryMethod === 'DELIVERY' ? deliveryLocation : selectedCanteen.name,
      deliveryFee
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setIsCheckoutView(false);
    setView('ORDERS');
  };

  // Fixed: More robust scroll anchoring using offsetTop
  const scrollToCategory = (category: string) => {
    isScrollingRef.current = true;
    setActiveCategory(category);
    
    const container = rightScrollRef.current;
    if (!container) return;

    if (category === '全部') {
       container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = categoryRefs.current[category];
      if (element) {
        // Offset for the sticky header (approx 40px)
        const top = element.offsetTop - 40; 
        container.scrollTo({ top, behavior: 'smooth' });
      }
    }
    
    // Increased timeout to allow smooth scroll animation to finish
    setTimeout(() => { isScrollingRef.current = false; }, 800);
  };

  // Fixed: Better active category detection during scroll
  const handleScroll = () => {
    if (isScrollingRef.current) return;
    
    const container = rightScrollRef.current;
    if (!container) return;
    
    const scrollTop = container.scrollTop;
    // Threshold to trigger change (header height + margin)
    const headerOffset = 50; 

    // Quick check for top
    if (scrollTop < 20) {
      if (activeCategory !== '全部') setActiveCategory('全部');
      return;
    }

    const categories = Object.keys(categoryRefs.current);
    let currentActive = '全部';
    
    for (const cat of categories) {
       const el = categoryRefs.current[cat];
       if (el) {
          // If the element's top position (relative to container) is reached
          if (el.offsetTop - headerOffset <= scrollTop) {
             currentActive = cat;
          }
       }
    }
    
    if (currentActive !== activeCategory) {
       setActiveCategory(currentActive);
    }
  };

  // --- Render Functions (Previously Components) ---
  // Using render functions instead of component definitions inside App prevents 
  // unmounting/remounting on every state change, solving the animation replay 
  // and focus loss issues.
  
  const renderCartPopup = () => (
    <div className="fixed inset-0 z-[110] flex flex-col justify-end">
       <div className="absolute inset-0 bg-black/60 animate-fade-in backdrop-blur-[2px]" onClick={() => setShowCartModal(false)}></div>
       
       <div className="bg-white w-full relative z-[111] animate-slide-in-bottom rounded-t-2xl overflow-hidden flex flex-col max-h-[70vh]">
          <div className="p-3 bg-gray-50 flex justify-between items-center text-xs text-gray-500 border-b border-gray-100">
             <span>已选商品</span>
             <button onClick={clearCart} className="flex items-center gap-1 hover:text-red-500 active:opacity-60 py-2 px-2">
                <Trash2 size={14}/> 清空
             </button>
          </div>
          
          <div className="overflow-y-auto p-4 space-y-5 pb-[90px]">
             {cart.length === 0 ? (
               <div className="text-center py-8 text-gray-400 text-sm">购物车是空的</div>
             ) : (
               cart.map(item => (
                 <div key={item.id} className="flex justify-between items-center">
                    <div className="flex gap-3 items-center overflow-hidden">
                       <img src={item.image} className="w-12 h-12 rounded object-cover bg-gray-100" />
                       <div className="min-w-0">
                          <div className="font-bold text-gray-900 text-sm truncate">{item.name}</div>
                          <div className="text-red-500 font-bold font-mono text-sm mt-1">¥{item.price}</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 active:bg-gray-100"><Minus size={16}/></button>
                       <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                       <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center active:bg-blue-700 shadow-sm"><Plus size={16}/></button>
                    </div>
                 </div>
               ))
             )}
          </div>
       </div>
    </div>
  );

  const renderFloatingCartBar = ({ mode = 'HOME' }: { mode?: 'HOME' | 'DETAILS' }) => {
    if (cart.length === 0 && mode !== 'DETAILS') return null;

    if (cart.length === 0 && mode === 'DETAILS') {
        return (
          <div className="fixed bottom-0 left-0 right-0 z-[120] bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="px-4 py-3 flex justify-between items-center h-[60px]">
               <div className="text-sm text-gray-500">未选购商品</div>
               {selectedProduct && (
                 <button 
                    onClick={() => addToCart(selectedProduct!)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform text-sm"
                 >
                    加入购物车
                 </button>
               )}
            </div>
          </div>
        )
    }

    const isExpanded = showCartModal || mode === 'DETAILS';

    return (
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[120] transition-all duration-300 ${
          isExpanded 
            ? 'bg-white border-t border-gray-100 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.08)]' 
            : 'bottom-[60px] px-4 pointer-events-none'
        }`}
      >
         <div 
            className={`flex items-center justify-between transition-all duration-300 pointer-events-auto ${
               isExpanded 
               ? 'px-4 h-[60px] w-full' 
               : 'bg-black/90 rounded-full h-12 px-4 shadow-xl mx-auto w-full'
            }`}
            onClick={() => {
              setShowCartModal(!showCartModal);
            }}
         >
            <div className="flex items-center gap-3 flex-1 cursor-pointer">
               <div className={`relative transition-transform ${isExpanded ? '' : '-mt-4'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center relative transition-colors ${
                    isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-blue-600 text-white border-4 border-[#f3f4f6]'
                  }`}>
                     <ShoppingCart size={24} />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full border border-white">
                     {cartCount}
                  </span>
               </div>
               <div className="flex flex-col justify-center">
                  <div className={`font-bold font-mono text-xl transition-colors ${isExpanded ? 'text-gray-900' : 'text-white'}`}>
                     ¥{cartItemTotal.toFixed(2)}
                  </div>
                  <div className={`text-[10px] transition-colors ${isExpanded ? 'text-gray-500' : 'text-gray-400'}`}>
                     预估配送费 ¥{deliveryFee}
                  </div>
               </div>
            </div>

            {mode === 'DETAILS' && selectedProduct && !showCartModal ? (
               <div className="flex items-center gap-4">
                  {getCartQuantity(selectedProduct.id) > 0 ? (
                    <>
                      <button onClick={(e) => {e.stopPropagation(); updateQuantity(selectedProduct.id, -1)}} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 active:bg-gray-100"><Minus size={18} /></button>
                      <span className="text-lg font-bold w-4 text-center">{getCartQuantity(selectedProduct.id)}</span>
                      <button onClick={(e) => {e.stopPropagation(); updateQuantity(selectedProduct.id, 1)}} className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white active:scale-95 shadow-sm"><Plus size={18} /></button>
                    </>
                  ) : (
                    <button 
                      onClick={(e) => {e.stopPropagation(); addToCart(selectedProduct)}}
                      className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform text-sm"
                    >
                      加入购物车
                    </button>
                  )}
               </div>
            ) : (
               <button 
                 onClick={(e) => { e.stopPropagation(); handleCheckout(); }}
                 className="bg-blue-600 text-white h-9 px-8 rounded-full font-bold text-sm shadow-lg shadow-blue-600/30 active:scale-95"
               >
                  去结算
               </button>
            )}
         </div>
      </div>
    );
  };

  const renderAddressListView = () => {
    return (
      <div className="absolute inset-0 bg-[#f3f4f6] z-[110] flex flex-col animate-slide-in">
        <WeChatHeader title="我的地址" onBack={() => setView('PROFILE')} />
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm active:scale-[0.99] transition-transform">
               <div onClick={() => {
                 if (isCheckoutView) {
                    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === addr.id })));
                    setView('PROFILE'); 
                 }
               }} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 text-base">{addr.area} {addr.detail}</span>
                    {addr.tag && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">{addr.tag}</span>}
                    {addr.isDefault && <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">默认</span>}
                  </div>
                  <div className="text-sm text-gray-500">{addr.contactName} <span className="ml-2">{addr.phone}</span></div>
               </div>
               <button onClick={(e) => { e.stopPropagation(); setCurrentAddress(addr); setView('ADDRESS_EDIT'); }} className="p-2 text-gray-400 hover:text-gray-600 border-l border-gray-100 ml-2">
                 <Edit2 size={18} />
               </button>
            </div>
          ))}
        </div>
        <div className="p-4 bg-white border-t border-gray-100 pb-safe z-10">
           <Button fullWidth onClick={() => { setCurrentAddress({}); setView('ADDRESS_EDIT'); }} className="rounded-full shadow-lg shadow-blue-100"><Plus size={18} className="mr-1"/> 新增地址</Button>
        </div>
      </div>
    );
  };

  const renderAddressEditView = () => {
    const updateAddr = (field: keyof Address, value: any) => { setCurrentAddress(prev => ({ ...prev, [field]: value })); };
    const handleSaveAddress = () => {
        if (!currentAddress.contactName || !currentAddress.phone || !currentAddress.area || !currentAddress.detail) { alert("请填写完整信息"); return; }
        const newAddr = { ...currentAddress, id: currentAddress.id || Date.now().toString(), isDefault: currentAddress.isDefault || false, tag: currentAddress.tag || '其他' } as Address;
        if (newAddr.isDefault) { setAddresses(prev => prev.map(a => ({ ...a, isDefault: false }))); }
        setAddresses(prev => {
          const exists = prev.find(a => a.id === newAddr.id);
          let updatedList = exists ? prev.map(a => a.id === newAddr.id ? newAddr : a) : [...prev, newAddr];
          if (newAddr.isDefault) { return updatedList.map(a => a.id === newAddr.id ? a : { ...a, isDefault: false }); }
          return updatedList;
        });
        setView('ADDRESS_LIST');
    };
    const handleDeleteAddress = (id: string) => { if(window.confirm('确定要删除该地址吗？')) { setAddresses(prev => prev.filter(a => a.id !== id)); setView('ADDRESS_LIST'); } };

    return (
      <div className="absolute inset-0 bg-[#f3f4f6] z-[120] flex flex-col animate-slide-in">
        <WeChatHeader title={currentAddress.id ? "编辑地址" : "新增地址"} onBack={() => setView('ADDRESS_LIST')} />
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
           <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center p-4 border-b border-gray-50">
                 <label className="w-20 text-sm font-medium text-gray-900">联系人</label>
                 <input type="text" value={currentAddress.contactName || ''} onChange={e => updateAddr('contactName', e.target.value)} placeholder="请填写收货人姓名" className="flex-1 outline-none text-sm"/>
              </div>
              <div className="flex items-center p-4 border-b border-gray-50">
                 <label className="w-20 text-sm font-medium text-gray-900">手机号</label>
                 <input type="tel" value={currentAddress.phone || ''} onChange={e => updateAddr('phone', e.target.value)} placeholder="请填写收货人手机号" className="flex-1 outline-none text-sm"/>
              </div>
              <div className="flex items-center p-4 border-b border-gray-50">
                 <label className="w-20 text-sm font-medium text-gray-900">地址</label>
                 <input type="text" value={currentAddress.area || ''} onChange={e => updateAddr('area', e.target.value)} placeholder="小区/写字楼/学校" className="flex-1 outline-none text-sm"/>
              </div>
              <div className="flex items-center p-4">
                 <label className="w-20 text-sm font-medium text-gray-900">门牌号</label>
                 <input type="text" value={currentAddress.detail || ''} onChange={e => updateAddr('detail', e.target.value)} placeholder="例：8号楼808室" className="flex-1 outline-none text-sm"/>
              </div>
           </div>
           <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">标签</span>
              <div className="flex gap-2">
                 {['家', '公司', '学校'].map(tag => (
                   <button key={tag} onClick={() => updateAddr('tag', tag)} className={`px-3 py-1 rounded-full text-xs border transition-colors ${currentAddress.tag === tag ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-600'}`}>{tag}</button>
                 ))}
              </div>
           </div>
           <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">设为默认地址</span>
              <div onClick={() => updateAddr('isDefault', !currentAddress.isDefault)} className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${currentAddress.isDefault ? 'bg-blue-600' : 'bg-gray-300'}`}>
                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${currentAddress.isDefault ? 'translate-x-4' : ''}`}></div>
              </div>
           </div>
           <Button fullWidth onClick={handleSaveAddress} className="mt-4 py-3 rounded-xl shadow-lg shadow-blue-100">保存</Button>
           {currentAddress.id && ( <Button variant="outline" fullWidth onClick={() => handleDeleteAddress(currentAddress.id!)} className="mt-2 border-none text-red-500 bg-white shadow-sm">删除地址</Button> )}
        </div>
      </div>
    );
  };

  // --- Main Views ---

  const renderHomeView = () => {
    const categories = Object.values(Category);
    const groupedProducts = categories.map(cat => ({
      category: cat,
      products: MOCK_PRODUCTS.filter(p => p.category === cat)
    })).filter(group => group.products.length > 0);

    return (
      <div className="flex flex-col h-full bg-white relative">
        {/* Title removed as requested */}
        <WeChatHeader />

        {/* Search & Location Bar */}
        <div className="bg-white px-4 pb-3 flex gap-3 items-center shadow-[0_4px_10px_-4px_rgba(0,0,0,0.05)] z-30 shrink-0">
            <div 
              className="flex items-center gap-1 max-w-[40%] cursor-pointer active:opacity-60"
              onClick={() => setShowLocationModal(true)}
            >
              <MapPin size={18} className="text-gray-900" />
              <span className="text-base font-bold text-gray-900 truncate">{selectedCanteen.name}</span>
              <ChevronDown size={14} className="text-gray-500" />
            </div>

            <div 
              className="flex-1 bg-gray-100 rounded-full flex items-center px-3 py-1.5 h-9 active:bg-gray-200 transition-colors"
              onClick={() => setView('SEARCH')}
            >
              <Search size={16} className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-400">搜索美食</span>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar - Added extra padding bottom to ensure scroll clearing */}
          <div className="w-24 bg-[#f7f8fa] overflow-y-auto no-scrollbar shrink-0 pb-40">
            <button 
               onClick={() => scrollToCategory('全部')}
               className={`w-full px-2 py-4 text-xs font-medium text-center break-words relative transition-all ${
                 activeCategory === '全部' ? 'bg-white text-gray-900 font-bold' : 'text-gray-500'
               }`}
            >
              {activeCategory === '全部' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 rounded-r"></div>}
              今日疯抢
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => scrollToCategory(cat)}
                className={`w-full px-2 py-4 text-xs font-medium text-center break-words relative transition-all ${
                  activeCategory === cat ? 'bg-white text-gray-900 font-bold' : 'text-gray-500'
                }`}
              >
                {activeCategory === cat && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 rounded-r"></div>}
                {cat}
              </button>
            ))}
          </div>

          {/* Product List - Added extra padding bottom (pb-40) */}
          <div 
            className="flex-1 bg-white overflow-y-auto pb-40" 
            ref={rightScrollRef}
            onScroll={handleScroll}
          >
            {/* Featured Section */}
            <div className="p-4">
               <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-bold text-base text-gray-800">今日疯抢</h3>
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold">限时</span>
               </div>
               <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {MOCK_PRODUCTS.slice(0, 5).map(product => (
                    <div key={product.id} className="w-32 min-w-[8rem] shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col active:scale-95 transition-transform" onClick={() => setSelectedProduct(product)}>
                        <div className="relative h-24">
                          <img src={product.image} className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-4">
                             <div className="text-white text-sm font-bold font-mono">¥{product.price}</div>
                          </div>
                        </div>
                        <div className="p-2 flex flex-col justify-between flex-1">
                           <h4 className="text-xs font-medium text-gray-800 line-clamp-1">{product.name}</h4>
                           <button 
                             onClick={(e) => addToCart(product, e)}
                             className="mt-2 w-full bg-red-50 text-red-600 text-[10px] py-1 rounded font-bold border border-red-100"
                           >
                             马上抢
                           </button>
                        </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Categories */}
            {groupedProducts.map(group => (
              <div key={group.category} id={group.category} ref={(el) => { categoryRefs.current[group.category] = el; }} className="mb-4">
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-4 py-2 z-10 text-xs font-bold text-gray-500 flex items-center gap-2">
                  <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                  {group.category}
                </div>
                <div>
                  {group.products.map(product => {
                    const qty = getCartQuantity(product.id);
                    return (
                      <div 
                        key={product.id} 
                        className="flex p-4 gap-3 relative active:bg-gray-50 transition-colors"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative border border-gray-100">
                           <img src={product.image} className="w-full h-full object-cover" loading="lazy" />
                           {product.stock < 10 && (
                             <div className="absolute bottom-0 w-full bg-black/60 text-white text-[10px] text-center py-0.5">仅剩{product.stock}份</div>
                           )}
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                           <div>
                              <h3 className="font-bold text-gray-900 text-sm mb-1">{product.name}</h3>
                              <p className="text-xs text-gray-500 line-clamp-1 mb-1">{product.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {product.tags?.map(tag => (
                                  <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-1">月售 {formatSales(product.sales)}</div>
                           </div>
                           
                           <div className="flex justify-between items-end">
                              <div className="text-red-500 font-bold text-lg flex items-baseline font-mono">
                                <span className="text-xs mr-0.5">¥</span>{product.price}
                              </div>
                              
                              {qty > 0 ? (
                                <div className="flex items-center gap-3">
                                  <button onClick={(e) => removeFromCart(product.id, e)} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 bg-white active:bg-gray-100">
                                    <Minus size={14} />
                                  </button>
                                  <span className="text-sm font-medium w-4 text-center">{qty}</span>
                                  <button onClick={(e) => addToCart(product, e)} className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white active:scale-95 shadow-sm">
                                    <Plus size={14} />
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={(e) => addToCart(product, e)}
                                  className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white active:scale-95 shadow-sm"
                                >
                                  <Plus size={14} />
                                </button>
                              )}
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="h-16 flex items-center justify-center text-xs text-gray-300 pb-safe">
               — 到底了 —
            </div>
          </div>
        </div>

        {/* Global Floating Cart Bar on Home View - Hidden when checkout is active */}
        {!isCheckoutView && renderFloatingCartBar({ mode: 'HOME' })}
        
        {/* Cart Modal - Now just the list content */}
        {showCartModal && renderCartPopup()}

        {/* Location Modal */}
        {showLocationModal && (
          <div className="absolute inset-0 z-[70] flex flex-col justify-end bg-black/50 animate-fade-in">
            <div className="bg-white w-full rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-in-bottom pb-safe">
               <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                  <h3 className="font-bold text-lg text-gray-800">选择就餐点</h3>
                  <button onClick={() => setShowLocationModal(false)} className="p-1"><X size={20} className="text-gray-500"/></button>
               </div>
               <div className="p-4 overflow-y-auto space-y-3">
                 <div className="text-xs text-gray-500 font-medium">当前定位附近</div>
                 {CANTEENS.map(canteen => (
                   <div 
                    key={canteen.id} 
                    onClick={() => { setSelectedCanteen(canteen); setShowLocationModal(false); }}
                    className={`flex justify-between items-center p-4 rounded-xl border transition-colors active:scale-[0.99] ${selectedCanteen.id === canteen.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white'}`}
                   >
                      <div>
                        <div className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                          {canteen.name}
                          {selectedCanteen.id === canteen.id && <span className="text-blue-600 text-[10px] border border-blue-600 px-1 rounded">当前</span>}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{canteen.address}</div>
                      </div>
                      <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
                         <MapPin size={12}/> {canteen.distance}
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProductDetailsView = () => {
    if (!selectedProduct) return null;

    const qty = getCartQuantity(selectedProduct.id); // Get current quantity

    return (
       <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-slide-in-right">
          {/* Header Image Area */}
          <div className="relative h-72 w-full bg-gray-200">
             <img src={selectedProduct.image} className="w-full h-full object-cover" />
             <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 left-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white active:bg-black/60 z-20"
                style={{ marginTop: 'env(safe-area-inset-top)' }}
             >
                <ChevronLeft size={24} />
             </button>

             {/* Cart Icon - Floating Top Right */}
             <div 
                className="absolute top-4 right-4 z-20"
                style={{ marginTop: 'env(safe-area-inset-top)' }}
             >
                <button 
                  onClick={() => setShowCartModal(true)}
                  className="w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white active:bg-black/60 relative"
                >
                    <ShoppingCart size={18} />
                    {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-white">{cartCount}</span>}
                </button>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 pb-safe">
             <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h1>
             
             {/* Modified Price Row with Quantity Controls */}
             <div className="flex justify-between items-end mb-6">
                 <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-red-500 font-mono">¥{selectedProduct.price}</span>
                    <span className="text-sm text-gray-400 mb-1">月售 {formatSales(selectedProduct.sales)}</span>
                 </div>

                 {/* Quantity Controls Inline */}
                 <div className="flex items-center gap-3">
                    {qty > 0 ? (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); updateQuantity(selectedProduct.id, -1)}} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 active:bg-gray-100"><Minus size={18} /></button>
                            <span className="text-lg font-bold min-w-[20px] text-center">{qty}</span>
                            <button onClick={(e) => {e.stopPropagation(); updateQuantity(selectedProduct.id, 1)}} className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white active:scale-95 shadow-sm"><Plus size={18} /></button>
                        </>
                    ) : (
                         <button 
                            onClick={(e) => {e.stopPropagation(); addToCart(selectedProduct)}}
                            className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold shadow-md shadow-blue-200 active:scale-95 transition-transform text-sm flex items-center gap-1"
                         >
                            <Plus size={16} /> 加入购物车
                         </button>
                    )}
                 </div>
             </div>
             
             <p className="text-gray-600 leading-relaxed mb-8">{selectedProduct.description}</p>
             
             <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-sm mb-3">营养成分 (参考)</h3>
                <div className="grid grid-cols-4 gap-2 text-center">
                   {[
                     { label: '热量', val: '450kcal' },
                     { label: '蛋白质', val: '22g' },
                     { label: '碳水', val: '45g' },
                     { label: '脂肪', val: '18g' },
                   ].map(n => (
                      <div key={n.label}>
                         <div className="text-xs text-gray-500 mb-1">{n.label}</div>
                         <div className="text-sm font-bold text-gray-800">{n.val}</div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="space-y-4">
                <h3 className="font-bold text-sm">商品评价 (12)</h3>
                {[1,2].map(i => (
                   <div key={i} className="flex gap-3 border-b border-gray-50 pb-3 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-700">用户88**</span>
                            <span className="text-[10px] text-gray-400">2023-10-24</span>
                         </div>
                         <p className="text-xs text-gray-600">味道很不错，分量也足，推荐！</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
          
          {/* Show Checkout Bar ONLY if cart modal is open in Details view, to allow checkout */}
          {showCartModal && renderFloatingCartBar({ mode: 'HOME' })}
       </div>
    );
  };

  const renderOrderDetailView = () => {
     if (!selectedOrder) return null;
     
     // 计算预计时间：下单时间延后2-3小时
     const calculateEstimatedTime = () => {
       // 解析下单时间
       const orderDate = new Date(selectedOrder.date.replace(/\//g, '-'));
       // 生成2-3小时的随机延迟（毫秒）
       const delayHours = 2 + Math.random(); // 2-3小时
       const delayMs = delayHours * 60 * 60 * 1000;
       // 计算预计时间
       const estimatedDate = new Date(orderDate.getTime() + delayMs);
       // 格式化时间
       return estimatedDate.toLocaleTimeString('zh-CN', { 
         hour: '2-digit', 
         minute: '2-digit' 
       });
     };
     
     const estimatedTime = calculateEstimatedTime();
     
     return (
       <div className="fixed inset-0 z-[100] bg-[#f3f4f6] flex flex-col animate-slide-in-right">
          <WeChatHeader title="订单详情" onBack={() => setSelectedOrder(null)} />
          
          <div className="flex-1 overflow-y-auto p-4 pb-safe">
             {/* Status Header */}
             <div className="bg-white p-6 rounded-xl mb-4 text-center shadow-sm">
                <div className="text-xl font-bold text-gray-900 mb-1">{selectedOrder.status}</div>
                <div className="text-xs text-gray-500">感谢您使用 </div>
                
                {/* Estimated Time */}
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Clock size={16} className="text-blue-600" />
                  <span>
                    {selectedOrder.deliveryMethod === 'DELIVERY' ? 
                      `预计配送时间：${estimatedTime}` : 
                      `预计取餐时间：${estimatedTime}`
                    }
                  </span>
                </div>
                
                <div className="flex justify-center gap-4 mt-6">
                   <button className="px-4 py-2 border border-gray-200 rounded-full text-xs font-medium text-gray-600">申请售后</button>
                   <button className="px-4 py-2 border border-blue-600 rounded-full text-xs font-medium text-blue-600">再来一单</button>
                </div>
             </div>
             
             {/* Items */}
             <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
                <div className="p-4 border-b border-gray-50 font-bold text-sm">商品信息</div>
                <div className="p-4">
                   {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center mb-4 last:mb-0">
                         <div className="flex items-center gap-3">
                            <img src={item.image} className="w-12 h-12 rounded bg-gray-100 object-cover"/>
                            <div>
                               <div className="text-sm font-bold text-gray-800">{item.name}</div>
                               <div className="text-xs text-gray-400">x{item.quantity}</div>
                            </div>
                         </div>
                         <div className="font-bold font-mono text-sm">¥{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                   ))}
                   
                   <div className="border-t border-dashed border-gray-100 my-4"></div>
                   
                   <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex justify-between">
                         <span>打包费</span>
                         <span>¥0.00</span>
                      </div>
                      <div className="flex justify-between">
                         <span>配送费</span>
                         <span>¥{selectedOrder.deliveryFee}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-2">
                         <span>实付</span>
                         <span className="font-mono text-lg">¥{selectedOrder.total.toFixed(2)}</span>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Info */}
             <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between text-xs">
                   <span className="text-gray-500">订单编号</span>
                   <span className="text-gray-900">{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-gray-500">下单时间</span>
                   <span className="text-gray-900">{selectedOrder.date}</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-gray-500">支付方式</span>
                   <span className="text-gray-900">微信支付</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-gray-500">配送方式</span>
                   <span className="text-gray-900">{selectedOrder.deliveryMethod === 'DELIVERY' ? '外卖配送' : '到店自提'}</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-gray-500">{selectedOrder.deliveryMethod === 'DELIVERY' ? '收货地址' : '自提地点'}</span>
                   <span className="text-gray-900 max-w-[60%] text-right truncate">{selectedOrder.locationInfo}</span>
                </div>
             </div>
          </div>
       </div>
     );
  };

  const renderOrdersView = () => (
    <div className="flex flex-col h-full bg-[#f7f8fa]">
      <WeChatHeader title="订单列表" />
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3">
        {orders.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
              <History size={48} className="mb-4 opacity-20"/>
              <p className="text-sm">暂无订单</p>
           </div>
        ) : (
          orders.map(order => (
            <div 
              key={order.id} 
              onClick={() => setSelectedOrder(order)}
              className="bg-white p-4 rounded-xl shadow-sm active:scale-[0.99] transition-transform"
            >
               <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                     <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-sm">{order.deliveryMethod === 'DELIVERY' ? '外卖' : '自提'}</span>
                     <span className="font-bold text-gray-800 text-sm truncate max-w-[150px]">{order.locationInfo}</span>
                     <ChevronRight size={14} className="text-gray-400"/>
                  </div>
                  <span className="text-xs text-gray-500">{order.status}</span>
               </div>
               
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 overflow-hidden">
                     {order.items.slice(0, 3).map(item => (
                        <img key={item.id} src={item.image} className="w-12 h-12 rounded bg-gray-100 object-cover border border-gray-100" />
                     ))}
                     {order.items.length > 3 && <div className="text-xs text-gray-400 bg-gray-50 h-12 px-2 flex items-center justify-center rounded">+{order.items.length - 3}</div>}
                  </div>
                  <div className="text-right">
                     <div className="font-bold text-gray-900 text-base font-mono">¥{order.total.toFixed(2)}</div>
                     <div className="text-[10px] text-gray-400">共{order.items.reduce((a,b)=>a+b.quantity,0)}件</div>
                  </div>
               </div>
               
               <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end gap-2">
                  <button onClick={(e) => {e.stopPropagation();}} className="px-3 py-1.5 border border-blue-600 text-blue-600 rounded-full text-xs font-medium">再来一单</button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderProfileView = () => (
    <div className="flex flex-col h-full bg-[#f7f8fa]">
       <WeChatHeader title="个人中心" />
       <div className="flex-1 overflow-y-auto pb-20">
          <div className="bg-white p-6 mb-2 flex items-center gap-4">
             <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                {user ? <img src={user.avatar} className="w-full h-full object-cover"/> : <UserIcon className="w-full h-full p-4 text-gray-400"/>}
             </div>
             <div className="flex-1">
                {user ? (
                   <>
                     <h2 className="font-bold text-xl text-gray-900">{user.name}</h2>
                     <p className="text-sm text-gray-500 mt-1">{user.phone}</p>
                   </>
                ) : (
                   <button onClick={() => setShowLoginModal(true)} className="font-bold text-lg text-blue-600">点击登录</button>
                )}
             </div>
          </div>
          
          <div className="bg-white mt-4">
             {[
               { icon: MapPin, label: '收货地址', action: () => setView('ADDRESS_LIST') },
               { icon: ShoppingBag, label: '自提信息', action: () => setView('PICKUP_EDIT') },
               { icon: Headphones, label: '联系客服', action: () => {} },
               { icon: Store, label: '关于我们', action: () => {} }
             ].map((item, idx) => (
                <div key={idx} onClick={item.action} className="flex items-center p-4 active:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                   <item.icon size={20} className="text-gray-600 mr-3" />
                   <span className="flex-1 text-sm font-medium text-gray-900">{item.label}</span>
                   {item.label === '自提信息' && pickupContact.name && (
                      <span className="text-xs text-gray-400 mr-2">{pickupContact.name} {pickupContact.phone}</span>
                   )}
                   <ChevronRight size={16} className="text-gray-400" />
                </div>
             ))}
          </div>

          {user && (
            <div className="mt-6 px-4">
               <Button 
                  fullWidth 
                  variant="secondary" 
                  onClick={handleLogout} 
                  className="bg-white text-red-500 hover:bg-gray-50 border-none shadow-none py-3"
               >
                  退出登录
               </Button>
            </div>
          )}
       </div>
    </div>
  );

  const renderSearchView = () => {
    // 优化搜索逻辑：支持模糊匹配，忽略大小写
    const filtered = searchQuery ? MOCK_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : [];
    
    return (
      <div className="flex flex-col h-full bg-white z-[60]">
         <div className="flex items-center gap-2 p-2 bg-white border-b border-gray-100 pt-safe">
            <button onClick={() => setView('HOME')} className="p-2"><ChevronLeft size={24}/></button>
            <div className="flex-1 bg-gray-100 rounded-full flex items-center px-3 h-9">
               <Search size={16} className="text-gray-400 mr-2"/>
               <input 
                 autoFocus 
                 className="bg-transparent flex-1 outline-none text-sm h-full" 
                 placeholder="搜索商品名称、描述或标签"
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
               />
               {searchQuery && <button onClick={() => setSearchQuery('')}><X size={14} className="text-gray-400"/></button>}
            </div>
            <button className="px-2 text-sm text-blue-600 font-medium" onClick={() => {}}>搜索</button>
         </div>
         
         <div className="flex-1 overflow-y-auto p-4">
            {!searchQuery ? (
               <div className="text-gray-400 text-sm mt-10 text-center">请输入关键词搜索</div>
            ) : filtered.length === 0 ? (
               <div className="text-gray-400 text-sm mt-10 text-center">未找到相关商品</div>
            ) : (
               <div className="grid grid-cols-2 gap-3">
                  {filtered.map(product => {
                    const qty = getCartQuantity(product.id);
                    return (
                      <div key={product.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden flex flex-col shadow-sm active:scale-95 transition-transform" onClick={() => setSelectedProduct(product)}>
                        <div className="h-32 bg-gray-200 relative">
                           <img src={product.image} className="w-full h-full object-cover" loading="lazy"/>
                           {product.stock < 10 && (
                             <div className="absolute bottom-0 w-full bg-black/60 text-white text-[10px] text-center py-0.5">仅剩{product.stock}份</div>
                           )}
                        </div>
                        <div className="p-2 flex flex-col flex-1">
                           <div className="font-bold text-sm text-gray-800 line-clamp-2">{product.name}</div>
                           <div className="text-xs text-gray-500 line-clamp-1 mt-1">{product.description}</div>
                           {product.tags && product.tags.length > 0 && (
                             <div className="flex flex-wrap gap-1 mt-1">
                               {product.tags.slice(0, 2).map(tag => (
                                 <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-1 rounded">{tag}</span>
                               ))}
                             </div>
                           )}
                           <div className="mt-auto flex justify-between items-center pt-2">
                              <span className="text-red-500 font-bold text-sm">¥{product.price}</span>
                              {qty > 0 ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={(e) => removeFromCart(product.id, e)} className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 bg-white">
                                    <Minus size={12} />
                                  </button>
                                  <span className="text-xs font-medium w-4 text-center">{qty}</span>
                                  <button onClick={(e) => addToCart(product, e)} className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                    <Plus size={12} />
                                  </button>
                                </div>
                              ) : (
                                <button onClick={(e) => addToCart(product, e)} className="w-5 h-5 bg-blue-600 rounded-full text-white flex items-center justify-center">
                                  <Plus size={12} />
                                </button>
                              )}
                           </div>
                        </div>
                      </div>
                    );
                  })}
               </div>
            )}
         </div>
      </div>
    );
  };

  const renderLoginModal = () => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
       <div className="bg-white w-[80%] max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
          <div className="p-6 flex flex-col items-center">
             <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-green-200 shadow-lg">
                <MessageSquare size={32} fill="currentColor" />
             </div>
             <h3 className="font-bold text-lg text-gray-900 mb-2">欢迎使用 Canteen</h3>
             <p className="text-sm text-gray-500 text-center mb-6">登录后可享受更便捷的点餐服务，查看历史订单及优惠券。</p>
             <Button fullWidth onClick={handleLoginSubmit} className="bg-[#07c160] hover:bg-[#06ad56] active:bg-[#05964b] shadow-lg shadow-green-100">
                微信一键登录
             </Button>
             <button onClick={() => setShowLoginModal(false)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">暂不登录</button>
          </div>
       </div>
    </div>
  );

  // 首次使用弹窗渲染函数
  const renderFirstUsePopup = () => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
       <div className="bg-white w-[85%] max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
          <div className="p-6 flex flex-col">
             <div className="text-center mb-4">
                <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
                   <Clock size={24} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">温馨提示</h3>
             </div>
             <div className="text-sm text-gray-600 mb-6 leading-relaxed">
                <p className="mb-3">感谢您使用我们的点餐APP！</p>
                <p className="font-medium">为了确保您能及时享用美食，请提前 <span className="text-red-500 font-bold">2-3小时</span> 预下单。</p>
                <p className="mt-3 text-xs text-gray-500">我们将根据您的下单时间安排制作和配送，确保您在期望的时间享用美味餐食。</p>
             </div>
             <Button 
               fullWidth 
               onClick={() => {
                 setShowFirstUsePopup(false);
                 localStorage.setItem('hasSeenFirstUsePopup', 'true');
               }} 
               className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-200"
             >
               我知道了
             </Button>
          </div>
       </div>
    </div>
  );

  const renderCheckoutView = () => {
    // Determine address logic
    const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
    const hasAddress = addresses.length > 0;
    
    // 计算预计时间
    const now = new Date();
    const getEstimatedTime = () => {
      if (deliveryMethod === 'DELIVERY') {
        // 外卖配送：预计30-45分钟送达
        const deliveryTime = new Date(now.getTime() + Math.floor(Math.random() * 15 + 30) * 60 * 1000);
        return `预计${deliveryTime.getHours().toString().padStart(2, '0')}:${deliveryTime.getMinutes().toString().padStart(2, '0')}送达`;
      } else {
        // 到店自提：预计15-25分钟出餐
        const pickupTime = new Date(now.getTime() + Math.floor(Math.random() * 10 + 15) * 60 * 1000);
        return `预计${pickupTime.getHours().toString().padStart(2, '0')}:${pickupTime.getMinutes().toString().padStart(2, '0')}出餐`;
      }
    };
    
    return (
       <div className="fixed inset-0 z-[100] bg-[#f7f8fa] flex flex-col animate-slide-in-right">
          <WeChatHeader title="确认订单" onBack={() => setIsCheckoutView(false)} />
          
          <div className="flex-1 overflow-y-auto p-4 pb-24">
             {/* Delivery Toggle */}
             <div className="bg-white p-1 rounded-lg flex mb-4 border border-gray-100">
                <button 
                  onClick={() => setDeliveryMethod('DELIVERY')} 
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${deliveryMethod === 'DELIVERY' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  外卖配送
                </button>
                <button 
                  onClick={() => setDeliveryMethod('PICKUP')} 
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${deliveryMethod === 'PICKUP' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  到店自提
                </button>
             </div>

             {/* Estimated Time */}
             <div className="bg-blue-50 rounded-lg p-3 mb-4 flex items-center gap-2">
               <Clock size={16} className="text-blue-600" />
               <span className="text-sm text-blue-800 font-medium">{getEstimatedTime()}</span>
             </div>

             {/* Location/Address Card */}
             <div className="bg-white rounded-xl p-4 mb-4 shadow-sm active:bg-gray-50 transition-colors cursor-pointer" 
                  onClick={() => {
                     if (deliveryMethod === 'DELIVERY') {
                        setView('ADDRESS_LIST');
                     } else {
                        setShowLocationModal(true);
                     }
                  }}
             >
                {deliveryMethod === 'DELIVERY' ? (
                   hasAddress ? (
                      <div className="flex justify-between items-center">
                         <div>
                            <div className="font-bold text-lg text-gray-900 mb-1">{defaultAddress?.area} {defaultAddress?.detail}</div>
                            <div className="text-sm text-gray-500">{defaultAddress?.contactName} {defaultAddress?.phone}</div>
                         </div>
                         <ChevronRight size={20} className="text-gray-400"/>
                      </div>
                   ) : (
                      <div className="flex justify-between items-center py-2 text-orange-500">
                         <span className="font-bold">请选择收货地址</span>
                         <ChevronRight size={20}/>
                      </div>
                   )
                ) : (
                   <div className="flex justify-between items-center">
                      <div>
                         <div className="text-xs text-gray-500 mb-1">自提地点</div>
                         <div className="font-bold text-lg text-gray-900">{selectedCanteen.name}</div>
                         <div className="text-xs text-gray-400 mt-1">{selectedCanteen.address}</div>
                      </div>
                      <ChevronRight size={20} className="text-gray-400"/>
                   </div>
                )}
             </div>

             {/* Cart Items Summary */}
             <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
                <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-sm text-gray-700">商品明细</div>
                <div className="p-4">
                   {cart.map(item => (
                      <div key={item.id} className="flex justify-between mb-4 last:mb-0">
                         <div className="flex gap-3">
                            <img src={item.image} className="w-12 h-12 rounded bg-gray-100 object-cover" />
                            <div>
                               <div className="text-sm font-bold text-gray-800">{item.name}</div>
                               <div className="text-xs text-gray-400 mt-1">x {item.quantity}</div>
                            </div>
                         </div>
                         <div className="font-mono font-bold text-gray-900">¥{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                   ))}
                   
                   <div className="border-t border-dashed border-gray-100 my-4"></div>
                   
                   <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">打包费</span>
                      <span className="font-mono">¥0.00</span>
                   </div>
                   <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">配送费</span>
                      <span className="font-mono">¥{deliveryFee.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-bold text-gray-900">小计</span>
                      <span className="text-xl font-bold text-red-500 font-mono">¥{finalTotal.toFixed(2)}</span>
                   </div>
                </div>
             </div>
             
             {/* Payment Method */}
             <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
                <span className="font-bold text-sm text-gray-900">支付方式</span>
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                   <MessageSquare size={16} fill="currentColor" /> 微信支付
                </div>
             </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="bg-white border-t border-gray-100 p-4 pb-safe flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
             <div className="text-2xl font-bold text-gray-900 font-mono flex items-baseline">
                <span className="text-xs mr-1">合计</span>
                <span className="text-sm">¥</span>{finalTotal.toFixed(2)}
             </div>
             <Button 
                onClick={placeOrder} 
                className="bg-[#07c160] hover:bg-[#06ad56] text-white px-8 rounded-full font-bold shadow-lg shadow-green-100"
                disabled={deliveryMethod === 'DELIVERY' && !hasAddress}
             >
                立即支付
             </Button>
          </div>
       </div>
    );
  };

  return (
    <div className="w-full h-full max-w-md mx-auto bg-[#f3f4f6] relative shadow-2xl overflow-hidden text-gray-800">
      {view === 'HOME' && renderHomeView()}
      {view === 'ORDERS' && renderOrdersView()}
      {view === 'PROFILE' && renderProfileView()}
      {view === 'ADDRESS_LIST' && renderAddressListView()}
      {view === 'ADDRESS_EDIT' && renderAddressEditView()}
      {view === 'SEARCH' && renderSearchView()}
      
      {view === 'PICKUP_EDIT' && (
        <PickupEditView 
          initialName={pickupContact.name} 
          initialPhone={pickupContact.phone}
          onSave={(name, phone) => {
            setPickupContact({ name, phone });
            setView('PROFILE');
          }}
          onBack={() => setView('PROFILE')}
        />
      )}
      
      {showLoginModal && renderLoginModal()}
      
      {showCartModal && renderCartPopup()}
      
      {isCheckoutView && renderCheckoutView()}

      {selectedProduct && renderProductDetailsView()}
      {selectedOrder && renderOrderDetailView()}
      
      {/* First use popup */}
      {showFirstUsePopup && renderFirstUsePopup()}
      
      {/* Global Floating Cart Bar - Always show when not in checkout view */}
      {!isCheckoutView && renderFloatingCartBar({ mode: 'HOME' })}
      
      {/* Bottom Nav Conditions */}
      {['HOME', 'ORDERS', 'PROFILE'].includes(view) && 
       !isCheckoutView && (
        <BottomNav current={view as ViewState} onChange={(v) => setView(v)} />
      )}
    </div>
  );
};