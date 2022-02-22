import React from 'react';
import { Text, Card, useTheme, Image, Button } from '@geist-ui/react';
import * as Icons from 'react-feather';

interface Props {
  pictureURL: string;
  pictureName: string;
}

export type PictureCardProps = Props;

const PictureCard: React.FC<PictureCardProps> = ({ pictureURL, pictureName }) => {
  const theme = useTheme();

  const handleDeletePicture = () => {
    console.log("Yes");
  }

  const handleConfirmDeletePicture = () => {
    if (confirm("Sure to delete this picture?")) {
      handleDeletePicture();
    }
    else {
      console.log("Cancel deletion");
    }
  }

  return (
    <>
      <div className="picture__wrapper">
        <Card className="picture__card" shadow>
          <Image src={pictureURL}></Image>
          <Text marginBottom={0} font="0.875rem" style={{ color: theme.palette.accents_5 }}>
            {pictureName} {' '}
            <Button
              icon={<Icons.Trash2 />}
              type='error-light'
              auto
              scale={1/3}
              onClick={handleConfirmDeletePicture}
            />
          </Text>
        </Card>
      </div>
      <style jsx>{`
        .picture__wrapper {
          width: 100%;
        }
        .picture__wrapper :global(.picture__card) {
          box-shadow: ${theme.type === 'dark' ? theme.expressiveness.shadowSmall : '0px 2px 4px rgba(0,0,0,0.1)'};
        }
        .picture__wrapper :global(.picture__card):hover {
          box-shadow: ${theme.type === 'dark'
            ? `0 0 0 1px ${theme.palette.foreground}`
            : '0px 4px 8px rgba(0,0,0,0.12)'};
        }
      `}</style>
    </>
  );
};

export default PictureCard;
