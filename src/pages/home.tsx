import { useEffect, useState } from 'react';
import {
  getAuth,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import UserHeading from '../components/UserHeading';
import Menu from '../components/navigation/menu';
import { Helmet } from 'react-helmet';
import SignInAlert from '../components/SignInAlert';

const Home = () => {
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(auth, async (aUser) => {
      setUser(aUser);
    });
  }, [auth]);

  return (
    <>
    <Helmet>
      <title>GreenDay | Home</title>
    </Helmet>
    <Menu></Menu>
    <div className='body'>
      {user ? (
        <>
          {(user?.displayName !== undefined) && <UserHeading user={{ name: user?.displayName!, avatarSrc: user.photoURL }} />}
        </>) : (
        <>
          <SignInAlert></SignInAlert>
        </>
      )}
    </div>
    <style jsx>{`
      .body {
        height: calc(100vh - 102px);
        background-image: url("/assets/images/background.jpg");
        backgroundRepeat: "no-repeat";
        background-size: cover;
      }
    `}</style>
    </>
  );
};

export default Home;