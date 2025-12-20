import React from 'react';
import { ShopProvider } from './context/ShopContext';
import { ThemeProvider } from './context/ThemeContext';
import { ParishGuard } from './components/ParishGuard';
import { BetaBanner } from './components/BetaBanner';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ShopProvider>
        <div className="flex flex-col min-h-screen">
          <BetaBanner />
          <ParishGuard />
        </div>
      </ShopProvider>
    </ThemeProvider>
  );
};

export default App;
