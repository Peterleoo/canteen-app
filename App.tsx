// Security initialized: 2026-01-05
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Product, Order, Canteen, DeliveryMethod, OrderStatus } from './types';
import { useUserStore } from './stores/useUserStore';
import { useCartStore } from './stores/useCartStore';
import { useOrderStore } from './stores/useOrderStore';
import { useAddressStore } from './stores/useAddressStore';
import { getCanteens } from './services/canteenService';
import { createOrder } from './services/orderService';
// 直接导入getDefaultCoords，避免在useState中使用require()
import { getDefaultCoords } from './utils/location';
import { History } from 'lucide-react';

// Components
import { BottomNav } from './components/layout/BottomNav';
import { CartPopup } from './components/business/CartPopup';
import { FloatingCartBar } from './components/business/FloatingCartBar';
import { LoginModal } from './components/business/LoginModal';
import { FirstUsePopup } from './components/business/FirstUsePopup';
import { LocationModal } from './components/business/LocationModal';
import { AlertPopup } from './components/common/AlertPopup';
import { CartConflictModal } from './components/business/CartConflictModal';

// Pages
import { HomeView } from './pages/HomeView';
import { SearchView } from './pages/SearchView';
import { ProductDetailsView } from './pages/ProductDetailsView';
import { CheckoutView } from './pages/CheckoutView';
import { OrdersView } from './pages/OrdersView';
import { OrderDetailsView } from './pages/OrderDetailsView';
import { ProfileView } from './pages/ProfileView';
import { AddressListView } from './pages/AddressListView';
import { AddressEditView } from './pages/AddressEditView';
import { PickupEditView } from './pages/PickupEditView';
import { AddressMapView } from './pages/AddressMapView';

// 基础页面切换（支持淡入淡出，用于主 Tab 切换）
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="h-full w-full flex-1 min-h-0 flex flex-col"
  >
    {children}
  </motion.div>
);

// 子页面覆盖滑入（用于地址编辑、结算等，模拟商品详情页的覆盖感）
const SubPageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ x: '100%' }}
    animate={{ x: 0 }}
    exit={{ x: '100%' }}
    transition={{ type: 'spring', damping: 30, stiffness: 250 }}
    className="fixed inset-0 z-[120] bg-white flex flex-col shadow-2xl overflow-hidden touch-none"
    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, touchAction: 'none' }}
  >
    <div className="flex-1 flex flex-col touch-auto">
      {children}
    </div>
  </motion.div>
);

// Auth Guard Component
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUserStore();

  if (!user) {
    // Redirect to home and show login modal
    return <Navigate to="/" replace state={{ showLogin: true }} />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Store Access ---
  const { user, showLoginModal, setShowLoginModal } = useUserStore();
  const { cart, getCartTotal, clearCart, canteenId: cartCanteenId } = useCartStore();
  const { addOrder } = useOrderStore();
  const { addresses } = useAddressStore();


  // --- Handle Login Redirect State ---
  useEffect(() => {
    if (location.state?.showLogin) {
      setShowLoginModal(true);
      // Clear state to prevent reopening on reload (optional but good practice)
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setShowLoginModal]);

  // --- Local UI State ---
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFirstUsePopup, setShowFirstUsePopup] = useState(false);

  // 弹窗状态
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  // 用户位置状态 - 初始化为默认坐标，避免null导致的额外API调用
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number }>(getDefaultCoords);

  // These could be global but local is fine for now as they are page-specific
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('DELIVERY');
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null);

  // --- Derived State ---
  // 获取购物车所属的食堂对象（如果购物车为空，则退化到当前选择的食堂）
  const cartCanteen = (canteens.find(c => c.id === cartCanteenId)) || selectedCanteen;

  // --- Initial Effects ---
  useEffect(() => {
    const hasSeenFirstUsePopup = localStorage.getItem('hasSeenFirstUsePopup');
    if (!hasSeenFirstUsePopup) {
      const timer = setTimeout(() => setShowFirstUsePopup(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // --- Get User Location --- 
  useEffect(() => {
    // 导入位置服务（动态导入，避免SSR问题）
    const fetchUserLocation = async () => {
      try {
        const { getUserLocation } = await import('./utils/location');
        const coords = await getUserLocation();
        // 只有当获取到的坐标与当前坐标不同时，才更新状态
        // 这样可以避免不必要的API调用和重渲染
        if (coords.latitude !== userCoords.latitude || coords.longitude !== userCoords.longitude) {
          setUserCoords(coords);
        }
      } catch (error) {
        console.error('Failed to get user location:', error);
        // 用户不同意定位或定位失败时，使用默认坐标
        // 但由于我们已经在初始化时设置了默认坐标，这里不需要再次设置
      }
    };

    fetchUserLocation();
  }, [userCoords]);

  // --- Show Alert Popup --- 
  const showAlert = (message: string, title: string = '提示') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // --- Load canteens from database ---  
  // 使用ref防止React StrictMode下的重复调用
  const canteensLoadedRef = useRef(false);
  useEffect(() => {
    // React StrictMode下会执行两次，这里只执行一次
    if (canteensLoadedRef.current) return;
    canteensLoadedRef.current = true;

    const loadCanteens = async () => {
      try {
        // userCoords永远不会为null，因为我们已经在初始化时设置了默认值
        const result = await getCanteens(true, userCoords);
        if (result.code === 200) {
          setCanteens(result.data);
        }
      } catch (error) {
        console.error('Failed to load canteens:', error);
      }
    };
    loadCanteens();
  }, [userCoords]); // 当用户位置变化时重新加载食堂列表

  // --- Set default canteen when canteens are loaded ---  
  useEffect(() => {
    if (canteens.length > 0 && !selectedCanteen) {
      setSelectedCanteen(canteens[0]);
      // console.log('=== 默认食堂设置 ===');
      // console.log('默认食堂:', canteens[0].name);
      // console.log('食堂坐标:', { latitude: canteens[0].latitude, longitude: canteens[0].longitude });
    }
  }, [canteens, selectedCanteen]);

  // --- 监听所选食堂变化，计算距离并更新配送方式 ---  
  useEffect(() => {
    if (selectedCanteen && userCoords) {
      // 导入距离计算函数
      const calculateDistance = async () => {
        try {
          const { calculateDistance } = await import('./utils/location');
          // 计算距离但不使用结果，用于调试目的
          calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            selectedCanteen.latitude,
            selectedCanteen.longitude
          );
          // console.log('=== 距离计算结果 ===');
          // console.log('所选食堂:', selectedCanteen.name);
          // console.log('食堂坐标:', { latitude: selectedCanteen.latitude, longitude: selectedCanteen.longitude });
          // console.log('用户坐标:', userCoords);
          // console.log('计算距离:', distance.toFixed(3), '公里');
          // console.log('格式化显示:', distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`);
        } catch (error) {
          console.error('Failed to calculate distance:', error);
        }
      };
      calculateDistance();
    }
  }, [selectedCanteen, userCoords]);

  // --- 监听食堂配送状态变化，当只有一种配送方式时默认选中 ---  
  useEffect(() => {
    if (selectedCanteen) {
      // 如果食堂不支持配送，只有自提一种方式，默认选中自提
      if (!selectedCanteen.isDeliveryActive) {
        setDeliveryMethod('PICKUP');
      }
      // 如果食堂只支持配送（理论上不会，但为了完整性添加）
      // 这里可以根据实际业务逻辑调整，比如是否有自提选项
    }
  }, [selectedCanteen]);

  // --- Actions --- 

  const handlePlaceOrder = async () => {
    if (!cartCanteen) {
      console.error('No canteen available for order');
      return;
    }

    const orderCanteen = cartCanteen;

    // --- 订单创建前验证 --- 
    // 1. 检查食堂状态
    if (orderCanteen.status === 'CLOSED') {
      showAlert('该食堂当前处于关停状态，无法下单', '提示');
      return;
    }

    if (orderCanteen.status === 'BUSY') {
      showAlert('该食堂当前处于繁忙状态，无法下单', '提示');
      return;
    }

    // 2. 检查服务半径（仅检查配送地址与食堂的距离）
    if (deliveryMethod === 'DELIVERY') {
      // 导入距离计算函数
      const { isWithinServiceRadius } = await import('./utils/location');

      // 获取默认地址
      const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0];

      // 检查地址是否有坐标
      if (defaultAddress && defaultAddress.latitude && defaultAddress.longitude) {
        // 使用配送地址的坐标进行服务半径检查
        const isWithinRadius = isWithinServiceRadius(
          {
            latitude: defaultAddress.latitude,
            longitude: defaultAddress.longitude
          },
          {
            latitude: orderCanteen.latitude,
            longitude: orderCanteen.longitude
          },
          orderCanteen.deliveryRadius
        );

        if (!isWithinRadius) {
          showAlert(`您选择的配送地址超出该食堂的配送范围（${orderCanteen.deliveryRadius}km），无法下单`, '提示');
          return;
        }
      }
    }

    // 3. 检查配送状态
    if (deliveryMethod === 'DELIVERY' && !orderCanteen.isDeliveryActive) {
      showAlert('该食堂当前未开启配送服务，无法选择外卖配送', '提示');
      return;
    }

    // --- 验证通过，继续创建订单 --- 
    const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0];
    const deliveryLocation = defaultAddress ? `${defaultAddress.area} ${defaultAddress.detail}` : '请选择地址';
    const deliveryFee = deliveryMethod === 'DELIVERY' ? orderCanteen.deliveryFee : 0;
    const cartItemTotal = getCartTotal();

    // 计算包装费
    const packagingFee = cart.length > 0 ? orderCanteen.defaultPackagingFee : 0;
    const totalAmount = cartItemTotal + deliveryFee + packagingFee;

    // 构建订单数据
    const orderData = {
      userId: user?.id || 'anonymous',
      canteenId: orderCanteen.id,
      subtotal: cartItemTotal,
      total: totalAmount,
      status: deliveryMethod === 'DELIVERY' ? OrderStatus.PENDING : OrderStatus.PENDING,
      deliveryMethod,
      deliveryFee,
      packagingFee: packagingFee, // 使用实际计算的包装费
      discountAmount: 0, // 添加默认折扣金额
      addressId: defaultAddress?.id || null,
      addressDetail: deliveryMethod === 'DELIVERY' ? deliveryLocation : orderCanteen.name,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image // 包含商品图片字段
      }))
    };

    try {
      // 调用API创建订单
      const result = await createOrder(orderData);

      if (result.code === 200 && result.data) {
        // 将订单添加到本地状态
        addOrder(result.data);
        // 清空购物车
        clearCart();
        // 跳转到订单列表页
        navigate('/orders');
      } else {
        console.error('Failed to create order:', result.message);
        showAlert(result.message || '订单创建失败，请稍后重试', '提示');
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      showAlert(error.message || '订单创建失败，请稍后重试', '提示');
    }
  };

  // Logic to show/hide bottom nav and floating cart
  const showBottomNav = ['/', '/orders', '/profile'].includes(location.pathname) && !selectedProduct;
  const showFloatingCart = ['/', '/search'].includes(location.pathname) || selectedProduct !== null;

  return (
    <div className="w-full h-[100dvh] max-w-md mx-auto bg-[#F5F6F8] relative shadow-2xl overflow-hidden text-gray-800 flex flex-col">
      {/* 第一层：持久化主页内容层 (保证状态不丢失，返回不重载) */}
      <div className="flex-1 relative flex flex-col min-h-0">
        <div style={{ display: location.pathname === '/' ? 'flex' : 'none' }} className="flex-1 flex flex-col h-full min-h-0">
          {selectedCanteen ? (
            <HomeView
              selectedCanteen={selectedCanteen}
              onShowLocation={() => setShowLocationModal(true)}
              onSearch={() => navigate('/search')}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              onProductClick={setSelectedProduct}
            />
          ) : (
            <div className="flex items-center justify-center h-full">加载中...</div>
          )}
        </div>

        <div style={{ display: location.pathname === '/orders' ? 'flex' : 'none' }} className="flex-1 flex flex-col h-full min-h-0">
          {user ? (
            <OrdersView onOrderClick={(o) => { setSelectedOrder(o); navigate(`/order/${o.id}`); }} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-[#f7f8fa] p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <History size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-900 font-bold mb-2">您还未登录</p>
              <p className="text-gray-500 text-sm mb-6">登录后即可查看您的订餐记录</p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-100 active:scale-95 transition-transform"
              >
                立即登录
              </button>
            </div>
          )}
        </div>

        <div style={{ display: location.pathname === '/profile' ? 'flex' : 'none' }} className="flex-1 flex flex-col h-full min-h-0">
          <ProfileView
            onNavigate={(path: string) => {
              if (path === 'ADDRESS_LIST') navigate('/address/list');
              if (path === 'PICKUP_EDIT') navigate('/pickup-contact');
            }}
          />
        </div>
      </div>

      {/* 第二层：覆盖式二级页面层 (URL 驱动，滑入滑出) */}
      <AnimatePresence>
        <Routes location={location} key={location.pathname}>
          {/* 只定义二级及以上的覆盖页面 */}
          <Route path="/search" element={
            <SubPageTransition>
              <SearchView
                onBack={() => navigate(-1)}
                onProductClick={setSelectedProduct}
                selectedCanteen={selectedCanteen}
              />
            </SubPageTransition>
          } />

          <Route path="/order/:id" element={
            <RequireAuth>
              <SubPageTransition>
                {selectedOrder ? (
                  <OrderDetailsView order={selectedOrder} onBack={() => navigate(-1)} />
                ) : (
                  <div className="p-4">订单加载中...</div>
                )}
              </SubPageTransition>
            </RequireAuth>
          } />

          <Route path="/addresses" element={
            <RequireAuth>
              <SubPageTransition>
                <AddressListView
                  onBack={() => navigate(-1)}
                  onEdit={(addr) => { navigate('/address/edit', { state: { address: addr } }); }}
                  onSelect={(addr) => {
                    const { setDefaultAddress } = useAddressStore.getState();
                    const { user } = useUserStore.getState();
                    if (user?.id) {
                      setDefaultAddress(addr.id, user.id);
                      navigate(-1);
                    }
                  }}
                  onAdd={() => { navigate('/address/edit'); }}
                  isCheckoutMode={true}
                />
              </SubPageTransition>
            </RequireAuth>
          } />

          <Route path="/address/list" element={
            <RequireAuth>
              <SubPageTransition>
                <AddressListView
                  onBack={() => navigate(-1)}
                  onEdit={(addr) => { navigate('/address/edit', { state: { address: addr } }); }}
                  onSelect={() => { }}
                  onAdd={() => { navigate('/address/edit'); }}
                  isCheckoutMode={false}
                />
              </SubPageTransition>
            </RequireAuth>
          } />

          <Route path="/address/edit" element={
            <RequireAuth>
              <SubPageTransition><AddressWrapper /></SubPageTransition>
            </RequireAuth>
          } />

          <Route path="/pickup-contact" element={
            <RequireAuth>
              <SubPageTransition>
                <PickupEditView
                  onSaved={() => navigate(-1)}
                  onBack={() => navigate(-1)}
                />
              </SubPageTransition>
            </RequireAuth>
          } />

          <Route path="/address/map" element={
            <RequireAuth>
              <SubPageTransition>
                <AddressMapViewWrapper />
              </SubPageTransition>
            </RequireAuth>
          } />

          <Route path="/checkout" element={
            <RequireAuth>
              <SubPageTransition>
                {cartCanteen ? (
                  <CheckoutView
                    onBack={() => navigate(-1)}
                    deliveryMethod={deliveryMethod}
                    setDeliveryMethod={setDeliveryMethod}
                    selectedCanteen={cartCanteen}
                    onShowAddressList={() => navigate('/addresses')}
                    onPlaceOrder={handlePlaceOrder}
                  />
                ) : (
                  <Navigate to="/" />
                )}
              </SubPageTransition>
            </RequireAuth>
          } />

          <Route path="*" element={null} />
        </Routes>
      </AnimatePresence>

      {/* Global Modals - Wrapped with separate AnimatePresence for popups */}
      <AnimatePresence>
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCartModal && (
          <CartPopup onClose={() => setShowCartModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailsView
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onOpenCart={() => setShowCartModal(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFirstUsePopup && (
          <FirstUsePopup onConfirm={() => {
            setShowFirstUsePopup(false);
            localStorage.setItem('hasSeenFirstUsePopup', 'true');
          }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLocationModal && selectedCanteen && (
          <LocationModal
            selectedCanteen={selectedCanteen}
            canteens={canteens}
            onSelect={(canteen) => {
              // 跨食堂切换拦截逻辑
              if (cart.length > 0 && cartCanteenId && cartCanteenId !== canteen.id) {
                if (window.confirm(`切换食堂将清空购物车中“${cartCanteen?.name || ''}”的商品，是否继续？`)) {
                  clearCart();
                  setSelectedCanteen(canteen);
                  setShowLocationModal(false);
                }
              } else {
                setSelectedCanteen(canteen);
                setShowLocationModal(false);
              }
            }}
            onClose={() => setShowLocationModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Alert Popup */}
      <AlertPopup
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={alertTitle}
        message={alertMessage}
      />

      {/* Cart Conflict Modal */}
      <CartConflictModal />

      {/* Persistent Components */}
      {showFloatingCart && location.pathname !== '/checkout' && (
        <FloatingCartBar
          mode={selectedProduct ? 'DETAILS' : 'HOME'}
          showCartModal={showCartModal}
          onToggleCart={() => setShowCartModal(!showCartModal)}
          selectedProduct={selectedProduct}
          onCheckout={() => {
            if (!user) {
              setShowLoginModal(true);
            } else {
              setShowCartModal(false);
              setSelectedProduct(null);
              navigate('/checkout');
            }
          }}
          deliveryFee={deliveryMethod === 'DELIVERY' ? (cartCanteen?.deliveryFee || 0) : 0}
          hasBottomNav={showBottomNav}
          selectedCanteen={cartCanteen || undefined}
          deliveryMethod={deliveryMethod}
        />
      )}

      {showBottomNav && <BottomNav />}
    </div>
  );
};

// Helper wrapper to handle navigation state params for edit
const AddressWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialAddress = location.state?.address || {};
  return <AddressEditView initialAddress={initialAddress} onBack={() => navigate(-1)} onSaved={() => navigate('/addresses', { replace: true })} />
};

// Helper wrapper for map address selection
const AddressMapViewWrapper = () => {
  const navigate = useNavigate();

  const handleSelect = (addressInfo: any) => {
    // Store the selected address in location state and navigate back
    navigate('/address/edit', { state: { selectedAddress: addressInfo }, replace: true });
  };

  return <AddressMapView onSelect={handleSelect} onBack={() => navigate(-1)} />
};