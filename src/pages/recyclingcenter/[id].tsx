import { Image, useTheme } from "@geist-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Menu from "../../components/navigation/menu";
import { getBusinessData } from "../api/backend";
import { Helmet } from 'react-helmet';

const RecyclingCenter = (props) => {
  const theme = useTheme();
  const [gallery, setGallery] = useState<boolean>(false);

  useEffect(() => {
    if (props.data.pictureURL === "") {
      setGallery(false);
    }
    else {
      setGallery(true);
    }
  });

  return (
    <>
    <Helmet>
      <title>GreenDay | Details</title>
    </Helmet>
    <Menu></Menu>
    <ion-grid>
      <ion-row>
        <ion-col>
          <ion-card color="success">
            <ion-card-header><h3>Business Details</h3></ion-card-header>
            <ion-card-content><h5>
              Name: {props.data.name}<br></br>
              Phone: {props.data.phone}<br></br>
              Address: {props.data.location}<br></br>
              Website:{' '}
              <Link href={props.data.website!} passHref={true}>
                {props.data.website.toString()}
              </Link><br></br>
              Recycling Types: {props.data.recyclingTypes}<br></br>
            </h5></ion-card-content>
          </ion-card>
        </ion-col>
        <ion-col>
          <ion-card color="success">
            <ion-card-header><h3>Time Availability</h3></ion-card-header>
            <ion-card-content><h5>
              {props.time.at(0)}<br></br>
              {props.time.at(1)}<br></br>
              {props.time.at(2)}<br></br>
              {props.time.at(3)}<br></br>
              {props.time.at(4)}<br></br>
              {props.time.at(5)}<br></br>
              {props.time.at(6)}<br></br>
              {props.time.at(7)}<br></br>
            </h5></ion-card-content>
          </ion-card>
        </ion-col>
        <ion-col>
          {gallery && <ion-card><Image src={props.data.pictureURL}></Image></ion-card>}
        </ion-col>
      </ion-row>
    </ion-grid>
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
  let timeArray = data.success.timeAvailability.split('; ');
  return {
    props: {
      data: data.success,
      time: timeArray
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