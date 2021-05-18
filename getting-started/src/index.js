// IF USING AS SCRIPT TAG:
/** Make sure the `<script>` tag with the dotwallet library is loaded *before* this script, otherwise you will not have access to this `DotWallet` object
 *
 * Use as an npm import `npm install @dotwallet/js` for typescript and intellisense support
 * */
// const DotWallet = dotwallet.default;

// If using as import:
import DotWallet from '@dotwallet/js';

/** Check out server API documentation at
 * https://dotwallet-microservice-xfl2wlshtq-de.a.run.app/docs
 */
// const SERVER_URL = 'http://localhost:3005';
const SERVER_URL = 'https://dotwallet-microservice-xfl2wlshtq-de.a.run.app';
/** This is the client_id associated with the test server above. Replace with your own in a real app*/
const CLIENT_ID = '89d001043806644fdb4fb14099ff6be5';
/** Make sure to change to your own address!*/
const DEV_WALLET_ADDRESS = '1L4eTJidJjVajv4caJkmQyTFRXBnoN4Pap';

const REDIRECT_URI = window.location.origin;

DotWallet.loginButton('login-button', {
  clientID: CLIENT_ID,
  redirectURI: REDIRECT_URI,
});

/** Call this function from the redirectURI. It could be on a separate page than the login button. It will also return the user's info. In this example, we are just saving the server auth token */
DotWallet.loginRedirect({
  authEndpoint: SERVER_URL + '/auth',
  successCallback: (userData) => {
    localStorage.setItem('server-token', userData.server_token);
  },
  failureCallback: (error) => {
    console.error({ error });
  },
  log: true,
});

DotWallet.payButton('pay-button', {
  productName: 'Bananas',
  orderAmount: 900,
  receiveAddress: DEV_WALLET_ADDRESS,
  createOrderEndpoint: SERVER_URL + '/create-order',
  redirectURI: REDIRECT_URI,
  notifyURL: SERVER_URL + '/payment-result',
  fetchHeaders: {
    Authorization: 'Bearer ' + localStorage.getItem('server-token'),
    'Content-type': 'application/json; charset=UTF-8',
  },
  log: true,
  lang: 'zh',
  successCallback: (response) => {
    alert(JSON.stringify(response));
  },
  failureCallback: (response) => {
    alert(JSON.stringify(response));
  },
});
