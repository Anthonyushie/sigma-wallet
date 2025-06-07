
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBack = false, 
  className = '' 
}) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen bg-white ${className}`}>
      {(title || showBack) && (
        <header className="brutal-card rounded-none border-b-4 border-t-0 border-x-0 shadow-none">
          <div className="flex items-center justify-between">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="brutal-button py-2 px-4 shadow-none hover:shadow-none"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            {title && (
              <h1 className="text-2xl font-black text-center flex-1">
                {title}
              </h1>
            )}
            {showBack && <div className="w-16" />}
          </div>
        </header>
      )}
      <main className="p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
