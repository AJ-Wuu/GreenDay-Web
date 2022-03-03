import React, { useEffect } from "react";
import { Loader } from '@googlemaps/js-api-loader';
import { useTheme } from '@geist-ui/react';
import { useState } from 'react';
import StyledMap from "../styles/map.css";
import Geocode from 'react-geocode';
import { getBusinessData, getTrashCanData, getTrashCanImage, queryBusinessIDs, queryTrashCanLocations } from "./api/backend";
import router from "next/router";

Geocode.setApiKey(process.env.GEOCODE_API_KEY!);

type MarkerInfo = {
  name: string;
  recyclingTypes: string | URL;
  location: string;
  pictureURL: string;
  phone: string;
  website: URL | string;
  category: string;
  lat: number;
  lng: number;
}

let map: google.maps.Map;
const loader = new Loader({
  apiKey: process.env.GOOGLE_API_KEY!,
  version: 'weekly',
});
var varMarkers:MarkerInfo[] = [];
var state = {
  defaultCenter: { lat: 39.87154121541584, lng: -102.955994347825 },
  markers: varMarkers
}
var address:string = "";
var userLat:number;
var userLng:number;

const LoadMap = () => {
  const theme = useTheme();
  const [gotMarkers, setGotMarkers] = useState<boolean>(false);

  const handleLatLng = async (address:string) => {
    await Geocode.fromAddress(address).then(
      (response) => {
        const { lat, lng } = response.results[0].geometry.location;
        userLat = lat;
        userLng = lng;
      },
      (error) => {
        console.error(error);
        if (confirm("Ah oh, something goes wrong. Please try again later.")) {
          router.push("/home");
        }
      }
    );
  }

  const handleSearchTrashCan = () => {
    setGotMarkers(false);
    if (address !== '' && address !== undefined) {
      handleLatLng(address).then(async () => {
        await queryTrashCanLocations(userLat, userLng).then((trashcanIDs) => {
          if (trashcanIDs.success === undefined || trashcanIDs.success.length === 0) {
            window.alert("Sorry, there is no trash can near this location now. Enter the first one yourself!");
          }
          else {
            state.markers = [];
            trashcanIDs.success.forEach(async (trashcanID) => {
              let currTrashCanImg: string;
              let currTrashCanLat: number;
              let currTrashCanLng: number;
              let currTrashCanDate: string;
              let currRecyclingType: string;
              await getTrashCanImage(trashcanID).then((trashcanImg) => {
                currTrashCanImg = trashcanImg.success[0];
              }).then(async () => {
                await getTrashCanData(trashcanID).then((trashcanData) => {
                  currTrashCanDate = trashcanData[0].date_taken;
                  currTrashCanLat = parseFloat(trashcanData[0].latitude);
                  currTrashCanLng = parseFloat(trashcanData[0].longitude);
                  currRecyclingType = trashcanData[0].recycling_types[0];
                });
              }).then(() => {
                let currMarker:MarkerInfo = {
                  name: currTrashCanDate,
                  recyclingTypes: new URL(currRecyclingType),
                  location: "",
                  pictureURL: currTrashCanImg,
                  phone: "",
                  website: "",
                  category: "TrashCan",
                  lat: currTrashCanLat,
                  lng: currTrashCanLng
                }
                state.markers.push(currMarker);
              })
            });
            setGotMarkers(true);
          }
        });
      });
    }
    else {
      window.alert("Please enter your location.");
    }
  }

  const handleSearchBusiness = () => {
    setGotMarkers(false);
    if (address !== '' && address !== undefined) {
      handleLatLng(address).then(async () => {
        await queryBusinessIDs(userLat, userLng).then((businessIDs) => {
          if (businessIDs.success === undefined || businessIDs.success.length === 0) {
            window.alert("Sorry, there is no recycling center near this location now. Be the first one by entering yours!");
          }
          else {
            state.markers = [];
            businessIDs.success.forEach(async (businessID) => {
              await getBusinessData(businessID).then((businessData) => {
                let currMarker:MarkerInfo = {
                  name: businessData.success.name,
                  recyclingTypes: businessData.success.recyclingTypes,
                  location: businessData.success.location,
                  pictureURL: businessData.success.pictureURL,
                  phone: businessData.success.phone,
                  website: new URL(businessData.success.website),
                  category: "RecyclingCenter",
                  lat: businessData.success.lat,
                  lng: businessData.success.lng
                }
                state.markers.push(currMarker);
              });
            })
            setGotMarkers(true);
          }
        })
      })
    }
    else {
      window.alert("Please enter your location.");
    }
  }

  function handleAttachGoogleMap() {
    if (gotMarkers) {
      setTimeout(() => {
        handleDrawMarkers(state.markers);
      }, 2000);
    }
  };

  function attachSecretMessage(marker: google.maps.Marker, secretMessage: MarkerInfo) {
    let infowindow;
    if (secretMessage.category === "RecyclingCenter") {
      infowindow = new google.maps.InfoWindow({
        content: 
          "<p><b>" + secretMessage.name + "</b></p>" + 
          "<p>recycling: <b>" + secretMessage.recyclingTypes + "</b></p>" + 
          "<p>Address: <b>" + secretMessage.location + "</b></p>" + 
          "<p>Phone: <b>" + secretMessage.phone + "</b></p>" + 
          "<p>Website: <b><a href=" + secretMessage.website + ">" + secretMessage.website + "</b></p>" +
          "<img src='" + secretMessage.pictureURL + "' width='200' height='100'>",
        maxWidth: 300
      });
    }
    else if (secretMessage.category === "TrashCan") {
      infowindow = new google.maps.InfoWindow({
        content: 
          "<p>Photo taken on: <b>" + secretMessage.name + "</b></p>" + 
          "<img src='" + secretMessage.pictureURL + "' width='200' height='100'>",
        maxWidth: 300
      });
    }

    marker.addListener("click", () => {
      infowindow.open(marker.get("map"), marker);
    });
  }

  function handleDrawMarkers(markers:any[]) {
    const bounds = new google.maps.LatLngBounds();

    markers.forEach((markerInfo:MarkerInfo) => {
      const marker = new google.maps.Marker({
        position: { lat: markerInfo.lat, lng: markerInfo.lng},
        map,
      });
      bounds.extend(markerInfo);
      attachSecretMessage(marker, markerInfo);
    });

    map.fitBounds(bounds);
    map.panToBounds(bounds);
  };

  useEffect(() => {
    setGotMarkers(false);
    loader.load()
      .then(() => {
        const styledMapType = new google.maps.StyledMapType([
          {
            featureType: 'administrative',
            elementType: 'geometry',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'road',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'transit',
            stylers: [{ visibility: 'off' }],
          },
        ],
        { name: 'Styled Map' }
      );

      map = new google.maps.Map(
        document.getElementById('google-map') as HTMLElement,
        {
          center: state.defaultCenter,
          zoom: 4,
          mapTypeControlOptions: {
            mapTypeIds: [
              'roadmap',
              'satellite',
              'hybrid',
              'terrain',
              'styled_map',
            ],
          },
        }
      );

      map.mapTypes.set('styled_map', styledMapType);
      map.setMapTypeId('styled_map');
    })
    .then(() => {
      console.log(map);
    });

    handleAttachGoogleMap()
  });

  return (
    <>
      <div>
        <ion-header class="ion-no-border">
          <ion-toolbar>
            <ion-item>
              <ion-button size="default" shape="round" color="warning" onClick={() => router.push("/home")}>Back Home</ion-button>
              <ion-searchbar placeholder="Enter Your Location..." onBlur={e => address = (e.target as HTMLInputElement).value}></ion-searchbar>         
              <ion-button size="default" shape="round" color="tertiary" onClick={handleSearchTrashCan}>Trash Can</ion-button>
              <ion-button size="default" shape="round" color="tertiary" onClick={handleSearchBusiness}>Recycling Center</ion-button>
            </ion-item>
          </ion-toolbar>
        </ion-header>
        <StyledMap>
          <div id="google-map" />
        </StyledMap>
      </div>
      <style jsx>{`
        #search-bar {
          text-align: center;
          display: flex;
          width: 20%;
          float: left;
          background: lightgreen;
        }
        #map {
          width: 80%;
          float:right;
        }
        #space {
          color: lightgreen;
        }
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
        .actions-stack {
          display: flex;
          width: 100%;
        }
        .actions-stack :global(.input-wrapper) {
          background-color: ${theme.palette.background};
        }
        .actions-stack :global(input) {
          font-size: 14px;
        }
      `}</style>
    </>
  )
}

export default LoadMap;