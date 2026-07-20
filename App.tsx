/* Preconfigured App.tsx — modify only routes */
      
import React, { Suspense, lazy, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import Home from './src/pages/Home.tsx';
import SkipLinks from './src/components/SkipLinks';
import Analytics from './src/components/Analytics';
import { MobileMenuContext } from './src/context/mobileMenuContext';
import RequireAuth from './src/components/RequireAuth';
const NotFound = lazy(() => import('./src/pages/NotFound.tsx'));
const Club = lazy(() => import('./src/pages/Club'));
const ClubRates = lazy(() => import('./src/pages/ClubRates'));
const Retreats = lazy(() => import('./src/pages/Retreats'));
const Personal = lazy(() => import('./src/pages/Personal'));
const AboutPage = lazy(() => import('./src/pages/AboutPage'));
const HowToBuy = lazy(() => import('./src/pages/HowToBuy'));
const CheckoutStub = lazy(() => import('./src/pages/CheckoutStub'));
const PaymentSuccess = lazy(() => import('./src/pages/PaymentSuccess'));
const PaymentError = lazy(() => import('./src/pages/PaymentError'));
const Offer = lazy(() => import('./src/pages/legal/Offer'));
const Policy = lazy(() => import('./src/pages/legal/Policy'));
const Refund = lazy(() => import('./src/pages/legal/Refund'));
const MedicalDisclaimer = lazy(() => import('./src/pages/legal/MedicalDisclaimer'));
const AccountLogin = lazy(() => import('./src/pages/account/Login'));
const AccountRegister = lazy(() => import('./src/pages/account/Register'));
const AccountLayout = lazy(() => import('./src/components/AccountLayout'));
const AccountDashboard = lazy(() => import('./src/pages/account/Dashboard'));
const AccountVideos = lazy(() => import('./src/pages/account/Videos'));
const AccountKnowledge = lazy(() => import('./src/pages/account/Knowledge'));
const AccountKnowledgeDetail = lazy(() => import('./src/pages/account/KnowledgeDetail'));
const AccountSubscription = lazy(() => import('./src/pages/account/Subscription'));
const AccountSupport = lazy(() => import('./src/pages/account/Support'));
const AdminDashboard = lazy(() => import('./src/pages/admin/AdminDashboard'));
const BlogIndex = lazy(() => import('./src/pages/blog/BlogIndex'));
const BlogPost = lazy(() => import('./src/pages/blog/BlogPost'));

const App: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const suspenseFallback = (
    <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
  );

  return (
    <MobileMenuContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen }}>
      <Analytics />
      <SkipLinks />
      <Router>
        <motion.main 
          id="main-content" 
          className="min-h-screen font-body overflow-x-hidden" 
          role="main"
          animate={{
            x: isMobileMenuOpen ? '-85%' : '0%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/club"
              element={
                <Suspense fallback={suspenseFallback}>
                  <Club />
                </Suspense>
              }
            />
            <Route
              path="/club/rates"
              element={
                <Suspense fallback={suspenseFallback}>
                  <ClubRates />
                </Suspense>
              }
            />
            <Route
              path="/retreats"
              element={
                <Suspense fallback={suspenseFallback}>
                  <Retreats />
                </Suspense>
              }
            />
            <Route
              path="/personal"
              element={
                <Suspense fallback={suspenseFallback}>
                  <Personal />
                </Suspense>
              }
            />
            <Route
              path="/about"
              element={
                <Suspense fallback={suspenseFallback}>
                  <AboutPage />
                </Suspense>
              }
            />
            <Route
              path="/how-to-buy"
              element={
                <Suspense fallback={suspenseFallback}>
                  <HowToBuy />
                </Suspense>
              }
            />
            <Route
              path="/checkout"
              element={<Navigate to="/club/rates" replace />}
            />
            <Route
              path="/payment/success"
              element={
                <Suspense fallback={suspenseFallback}>
                  <PaymentSuccess />
                </Suspense>
              }
            />
            <Route
              path="/payment/error"
              element={
                <Suspense fallback={suspenseFallback}>
                  <PaymentError />
                </Suspense>
              }
            />
            <Route
              path="/checkout/:productId"
              element={
                <Suspense fallback={suspenseFallback}>
                  <CheckoutStub />
                </Suspense>
              }
            />
            <Route
              path="/blog"
              element={
                <Suspense fallback={suspenseFallback}>
                  <BlogIndex />
                </Suspense>
              }
            />
            <Route
              path="/blog/:slug"
              element={
                <Suspense fallback={suspenseFallback}>
                  <BlogPost />
                </Suspense>
              }
            />
            <Route
              path="/offer"
              element={
                <Suspense fallback={suspenseFallback}>
                  <Offer />
                </Suspense>
              }
            />
            <Route
              path="/policy"
              element={
                <Suspense fallback={suspenseFallback}>
                  <Policy />
                </Suspense>
              }
            />
            <Route
              path="/refund"
              element={
                <Suspense fallback={suspenseFallback}>
                  <Refund />
                </Suspense>
              }
            />
            <Route
              path="/medical-disclaimer"
              element={
                <Suspense fallback={suspenseFallback}>
                  <MedicalDisclaimer />
                </Suspense>
              }
            />
            <Route
              path="/account/login"
              element={
                <Suspense fallback={suspenseFallback}>
                  <AccountLogin />
                </Suspense>
              }
            />
            <Route
              path="/account/register"
              element={
                <Suspense fallback={suspenseFallback}>
                  <AccountRegister />
                </Suspense>
              }
            />
            <Route
              path="/account"
              element={
                <Suspense fallback={suspenseFallback}>
                  <RequireAuth>
                    <AccountLayout />
                  </RequireAuth>
                </Suspense>
              }
            >
              <Route
                index
                element={
                  <Suspense fallback={suspenseFallback}>
                    <AccountDashboard />
                  </Suspense>
                }
              />
              <Route
                path="videos"
                element={
                  <Suspense fallback={suspenseFallback}>
                    <AccountVideos />
                  </Suspense>
                }
              />
              <Route
                path="knowledge"
                element={
                  <Suspense fallback={suspenseFallback}>
                    <AccountKnowledge />
                  </Suspense>
                }
              />
              <Route
                path="knowledge/:slug"
                element={
                  <Suspense fallback={suspenseFallback}>
                    <AccountKnowledgeDetail />
                  </Suspense>
                }
              />
              <Route path="articles" element={<Navigate to="/account/knowledge" replace />} />
              <Route path="articles/:slug" element={<Navigate to="/account/knowledge" replace />} />
              <Route
                path="subscription"
                element={
                  <Suspense fallback={suspenseFallback}>
                    <AccountSubscription />
                  </Suspense>
                }
              />
              <Route
                path="support"
                element={
                  <Suspense fallback={suspenseFallback}>
                    <AccountSupport />
                  </Suspense>
                }
              />
            </Route>
            <Route
              path="/admin"
              element={
                <Suspense fallback={suspenseFallback}>
                  <RequireAuth roles={['admin', 'editor', 'support']}>
                    <AdminDashboard />
                  </RequireAuth>
                </Suspense>
              }
            />
            <Route 
              path="*" 
              element={
                <Suspense fallback={suspenseFallback}>
                  <NotFound />
                </Suspense>
              } 
            />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
          />
        </motion.main>
      </Router>
    </MobileMenuContext.Provider>
  );
}

export default App;
