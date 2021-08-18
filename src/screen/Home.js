import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  Image,
  Linking
} from 'react-native';
import Voice from '@react-native-voice/voice';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import { authorize } from 'react-native-app-auth';
import { encode } from "base-64";
import {messageJSON, users} from "../../DB.js" 
import AsyncStorage from '@react-native-async-storage/async-storage';

const config = {
  clientId: "<ClientId-here>",
  apiKey: "<Id-Here",
  redirectUrl: 'com.googleusercontent.apps.812011190238-6eu48hgtmkfei7jvmdjufrrvjrelacdi:/oauth2redirect/google',
  scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events']
};
var auth = "";
const Home = () => {


  const [isLoading, setIsLoading] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const [disabled, toggleDisabled] = useState(false);
  const [timerCount, setTimer] = useState(6)
  const [text, setText] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogVisible, setIsLogVisible] = useState(false);
  const [logging, setLogging] = useState('');

  const [isViewBtnVisisble, setViewBtnVisisble] = useState(false);
  const [eventHTML, setEventHTML] = useState('');

  const [isErrorLogVisible, setErrorLogVisible] = useState(false);
  const [errorLog, setErrorLog] = useState('');

  var text2 = "";
   
  let timeout;
  const InitDelay = 6000;
  const ContinueDelay = 150;
  const handleTimeout = () => {
       Voice.stop();
  }


  const buttonLabel = isRecord ? 'Stop' : 'Start';

  const voiceLabel = text
    ? "\""+ text +"\""
    : isRecord
    ? 'Im Listening...'
    : 'Press Mic button to Start';

  const _onSpeechStart = () => {
    console.log('onSpeechStart');
    setText('');
    // timeout = setTimeout(handleTimeout, InitDelay);
  };
 
  const _onSpeechResults = (event) => {
    console.log('onSpeechResults: ', event.value[0]);
    setText(event.value[0]);
    text2 = event.value[0];
    // if(timeout) { 
    //     clearTimeout(timeout);
    // }
    // timeout = setTimeout(handleTimeout, ContinueDelay);

  };
  const _onSpeechError = (event) => {
    console.log('_onSpeechError');
    console.log(event.error);
  };

 const _onSpeechEnd = () => {
    
      setIsLoading(true)
      console.log('onSpeechEnd ', text);
      console.log('text2 ', text2);
      parseText(text2)
  };


  const _onRecordVoice = () => {  
    // parseText("Could you organize a meeting with developer for 20 August from 12 to 2 am")
    // parseText("Could you please send Kuala to Alex")
    if (isRecord) {
      Voice.stop();
    } else {
      Voice.start('en-US');
    }
    setIsRecord(!isRecord);
  };



  useEffect(() => {
    Voice.onSpeechStart = _onSpeechStart;
    Voice.onSpeechEnd = _onSpeechEnd;
    Voice.onSpeechResults = _onSpeechResults;
    Voice.onSpeechError = _onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners).catch(e => {
        console.log("UNABLE TO DESTROY");
        console.log(e.error);
      });
    };
  }, []);





  // const autoEndTimer = () => {
  //    let interval = setInterval(() => {
  //     setTimer(lastTimerCount => { console.log(lastTimerCount)
        
  //         if(lastTimerCount <= 1){ console.log("Less than 1"); 
  //           if (isRecord) { _onRecordVoice(); console.log("Auto Stopped"); }
  //           lastTimerCount <= 1 && clearInterval(interval)

  //         }
          
  //         return lastTimerCount - 1
  //     })
  //   }, 1000)
  // }


// function splitParts(sentence, first, last){ 
//   let goodParts: string[] = [];
  
//   const allParts = sentence.split(first);

//   allParts.forEach((part: string) => {
//     if (part.indexOf(last) > -1) {
//             const goodOne = (part.split(last))[0];
//       goodParts = goodParts.concat(goodOne);
//     }
//   });
//   return goodParts;
// }


function hasNumber(myString) {
  return /\d/.test(myString);
}



  const findMatches = (array, sentence) => {
    let found = false
    let before = ""
    let after = ""
    let word = ""
    let index = -1
    let splitArr = sentence.split(/\s+|\./)

    array.map((item)=> { //console.log("item: ", item)
      if (splitArr.includes(item)){
        found = true
        word = item
        index = splitArr.indexOf(item)
        console.log("Fixing Pronunciation: ", splitArr)
        
        before = splitArr[index - 1]
        after = splitArr[index + 1]
      }

      })

    let obj = {
      found,
      before,
      after,
      word,
      index
    }
    return obj
  }




  const findPerson = (text) => {
    let found = false
      users.map((item)=>{ //console.log(text, item.name, text.indexOf(item.name))
            if( text.indexOf(item.name) >= 0 ){
              found = item
            }
          })
      return found
  }


  const findAnimal = (text) => {
    let found = false
      messageJSON.map((item)=>{ console.log(text)
            if( text.indexOf(item.name) >= 0 ){
              found = item
            }
          })
      return found
  }




  const convert12To24 = (stringHour) => {
      let intHour = parseInt(stringHour)
      if(intHour < 12){
            intHour = intHour + 12   
          }
      return intHour    
  }


      // if(isTime && isTime.found){

        // time = isTime.after
        // if(isTime.after.includes("am")){ console.log("Time split am: ", isTime.after.split("am"))
        //   time = isTime.after.split("am")[0]
        // } else if (isTime.after.includes("pm")){ console.log("Time split pm: ", isTime.after.split("pm"))
        //   time = isTime.after.split("pm")[0]
        //   // time = time + 12
        // }
      // start = moment().set('hour', time).format()
      //   end   = moment().set('hour', time).add(1, 'hours').format()
      // }



  const parseText = (text) => {
    text = text.toLowerCase()
    console.log("Voice Recognized.. ", text)

    let start = moment().format()
    let end = moment().add(1, 'hours').format()
    let log = ""


    text = text.replace('of','');
    text = text.replace('the','');
    text = text.replace('following','');
    text = text.replace('address','');
    text = text.replace('kuala','koala');
    text = text.replace('john','jhon');
    text = text.replace('been','ben');
    setText(text)


    const monthStrings   = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    const meetingStrings = ['meeting', 'conference', 'appointment', 'call'];
    const createStrings  = ['create', 'organize', 'make', 'schedule', 'arrange'];
    const locationString = ['at'];
    const emailStrings   = ['send', 'share', 'email', 'message'];
    const fromString     = ['from'];
    const toString       = ['to'];
    const meridian       = ['pm'];
    const dateFilter     = ['th', 'st', 'nd', ','];

    const person    = findPerson(text)
    const isMeeting = findMatches(meetingStrings, text)
    const isCreate  = findMatches(createStrings, text)
    const isLocation= findMatches(locationString, text)
    const isEmail   = findMatches(emailStrings, text)
    const isFrom    = findMatches(fromString, text)
    const isMonth   = findMatches(monthStrings, text)
    const isPMfound = findMatches(meridian, text)
    
    text = text.replace('am','');
    text = text.replace('pm','');

    const isTo      = findMatches(toString, text)
    
    console.log("Person: ", person)
    console.log("isMeeting: ", isMeeting)
    console.log("isCreate: ", isCreate)
    console.log("isLocation: ", isLocation)
    console.log("fromTime: ", isFrom)
    console.log("isTo: ", isTo)
    console.log("isMonth: ", isMonth)
    console.log("isPMFound: ", isPMfound)


    if (isMeeting && isMeeting.found){
      
      let title = isMeeting.word
      let time = null
      let email = null
      let loc = null

      if(person && person.email){
        title = title + " with " + person.name
        email = person.email
      }

      if(isLocation && isLocation.found){
          loc = text.split("at ").pop()
          console.log("Location: ", loc)
      }


      if(isFrom && isFrom.found){
        if(isTo && isTo.found){

        let e = isTo.after  
        let s = isTo.before
        let isPM = false

        if(isTo.after.includes("am")){ 
          e = isTo.after.split("am")[0]
        } else if (isTo.after.includes("pm")){ 
          e = isTo.after.split("pm")[0]
          isPM = true
        }



        if (isPM) {
          console.log("12-24 -> ", e)
          e = convert12To24(e)
          s = convert12To24(s)
          console.log("12-24 -> ", e)
        } else if (isPMfound && isPMfound.found) {
          console.log("12-24 -> ", e)
          e = convert12To24(e)
          s = convert12To24(s)
          console.log("12-24 -> ", e)
        }


          start = moment().set('hour', s).set('Minutes', '00') //.format()
          end = moment().set('hour', e).set('Minutes', '00') //.format()

          if (text.includes('tomorrow')){
            start = start.add(1, 'days')
            end = end.add(1, 'days')
          } 

          else if (isMonth && isMonth.found) {
          
            if(hasNumber(isMonth.before)){
              let month1 = isMonth.before
              

              // if(month1.includes("th"))
              // {console.log("before date: ", month1)
              //   month1 = month1.split('th')[0]
              //   console.log("after date: ", month1)
              // }
              console.log("filtering date..")
              dateFilter.map((item)=> { 
                if (month1.includes(item)){
                  month1 = month1.split(item)[0]
                }
              })



              start = start.set('date', month1)
              end = end.set('date', month1)
            } else if (hasNumber(isMonth.after)){
              let month1 = isMonth.after
              
              console.log("filtering date after..")
              dateFilter.map((item)=> { 
                if (month1.includes(item)){
                  month1 = month1.split(item)[0]
                }
              })

              start = start.set('date', month1)
              end = end.set('date', month1)

              
            }

            let number = moment().month(isMonth.word).format("M") - 1
            console.log("month ", number)
            start = start.set('month', number)
            end = end.set('month', number)
            start = start.set('second', 0)
            end = end.set('second', 0)


          }

console.log("Start: ", start)
console.log("end: ", end)

          start = start.format()
          end = end.format()


          console.log("Start: ", start)
          console.log("end: ", end)
        }
      }


      log = "Event " + title + " created successfully."

      let eventObj = {
        title,
        start,
        end,
        email,
        log,
        loc
      }

      console.log("Event: ", eventObj)
      createEvents(eventObj)
      setIsLoading(false)
    }





    else if (isEmail && isEmail.found){
      console.log("isEmail: ", isEmail)
      let email = null
      let html = null
      let emailText = null

      let item = findAnimal(text)
      if(item){
        html = item.html
        emailText = item.text
      }

      // console.log("email obj: ", person, html, emailText)

      if(item && person){
      sendEmail(html, person.email, emailText, true)
      } else {
        setIsLoggedIn(false)
      }
      
    } else {
      setIsLoading(false)
    }

  }





   const getEvents = () => {
        const CALENDAR_ID = 'primary';
        const API_KEY = 'AIzaSyByc9nFvlxgU7IUZ8MuiX-cfL-AKi7DENg';
        const beginDate = moment();
        let url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${beginDate.toISOString()}&maxResults=50&singleEvents=true&orderBy=startTime`;

        
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                console.log("res: ", responseJson)
            })
            .then(() => {
                // this.getDates()
            }) 
            .catch(error => {
              console.log("err: ", error)
                // this.setState({ error, loading: false, refreshing: false });
            });
    };



    const createEvents = async (event) => {

        

        const CALENDAR_ID = 'primary';
        const API_KEY = 'AIzaSyByc9nFvlxgU7IUZ8MuiX-cfL-AKi7DENg';
        let url = `https://www.googleapis.com/calendar/v3/calendars/primary/events`;

        let attendee = null
        if(event.email && event.email != ""){
          attendee = [{ "email": event.email }]
        }

        let body = {

              "summary": event.title,
              
              "description": "This event was created from Benjamin Assistant App",
              "start": {
                "dateTime": event.start,
                // "timeZone": "America/Los_Angeles"
              },
              "end": {
                "dateTime": event.end,
                // "timeZone": "America/Los_Angeles"
              },
            
              "attendees": attendee,

            "location": event.loc,
              
              // "recurrence": [
              //   "RRULE:FREQ=DAILY;COUNT=2"
              // ],
              "sendNotifications": true,
              "reminders": {
                "useDefault": false,
                "overrides": [
                  {"method": "email", "minutes": 30},
                  {"method": "popup", "minutes": 10}
                ]
            }
        }
        console.log("body: ", body)
        
        const value = await AsyncStorage.getItem('@auth_token')
        console.log("value: ", value)


        if(value == ''){
          alert("Login expired, Please Login again")
          setIsLoggedIn(false)
        }

        setIsLoading(true)
        fetch(url, { 
           method: 'post', 
           headers: new Headers({
             'Authorization': 'Bearer '+ value, 
             'Content-Type': 'application/json'
           }), 
           body: JSON.stringify(body)
         })
            .then((response) => response.json())
            .then((responseJson) => {
                console.log("res: ", responseJson)
                setIsLoading(false)


                if(responseJson.htmlLink){
                setIsLogVisible(true)
                setLogging(logging + "\n" + event.log)
                setViewBtnVisisble(true)
                setEventHTML(responseJson.htmlLink)
                let emailHTML = "<h2>An event is created on your <a href='https://calendar.google.com/calendar/u/0/r'>Google Calander</a>. You can respond to it <a href='https://calendar.google.com/calendar/u/0/r'>here</a>.</h2>"
                sendEmail(emailHTML, event.email, '', false)

                } else {
                  let err = "Response: \n" + JSON.stringify(responseJson) + "\n request:\n" + JSON.stringify(body) + "\n Auth Token: " + auth;
                  setErrorLog(err)
                  setErrorLogVisible(true)
                  setViewBtnVisisble(false)
                }
                
            })
            .then(() => {
                setIsLoading(false)
            }) 
            .catch(error => {
              console.log("err: ", error)
              setIsLoading(false)
                // this.setState({ error, loading: false, refreshing: false });
            });
    };

   
   const authenticate = async () => {
    const authState = await authorize(config);
    console.log(authState)

    setAuthToken(setAuthToken(authState.accessToken))
    await AsyncStorage.setItem('@auth_token', authState.accessToken)
    auth = authState.accessToken
    setIsLoggedIn(true)

   }



   const sendEmail = async (html, email, text, showLog) => {
      console.log("Sending Email: ", html, email, text)
      let username = "c4191a134cf70004c1cb9ca078f0d0c8"
      let password = "778384f1494ae77204ce0a20e986af34"

      let body = {
            "Messages":[
              {
                "From": {
                  "Email": "testmedials@gmail.com",
                  "Name": "Benjamin Assistant"
                },
                "To": [
                  {
                    "Email": email,
                    "Name": "Benjamin Assistant"
                  }
                ],
                "Subject": "Benjamin Assistant",
                "TextPart": text,//"Greetings from Benjamin Assistant.",
                "HTMLPart": html,
                "CustomID": "AppGettingStartedTest"
              }
            ]
          }
      setIsLoading(true)
      setViewBtnVisisble(false)
      fetch('https://api.mailjet.com/v3.1/send', {
          method: 'post',
          headers: {
            "Content-Type": "application/json",
            'Authorization': 'Basic ' + encode(username + ":" + password),
          },
          body: JSON.stringify(body)
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setIsLoading(false)
                console.log("res: ", responseJson)
                if(showLog){
                setIsLogVisible(true)
                setLogging(logging + "\n" + " Email sent successfully")
              }
            })
            .then(() => {
                setIsLoading(false)
            }) 
            .catch(error => {
              setIsLoading(false)
              console.log("err: ", error)
                // this.setState({ error, loading: false, refreshing: false });
            });

   }




   const openLink = (link) => {
        console.log(link)
        Linking.openURL(link).catch(err => console.error("Couldn't load page", err));
      };

  return (
    <View style={styles.Container}>




    { isLoggedIn &&
    <Text style={styles.LabelStyles}>{voiceLabel}</Text>
    }



    { isLoggedIn ?

    <TouchableOpacity onPress={()=> _onRecordVoice() } >
      <LinearGradient colors={ isRecord ? ['#041E42', '#041E42'] : ["#FFFFFF", "#F5FCFF"]} style={[styles.MicView, { borderWidth: isRecord ? 0 : 1 }]}>
       <Image 
          source={ require("../assets/mic.png") } 
          style={[ styles.MicImg, { tintColor: isRecord ? "#FFFFFF" : "#000000" } ]}
          resizeMode={'contain'}
      />
      </LinearGradient>

    </TouchableOpacity>


    
     
    :
    <TouchableOpacity onPress={()=> authenticate()} style={styles.GoogleBtn}>
                <Image 
                    source={ require("../assets/google.png") } 
                    style={ styles.googleImg }
                    resizeMode={'contain'}
                />
                <Text style={styles.googleTxt}>Continue with Google</Text>
                <View /> 
    </TouchableOpacity>
  }


    { isViewBtnVisisble &&
    <TouchableOpacity onPress={()=> openLink(eventHTML)} style={styles.viewButton}>
          <Text style={styles.BtnText}>View Calander</Text>
    </TouchableOpacity>
    }


    { isErrorLogVisible &&
    <TouchableOpacity onPress={()=> alert(errorLog)} style={styles.viewButton}>
          <Text style={styles.BtnText}>Show Logs</Text>
    </TouchableOpacity>
    }
  




  {
    isLogVisible &&
      <Text style={styles.logText}>{logging}</Text>
  }


  { isLoading &&
  <Image  source={ require("../assets/loading.gif")} resizeMode="contain" style={styles.loading} />
  }


    </View>
  );
};







const styles = StyleSheet.create({

  Container:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    paddingHorizontal: 16,
  },

  row:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  LabelStyles: {
    fontWeight: 'bold',
    fontSize: 32,
    textAlign: 'center',
    fontStyle: 'italic',
    flex: 0.5
    // marginTop: 200,
    // marginBottom: 200,
  },

  MicView: {
    height: 100,
    width: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    // borderColor: 'black'
  },

  MicImg: {
    height: 70,
    width: 100
  },

  itemStyle: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },

  instructions: {
    textAlign: 'center',
    color: '#666666',
  },

  buttonText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },

  picovoiceText: {
    flex: 1,
    flexWrap: 'wrap',
    color: 'white',
    fontSize: 20,
  },
  
  GoogleBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 20,
        marginTop: 16,
        borderRadius: 8,
        borderColor: '#00000040', 
        borderWidth: 1,
        backgroundColor: '#FFF'
      },

      googleTxt: {
          fontSize: 16,
          color: '#000000'
      },

      googleImg: {
        height: 40,
        width: 40
      },

      logText: {
        textAlign: 'center',
        paddingHorizontal: 10,
        fontSize: 10,
        color: '#041E42'
      },

      loading: {
        alignSelf: 'center',
        marginVertical: 15,
        height: 50,
        width: 50
      },


      viewButton:{
        padding: 5,
        paddingHorizontal: 15,
        backgroundColor: '#377DFF',
        borderRadius: 4,
        marginTop: 15,

      },


      BtnText: {
        color: 'white'
      }

});


  



export default Home;