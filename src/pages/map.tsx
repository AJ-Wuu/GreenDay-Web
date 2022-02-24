import React, { useEffect } from "react";
import { Loader } from '@googlemaps/js-api-loader';
import { useTheme } from '@geist-ui/react';
import router from 'next/router';
import { useState } from 'react';
import RecycledTypesList from '../RecycledTypes';
import StyledMap from "../styles/map.css";

type MarkerInfo = {
  name: string;
  recyclingTypes: string;
  location: string;
  pictureURL: string;
  phone: string;
  website: URL;
  lat: number;
  lng: number;
}

let map: google.maps.Map;
const loader = new Loader({
  apiKey: process.env.GOOGLE_API_KEY!,
  version: 'weekly',
});
var state = {
  defaultCenter: { lat: 39.87154121541584, lng: -102.955994347825 },
  markers: require("../TestCases.json")
}
var address:string = "";
var service:string = "";
var recycledType:string = "";

const LoadMap = () => {
  const theme = useTheme();
  const [trashcanDisabled, setTrashCanDisabled] = useState<boolean>(false);
  const [recyclecenterDisabled, setRecycleCenterDisabled] = useState<boolean>(false);
  const [gotMarkers, setGotMarkers] = useState<boolean>(false);

  const handleTrashCanDisabled = () => {
    if (trashcanDisabled === false) {
      setTrashCanDisabled(true);
      service = "RecycleCenter"
    }
    else {
      setTrashCanDisabled(false);
      service = "";
    }
  }

  const handleRecycleCenterDisabled = () => {
    if (recyclecenterDisabled === false) {
      setRecycleCenterDisabled(true);
      service = "TrashCan";
    }
    else {
      setRecycleCenterDisabled(false);
      service = "";
    }
  }

  const handleCheckEmpty = () => {
    if (address === "" || service === "" || recycledType === "") {
      alert("Please fill in all blanks.");
    }
  }

  const handleSearch = () => {
    console.log(address);
    console.log(service);
    console.log(recycledType);
    handleCheckEmpty();
    state.markers = require("../TestCases.json");
    setGotMarkers(true);
  }

  function handleAttachGoogleMap() {
    if (gotMarkers) {
      setTimeout(() => {
        handleDrawMarkers(state.markers);
      }, 2000);
    }
    else {
      setTimeout(() => {
        console.log("No Marker");
      }, 2000);
    }
  };

  function attachSecretMessage(marker: google.maps.Marker, secretMessage: MarkerInfo) {
    const infowindow = new google.maps.InfoWindow({
      content: 
        "<p><b>" + secretMessage.name + "</b></p>" + 
        "<p>recycling: <b>" + secretMessage.recyclingTypes + "</b></p>" + 
        "<p>Address: <b>" + secretMessage.location + "</b></p>" + 
        "<p>Phone: <b>" + secretMessage.phone + "</b></p>" + 
        "<p>Website: <b><a href=" + secretMessage.website + ">" + secretMessage.website + "</b></p>" +
        "<img src='" + secretMessage.pictureURL + "' width='200' height='100'>",
      maxWidth: 300
    });

    marker.addListener("click", (event) => {
      infowindow.open(marker.get("map"), marker);
      map.setZoom(15);
      map.setCenter(event.latLng);
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
    <div>
      <div>
        <ion-split-pane content-id="main">
          <ion-menu content-id="main">
            <ion-header>
              <ion-toolbar>
                <ion-item>
                  <ion-title>Map Menu</ion-title>
                  <ion-button onClick={() => router.push("/home")}>Back Home</ion-button>
                </ion-item>
              </ion-toolbar>
            </ion-header>
            <ion-searchbar placeholder="Enter Your Location..." onKeyUp={e => address = (e.target as HTMLInputElement).value}></ion-searchbar>
            <ion-list>
              <ion-label color="primary">Service</ion-label>
              <ion-item>
                <ion-label>Trash Can</ion-label>
                <ion-checkbox slot="end" value="trashcan" disabled={trashcanDisabled} onClick={handleRecycleCenterDisabled}></ion-checkbox>
              </ion-item>
              <ion-item>
                <ion-label>Recycle Center</ion-label>
                <ion-checkbox slot="end" value="recyclecenter" disabled={recyclecenterDisabled} onClick={handleTrashCanDisabled}></ion-checkbox>
              </ion-item>
            </ion-list>
            <ion-list>
              <ion-label color="primary">Recycle Type(s)</ion-label>
              <ion-select
                multiple={true}
                cancelText="Cancel"
                okText="Okay"
                onBlur={(e) => {
                  recycledType = (
                    e.target as HTMLInputElement
                  ).value?.toString();
                }}>
                {RecycledTypesList.map(({ val }, i) => (
                  <ion-select-option key={i}>{val}</ion-select-option>
                ))};
              </ion-select>
            </ion-list>
            <ion-button size='default' onClick={handleSearch}>GO</ion-button>
          </ion-menu>
          
          <ion-content id="main">
            <StyledMap>
              <div id="google-map" />
            </StyledMap>
          </ion-content>
        </ion-split-pane>
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
    </div>
  )
}

export default LoadMap;