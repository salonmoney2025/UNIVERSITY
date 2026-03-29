'use client';

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';
import '../../styles/components/page-header.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  backUrl?: string;
  homeUrl?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  showBackButton = true,
  showHomeButton = true,
  backUrl,
  homeUrl = '/dashboard',
  actions,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  const handleHome = () => {
    router.push(homeUrl);
  };

  return (
    <div className="page-header">
      <div className="page-header-container">
        <div className="page-header-left">
          {icon && <div className="page-header-icon">{icon}</div>}
          <div className="page-header-content">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>

        <div className="page-header-right">
          <div className="page-header-nav">
            {showBackButton && (
              <button onClick={handleBack} className="nav-btn-back" type="button">
                <ArrowLeft />
                <span>Back</span>
              </button>
            )}
            {showHomeButton && (
              <button onClick={handleHome} className="nav-btn-home" type="button">
                <Home />
                <span>Home</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}
