import Menu from "../components/navigation/menu";
import { useTheme } from "@geist-ui/react";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import PictureCard from "../components/PictureCard";
import { Helmet } from 'react-helmet';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import db from '../firebase.config';
import router from 'next/router';

var data:any;

const Gallery = () => {
  const auth = getAuth();
  const theme = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [gallery, setGallery] = useState<boolean>(false);
  const [picture, setPicture] = useState<string>("");

  const handleUploadNewPic = async () => {
    data.pictureURL = picture;
    await setDoc(doc(db, 'business', user!.uid), data)
      .catch(error => {
        alert(error);
    });
    /*
    //Deprecated - Using Cloud to store Images
    if (picture !== []) {
      let response = await addBusinessImage(uuidv4(), picture[0]);
      if (response.success !== undefined || response.success !== null) {
        Router.reload();
      }
      else {
        window.alert("Ah oh, something goes wrong. Please try again later.");
      }
    }
    */
  }

  const loadData = async (user: User) => {
    const docRef = doc(db, 'business', user.uid.toString());
    console.log(docRef);
    const docSnap = await getDoc(docRef);
    console.log(docSnap);
    if (docSnap.exists()) {
      data = docSnap.data();
      console.log(data);
      setPicture(data.pictureURL);
    }
    else {
      if (confirm("Please Create Your Business First!") === true) {
        router.push('./settings');
      }
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (aUser) => {
      setUser(aUser);
      if (aUser) {
        loadData(aUser).then(() => {
          if (data !== undefined && data.pictureURL !== "") {
            setGallery(true);
          }
        });
      }
      /*
      //Deprecated - Using Cloud to store Images
      let getPictures = await getBusinessImages(aUser?.uid);
      currPictures = getPictures.success;
      if (currPictures === [] || currPictures.length === 0) {
        setGallery(false);
      }
      else {
        setGallery(true);
      }
      */
    });
  }, [auth]);

  return (
    <>
    <Helmet>
      <title>GreenDay | Gallery</title>
    </Helmet>
    <Menu></Menu>
    <div className="body">
    {user ? (
    <div className="page__content"><ion-grid>
      <ion-row>
        <ion-col>
          <h3 id="gallery">Your Gallery</h3>
          {gallery && <PictureCard
              pictureURL={picture}
              pictureName={""}
            />
          }
        </ion-col>
        <ion-col>
          <ion-item>
            <h3 id="sentence">Display Your Best Picture To Show Your Business!</h3>
            <ion-button size="default" shape="round" color="tertiary" onClick={handleUploadNewPic}>Submit</ion-button>
          </ion-item>
          <ion-item>
            <ion-label>Enter URL:</ion-label>
            <ion-textarea rows={7} placeholder="Choose a picture from your website, right click and open image in new tab, then copy the new tab link here." onBlur={e => setPicture((e.target as HTMLInputElement).value)}></ion-textarea>
          </ion-item>
        </ion-col>
      </ion-row>
    </ion-grid></div>
    ) : (
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
    </div>
    <style jsx>{`
      .page__content {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        width: ${theme.layout.pageWidthWithMargin};
        max-width: 100%;
        margin: 0 auto;
        padding: calc(${theme.layout.unit} * 2) ${theme.layout.pageMargin};
        box-sizing: border-box;
      }
      #gallery {
        color: #112a12;
      }
      #sentence {
        color: #2c9678;
      }
      .body {
        height: calc(100vh - 102px);
        background-image: url('/assets/images/background.jpg');
        background-size: cover;
      }
      `}</style>
    </>
  );
}

export default Gallery;