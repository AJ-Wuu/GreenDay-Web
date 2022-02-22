import React, { useEffect } from "react";
import { Loader } from '@googlemaps/js-api-loader';
import StyledMap from "./map.css";

type MarkerInfo = {
  name: string;
  lat: number;
  lng: number;
}

let map: google.maps.Map;

const Map = () => {
  var json = require("../places.json");

  var state = {
    defaultCenter: json.Center,
    markers: json.Places
  }

  const loader = new Loader({
    apiKey: process.env.GOOGLE_API_KEY!,
    version: 'weekly',
  });

  function handleAttachGoogleMap() {
    setTimeout(() => {
      handleDrawMarkers();
    }, 2000);
  };

  function attachSecretMessage(marker: google.maps.Marker, secretMessage: string) {
    const infowindow = new google.maps.InfoWindow({
      content: secretMessage,
    });

    marker.addListener("click", (event) => {
      infowindow.open(marker.get("map"), marker);
      map.setZoom(10);
      map.setCenter(event.latLng);
    });
  }

  function handleDrawMarkers() {
    const { markers } = state;
    const bounds = new google.maps.LatLngBounds();

    markers.forEach((markerInfo:MarkerInfo) => {
      const marker = new google.maps.Marker({
        position: { lat: markerInfo.lat, lng: markerInfo.lng},
        map,
      });
      bounds.extend(markerInfo);
      attachSecretMessage(marker, markerInfo.name);
    });

    map.fitBounds(bounds);
    map.panToBounds(bounds);
  };

  useEffect(() => {
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
          center: { lat: json.Center.lat, lng: json.Center.lng },
          zoom: 8,
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

    handleAttachGoogleMap();
  });

  return (
    <StyledMap>
      <div id="google-map" />
    </StyledMap>
  );
}

export default Map;