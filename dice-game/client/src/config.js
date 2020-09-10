export const SERVER_URL =
  process.env.NODE_ENV == 'production'
    ? 'https://bitcoin-fair-dice.herokuapp.com'
    : 'http://192.168.1.142:3001';
export const CLIENT_URL =
  process.env.NODE_ENV == 'production'
    ? 'https://musing-pike-d80e67.netlify.app'
    : 'http://192.168.1.142:8080';
export const APP_ID = '89d001043806644fdb4fb14099ff6be5';
