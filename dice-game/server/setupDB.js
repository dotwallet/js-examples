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
module.exports = async function setupDB() {
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
    const exists = threadsList.listList
      .map((thread) => thread.id)
      .includes(process.env.THREAD_ID);
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
};
