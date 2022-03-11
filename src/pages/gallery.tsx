import { DropzoneArea } from "material-ui-dropzone";
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Menu from "../components/navigation/menu";
import { Grid, useTheme } from "@geist-ui/react";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { addBusinessImage, getBusinessImages } from "./api/backend";
import { v4 as uuidv4 } from 'uuid';
import Router from 'next/router';
import PictureCard from "../components/PictureCard";

const useStyles = makeStyles(() => createStyles({
  previewChip: {
    minWidth: 160,
    maxWidth: 210
  },
}));

var picture:File;
var currPictures:any[] = [];

const Gallery = () => {
  const auth = getAuth();
  const theme = useTheme();
  const classes = useStyles();
  const [user, setUser] = useState<User | null>(null);
  const [gallery, setGallery] = useState<boolean>(false);

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
      let getPictures = await getBusinessImages(aUser?.uid);
      currPictures = getPictures.success;
      if (currPictures === []) {
        setGallery(false);
      }
      else {
        setGallery(true);
      }
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
          <Grid.Container gap={2} marginTop={1} justify="flex-start">
            {gallery && (currPictures.map(picture => (
              <Grid xs={24} sm={12} md={8}>
                <PictureCard
                  pictureURL={picture}
                  pictureName={""}
                />
              </Grid>
            )))}
          </Grid.Container>
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