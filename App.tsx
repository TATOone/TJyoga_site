/* Preconfigured App.tsx — modify only routes */
      
import React, { Suspense, lazy, useState, createContext } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

import Home from './src/pages/Home.tsx';
import SkipLinks from './src/components/SkipLinks';
import Analytics from './src/components/Analytics';
const NotFound = lazy(() => import('./src/pages/NotFound.tsx'));

export const MobileMenuContext = createContext<{
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}>({
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: () => {},
});

const App: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <MobileMenuContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen }}>
      <Analytics />
      <SkipLinks />
      <Router>
        <motion.main 
          id="main-content" 
          className="min-h-screen font-inter overflow-x-hidden" 
          role="main"
          animate={{
            x: isMobileMenuOpen ? '-85%' : '0%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="*" 
              element={
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Загрузка...</div>}>
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