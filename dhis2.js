const axios = require('axios');
const config = require('config')

const dhis2 = axios.create({
    baseURL: config.get('dhis2Url')
});

dhis2.interceptors.request.use((request) => {
    request.headers = {
        Authorization: config.get('token'),
        "Content-Type": "application/json"
    }
    return request;
}, (error) => { return Promise.reject(error) });


exports.dhis2 = dhis2;