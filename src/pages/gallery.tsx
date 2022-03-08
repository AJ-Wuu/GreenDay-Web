import { DropzoneArea } from "material-ui-dropzone";
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Menu from "../components/navigation/menu";
import { useTheme } from "@geist-ui/react";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { addBusinessImage, getBusinessImages } from "./api/backend";
import { v4 as uuidv4 } from 'uuid';
import Router from 'next/router';

const useStyles = makeStyles(() => createStyles({
  previewChip: {
    minWidth: 160,
    maxWidth: 210
  },
}));

var picture:File;
var currPictures:[];

const Gallery = () => {
  const auth = getAuth();
  const theme = useTheme();
  const classes = useStyles();
  const [user, setUser] = useState<User | null>(null);
  const [gallery, setGallery] = useState<boolean>(false);

  const handleGetAllPictures = async () => {
    await getBusinessImages(user?.uid).then((images) => {
      if (images.success !== undefined && images.success.length !== 0) {
        currPictures = images.success;
        setGallery(true);
      }
    })
  }

  const handleUploadNewPic = async () => {
    let response = await addBusinessImage(uuidv4(), picture);
    if (response.success !== undefined || response.success !== null) {
      Router.reload();
    }
    else {
      window.alert("Ah oh, something goes wrong. Please try again later.");
    }
  }

  useEffect(() => {
    onAuthStateChanged(auth, async (aUser) => {
      console.log(`Auth state changes: ${aUser}`);
      setUser(aUser);
      setGallery(false);
      await handleGetAllPictures();
    });
  }, [auth]);

  return (
    <>
    <Menu></Menu>
    {user ? (
    <div className="page__content"><ion-grid>
      <ion-row>
        <ion-col>
          <h3>Your Gallery</h3>
          {gallery ? (
            currPictures.map((pictureURL, i) => (
              <img title={"pic"} key={i} src={pictureURL} width={400} height={400}/>
            ))) : (
            <h4>Add your first picture now!</h4>
          )}
        </ion-col>
        <ion-col>
          <ion-item>
            <h3>Upload Pictures To Help People Know Your Business!</h3>
            <ion-button size="default" shape="round" color="tertiary" onClick={handleUploadNewPic}>Submit</ion-button>
          </ion-item>
          <DropzoneArea
            acceptedFiles={['.jpg, .png']}
            dropzoneText={"Drag and drop an image here or click"}
            filesLimit={1}
            previewGridProps={{container: { spacing: 1, direction: 'row' }}}
            previewChipProps={{classes: { root: classes.previewChip } }}
            previewText="Selected files"
            onChange={file => picture = file[0]!}
          />
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
      h3,h4 {
        color: #2c9678;
      }
      `}</style>
    </>
  );
}

export default Gallery;