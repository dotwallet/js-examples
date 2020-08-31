const Koa = require('koa');
const dotenv = require('dotenv');
const app = new Koa();
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const ip = require('ip');
const Router = require('koa-router');
const onerror = require('koa-onerror');

dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 3000;
const YOUR_APP_SECRET = process.env.APP_SECRET;
const YOUR_APP_ID = process.env.APP_ID;

const DotWallet = require('dotwallet-koa');
const dotwallet = DotWallet(YOUR_APP_ID, YOUR_APP_SECRET);
app.use(cors());
app.use(bodyParser());
const router = new Router();
onerror(app);

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
  const authResponse = await dotwallet.handleAuthResponse(
    ctx,
    next,
    `http://localhost:8080/game/`,
    true
  );
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
 * ============================PAYMENT============================
 */

router.post('/create-order', async (ctx) => {
  const order_sn = await dotwallet.handleOrder(ctx.request.body, true);
  ctx.body = { order_sn };
});

router.get('/payment-result', (ctx) => {
  paymentHistory.push({ ...ctx.request.query });
});

/**
 * ============================AUTOMATIC PAYMENTS============================
 */

router.post('/create-autopayment', async (ctx) => {
  const orderResultData = await dotwallet.autopayment(ctx.request.body, true);
  ctx.body = orderResultData;
});

/**
 * ============================SAVE DATA ON CHAIN============================
 */

router.post('/save-data', async (ctx) => {
  try {
    const data = ctx.request.body;
    // check if recieve address is dev's own
    console.log('==============data==============\n', data);

    const getBalanceData = await dotwallet.hostedAccountBalance('BSV', true);
    console.log('==============getBalanceData==============', getBalanceData);

    if (getBalanceData.confirm + getBalanceData.unconfirm < 700)
      throw 'developer wallet balance too low';

    const saveDataData = await dotwallet.saveData(data, 0, true);
    console.log('==============saveDataData==============', saveDataData);
    savedDataTxns.push({
      ...saveDataData.data,
      timestamp: new Date(),
      tag: 'banana-price',
    });
    ctx.body - saveDataData.data;
  } catch (err) {
    console.log(err.msg, err.data, err.message, err.response);
    console.log('==============err==============\n', err);
    ctx.body = err;
  }
});

app.use(router.routes()).use(router.allowedMethods());

// check/get hosted account (only need to do once)
// dotwallet
//   .getHostedAccount('BSV', true)
//   .then((getHostedData) =>
//     console.log(
//       '==============hosted account status==============',
//       getHostedData
//     )
//   );
app.listen(PORT, () =>
  console.log(
    `DotWallet example app listening at ${
      process.env.NODE_ENV === 'production'
        ? 'production host'
        : ip.address() + ':' + PORT
    }`
  )
);
