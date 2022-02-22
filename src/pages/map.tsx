import { useTheme } from '@geist-ui/react';
import router from 'next/router';
import { useState } from 'react';
import Map from '../map/map'
import RecycledTypesList from '../RecycledTypes';

var address:string = "";
var service:string = "";
var recycledType:string = "";

const LoadMap = () => {
  const theme = useTheme();
  const [trashcanDisabled, setTrashCanDisabled] = useState<boolean>(false);
  const [recyclecenterDisabled, setRecycleCenterDisabled] = useState<boolean>(false);

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
    /*
    setTimeout(() => {
      setUpdateAddress(false);
    }, 1000)
    setUpdateAddress(true);
    */
  }

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
            <Map></Map>
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
