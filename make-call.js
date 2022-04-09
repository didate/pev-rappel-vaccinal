const Vonage = require('@vonage/server-sdk')
const config = require('config')
const fs = require('fs');
const csv = require('csv-parser');

const API_KEY = config.get("apiKey")
const API_SECRET = config.get("apiSecret")
const APPLICATION_ID = config.get("applicationId")
const PRIVATE_KEY_PATH = config.get("privateKey")

const vonage = new Vonage({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  applicationId: APPLICATION_ID,
  privateKey: PRIVATE_KEY_PATH
})


const run = async () => {

  const rendezvous = []

  fs.createReadStream('./rendezvous.csv').pipe(csv()).on('data', (row) => {
    rendezvous.push(row);
  }).on('end', async () => {
    for (let index = 0; index < rendezvous.length; index++) {
      const element = rendezvous[index];
      vonage.calls.create({
        to: [{
          type: 'phone',
          number: `224${element.telephone}`
        }],
        from: {
          type: 'phone',
          number: `224${element.telephone}`
        },
        ncco:[{
          "action": "stream",
          "streamUrl": [`https://github.com/didate/pev-audio/blob/main/${element.langue ? element.langue : 'francais'}.ogg?raw=true`]
        }]
      }, (error, response) => {
        if (error) console.error(error)
        if (response) console.log(response)
      })
      console.log(new Date())
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(new Date())
    }
    

  });
}




run();
/* 
vonage.calls.create({
  to: [{
    type: 'phone',
    number: "+224628204721"
  }],
  from: {
    type: 'phone',
    number: "+224628204721"
  },
  ncco:[{
    "action": "stream",
    "streamUrl": ["https://github.com/didate/pev-audio/blob/main/francais.ogg?raw=true"]
  }]
}, (error, response) => {
  if (error) console.error(error)
  if (response) console.log(response)
}) */