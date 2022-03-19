import { useEffect, useState } from 'react';
import { Button, useTheme } from '@geist-ui/react';
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
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import DateFnsUtils from '@date-io/date-fns'; // choose your lib
import { MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers';
import { Helmet } from 'react-helmet';
import SignInAlert from '../components/SignInAlert';

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
var timeArray:string[] = [];

const Settings = () => {
  const auth = getAuth();
  const theme = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [userInfoUpdate, setUserInfoUpdate] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showClocks, setShowClocks] = useState<boolean>(false);
  const [MondayClockBegin, setMondayClockBegin] = useState(new Date());
  const [TuesdayClockBegin, setTuesdayClockBegin] = useState(new Date());
  const [WednesdayClockBegin, setWednesdayClockBegin] = useState(new Date());
  const [ThursdayClockBegin, setThursdayClockBegin] = useState(new Date());
  const [FridayClockBegin, setFridayClockBegin] = useState(new Date());
  const [SaturdayClockBegin, setSaturdayClockBegin] = useState(new Date());
  const [SundayClockBegin, setSundayClockBegin] = useState(new Date());
  const [MondayClockEnd, setMondayClockEnd] = useState(new Date());
  const [TuesdayClockEnd, setTuesdayClockEnd] = useState(new Date());
  const [WednesdayClockEnd, setWednesdayClockEnd] = useState(new Date());
  const [ThursdayClockEnd, setThursdayClockEnd] = useState(new Date());
  const [FridayClockEnd, setFridayClockEnd] = useState(new Date());
  const [SaturdayClockEnd, setSaturdayClockEnd] = useState(new Date());
  const [SundayClockEnd, setSundayClockEnd] = useState(new Date());

  const handleTriggerUpdate = () => {
    setUserInfoUpdate(true);
    setShowClocks(false);
  };

  const handleDeleteCurrentBusiness = async () => {
    await deleteBusiness().then((response) => {
      console.log(response);
      if (response.success === undefined) {
        window.alert("You have not created a business or your business has been deleted. You might not delete it again.")
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
     || userDetails.zipcode === "" || userDetails.zipcode === undefined
     || userDetails.timeAvailability === "" || userDetails.timeAvailability === undefined) {
      window.alert("Please fill in all required blanks (Name, Phone Number, Address, Recycling Types, and Time Availability).")
    }
    else {
      handleLatLng(userDetails.location).then(async () => {
        await getBusinessData(user?.uid).then((data) => {
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
    }
    if (showClocks === true) {     
      let MondayTime = `Monday: ` + ((MondayClockBegin.getHours() === MondayClockEnd.getHours()) ? `Closed; ` : (`${MondayClockBegin.getHours()}:` + ((MondayClockBegin.getMinutes() === 0) ? `00` : `${MondayClockBegin.getMinutes()}`) + ` to ${MondayClockEnd.getHours()}:` + ((MondayClockEnd.getMinutes() === 0) ? `00; ` : `${MondayClockEnd.getMinutes()}; `)));
      let TuesdayTime = `Tuesday: ` + ((TuesdayClockBegin.getHours() === TuesdayClockEnd.getHours()) ? `Closed; ` : (`${TuesdayClockBegin.getHours()}:` + ((TuesdayClockBegin.getMinutes() === 0) ? `00` : `${TuesdayClockBegin.getMinutes()}`) + ` to ${TuesdayClockEnd.getHours()}:` + ((TuesdayClockEnd.getMinutes() === 0) ? `00; ` : `${TuesdayClockEnd.getMinutes()}; `)));
      let WednesdayTime = `Wednesday: ` + ((WednesdayClockBegin.getHours() === WednesdayClockEnd.getHours()) ? `Closed; ` : (`${WednesdayClockBegin.getHours()}:` + ((WednesdayClockBegin.getMinutes() === 0) ? `00` : `${WednesdayClockBegin.getMinutes()}`) + ` to ${WednesdayClockEnd.getHours()}:` + ((WednesdayClockEnd.getMinutes() === 0) ? `00; ` : `${WednesdayClockEnd.getMinutes()}; `)));
      let ThursdayTime = `Thursday: ` + ((ThursdayClockBegin.getHours() === ThursdayClockEnd.getHours()) ? `Closed; ` : (`${ThursdayClockBegin.getHours()}:` + ((ThursdayClockBegin.getMinutes() === 0) ? `00` : `${ThursdayClockBegin.getMinutes()}`) + ` to ${ThursdayClockEnd.getHours()}:` + ((ThursdayClockEnd.getMinutes() === 0) ? `00; ` : `${ThursdayClockEnd.getMinutes()}; `)));
      let FridayTime = `Friday: ` + ((FridayClockBegin.getHours() === FridayClockEnd.getHours()) ? `Closed; ` : (`${FridayClockBegin.getHours()}:` + ((FridayClockBegin.getMinutes() === 0) ? `00` : `${FridayClockBegin.getMinutes()}`) + ` to ${FridayClockEnd.getHours()}:` + ((FridayClockEnd.getMinutes() === 0) ? `00; ` : `${FridayClockEnd.getMinutes()}; `)));
      let SaturdayTime = `Saturday: ` + ((SaturdayClockBegin.getHours() === SaturdayClockEnd.getHours()) ? `Closed; ` : (`${SaturdayClockBegin.getHours()}:` + ((SaturdayClockBegin.getMinutes() === 0) ? `00` : `${SaturdayClockBegin.getMinutes()}`) + ` to ${SaturdayClockEnd.getHours()}:` + ((SaturdayClockEnd.getMinutes() === 0) ? `00; ` : `${SaturdayClockEnd.getMinutes()}; `)));
      let SundayTime = `Sunday: ` + ((SundayClockBegin.getHours() === SundayClockEnd.getHours()) ? `Closed` : (`${SundayClockBegin.getHours()}:` + ((SundayClockBegin.getMinutes() === 0) ? `00` : `${SundayClockBegin.getMinutes()}`) + ` to ${SundayClockEnd.getHours()}:` + ((SundayClockEnd.getMinutes() === 0) ? `00` : `${SundayClockEnd.getMinutes()}`)));
      userDetails.timeAvailability = `${MondayTime}${TuesdayTime}${WednesdayTime}${ThursdayTime}${FridayTime}${SaturdayTime}${SundayTime}`;
      setShowClocks(false);
    }
    handleCheckBlank();
  };

  const loadData = async (user: User) => {
    const docRef = doc(db, 'business', user.uid.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
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
    }
    else {
      console.log('No such document!');
    }
  };

  useEffect(() => {
    setShowDetails(false);
    setUserInfoUpdate(false);
    onAuthStateChanged(auth, (aUser) => {
      setUser(aUser);
      if (aUser) {
        loadData(aUser).then(() => {
          timeArray = userDetails.timeAvailability.split('; ');
        }).then(() => {
          setShowDetails(true);
        });;
      }
    });
  }, [auth]);

  return (
    <>
      <Helmet>
        <title>RecycleMe | Settings</title>
      </Helmet>
      <Menu></Menu>
      <div className='body'>
        {user ? (
        <>
          <div className='heading__wrapper'>
            <div className='heading'>
              <ion-grid>
                <ion-row>
                  <ion-col>
                    {showDetails && <ion-card>
                      <ion-card-header><h3>Business Details</h3></ion-card-header>
                      <ion-card-content><h4>
                        Name: {userDetails.name}<br></br>
                        Email: {user.email}<br></br>
                        Phone: {userDetails.phone}<br></br>
                        Address: {userDetails.location}<br></br>
                        Website:{' '}
                          <Link href={userDetails.website!} passHref={true}>
                            {userDetails.website.toString()}
                          </Link><br></br>
                        Recycling Types: {userDetails.recyclingTypes}
                      </h4></ion-card-content></ion-card>}
                  </ion-col>
                  <ion-col>
                    {(showDetails && userDetails.timeAvailability !== "") ? (<ion-card>
                      <ion-card-header><h3>Time Availability</h3></ion-card-header>
                      <ion-card-content><h4>
                        {timeArray.at(0)}<br></br>
                        {timeArray.at(1)}<br></br>
                        {timeArray.at(2)}<br></br>
                        {timeArray.at(3)}<br></br>
                        {timeArray.at(4)}<br></br>
                        {timeArray.at(5)}<br></br>
                        {timeArray.at(6)}
                      </h4></ion-card-content></ion-card>) : (
                        <ion-card><ion-card-header>Enter Your Business Today!</ion-card-header></ion-card>
                      )}
                  </ion-col>
                  <ion-col>
                    <div className="heading__actions">
                      <Button type="success" auto onClick={handleTriggerUpdate}>
                        Update Business Info
                      </Button>
                      <h5></h5>
                      <Button type="success" auto onClick={handleTriggerDelete}>
                        Delete Current Business
                      </Button>
                    </div>
                  </ion-col>
                </ion-row>
              </ion-grid>
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
                  <PhoneInput
                    placeholder="Enter phone number"
                    type="tel"
                    required={true}
                    value={userDetails.phone}
                    onChange={(e) =>
                      (userDetails.phone = e?.toString()!)
                    }/>
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
                <ion-grid>
                  <ion-row>
                    <ion-col>
                      <ion-item>
                        <ion-label class='recyclingTypesLabel' color="danger">Recycling Type(s) Supported: </ion-label>
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
                    </ion-col>
                    <ion-col>
                      <ion-label color='primary'>Other Type(s) (Not included before): </ion-label>
                      <ion-input placeholder='Split by comma, NO space (eg. Type1,Type2)' onBlur={e => otherTypes = (e.target as HTMLInputElement).value}></ion-input>
                    </ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col>
                      <ion-item>
                        <ion-label class="ion-text-wrap" color="danger" placeholder='e.g. MTWRF 9am - 5pm'>
                          Time Availability:{' '}
                        </ion-label>
                        <ion-button onClick={() => setShowClocks(true)}>Click Here to Choose</ion-button>
                      </ion-item>
                    </ion-col>
                    <ion-col></ion-col>
                  </ion-row>
                </ion-grid>
                {showClocks && <ion-grid>
                  <ion-row>
                    <ion-col>
                      <ion-label>Day (leave the auto value unchanged if you are not available)</ion-label>
                    </ion-col>
                    <ion-col>
                      <ion-label>From</ion-label>
                    </ion-col>
                    <ion-col>
                      <ion-label>To</ion-label>
                    </ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col>
                      <ion-label>Monday</ion-label>
                    </ion-col>
                    <ion-col>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <TimePicker value={MondayClockBegin} onChange={(newValue) => setMondayClockBegin(newValue!)} />
                      </MuiPickersUtilsProvider>
                    </ion-col>
                    <ion-col>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <TimePicker value={MondayClockEnd} onChange={(newValue) => setMondayClockEnd(newValue!)} />
                      </MuiPickersUtilsProvider>
                    </ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col>
                      <ion-label>Tuesday</ion-label>
                    </ion-col>
                    <ion-col>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <TimePicker value={TuesdayClockBegin} onChange={(newValue) => setTuesdayClockBegin(newValue!)} />
                      </MuiPickersUtilsProvider>
                    </ion-col>
                    <ion-col>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <TimePicker value={TuesdayClockEnd} onChange={(newValue) => setTuesdayClockEnd(newValue!)} />
                      </MuiPickersUtilsProvider>
                    </ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col>
                      <ion-label>Wednesday</ion-label>
                    </ion-col>
                    <ion-col>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <TimePicker value={WednesdayClockBegin} onChange={(newValue) => setWednesdayClockBegin(newValue!)} />
                      </MuiPickersUtilsProvider>
                    </ion-col>
                    <ion-col>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <TimePicker value={WednesdayClockEnd} onChange={(newValue) => setWednesdayClockEnd(newValue!)} />
                      </MuiPickersUtilsProvider>
                    </ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col>
                      <ion-label>Thursday</ion-label>
                    </ion-col>
                    <ion-col>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <TimePicker value={ThursdayClockBegin} onChange={(newValue) => setThursdayClockBegin(newValue!)} />
                      </MuiPickersUtilsProvider>
                    </ion-col>
                    <ion-col>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <TimePicker value={ThursdayClockEnd} onChange={(newValue) => setThursdayClockEnd(newValue!)} />
                      </MuiPickersUtilsProvider>
                    </ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col>
                      <ion-label>Friday</ion-label>
                    </ion-col>
                    <ion-col>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <TimePicker value={FridayClockBegin} onChange={(newValue) => setFridayClockBegin(newValue!)} />
                      </MuiPickersUtilsProvider>
                    </ion-col>
                    <ion-col>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <TimePicker value={FridayClockEnd} onChange={(newValue) => setFridayClockEnd(newValue!)} />
                      </MuiPickersUtilsProvider>
                    </ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col>
                      <ion-label>Saturday</ion-label>
                    </ion-col>
                    <ion-col>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <TimePicker value={SaturdayClockBegin} onChange={(newValue) => setSaturdayClockBegin(newValue!)} />
                      </MuiPickersUtilsProvider>
                    </ion-col>
                    <ion-col>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <TimePicker value={SaturdayClockEnd} onChange={(newValue) => setSaturdayClockEnd(newValue!)} />
                      </MuiPickersUtilsProvider>
                    </ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col>
                      <ion-label>Sunday</ion-label>
                    </ion-col>
                    <ion-col>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <TimePicker value={SundayClockBegin} onChange={(newValue) => setSundayClockBegin(newValue!)} />
                      </MuiPickersUtilsProvider>
                    </ion-col>
                    <ion-col>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <TimePicker value={SundayClockEnd} onChange={(newValue) => setSundayClockEnd(newValue!)} />
                      </MuiPickersUtilsProvider>
                    </ion-col>
                  </ion-row>
                </ion-grid>}
              </ion-card-content>
            </ion-card>
          )}
        </>
      ) : (
        <>
          <SignInAlert></SignInAlert>
        </>
      )}
      </div>
      <style jsx>{`
        h3 {
          color: #12732b;
        }
        h4 {
          color: #12732b;
        }
        .heading__wrapper {
          height: 100% !important;
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
          color: #05480d;
        }
        .heading__info {
          display: flex;
          flex-direction: column;
          justify-content: left;
          flex: 1;
          color: #05480d;
        }
        .heading__actions {
          text-align: center;
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
        .body {
          height: calc(100vh - 102px);
          background-image: url("/assets/images/background.jpg");
          backgroundRepeat: "no-repeat";
          background-size: 100%;
        }
      `}</style>
    </>
  );
};

export default Settings;