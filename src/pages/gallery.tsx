import { DropzoneArea } from "material-ui-dropzone";
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Menu from "../components/navigation/menu";
import { useTheme } from "@geist-ui/react";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

const useStyles = makeStyles(() => createStyles({
    previewChip: {
        minWidth: 160,
        maxWidth: 210
    },
}));

const Gallery = () => {
  const auth = getAuth();
  const theme = useTheme();
  const classes = useStyles();
  const json = require("../TestCases.json");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(auth, (aUser) => {
      console.log(`Auth state changes: ${aUser}`);
      setUser(aUser);
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
          {json.map(({ name, pictureURL }) => (
            <img title={name} src={pictureURL} width={400} height={400}/>
          ))}
        </ion-col>
        <ion-col>
          <h3>Contribute to Your Community</h3>
          <h4>Upload picture with detailed address to help more!</h4>
          <ion-item>
            <ion-label>Address: </ion-label>
            <ion-input></ion-input>
            <ion-button>Submit</ion-button>
          </ion-item>
          <DropzoneArea
            acceptedFiles={['image/*']}
            dropzoneText={"Drag and drop an image here or click"}
            filesLimit={1}
            previewGridProps={{container: { spacing: 1, direction: 'row' }}}
            previewChipProps={{classes: { root: classes.previewChip } }}
            previewText="Selected files"
            onChange={(files) => console.log('Files:', files)}
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