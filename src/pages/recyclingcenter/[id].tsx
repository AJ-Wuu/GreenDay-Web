import { Grid, Image, Text, useTheme } from "@geist-ui/react";
import Link from "next/link";
import { useState } from "react";
import Menu from "../../components/navigation/menu";
import { getBusinessData, getBusinessImages } from "../api/backend";

const RecyclingCenter = (props) => {
  const theme = useTheme();
  const [gallery, ] = useState<boolean>(false);

  /*
  useEffect(() => {
    if (props.images === []) {
      setGallery(false);
    }
    else {
      setGallery(true);
    }
  });
  */

  return (
    <>
    <Menu></Menu>
    <div className="page__wrapper">
      <div className="page__content">
        <div className='heading__info'>
          <Text h5 className='heading__user-info'>
            Name: {props.data.name}<br></br>
            Phone: {props.data.phone}<br></br>
            Address: {props.data.location}<br></br>
            Website:{' '}
            <Link href={props.data.website!} passHref={true}>
              {props.data.website.toString()}
            </Link><br></br>
            Recycling Types: {props.data.recyclingTypes}<br></br>
          </Text>
        </div>
        <div className="page__wrapper">
          <div className="page__content">
            <Grid.Container gap={2} marginTop={1} justify="flex-start">
            {gallery && (props.images.map(picture => (
              <Grid xs={24} sm={12} md={8}>
                <Image src={picture}></Image>
              </Grid>
            )))}
          </Grid.Container>
          </div>
        </div>
      </div>
    </div>
    <style jsx>{`
      .page__wrapper {
        background-color: ${theme.palette.accents_1};
        min-height: calc(100vh - 172px);
      }
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
      .heading {
        display: flex;
        flex-direction: row;
        width: ${theme.layout.pageWidthWithMargin};
        max-width: 100%;
        margin: 0 auto;
        padding: calc(${theme.layout.gap} * 2) ${theme.layout.pageMargin} calc(${theme.layout.gap} * 4);
        box-sizing: border-box;
      }
      .heading__info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        margin-left: 20px;
        color: #2c9678;
      }
      `}</style>
    </>
  );
}

export async function getStaticProps(context) {
  let uid = context.params.id;
  let data = await getBusinessData(uid);
  let images = await getBusinessImages(uid);
  return {
    props: {
      data: data.success,
      images: images.success
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export default RecyclingCenter;