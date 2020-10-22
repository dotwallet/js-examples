const Koa = require('koa');
const dotenv = require('dotenv');
const app = new Koa();
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const ip = require('ip');
const Router = require('koa-router');
const onerror = require('koa-onerror');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');

dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 3001;
const APP_SECRET = process.env.APP_SECRET;
const APP_ID = process.env.APP_ID;
const DEV_OPEN_ID = process.env.DEV_OPEN_ID;
const DEV_ADDRESS = process.env.DEV_ADDRESS;
let API_TOKEN = 'zsHSaj4NSb';
const clientURL =
  process.env.NODE_ENV === 'production'
    ? 'https://musing-pike-d80e67.netlify.app'
    : `http://localhost:8080`;

const DotWallet = require('dotwallet-koa');
const dotwallet = DotWallet(APP_ID, APP_SECRET);

app.use(cors());
app.use(bodyParser());
const router = new Router();
onerror(app);

const setupDB = require('./setupDB');
let DB;
let dbCalls;
let seedHash;
let lastDay;

const tokenStorage = [];
const savedDataTxns = [];
const paymentHistory = [];

/**
 * ============================AUTHENTICATION============================
 */

router.get('/auth', async (ctx, next) => {
  console.log(
    '++++++++++++++++++++++++++++++++++++++++++++++++auth called++++++++++++++++++++++++++++++++++++++++'
  );
  const authResponse = await dotwallet.handleAuthResponse(ctx, next, `${clientURL}/login`, true);
  tokenStorage.push({
    [authResponse.userData.user_open_id]: {
      refreshToken: authResponse.accessData.refresh_token,
      accessToken: authResponse.accessData.access_token,
    },
  });
});

const refreshAccessToken = (refreshTokenStorage) => {
  dotwallet.refreshAccess(refreshTokenStorage).then((result) => {
    refreshTokenStorage = result.refresh_token;
    accessTokenStorage = result.access_token;
  });
};

/**
 * ============================AUTOMATIC PAYMENTS============================
 */

/** converts each character in a string to an ascii number value and sums the total value */
function asciiSum(str) {
  const toArray = [...str].map((char) => char.charCodeAt(0));
  return toArray.reduce((previous, current) => previous * current);
}
function diceRollFromSum(sum) {
  // console.log('diceRollFromSum, sum', sum);
  return (sum % 6) + 1;
}
async function payOutBet(ctx, payout, txid, address) {
  const orderData = {
    app_id: APP_ID,
    merchant_order_sn: uuid(),
    item_name: 'payout--' + txid,
    pre_amount: payout,
    user_open_id: DEV_OPEN_ID,
    receive_address: JSON.stringify([
      {
        address: address,
        amount: payout,
      },
    ]),
  };
  const orderResultData = await dotwallet.autopayment(orderData, true);
  // console.log('payout orderResultData', orderResultData);
  return orderResultData;
}

router.post('/bet', async (ctx) => {
  const orderData = ctx.request.body.orderData;
  const userWallet = ctx.request.body.userWallet;
  const betAmount = ctx.request.body.betAmount;
  const guessesStr = ctx.request.body.guesses;
  const orderResultData = await dotwallet.autopayment(orderData, true);
  console.log('orderResultData', orderResultData);
  if (orderResultData.error || !orderResultData.pay_txid) ctx.body = orderResultData;
  else {
    const userID = orderData.user_open_id;
    const txid = orderResultData.pay_txid;
    const rollHash = crypto
      .createHash('sha256')
      .update(txid + guessesStr + seedHash)
      .digest()
      .toString('hex');
    const rollSum = asciiSum(rollHash);
    const roll = diceRollFromSum(rollSum);
    const guesses = guessesStr.split('');
    let correct = false;
    guesses.forEach((guess) => {
      if (parseInt(guess, 10) === roll) correct = true;
    });

    let payoutResult = {};
    if (correct) {
      const payout = (betAmount / 0.00000001 / (guesses.length / 6)) * 0.9;
      payoutResult = await payOutBet(ctx, payout, txid, userWallet);
      payoutResult.payoutAmount = payout * 0.00000001;
    }
    const betRecord = {
      timeStamp: new Date(),
      betAmount,
      payoutResult,
      txid,
      seedHash,
      rollHash,
      roll,
      guesses: guessesStr,
      correct,
      userID,
      userWallet,
    };
    // console.log('betRecord, orderResultData', betRecord, orderResultData);
    dbCalls.saveBetRecord(betRecord);
    ctx.body = { betRecord, orderResultData };
  }
});

router.post('/bet-history', async (ctx) => {
  const rangeStart = ctx.request.body.rangeStart;
  const rangeEnd = ctx.request.body.rangeEnd;
  const userID = ctx.request.body.userID;
  const result = await dbCalls.getBetRecords(rangeStart, rangeEnd, userID);
  ctx.body = result;
});

router.get('/seed-history', async (ctx) => {
  // console.log('/seed-history');
  const result = await dbCalls.getSeedRecords();
  ctx.body = result;
});

router.get('/check-prize-pool', async (ctx) => {
  const headers = { token: API_TOKEN };
  const address = 'https://www.ddpurse.com/platform/openapi/svdb/BSV/address/info';
  const data = { address: DEV_ADDRESS };
  console.log(address, data, { headers });
  const result = await axios.post(address, data, { headers });
  console.log('/check-max\n', result.data);
  ctx.body = result.data;
});

app.use(router.routes()).use(router.allowedMethods());

const dailySecret = async function () {
  async function resetSeed() {
    const seed = uuid();
    // console.log('new seed:\n', seed);
    const newSeedHash = crypto.createHash('sha256').update(seed).digest().toString('hex');
    // console.log('new seedHash:\n', newSeedHash);
    const now = new Date();
    const seedRecord = {
      newSeedHash,
      seed,
      date: now,
    };
    await dbCalls.setTodaysSeed(now.getDay(), seed, newSeedHash);
    await dbCalls.saveSeedRecord(seedRecord);
    lastDay = now.getDay();
    seedHash = newSeedHash;
  }

  async function checkReset() {
    const now = new Date();
    if (now.getDay() !== lastDay) {
      await resetSeed();
    }
  }
  // await resetSeed();

  const todaysSeedInfo = await dbCalls.getTodaysSeed();
  console.log('todaysSeedInfo:\n', todaysSeedInfo);
  lastDay = todaysSeedInfo.lastDay;
  seedHash = todaysSeedInfo.seedHash;
  if (lastDay === -1) resetSeed(); // init

  await checkReset();

  setInterval(() => {
    checkReset();
  }, 1000 * 60 * 60);
};

const getToken = async () => {
  const headers = { appid: APP_ID, appsecret: APP_SECRET };
  console.log(headers);
  const result = await axios.get('https://www.ddpurse.com/platform/openapi/svdb/token', headers);
  console.log('get token', result.data);
  API_TOKEN = result.data.data;
};

app.listen(PORT, async () => {
  console.log(
    `DotWallet example app listening at ${
      process.env.NODE_ENV === 'production' ? 'production host' : ip.address() + ':' + PORT
    }`
  );
  const dbSetup = await setupDB();
  DB = dbSetup.db;
  const DBCalls = require('./DBCalls');
  dbCalls = new DBCalls(DB, dbSetup.threadId);
  dailySecret();
  // getToken();
});
