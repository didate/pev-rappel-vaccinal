const Vonage = require('@vonage/server-sdk')
const config = require('config')
const fs = require('fs');
const csv = require('csv-parser');
const { dhis2 } = require('./dhis2');

const API_KEY = config.get("apiKey")
const API_SECRET = config.get("apiSecret")
const APPLICATION_ID = config.get("applicationId")
const PRIVATE_KEY_PATH = config.get("privateKey")
const PERIOD = config.get("period")

const vonage = new Vonage({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  applicationId: APPLICATION_ID,
  privateKey: PRIVATE_KEY_PATH
})



const run = async () => {


  const tomorrow = getTomorrow()

  const rendezvous = []
  try {
    let page = 1;
    let response = await dhis2.get(`${DHIS2URL}/api/analytics/events/query/DgZNKSYLbUK.json?dimension=pe:${PERIOD}&dimension=ou:Ky2CzFdfBuO&dimension=X6tfotxYRPH.vNM1jhFay2S&dimension=X6tfotxYRPH.H1Y38cZjZvF&dimension=X6tfotxYRPH.weZZbQso4V2:EQ:${tomorrow}&dimension=X6tfotxYRPH.Nw4lAR9nGqS&dimension=X6tfotxYRPH.bbOBxG4F6ja&dimension=X6tfotxYRPH.bXEwbxbLR9a&stage=X6tfotxYRPH&displayProperty=NAME&outputType=EVENT&desc=eventdate&pageSize=100&page=${page}`);

    let events = response.data.rows;
    while (events.length > 0) {

      events.forEach(item => {
        rendezvous.push({
          'telephone': item[13],
          'langue': item[16],
        })
      });

      page++;

      response = await dhis2.get(`${DHIS2URL}/api/analytics/events/query/DgZNKSYLbUK.json?dimension=pe:${PERIOD}&dimension=ou:Ky2CzFdfBuO&dimension=X6tfotxYRPH.vNM1jhFay2S&dimension=X6tfotxYRPH.H1Y38cZjZvF&dimension=X6tfotxYRPH.weZZbQso4V2:EQ:${tomorrow}&dimension=X6tfotxYRPH.Nw4lAR9nGqS&dimension=X6tfotxYRPH.bbOBxG4F6ja&dimension=X6tfotxYRPH.bXEwbxbLR9a&stage=X6tfotxYRPH&displayProperty=NAME&outputType=EVENT&desc=eventdate&pageSize=100&page=${page}`);

      events = response.data.rows;
    }

    for (let index = 0; index < rendezvous.length; index++) {
      const element = rendezvous[index];
      vonageCall(element);
      console.log(new Date())
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(new Date())
    }

  } catch (error) {
    console.log(error);
  }
}

const vonageCall = (element) => {
  vonage.calls.create({
    to: [{
      type: 'phone',
      number: `224${element.telephone}`
    }],
    from: {
      type: 'phone',
      number: `224${element.telephone}`
    },
    ncco: [{
      "action": "stream",
      "streamUrl": [`https://github.com/didate/pev-audio/blob/main/${element.langue ? element.langue : 'francais'}.ogg?raw=true`]
    }]
  }, (error, response) => {
    if (error) console.error(error);
    if (response) console.log(response);
  });
}

const getTomorrow = () => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  return `${tomorrow.getFullYear()}-${tomorrow.getMonth() + 1}-${tomorrow.getDate()}`
}

run();

