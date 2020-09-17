const express = require('express');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
const app = express();
const expressWs = require('express-ws')(app);
const bodyParser = require('body-parser');
const cors = require('cors');
const url = require('url');
var ip = require('ip');
// console.log(ip.address());
var _ = require('lodash');

dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV == 'production' ? '0.0.0.0' : 'localhost';
const YOUR_APP_SECRET = process.env.APP_SECRET;
const YOUR_APP_ID = process.env.APP_ID;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('src'));
let DB;
/**
 *
 * ============================AUTHENTICATION============================
 *
 */
function authWrapper(lang) {
  return async function auth(req, res) {
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
      console.log('==============access token result==============\n', accessTokenRequest.data);
      const accessToken = accessTokenRequest.data.data.access_token;
      if (accessToken) {
        const userInfoRequest = await axios.get(
          'https://www.ddpurse.com/platform/openapi/get_user_info?access_token=' + accessToken
        );
        console.log('==============user info result==============\n', userInfoRequest.data);
        const userData = userInfoRequest.data.data;
        res.redirect(
          url.format({
            pathname: '/wishlist/' + lang,
            query: {
              ...userData,
            },
          })
        );
      }
    } catch (err) {
      console.log('==============ERROR==============\n', err);
    }
  };
}

app.get('/auth', authWrapper('en'));
app.get('/auth-cn', authWrapper('cn'));

let accessTokenStorage = ''; // These would go to your database in a real app
let refreshTokenStorage = '';

async function refreshAccess(refreshToken) {
  const response = await axios.get(
    `https://www.ddpurse.com/platform/openapi/refresh_access_token?app_id=${YOUR_APP_ID}&refresh_token=${refreshToken}`
  );
  console.log('==============refresh response==============\n', response.data.data);
  // These would be wishlistd in database or session in a real app
  accessTokenStorage = response.data.data.access_token;
  refreshTokenStorage = response.data.data.refresh_token;
  return {
    refreshToken: response.data.data.refresh_token,
    expiry: response.data.data.expires_in,
  };
}
app.get('/login/cn', async (req, res) => {
  res.sendFile(path.join(__dirname + '/index-cn.html'));
});
app.get('/wishlist/en', async (req, res) => {
  res.sendFile(path.join(__dirname + '/wishlist.html'));
});
app.get('/wishlist/cn', async (req, res) => {
  res.sendFile(path.join(__dirname + '/wishlist-cn.html'));
});

/**
 *
 * ============================PAYMENT============================
 *
 */

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
    if (orderSnData.data && orderSnData.code == 0 && orderSnData.data.order_sn) {
      res.json({
        order_sn: orderSnData.data.order_sn,
      });
      // let's check on the the transaction status after a 2 minute wait
      setTimeout(() => {
        orderStatus(orderData.data.merchant_order_sn);
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

  const sign = crypto.createHmac('sha256', secret).update(str, 'utf8').digest('hex');

  return sign;
}
/**
 *
 * ============================AUTOMATIC PAYMENTS============================
 *
 */

app.post('/create-autopayment', async (req, res) => {
  try {
    const orderData = req.body;
    // check if recieve address is dev's own
    console.log('==============autopayment orderData==============\n', orderData);
    const orderWithSecret = {
      ...orderData,
      secret: YOUR_APP_SECRET,
    };
    const orderResponse = await axios.post(
      'https://www.ddpurse.com/openapi/pay_small_money',
      orderWithSecret
    );
    const orderResponseData = orderResponse.data;
    console.log('==============autopayment orderResponseData==============', orderResponseData);
    if (orderResponseData.code === -101001) {
      res.json({ error: 'balance too low' });
    } else if (orderResponseData.code !== 0) throw orderResponseData;
    else if (orderResponseData.data) {
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
 * ============================Database calls============================
 *
 */
var wishlistDefault = [
  {
    _id: '1',
    list: [],
  },
];
var txListDefault = [
  {
    _id: '1',
    list: [],
  },
];
const Textile = require('@textile/hub');
const Client = Textile.Client;
const ThreadID = Textile.ThreadID;
const threadId = ThreadID.fromString(process.env.THREAD_ID);
const wishlistSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  id: 'https://github.com/dotwallet/js-examples',
  title: 'Wishlist',
  properties: {
    _id: { type: 'string' },
    list: {
      type: 'array',
      items: { $ref: '#/definitions/wish' },
      default: [],
    },
  },
  definitions: {
    wish: {
      title: 'Wish',
      type: 'object',
      properties: {
        _id: { type: 'string' },
        desc: { type: 'string' },
        bounty: { type: 'number' },
      },
    },
  },
};
const txListSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  id: 'https://github.com/dotwallet/js-examples',
  title: 'TxList',
  properties: {
    _id: { type: 'string' },
    list: {
      type: 'array',
      items: { $ref: '#/definitions/txinfo' },
      default: [],
    },
  },
  definitions: {
    txinfo: {
      title: 'TxInfo',
      type: 'object',
      properties: {
        desc: { type: 'string' },
        saveTxid: { type: 'string' },
        userName: { type: 'string' },
        previousBounty: { type: 'number' },
        newBounty: { type: 'number' },
        txid: { type: 'string' },
      },
    },
  },
};
async function setupDB() {
  const db = await Client.withKeyInfo({
    key: process.env.TEXTILE_KEY,
    secret: process.env.TEXTILE_SECRET,
  });
  console.log(db);
  try {
    // const dbIfno = await db.getDBInfo(threadId);
    // console.log(dbIfno);
    // await db.updateCollection(threadId, 'txlist', txListSchema);
    const threadsList = await db.listThreads();
    console.log('threadslist', threadsList);
    const exists = threadsList.listList.map((thread) => thread.id).includes(process.env.THREAD_ID);
    console.log('thread exists', exists);
    if (threadsList.listList.length < 1 || !exists) {
      await initializeDB();
    }
  } catch (error) {
    console.log('error', error);
    await initializeDB();
  }

  async function initializeDB() {
    // first time, make a thread id
    const threadId = ThreadID.fromRandom();
    const threadIDStr = threadId.toString();
    // save this to your .env file
    console.log(threadIDStr);
    // and start a new DB
    await db.newDB(threadId);
    await db.newCollection(threadId, 'txlist', txListSchema);
    const txListInstance = await db.create(threadId, 'txlist', txListDefault);
    console.log('txListInstance', txListInstance);
    await db.newCollection(threadId, 'wishlist', wishlistSchema);
    const deckInstance = await db.create(threadId, 'wishlist', wishlistDefault);
    console.log('deckInstance', deckInstance);
  }
  return db;
}

// get wishlist
app.get('/get-wishlist', async (req, res) => {
  const wishlistInstanceResult = await DB.findByID(threadId, 'wishlist', '1');
  const wishlistInstance = wishlistInstanceResult.instance;
  const wishlist = wishlistInstance.list;
  console.log(wishlist);
  const sorted = _.orderBy(wishlist, ['bounty'], ['desc']);
  console.log(sorted);

  res.json(sorted);
});
// add wish
app.post('/add-wish', async (req, res) => {
  const wishlistInstanceResult = await DB.findByID(threadId, 'wishlist', '1');
  const wishlistInstance = wishlistInstanceResult.instance;
  const wishlist = wishlistInstance.list;
  wishlist.push(req.body);
  await DB.save(threadId, 'wishlist', [wishlistInstance]);
  res.json(wishlistInstance);
});
// increase bounty
app.post('/increase-bounty', async (req, res) => {
  const wishlistInstanceResult = await DB.findByID(threadId, 'wishlist', '1');
  const wishlistInstance = wishlistInstanceResult.instance;
  const wishlist = wishlistInstance.list;
  const { id, original, addAmt } = req.body;
  console.log('increase bounty', id, original, addAmt);
  wishlist.forEach((wish) => {
    if (wish._id === id) if (wish.bounty === original) wish.bounty += addAmt;
  });
  await DB.save(threadId, 'wishlist', [wishlistInstance]);
  res.json(wishlistInstance);
});

/**
 *
 * ============================SAVE DATA ON CHAIN============================
 *
 */

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
    const response = await axios(
      'https://www.ddpurse.com/platform/openapi/v2/push_chain_data',
      saveDataOptions
    );
    const responseData = response.data;
    console.log('==============saveData==============', responseData);

    const txlistInstanceResult = await DB.findByID(threadId, 'txlist', '1');
    const txlistInstance = txlistInstanceResult.instance;
    const txlist = txlistInstance.list;
    const newTxRecord = {
      saveTxid: responseData.data.txid,
      ...data,
    };
    console.log('newTxRecord', newTxRecord);
    txlist.push(newTxRecord);
    await DB.save(threadId, 'txlist', [txlistInstance]);
    res.json(txlist);
  } catch (err) {
    console.log(err.msg, err.data, err.message, err.response);
    console.log('==============err==============\n', err);
    res.json(err);
  }
});

// get wishlist
app.get('/get-txlist', async (req, res) => {
  const txlistInstanceResult = await DB.findByID(threadId, 'txlist', '1');
  const txlistInstance = txlistInstanceResult.instance;
  const txlist = txlistInstance.list;
  // console.log(txlist);
  res.json(txlist);
});
app.get('/tx-list/en', async (req, res) => {
  res.sendFile(path.join(__dirname + '/tx-list.html'));
});
app.get('/tx-list/cn', async (req, res) => {
  res.sendFile(path.join(__dirname + '/tx-list-cn.html'));
});

// boiler
app.listen(PORT, async () => {
  DB = await setupDB();
  console.log(
    `DotWallet example app listening at ${
      process.env.NODE_ENV === 'production' ? 'production host' : ip.address() + ':' + PORT
    }`
  );
});
