const express = require('express');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const url = require('url');
var ip = require('ip');
console.log(ip.address());

dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 3000;
const YOUR_APP_SECRET = process.env.APP_SECRET;
const YOUR_APP_ID = process.env.APP_ID;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('src'));

/**
 *
 * ============================AUTHENTICATION============================
 *
 */

app.get('/auth', async (req, res) => {
  // console.log('req, res', req, res);
  try {
    const code = req.query.code;
    console.log('==============got code==============\n', code);
    const data = {
      app_id: YOUR_APP_ID,
      secret: YOUR_APP_SECRET,
      code: code,
    };
    console.log('==============data==============\n', data);

    const accessTokenRequest = await axios.post(
      'https://www.ddpurse.com/platform/openapi/access_token',
      data
    );
    console.log(
      '==============access token result==============\n',
      accessTokenRequest
    );
    const accessToken = accessTokenRequest.data.data.access_token;
    if (accessToken) {
      const userInfoRequest = await axios.get(
        'https://www.ddpurse.com/platform/openapi/get_user_info?access_token=' +
          accessToken
      );
      console.log(
        '==============user info result==============\n',
        userInfoRequest.data
      );

      res.redirect(
        url.format({
          pathname: '/restricted-page/',
          query: {
            name: userInfoRequest.data.data.user_name,
            pic: userInfoRequest.data.data.user_avatar,
            user_id: userInfoRequest.data.data.user_open_id,
          },
        })
      );
    }
  } catch (err) {
    console.log('==============ERROR==============\n', err);
  }
});
let accessTokenStorage = ''; // These would go to your database in a real app
let refreshTokenStorage = '';

async function refreshAccess(refreshToken) {
  const response = await axios.get(
    `https://www.ddpurse.com/platform/openapi/refresh_access_token?app_id=${YOUR_APP_ID}&refresh_token=${refreshToken}`
  );
  console.log(
    '==============refresh response==============\n',
    response.data.data
  );
  // These would be stored in database or session in a real app
  accessTokenStorage = response.data.data.access_token;
  refreshTokenStorage = response.data.data.refresh_token;
  return {
    refreshToken: response.data.data.refresh_token,
    expiry: response.data.data.expires_in,
  };
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
app.post('/create-order', async (req, res) => {
  try {
    const orderData = req.body;
    // check if recieve address is dev's own
    console.log('==============orderData==============\n', orderData);
    const signedOrder = {
      ...orderData,
      sign: getSignature(orderData, YOUR_APP_SECRET),
    };
    const orderSnResponse = await axios.post(
      'https://www.ddpurse.com/platform/openapi/create_order',
      signedOrder
    );
    const orderSnData = orderSnResponse.data;
    console.log('==============orderSnData==============', orderSnData);
    if (orderSnData.data && orderSnData.data.order_sn) {
      res.json({
        order_sn: orderSnData.data.order_sn,
      });
      // let's check on the the transaction status after a 2 minute wait
      setTimeout(() => {
        orderStatus(orderData.merchant_order_sn);
      }, 1000 * 120);
    } else {
      res.json({
        error: orderSnData.msg,
      });
      throw orderSnResponse;
    }
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
        app_id: YOUR_APP_ID,
        secret: YOUR_APP_SECRET,
        merchant_order_sn: merchant_order_sn,
      }
    );
    const orderStatusData = orderStatusResponse.data;
    console.log('==============orderStatus==============\n', orderStatusData);
  } catch (err) {
    console.log('==============err==============\n', err);
  }
};

const md5 = require('md5');
const crypto = require('crypto');

function getSignature(orderData, appSecret) {
  let str = '';
  const secret = md5(appSecret);

  for (let key in orderData) {
    if (key != 'sign' || key != 'opreturn') {
      if (str) {
        str += '&' + key + '=' + orderData[key];
      } else {
        str = key + '=' + orderData[key];
      }
    }
  }

  str += '&secret=' + secret;
  str = str.toUpperCase();

  const sign = crypto
    .createHmac('sha256', secret)
    .update(str, 'utf8')
    .digest('hex');

  return sign;
}
/**
 *
 * ============================AUTOMATIC PAYMENTS============================
 *
 */

app.get('/autopayment-store', async (req, res) => {
  res.sendFile(path.join(__dirname + '/autopayment-store.html'));
});

app.post('/create-autopayment', async (req, res) => {
  try {
    const orderData = req.body;
    // check if recieve address is dev's own
    console.log('==============orderData==============\n', orderData);
    const orderWithSecret = {
      ...orderData,
      secret: YOUR_APP_SECRET,
    };
    const orderResponse = await axios.post(
      'https://www.ddpurse.com/openapi/pay_small_money',
      orderWithSecret
    );
    const orderResponseData = orderResponse.data;
    console.log(
      '==============orderResponseData==============',
      orderResponseData
    );
    if (orderResponseData.data) {
      res.json(orderResponseData.data);
    } else {
      res.json({
        error: orderResponseData.msg,
      });
      throw orderResponseData;
    }
  } catch (err) {
    console.log('==============err==============\n', err);
    res.send('error');
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
        appid: YOUR_APP_ID,
        appsecret: YOUR_APP_SECRET,
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
      throw getHostedData.msg;
    }
    const getBalanceOptions = {
      headers: {
        'Content-Type': 'application/json',
        appid: YOUR_APP_ID,
        appsecret: YOUR_APP_SECRET,
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
        appid: YOUR_APP_ID,
        appsecret: YOUR_APP_SECRET,
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

app.listen(PORT, () =>
  console.log(
    `DotWallet example app listening at ${
      process.env.NODE_ENV === 'production'
        ? 'production host'
        : ip.address() + ':' + PORT
    }`
  )
);
