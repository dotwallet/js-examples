const express = require('express');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 3000;
const YOUR_CLIENT_SECRET = process.env.CLIENT_SECRET;
const YOUR_CLIENT_ID = process.env.CLIENT_ID;
const DOTWALLET_API = `https://api.ddpurse.com/v1`; // https://staging.api.ddpurse.com/v1

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
    const accessTokenRequest = await axios.post(`${DOTWALLET_API}/oauth2/get_access_token`, data);
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
app.get('/log-in-redirect', async (req, res) => {
  res.sendFile(path.join(__dirname + '/log-in-redirect.html'));
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
      redirect_uri: `${APP_URL}/log-in-redirect`,
    };
    const accessTokenRequest = await axios.post(`${DOTWALLET_API}/oauth2/get_access_token`, data);
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
    const userInfoRequest = await axios(`${DOTWALLET_API}/user/get_user_info`, userInfoOptions);
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
    const accessTokenRequest = await axios.post(`${DOTWALLET_API}/oauth2/get_access_token`, data);
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

app.get('/logged-in', async (req, res) => {
  res.sendFile(path.join(__dirname + '/logged-in.html'));
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
    // console.log('==============orderData==============\n', orderData);
    const orderCallOptions = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appAccessToken}`,
      },
      method: 'POST',
      data: { ...orderData },
    };
    const orderSnResponse = await axios(`${DOTWALLET_API}/transact/order/create`, orderCallOptions);
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

app.post('/create-order', async (req, res) => {
  try {
    function respond(orderId) {
      if (orderId.error) {
        res.json({
          error: orderId.error,
        });
        throw orderId.error;
      } else {
        res.json({
          data: orderId,
        });
        // let's check on the the transaction status after a 1 minute wait
        setTimeout(() => {
          orderStatus(orderId);
        }, 1000 * 60);
      }
    }
    console.log('notify_url -----------', req.body.notify_url);
    let orderId = await createOrder(req.body);
    if (orderId === 'expired token') {
      await getAppAccessToken();
      orderId = await createOrder(req.body);
    }
    respond(orderId);
  } catch (err) {
    console.log('==============err==============\n', err);
  }
});

app.post('/payment-result', (req, res) => {
  // the response from 'notify_url' will be in the request queries
  const body = { ...req.body };
  console.log('==============payment-result ==============\n', body);
});

const orderStatus = async (orderId) => {
  try {
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appAccessToken}`,
      },
      method: 'POST',
      data: { order_id: orderId },
    };
    const orderStatusResponse = await axios(`${DOTWALLET_API}/transact/order/get_order`, options);
    if (!orderStatusResponse.data || orderStatusResponse.data.code !== 0) throw orderStatusResponse;
    const orderStatusData = orderStatusResponse.data;
    console.log('==============order Status result==============\n', orderStatusData);
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
    // console.log('==============orderData==============\n', req.body);
    const orderCallOptions = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appAccessToken}`,
      },
      method: 'POST',
      data: req.body,
    };
    const callApi = () => axios(`${DOTWALLET_API}/transact/order/autopay`, orderCallOptions);
    let orderResponse = await callApi();
    console.log(orderResponse);
    let orderResponseData = orderResponse.data;
    console.log('==============orderResponseData==============', orderResponseData);
    if (orderResponseData.code === 75000) {
      getAppAccessToken();
      orderResponse = await callApi();
      orderResponseData = orderResponse.data;
    }
    if (orderResponseData.code === 10180007) {
      res.json({ error: 'balance too low' });
    } else if (orderResponseData.code !== 0) throw orderResponseData;
    else res.json(orderResponseData.data);
  } catch (err) {
    console.log('==============err==============\n', err);
    res.json({ error: err });
  }
});

/**
 *
 * ============================SAVE DATA ON CHAIN============================
 * This will use autopay, so user must have it activated
 *
 */

const savedDataTxns = []; // In real app could store in DB. Save a list of txns to retrieve data

app.post('/save-data', async (req, res) => {
  try {
    const data = JSON.stringify(req.body.saveData);
    const userId = req.body.userId;
    const hexEncoded = Buffer.from(data, 'utf8').toString('hex');
    // console.log('==============data, hexEncoded==============\n', data, hexEncoded);
    const orderData = {
      user_id: userId,
      out_order_id: uuidv4(),
      coin_type: 'BSV',
      to: [
        {
          type: 'script',
          content: `006a${hexEncoded}`,
          amount: 0,
        },
      ],
      product: {
        id: uuidv4(),
        name: 'prices: ' + new Date().getDate(),
      },
    };
    const orderCallOptions = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appAccessToken}`,
      },
      method: 'POST',
      data: orderData,
    };
    const callApi = () => axios(`${DOTWALLET_API}/transact/order/autopay`, orderCallOptions);
    let orderResponse = await callApi();
    // console.log(orderResponse);
    let orderResponseData = orderResponse.data;
    console.log('==============orderResponseData==============', orderResponseData);
    if (orderResponseData.code === 75000) {
      getAppAccessToken();
      orderResponse = await callApi();
      orderResponseData = orderResponse.data;
    }
    if (orderResponseData.code === 10180007) {
      res.json({ error: 'balance too low' });
    } else if (orderResponseData.code !== 0) throw orderResponseData;
    else res.json(orderResponseData.data);
  } catch (err) {
    console.log(err.msg, err.data, err.message, err.response);
    console.log('==============save data err==============\n', err);
    res.json(err);
  }
});

app.post('/get-tx-data', async (req, res) => {
  try {
    const txid = req.body.txid;
    console.log('==============txid==============\n', txid);
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appAccessToken}`,
      },
      method: 'POST',
      data: JSON.stringify({ transaction_hash: txid }),
    };
    const callApi = () => axios(`${DOTWALLET_API}/bsvchain/get_transaction`, options);
    let response = await callApi();
    let responseData = response.data;
    console.log('==============responseData==============', responseData);
    if (responseData.code === 75000) {
      getAppAccessToken();
      response = await callApi();
      responseData = response.data;
    }
    let data;
    responseData.data.vouts.forEach((vout) => {
      if (vout.script_hex.startsWith('006a')) {
        const hexDecoded = Buffer.from(
          vout.script_hex.slice(4), // slice off the '006a'
          'hex'
        ).toString('utf8');
        data = JSON.parse(hexDecoded);
      }
    });
    res.json({ ...data });
  } catch (error) {
    console.log('==============check tx err==============\n', error);

    res.json({ error });
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
