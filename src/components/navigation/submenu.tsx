import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '@geist-ui/react';

const Submenu: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const scrollHandler = () => setSticky(document.documentElement.scrollTop > 54);
    document.addEventListener('scroll', scrollHandler);
    return () => document.removeEventListener('scroll', scrollHandler);
  }, [setSticky]);

  return (
    <>
      <nav className="submenu__wrapper">
        <div className={`submenu ${sticky ? 'submenu_sticky' : ''}`}>
          <div className="submenu__inner">
            <ion-tabs><ion-tab-bar>
              <ion-tab-button tab='home' onClick={() => router.push('/home')}>
                <ion-icon src='/assets/images/home.svg'></ion-icon>
                <ion-label>HOME</ion-label>
              </ion-tab-button>
              <ion-tab-button tab='map' onClick={() => router.push('/map')}>
                <ion-icon src='/assets/images/map.svg'></ion-icon>
                <ion-label>MAP</ion-label>
              </ion-tab-button>
              <ion-tab-button tab='settings' onClick={() => router.push('/settings')}>
                <ion-icon src='/assets/images/settings.svg'></ion-icon>
                <ion-label>SETTINGS</ion-label>
              </ion-tab-button>
              <ion-tab-button tab='gallery' onClick={() => router.push('/gallery')}>
                <ion-icon src='/assets/images/gallery.svg'></ion-icon>
                <ion-label>GALLERY</ion-label>
              </ion-tab-button>
            </ion-tab-bar></ion-tabs>
          </div>
        </div>
      </nav>
      <style jsx>{`
        .submenu__wrapper {
          height: 48px;
          position: relative;
          overflow: hidden;
          box-shadow: inset 0 -1px ${theme.palette.border};
        }
        .submenu_sticky {
          transition: box-shadow 0.2s ease;
        }
        .submenu_sticky {
          position: fixed;
          z-index: 1100;
          top: 0;
          right: 0;
          left: 0;
          background: ${theme.palette.background};
          box-shadow: ${theme.type === 'dark'
            ? `inset 0 -1px ${theme.palette.border}`
            : 'rgba(0, 0, 0, 0.1) 0 0 15px 0'};
        }
        .submenu__inner {
          display: flex;
          width: ${theme.layout.pageWidthWithMargin};
          max-width: 100%;
          margin: 0 auto;
          padding: 0 ${theme.layout.pageMargin};
          height: 48px;
          box-sizing: border-box;
          overflow-y: hidden;
          overflow-x: auto;
          overflow: -moz-scrollbars-none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          box-sizing: border-box;
        }
        .submenu__inner::-webkit-scrollbar {
          display: none;
        }
        .submenu__inner :global(.content) {
          display: none;
        }
        .submenu__inner :global(.tabs),
        .submenu__inner :global(header) {
          height: 100%;
          border: none;
        }
        .submenu__inner :global(.tab) {
          height: calc(100% - 2px);
          padding-top: 0;
          padding-bottom: 0;
          color: ${theme.palette.accents_5};
          font-size: 0.875rem;
        }
        .submenu__inner :global(.tab):hover {
          color: ${theme.palette.foreground};
        }
        .submenu__inner :global(.active) {
          color: ${theme.palette.foreground};
        }
      `}</style>
    </>
  );
};

export default Submenu;
