import { useEffect, useState } from 'react';
import {
  getAuth,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import UserHeading from '../components/UserHeading';
import Menu from '../components/navigation/menu';
import { Helmet } from 'react-helmet';

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
    {user ? (
      <>
        {(user?.displayName !== undefined) && <UserHeading user={{ name: user?.displayName!, avatarSrc: user.photoURL }} />}
      </>) : (
      <>
        <ion-progress-bar type="indeterminate"></ion-progress-bar>
        <ion-chip color="secondary">
          <ion-label color="dark">Please Sign In</ion-label>
        </ion-chip>
        <ion-progress-bar
          type="indeterminate"
          reversed={true}
        ></ion-progress-bar>
      </>
    )}
    </>
  );
};

export default Home;