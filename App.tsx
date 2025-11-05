/* Preconfigured App.tsx — modify only routes */
      
import React, { Suspense, lazy } from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './src/pages/Home.tsx';
import SkipLinks from './src/components/SkipLinks';
const NotFound = lazy(() => import('./src/pages/NotFound.tsx'));

const App: React.FC = () => {
  return (
    <Theme appearance="inherit" radius="large" scaling="100%">
      <SkipLinks />
      <Router>
        <main id="main-content" className="min-h-screen font-inter" role="main">
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
        </main>
      </Router>
    </Theme>
  );
}

export default App;