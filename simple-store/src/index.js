const express = require('express');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 3000;
const YOUR_CLIENT_SECRET = process.env.CLIENT_SECRET;
const YOUR_CLIENT_ID = process.env.CLIENT_ID;
const DOTWALLET_API = `https://staging.api.ddpurse.com`;

const url = require('url');
var ip = require('ip');
const APP_URL = `http://${ip.address()}:${PORT}`;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('src'));

/**
 *
 * ============================APP AUTHENTICATION============================
 *
 */
let appAccessToken = ''; // will call this when starting the server at the bottom in app.listen
async function getAppAccessToken() {
  try {
    const data = {
      client_id: YOUR_CLIENT_ID,
      client_secret: YOUR_CLIENT_SECRET,
      grant_type: 'client_credentials',
    };
    const accessTokenRequest = await axios.post(
      `${DOTWALLET_API}/v1/oauth2/get_access_token`,
      data
    );
    console.log('==============access token result==============\n', accessTokenRequest.data);
    if (!accessTokenRequest.data.data.access_token || accessTokenRequest.data.code !== 0)
      throw accessTokenRequest;
    else appAccessToken = accessTokenRequest.data.data.access_token;
  } catch (error) {
    console.log('==============ERROR==============\n', error);
  }
}

/**
 *
 * ============================USER AUTHENTICATION============================
 *
 */
const DB = {
  // example token storage
  userId: {
    accessToken: '12312',
    refreshToken: '12341',
    expiry: '123123123',
  },
}; // This might be a server cache for better performance

// client-side page to receive the code after user confirms login
app.get('/redirect', async (req, res) => {
  res.sendFile(path.join(__dirname + '/redirect.html'));
});

app.post('/auth', async (req, res) => {
  // console.log('req, res', req, res);
  const userAccessInfo = await getUserAccess(req.body.code);
  let userInfo;
  if (userAccessInfo.accessToken) {
    userInfo = await getUserInfo(userAccessInfo.accessToken);
  } else res.json({ error: 'error logging in' });
  DB[userInfo.id] = {
    accessToken: userAccessInfo.accessToken,
    refreshToken: userAccessInfo.refreshToken,
    expiry: new Date().getTime / 1000 + userAccessInfo.expiresIn,
  };
  res.json({ ...userInfo });
});

async function getUserAccess(code) {
  try {
    console.log('==============got code==============\n', code);
    const data = {
      client_id: YOUR_CLIENT_ID,
      client_secret: YOUR_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: `${APP_URL}/redirect`,
    };
    const accessTokenRequest = await axios.post(
      `${DOTWALLET_API}/v1/oauth2/get_access_token`,
      data
    );
    console.log('==============access token result==============\n', accessTokenRequest.data);
    // These would be stored in database or session in a real app
    if (!accessTokenRequest.data.data.access_token || accessTokenRequest.data.code !== 0)
      throw accessTokenRequest;
    else
      return {
        accessToken: accessTokenRequest.data.data.access_token,
        refreshToken: accessTokenRequest.data.data.refresh_token,
        expiresIn: accessTokenRequest.data.data.expires_in,
      };
  } catch (err) {
    console.log('==============ERROR==============\n', err);
  }
}

async function getUserInfo(accessToken) {
  try {
    const userInfoOptions = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      method: 'POST',
    };
    const userInfoRequest = await axios(`${DOTWALLET_API}/v1/user/get_user_info`, userInfoOptions);
    console.log('==============user info result==============\n', userInfoRequest.data);
    return userInfoRequest.data.data;
  } catch (err) {
    console.log('==============ERROR==============\n', err);
  }
}

async function refreshUserAccess(refreshToken) {
  try {
    const data = {
      client_id: YOUR_CLIENT_ID,
      client_secret: YOUR_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };
    const accessTokenRequest = await axios.post(
      `${DOTWALLET_API}/v1/oauth2/get_access_token`,
      data
    );
    console.log(
      '==============refresh access token result==============\n',
      accessTokenRequest.data
    );
    console.log('==============refresh response==============\n', response.data.data);
    // // These would be stored in database or session in a real app
    if (!accessTokenRequest.data.data.access_token || accessTokenRequest.data.code !== 0)
      throw accessTokenRequest;
    else
      return {
        refreshToken: response.data.data.refresh_token,
        expiry: response.data.data.expires_in,
      };
  } catch (error) {
    console.log('==============ERROR==============\n', error);
  }
}

app.get('/restricted-page', async (req, res) => {
  res.sendFile(path.join(__dirname + '/restricted-page.html'));
});

/**
 *
 * ============================PAYMENT============================
 *
 */

app.get('/store-front', async (req, res) => {
  res.sendFile(path.join(__dirname + '/store-front.html'));
});
app.get('/order-fulfilled', async (req, res) => {
  res.sendFile(path.join(__dirname + '/order-fulfilled.html'));
});

async function createOrder(orderData) {
  try {
    console.log('==============orderData==============\n', orderData);
    const orderCallOptions = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appAccessToken}`,
      },
      method: 'POST',
      data: { ...orderData },
    };
    const orderSnResponse = await axios(
      `${DOTWALLET_API}/v1/transact/order/create`,
      orderCallOptions
    );
    const orderSnData = orderSnResponse.data;
    console.log('==============orderSnData==============', orderSnData);
    if (orderSnData.code === 75000) {
      return 'expired token';
    } else if (orderSnData.data && orderSnData.code == 0 && orderSnData.data) {
      return orderSnData.data;
    } else {
      return { error: orderSnData.data ? orderSnData.data : orderSnData };
    }
  } catch (err) {
    console.log('==============err==============\n', err);
  }
}

// // let's check on the the transaction status after a 2 minute wait
// setTimeout(() => {
//   orderStatus(orderData.merchant_order_sn);
// }, 1000 * 120);

app.post('/create-order', async (req, res) => {
  try {
    function respond(orderNumber) {
      if (orderNumber.error) {
        res.json({
          error: orderNumber.error,
        });
        throw orderNumber.error;
      } else {
        res.json({
          data: orderNumber,
        });
      }
    }
    let orderNumber = await createOrder(req.body);
    if (orderNumber === 'expired token') {
      await getAppAccessToken();
      orderNumber = await createOrder(req.body);
    }
    respond(orderNumber);
  } catch (err) {
    console.log('==============err==============\n', err);
  }
});

app.get('/payment-result', (req, res) => {
  // the response from 'notice_uri' will be in the request queries
  console.log('==============payment-result req==============\n', req.query);
});

const orderStatus = async (merchant_order_sn) => {
  try {
    const orderStatusResponse = await axios.post(
      'https://www.ddpurse.com/platform/openapi/search_order',
      {
        app_id: YOUR_CLIENT_ID,
        secret: YOUR_CLIENT_SECRET,
        merchant_order_sn: merchant_order_sn,
      }
    );
    if (!orderStatusResponse.data || orderStatusResponse.data.code !== 0) throw orderStatusResponse;
    const orderStatusData = orderStatusResponse.data;
    console.log('==============orderStatus==============\n', orderStatusData);
  } catch (err) {
    console.log('==============err==============\n', err);
  }
};

/**
 *
 * ============================AUTOMATIC PAYMENTS============================
 *
 */

app.post('/create-autopayment', async (req, res) => {
  try {
    console.log('==============orderData==============\n', req.body);
    const orderCallOptions = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appAccessToken}`,
      },
      method: 'POST',
      data: req.body,
    };
    const orderResponse = await axios(
      `${DOTWALLET_API}/v1/transact/order/autopay`,
      orderCallOptions
    );
    console.log(orderResponse);
    const orderResponseData = orderResponse.data;
    console.log('==============orderResponseData==============', orderResponseData);
    if (!orderResponseData.data) throw orderResponseData;
    if (orderResponseData.data.code === -101001) {
      res.json({ error: 'balance too low' });
    } else if (orderResponseData.data.code !== 0) throw orderResponseData;
    else res.json(orderResponseData.data);
  } catch (err) {
    console.log('==============err==============\n', err);
    res.json({ error: err });
  }
});

/**
 *
 * ============================SAVE DATA ON CHAIN============================
 *
 */

const savedDataTxns = []; // In real app could store in DB. Save a list of txns to retrieve data

app.post('/save-data', async (req, res) => {
  try {
    const data = req.body;
    // check if recieve address is dev's own
    console.log('==============data==============\n', data);
    const getHostedOptions = {
      headers: {
        'Content-Type': 'application/json',
        appid: YOUR_CLIENT_ID,
        appsecret: YOUR_CLIENT_SECRET,
      },
      method: 'POST',
      data: {
        coin_type: 'BSV',
      },
    };
    const getHostedAccount = await axios(
      'https://www.ddpurse.com/platform/openapi/v2/get_hosted_account',
      getHostedOptions
    );
    const getHostedData = getHostedAccount.data;
    console.log('==============getHostedData==============', getHostedData);
    if (!getHostedData.data.address) {
      throw getHostedData;
    }
    const getBalanceOptions = {
      headers: {
        'Content-Type': 'application/json',
        appid: YOUR_CLIENT_ID,
        appsecret: YOUR_CLIENT_SECRET,
      },
      method: 'POST',
      data: {
        coin_type: 'BSV',
      },
    };
    const getBalance = await axios(
      'https://www.ddpurse.com/platform/openapi/v2/get_hosted_account_balance',
      getBalanceOptions
    );
    const getBalanceData = getBalance.data;
    console.log('==============getBalanceData==============', getBalanceData);
    if (!getBalanceData.data.confirm && getBalanceData.data.confirm !== 0) {
      console.log(
        'getBalanceData.data.confirm;, getBalanceData.data.confirm;',
        getBalanceData.data.confirm
      );
      throw getBalanceData;
    }

    if (getBalanceData.data.confirm + getBalanceData.data.unconfirm < 700)
      throw 'developer wallet balance too low';
    const saveDataOptions = {
      headers: {
        'Content-Type': 'application/json',
        appid: YOUR_CLIENT_ID,
        appsecret: YOUR_CLIENT_SECRET,
      },
      method: 'POST',
      data: {
        coin_type: 'BSV',
        data: JSON.stringify(data),
        data_type: 0,
      },
    };
    const saveData = await axios(
      'https://www.ddpurse.com/platform/openapi/v2/push_chain_data',
      saveDataOptions
    );
    const saveDataData = saveData.data;
    console.log('==============getBalanceData==============', saveDataData);
    savedDataTxns.push({
      ...saveDataData.data,
      timestamp: new Date(),
      tag: 'banana-price',
    }); //in a real app this would go to DB
    res.json(saveDataData.data);
  } catch (err) {
    console.log(err.msg, err.data, err.message, err.response);
    console.log('==============err==============\n', err);
    res.json(err);
  }
});

app.listen(PORT, async () => {
  console.log(
    `DotWallet example app listening at ${
      process.env.NODE_ENV === 'production' ? 'production host' : APP_URL
    }`
  );
  await getAppAccessToken();
});
