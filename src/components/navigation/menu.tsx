import React, { useEffect, useState } from 'react';
import { Button, CssBaseline, GeistProvider, useTheme } from '@geist-ui/react';
import * as Icons from 'react-feather';
import Submenu from './submenu';
import {
  getAuth,
  signInWithPopup,
  OAuthCredential,
  User,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from 'firebase/auth';
import router from 'next/router';

const Menu: React.FC = () => {
  const theme = useTheme();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const [, setUser] = useState<User | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [themeType, setThemeType] = useState('light')
  
  const switchThemes = () => {
    setThemeType(last => (last === 'dark' ? 'light' : 'dark'))
  }

  const handleSignInRequest = () => {
      signInWithPopup(auth, provider)
        .then((result) => {
          const credential: OAuthCredential | null =
            GoogleAuthProvider.credentialFromResult(result);
          if (credential) {
            setUser(result.user);
            setLoggedIn(true);
          }
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert(`${errorCode}: ${errorMessage}`);
        });
  };

  const handleSignOutRequest = () => {
      signOut(auth)
        .then(() => {
          setUser(null);
          setLoggedIn(false);
        })
        .catch((error) => {
          alert(error);
        });
  };

  useEffect(() => {
    onAuthStateChanged(auth, (aUser) => {
      setUser(aUser);
      if (aUser) {
        setLoggedIn(true);
      }
      else {
        setLoggedIn(false);
      }
    });
    console.log(loggedIn);
  }, [auth]);

  return (
    <>
    <GeistProvider themeType={themeType}>
      <CssBaseline />
      <nav className="theme-nav">
        <h1 className="theme-title" onClick={() => router.push("/")}>Green Day - RecycleMe Global</h1>
        <div>
          <Button
            className="theme-button"
            auto
            type="abort"
            onClick={switchThemes}
          >{theme.type === 'dark' ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
          </Button>
          <Button
            id="login-button"
            auto
            type="abort"
            disabled={loggedIn}
            onClick={handleSignInRequest}
          >LOG IN</Button>
          <Button
            id="logout-button"
            auto
            type="abort"
            disabled={!loggedIn}
            onClick={handleSignOutRequest}
          >LOG OUT</Button>
        </div>
      </nav>
      <Submenu />
      <style jsx>{`
        .theme-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: ${theme.layout.pageWidthWithMargin};
          max-width: 100%;
          margin: 0 auto;
          padding: 0 ${theme.layout.pageMargin};
          font-size: 16px;
          height: 54px;
          box-sizing: border-box;
        }
        .theme-title {
          font-size: 1rem;
          font-weight: 500;
          margin: 0;
          letter-spacing: 0;
          color: #00ad43;
        }
        .theme-nav > div {
          display: flex;
          align-items: center;
        }
        .theme-nav :global(.theme-button) {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.25rem;
          height: 2.25rem;
          padding: 0;
          margin: 0 ${theme.layout.gapHalf};
        }
      `}</style>
    </GeistProvider>
    </>
  );
};

export default Menu;
