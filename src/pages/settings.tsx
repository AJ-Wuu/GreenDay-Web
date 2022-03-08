import { useEffect, useState } from 'react';
import { Avatar, Button, Text, useTheme } from '@geist-ui/react';
import {
  getAuth,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import Router from 'next/router';
import Geocode from 'react-geocode';

import db from '../firebase.config';
import RecycledTypesList from '../RecycledTypes';
import Menu from '../components/navigation/menu';
import { createBusiness, deleteBusiness, getBusinessData, updateBusiness } from './api/backend';

Geocode.setApiKey(process.env.GEOCODE_API_KEY!);

type business_data = {
  name: string,
  pictureURL: string,
  category: string,
  recyclingTypes: string,
  location: string,
  street: string,
  city: string,
  county: string,
  state: string,
  zipcode: string,
  phone: string;
  website: string,
  timeAvailability: string,
  lat: number,
  lng: number
}

let avatarSrc: string = "";
let otherTypes: string = "";
var userDetails:business_data = {
  name: '',
  phone: '',
  category: 'RecyclingCenter',
  street: '',
  city: '',
  county: '',
  state: '',
  zipcode: '',
  lat: 0,
  lng: 0,
  location: '',
  timeAvailability: '',
  pictureURL: "404",
  website: '',
  recyclingTypes: ''
};

const Settings = () => {
  const auth = getAuth();
  const theme = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [userInfoUpdate, setUserInfoUpdate] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const handleTriggerUpdate = () => {
    setUserInfoUpdate(true);
  };

  const handleDeleteCurrentBusiness = async () => {
    await deleteBusiness().then((response) => {
      if (response.success === undefined) {
        window.alert("Your business has been deleted. You might not delete it again.")
      }
      else {
        if (confirm("Business deleted successfully. You could recreate a business or explore this platform without one.")) {
          Router.reload();
        }
      }
    })
  }

  const handleTriggerDelete = () => {
    if (confirm("Are you sure to delete all the information of your current business?")) {
      handleDeleteCurrentBusiness();
    }
    else {
      console.log("Business Deletion Cancelled");
    }
  }

  const handleLatLng = async (address:string) => {
    await Geocode.fromAddress(address).then(
      (response) => {
        const { lat, lng } = response.results[0].geometry.location;
        userDetails.lat = lat;
        userDetails.lng = lng;
        console.log(userDetails.lat);
        console.log(userDetails.lng);
      },
      (error) => {
        console.error(error);
      }
    );
    await Geocode.fromLatLng(userDetails.lat.toString(),userDetails.lng.toString()).then(
      (response) => {
        userDetails.location = response.results[0].formatted_address;
        const county = response.results[0].address_components[3].long_name;
        userDetails.county = county;
        console.log(userDetails.county);
      },
      (error) => {
        console.error(error);
      }
    );
  };

  const handleCheckBlank = () => {
    if (userDetails.name === "" || userDetails.name === undefined
     || userDetails.phone === "" || userDetails.phone === undefined
     || userDetails.recyclingTypes === "" || userDetails.recyclingTypes === undefined
     || userDetails.street === "" || userDetails.street === undefined
     || userDetails.city === "" || userDetails.city === undefined
     || userDetails.state === "" || userDetails.state === undefined
     || userDetails.zipcode === "" || userDetails.zipcode === undefined) {
      window.alert("Please fill in all required blanks (in red).")
    }
    else {
      handleLatLng(userDetails.location).then(async () => {
        await getBusinessData(user?.getIdToken()).then((data) => {
          console.log(data);
          if (data.success === undefined) { //return error
            console.log("Create Business");
            return createBusiness(userDetails);
          }
          else {
            console.log("Update Business");
            return updateBusiness(userDetails);
          }
        }).then((response) => {
          if (response.success === undefined) {
            window.alert("Woops, something goes wrong. Please try again later.")
          }
          else {
            Router.reload();
          }
        })
        /*
        //deprecated - direct firestore update
        await setDoc(doc(db, 'business', user!.uid), userDetails)
          .then(() => {
              Router.reload();
          }).catch(error => {
              alert(error);
          });
        */
      })
    }
  }

  const handleSubmit = async () => {
    userDetails.location = `${userDetails.street}, ${userDetails.city}, ${userDetails.state} ${userDetails.zipcode}`;
    if (otherTypes !== "") {
      userDetails.recyclingTypes = `${userDetails.recyclingTypes},${otherTypes}`;
      console.log(userDetails.recyclingTypes);
    }
    handleCheckBlank();
  };

  const loadData = async (user: User) => {
    const docRef = doc(db, 'business', user.uid.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(user.uid.toString());
      console.log(data);
      userDetails.name = data.name;
      userDetails.phone = data.phone;
      userDetails.street = data.street;
      userDetails.city = data.city;
      userDetails.county = data.county;
      userDetails.state = data.state;
      userDetails.zipcode = data.zipcode;
      userDetails.pictureURL = data.pictureURL;
      userDetails.lat = data.lat;
      userDetails.lng = data.lng;
      userDetails.location = data.location;
      userDetails.timeAvailability = data.timeAvailability;
      userDetails.website = data.website;
      userDetails.recyclingTypes = data.recyclingTypes;
      console.log(userDetails);
    }
    else {
      console.log('No such document!');
    }
  };

  useEffect(() => {
    setShowDetails(false);
    setUserInfoUpdate(false);
    onAuthStateChanged(auth, (aUser) => {
      console.log(`Auth state changes: ${aUser}`);
      setUser(aUser);
      if (aUser) {
        if (aUser.photoURL !== null) {
          avatarSrc = aUser.photoURL;
        }
        else {
          avatarSrc = "/assets/images/userLogo.jpg";
        }
        loadData(aUser).then(() => {
          console.log(userDetails);
          setShowDetails(true);
        });
      }
    });
  }, [auth]);

  return (
    <>
      <Menu></Menu>
      {user ? (
        <>
          <div className="heading__wrapper">
            <div className="heading">
              <Avatar alt="Your Avatar" className="heading__user-avatar" src={avatarSrc} />
              <div className="heading__name">
                <div className="heading__title">
                  <Text h2 className="heading__user-name">
                    {user.displayName}
                  </Text>
              
                  {showDetails && <div className='heading__info'>
                    <Text h5 className='heading__user-info'>
                      Name: {userDetails.name}<br></br>
                      Email: {user.email}<br></br>
                      Phone: {userDetails.phone}<br></br>
                      Address: {userDetails.location}<br></br>
                      Time Availability: {userDetails.timeAvailability}<br></br>
                      Website:{' '}
                        <Link href={userDetails.website!} passHref={true}>
                          {userDetails.website.toString()}
                        </Link><br></br>
                      Recycling Types: {userDetails.recyclingTypes}<br></br>
                    </Text>
                  </div>}

                  <div className="heading__actions">
                    <Button type="success" auto onClick={handleTriggerUpdate}>
                      Update Business Info
                    </Button>
                    <h5></h5>
                    <Button type="success" auto onClick={handleTriggerDelete}>
                      Delete Current Business
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {userInfoUpdate && (
            <ion-card class='user-info-update'>
              <ion-card-header>
                <ion-card-title>Update Your Account Information</ion-card-title>
              </ion-card-header>
              <ion-item>
                <ion-icon name="pin" slot="start"></ion-icon>
                <ion-label id="attention">
                  ATTENTION: Your update will only be shown on this website
                  without affecting your account on other sites.
                </ion-label>
                <ion-button fill="outline" slot="end" onClick={handleSubmit}>
                  Submit
                </ion-button>
              </ion-item>
              <ion-card-content>
                <ion-item>
                  <ion-label class="ion-text-wrap" color="danger">
                    Name:{' '}
                  </ion-label>
                  <ion-input
                    type="text"
                    required={true}
                    value={userDetails.name}
                    onBlur={(e) =>
                      (userDetails.name = (
                        e.target as HTMLInputElement
                      ).value)
                    }
                  ></ion-input>
                  <ion-label class="ion-text-wrap" color="danger">
                    Phone:{' '}
                  </ion-label>
                  <ion-input
                    type="tel"
                    required={true}
                    value={userDetails.phone}
                    onBlur={(e) =>
                      (userDetails.phone = (e.target as HTMLInputElement).value)
                    }
                  ></ion-input>
                  <ion-label class="ion-text-wrap" color="primary">
                    Website:{' '}
                  </ion-label>
                  <ion-input
                    type="url"
                    required={true}
                    value={userDetails.website}
                    onBlur={(e) =>
                      (userDetails.website = (
                        e.target as HTMLInputElement
                      ).value)
                    }
                  ></ion-input>
                </ion-item>
                <ion-item>
                  <ion-label class="ion-text-wrap" color="danger">
                    Street:{' '}
                  </ion-label>
                  <ion-input
                    type="text"
                    required={true}
                    value={userDetails.street}
                    onBlur={(e) =>
                      (userDetails.street = (
                        e.target as HTMLInputElement
                      ).value)
                    }
                  ></ion-input>
                  <ion-label class="ion-text-wrap" color="danger">
                    City:{' '}
                  </ion-label>
                  <ion-input
                    type="text"
                    required={true}
                    value={userDetails.city}
                    onBlur={(e) =>
                      (userDetails.city = (e.target as HTMLInputElement).value)
                    }
                  ></ion-input>
                  <ion-label class="ion-text-wrap" color="danger">
                    State/Province:{' '}
                  </ion-label>
                  <ion-input
                    type="text"
                    required={true}
                    value={userDetails.state}
                    onBlur={(e) =>
                      (userDetails.state = (e.target as HTMLInputElement).value)
                    }
                  ></ion-input>
                  <ion-label class="ion-text-wrap" color="danger">
                    Zip Code:{' '}
                  </ion-label>
                  <ion-input
                    type="text"
                    required={true}
                    value={userDetails.zipcode}
                    onBlur={(e) =>
                      (userDetails.zipcode = (
                        e.target as HTMLInputElement
                      ).value)
                    }
                  ></ion-input>
                </ion-item>
                <ion-item>
                  <ion-label class='recyclingTypesLabel' color="danger">Recycling Type(s): </ion-label>
                  <ion-select
                    class='recyclingTypesSelect'
                    multiple={true}
                    cancelText="Cancel"
                    okText="Okay"
                    onBlur={(e) => {
                      userDetails.recyclingTypes = (
                        e.target as HTMLInputElement
                      ).value?.toString();
                    }}>
                    {RecycledTypesList.map(({ val }, i) => (
                      <ion-select-option key={i}>{val}</ion-select-option>
                    ))};
                  </ion-select>
                </ion-item>
                <ion-item>
                  <ion-label class="ion-text-wrap" color="primary" placeholder='e.g. MTWRF 9am - 5pm'>
                    Time Availability:{' '}
                  </ion-label>
                  <ion-input
                    type="text"
                    required={true}
                    value={userDetails.timeAvailability}
                    onBlur={(e) =>
                      (userDetails.timeAvailability = (
                        e.target as HTMLInputElement
                      ).value)
                    }
                  ></ion-input>
                  <ion-label color='primary'>Other Type(s): </ion-label>
                  <ion-input onBlur={e => otherTypes = (e.target as HTMLInputElement).value}></ion-input>
                </ion-item>
              </ion-card-content>
            </ion-card>
          )}
        </>
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
        .heading__wrapper {
          border-bottom: 0px solid ${theme.palette.border};
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
        .heading :global(.heading__user-avatar) {
          height: 100px;
          width: 100px;
          margin-right: ${theme.layout.gap};
        }
        .heading__title {
          display: flex;
          flex-direction: row;
          align-items: center;
          flex: 1;
        }
        .heading__name {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
        }
        .heading__name :global(.heading__user-name) {
          line-height: 1;
          color: #20894d;
        }
        .heading__info {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          margin-left: 20px;
          color: #2c9678;
        }
        .heading__info :global(.heading__user-info) {
          line-height: 1;
        }
        .heading__actions {
          margin-left: auto;
        }
        .heading__integration :global(.heading__integration-title) {
          color: ${theme.palette.accents_5} !important;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          margin: 0;
        }
        .heading__integration-inner {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .heading__integration-inner :global(svg) {
          margin-right: ${theme.layout.gapQuarter};
        }
      `}</style>
    </>
  );
};

export default Settings;