// Security initialized: 2026-01-05
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CANTEENS } from './constants';
import { Product, Order, Canteen, DeliveryMethod, OrderStatus } from './types';
import { useUserStore } from './stores/useUserStore';
import { useCartStore } from './stores/useCartStore';
import { useOrderStore } from './stores/useOrderStore';
import { useAddressStore } from './stores/useAddressStore';

// Components
import { BottomNav } from './components/layout/BottomNav';
import { CartPopup } from './components/business/CartPopup';
import { FloatingCartBar } from './components/business/FloatingCartBar';
import { LoginModal } from './components/business/LoginModal';
import { FirstUsePopup } from './components/business/FirstUsePopup';
import { LocationModal } from './components/business/LocationModal';

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

// Page Transition Component
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2 }}
    className="h-full w-full"
  >
    {children}
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

  // These could be global but local is fine for now as they are page-specific
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('DELIVERY');
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen>(CANTEENS[0]);

  // --- Initial Effects ---
  useEffect(() => {
    const hasSeenFirstUsePopup = localStorage.getItem('hasSeenFirstUsePopup');
    if (!hasSeenFirstUsePopup) {
      const timer = setTimeout(() => setShowFirstUsePopup(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // --- Actions ---
  const { clearCart, getCartTotal, cart } = useCartStore();

  // State from stores
  const { addOrder } = useOrderStore();
  const { addresses } = useAddressStore();

  const handlePlaceOrder = () => {
    const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0];
    const deliveryLocation = defaultAddress ? `${defaultAddress.area} ${defaultAddress.detail}` : '请选择地址';
    const deliveryFee = deliveryMethod === 'DELIVERY' ? 2.5 : 0;
    const cartItemTotal = getCartTotal();

    // We need to construct the order
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-8)}`,
      items: [...cart],
      total: cartItemTotal + deliveryFee,
      subtotal: cartItemTotal,
      status: deliveryMethod === 'DELIVERY' ? OrderStatus.DELIVERING : OrderStatus.READY_FOR_PICKUP,
      date: new Date().toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      deliveryMethod,
      locationInfo: deliveryMethod === 'DELIVERY' ? deliveryLocation : selectedCanteen.name,
      deliveryFee
    };

    addOrder(newOrder);
    clearCart();
    navigate('/orders');
  };

  // Logic to show/hide bottom nav and floating cart
  const showBottomNav = ['/', '/orders', '/profile'].includes(location.pathname) && !selectedProduct;
  const showFloatingCart = ['/', '/search'].includes(location.pathname) || selectedProduct !== null;

  return (
    <div className="w-full h-full min-h-screen max-w-md mx-auto bg-[#F5F6F8] relative shadow-2xl overflow-hidden text-gray-800 flex flex-col">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <PageTransition>
              <HomeView
                selectedCanteen={selectedCanteen}
                onShowLocation={() => setShowLocationModal(true)}
                onSearch={() => navigate('/search')}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                onProductClick={setSelectedProduct}
              />
            </PageTransition>
          } />

          <Route path="/search" element={
            <PageTransition>
              <SearchView
                onBack={() => navigate(-1)}
                onProductClick={setSelectedProduct}
              />
            </PageTransition>
          } />

          <Route path="/orders" element={
            <RequireAuth>
              <PageTransition><OrdersView onOrderClick={(o) => { setSelectedOrder(o); navigate(`/order/${o.id}`); }} /></PageTransition>
            </RequireAuth>
          } />

          <Route path="/order/:id" element={
            <RequireAuth>
              {selectedOrder ? <PageTransition><OrderDetailsView order={selectedOrder} onBack={() => navigate(-1)} /></PageTransition> : <Navigate to="/orders" />}
            </RequireAuth>
          } />

          <Route path="/profile" element={
            <PageTransition>
              <ProfileView
                onNavigate={(path: string) => {
                  if (path === 'ADDRESS_LIST') navigate('/addresses');
                  if (path === 'PICKUP_EDIT') navigate('/pickup-contact');
                }}
              />
            </PageTransition>
          } />

          <Route path="/addresses" element={
            <RequireAuth>
              <PageTransition>
                <AddressListView
                  onBack={() => navigate(-1)}
                  onEdit={(addr) => { navigate('/address/edit', { state: { address: addr } }); }}
                  onSelect={(addr) => {
                    const { setDefaultAddress } = useAddressStore.getState();
                    setDefaultAddress(addr.id);
                    navigate(-1);
                  }}
                  onAdd={() => { navigate('/address/edit'); }}
                  isCheckoutMode={true}
                />
              </PageTransition>
            </RequireAuth>
          } />

          <Route path="/address/edit" element={
            <RequireAuth>
              <PageTransition><AddressWrapper /></PageTransition>
            </RequireAuth>
          } />

          <Route path="/pickup-contact" element={
            <RequireAuth>
              <PageTransition>
                <PickupEditView
                  onSaved={() => navigate(-1)}
                  onBack={() => navigate(-1)}
                />
              </PageTransition>
            </RequireAuth>
          } />

          <Route path="/checkout" element={
            <RequireAuth>
              <PageTransition>
                <CheckoutView
                  onBack={() => navigate(-1)}
                  deliveryMethod={deliveryMethod}
                  setDeliveryMethod={setDeliveryMethod}
                  selectedCanteen={selectedCanteen}
                  onShowLocation={() => setShowLocationModal(true)}
                  onShowAddressList={() => navigate('/addresses')}
                  onPlaceOrder={handlePlaceOrder}
                />
              </PageTransition>
            </RequireAuth>
          } />
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
        {showLocationModal && (
          <LocationModal
            selectedCanteen={selectedCanteen}
            onSelect={(canteen) => { setSelectedCanteen(canteen); setShowLocationModal(false); }}
            onClose={() => setShowLocationModal(false)}
          />
        )}
      </AnimatePresence>

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
          deliveryFee={deliveryMethod === 'DELIVERY' ? 2.5 : 0}
          hasBottomNav={showBottomNav}
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
  return <AddressEditView initialAddress={initialAddress} onBack={() => navigate(-1)} onSaved={() => navigate(-1)} />
}