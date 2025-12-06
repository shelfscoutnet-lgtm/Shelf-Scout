import React from 'react';
import { ShopProvider } from './context/ShopContext';
import { ThemeProvider } from './context/ThemeContext';
import { ParishGuard } from './components/ParishGuard';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ShopProvider>
        <ParishGuard />
      </ShopProvider>
    </ThemeProvider>
  );
};

export default App;