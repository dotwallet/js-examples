export const SERVER_URL =
  process.env.NODE_ENV == 'production'
    ? 'https://bitcoin-fair-dice.herokuapp.com'
    : 'http://192.168.1.112:3001';
export const CLIENT_URL =
  process.env.NODE_ENV == 'production'
    ? 'https://musing-pike-d80e67.netlify.app'
    : 'http://192.168.1.112:8080';
export const APP_ID = 'c260a14012c883e7ec4be8e15af86f95';
