import React, { useEffect } from "react";
import { Loader } from '@googlemaps/js-api-loader';
import { useTheme } from '@geist-ui/react';
import { useState } from 'react';
import StyledMap from "../styles/map.css";
import Geocode from 'react-geocode';
import { getBusinessData, getTrashCanData, getTrashCanImage, queryBusinessIDs, queryTrashCanLocations } from "./api/backend";
import router from "next/router";
import { Helmet } from 'react-helmet';

Geocode.setApiKey(process.env.GEOCODE_API_KEY!);

type MarkerInfo = {
  name: string;
  recyclingTypes: string;
  location: string;
  pictureURL: string;
  phone: string;
  website: URL | string;
  category: string;
  lat: number;
  lng: number;
  uid: string;
  timeAvailability: string;
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
        await queryTrashCanLocations(userLat, userLng).then(async (trashcans) => {
          if (trashcans.success === undefined || trashcans.success.length === 0) {
            window.alert("Sorry, there is no trash can near this location now. Enter the first one yourself!");
          }
          else {
            let trashcanIDs = trashcans.success;
            state.markers = [];
            let trashcanDetails:any[] = [];
            let trashcanImage:any[] = [];
            await getTrashCanData(trashcanIDs).then((trashcanData) => {
              trashcanDetails.push(trashcanData);
            }).then(async () => {
              await getTrashCanImage(trashcanIDs).then((trashcanImages) => {
                trashcanImage.push(trashcanImages.success);
              });
            }).then(() => {
              for (let i=0; i<trashcanDetails[0].length; i++) {
                let currMarker:MarkerInfo = {
                  name: trashcanDetails[0][i].date_taken,
                  recyclingTypes: "",
                  location: "",
                  pictureURL: trashcanImage[0][i],
                  phone: "",
                  website: "",
                  category: "TrashCan",
                  lat: parseFloat(trashcanDetails[0][i].latitude),
                  lng: parseFloat(trashcanDetails[0][i].longitude),
                  uid: "",
                  timeAvailability: ""
                }
                console.log(currMarker);
                state.markers.push(currMarker);
              }
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
                let websiteURL = (businessData.success.website === null || businessData.success.website === undefined || businessData.success.website === "") ? new URL("https://green-day-web.vercel.app/404") : new URL(businessData.success.website);
                let currMarker:MarkerInfo = {
                  name: businessData.success.name,
                  recyclingTypes: businessData.success.recyclingTypes,
                  location: businessData.success.location,
                  pictureURL: businessData.success.pictureURL,
                  phone: businessData.success.phone,
                  website: websiteURL,
                  category: "RecyclingCenter",
                  lat: businessData.success.lat,
                  lng: businessData.success.lng,
                  uid: businessID,
                  timeAvailability: businessData.success.timeAvailability
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

  function attachUserMessage(marker: google.maps.Marker) {
    let infowindow = new google.maps.InfoWindow({
      content: "<ion-item><ion-label>You are HERE</ion-label></ion-item>"
    })
    marker.addListener("click", () => {
      infowindow.open(marker.get("map"), marker);
    });
  }

  function attachSecretMessage(marker: google.maps.Marker, secretMessage: MarkerInfo) {
    let infowindow;
    let recycling = secretMessage.recyclingTypes.replace(/,/g, '\n'); //'g' for global
    let workingday = secretMessage.timeAvailability.replace(/; /g, '\n');
    if (secretMessage.category === "RecyclingCenter") {
      if (secretMessage.pictureURL === undefined || secretMessage.pictureURL === "") {
        infowindow = new google.maps.InfoWindow({
          content: 
            "<ion-title color=\"success\">" + secretMessage.name + "</ion-title>" + 
            "<ion-item><ion-label>Phone: " + secretMessage.phone + "</ion-label></ion-item>" + 
            "<ion-item><ion-label>Address: </ion-label><ion-textarea readonly class=\"ion-text-wrap\" value=\"" + secretMessage.location + "\"></ion-textarea></ion-item>" + 
            "<ion-item><ion-label>Recycle: </ion-label><ion-textarea readonly class=\"ion-text-wrap\" value=\"" + recycling + "\"></ion-textarea></ion-item>" +
            "<ion-item><ion-label>Working: </ion-label><ion-textarea readonly class=\"ion-text-wrap\" value=\"" + workingday + "\"></ion-textarea></ion-item>" +
            "<ion-item><ion-label><a href=" + secretMessage.website + " target=\"_blank\">External Website</a></ion-label></ion-item>"
        });
      }
      else {
        infowindow = new google.maps.InfoWindow({
          content: 
            "<ion-title color=\"success\">" + secretMessage.name + "</ion-title>" + 
            "<ion-item><ion-label>Phone: " + secretMessage.phone + "</ion-label></ion-item>" + 
            "<ion-item><ion-label>Address: </ion-label><ion-textarea readonly class=\"ion-text-wrap\" value=\"" + secretMessage.location + "\"></ion-textarea></ion-item>" + 
            "<ion-item><ion-label>Recycle: </ion-label><ion-textarea readonly class=\"ion-text-wrap\" value=\"" + recycling + "\"></ion-textarea></ion-item>" +
            "<ion-item><ion-label>Working: </ion-label><ion-textarea readonly class=\"ion-text-wrap\" value=\"" + workingday + "\"></ion-textarea></ion-item>" +
            "<ion-item><ion-label><a href=" + secretMessage.website + " target=\"_blank\">External Website</a></ion-label></ion-item>" +
            "<img src='" + secretMessage.pictureURL + "' width='300'>"
        });
      }
    }
    else if (secretMessage.category === "TrashCan") {
      infowindow = new google.maps.InfoWindow({
        content: 
          "<ion-item><ion-label>Taken on: " + secretMessage.name + "</ion-label></ion-item>" +
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

    const userMarker = new google.maps.Marker({
      position: { lat: userLat, lng: userLng },
      map,
      icon: {                             
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        }
    });
    bounds.extend(new google.maps.LatLng(userLat, userLng));
    attachUserMessage(userMarker);
    

    markers.forEach((markerInfo:MarkerInfo) => {
      const marker = new google.maps.Marker({
        position: { lat: markerInfo.lat, lng: markerInfo.lng},
        map
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
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'road',
            elementType: 'labels.icon',
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
    <Helmet>
      <title>RecycleMe | Map</title>
    </Helmet>
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
      strong {
        color: green;
      }
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