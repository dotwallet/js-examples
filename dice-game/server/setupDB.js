const Textile = require('@textile/hub');
const Client = Textile.Client;
const ThreadID = Textile.ThreadID;
const threadId = ThreadID.fromString(process.env.THREAD_ID);
const diceGameSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  id: 'https://github.com/dotwallet/js-examples/dicegame',
  title: 'DiceGame',
  properties: {
    _id: { type: 'string' },
    seedRecords: {
      type: 'array',
      items: { $ref: '#/definitions/seedRecord' },
      default: [],
    },
    betRecords: {
      type: 'array',
      items: { $ref: '#/definitions/betRecord' },
      default: [],
    },
    lastDay: {
      type: 'number',
      default: 0,
    },
    seed: {
      type: 'string',
    },
    seedHash: {
      type: 'string',
    },
  },
  definitions: {
    seedRecord: {
      title: 'SeedRecord',
      type: 'object',
      properties: {
        newSeedHash: { type: 'string' },
        seed: { type: 'string' },
        date: { type: 'string' },
      },
    },
    betRecord: {
      title: 'BetRecord',
      type: 'object',
      properties: {
        timeStamp: { type: 'string' },
        betAmount: { type: 'string' },
        payoutResult: { type: 'object' },
        txid: { type: 'string' },
        seedHash: { type: 'string' },
        rollHash: { type: 'string' },
        roll: { type: 'number' },
        guesses: { type: 'string' },
        correct: { type: 'string' },
        userID: { type: 'string' },
        userWallet: { type: 'string' },
      },
    },
  },
};

const diceGameDefault = {
  _id: '1',
  seedRecords: [],
  betRecords: [],
  lastDay: -1,
  seed: '',
  seedHash: '',
};

module.exports = async function setupDB() {
  const db = await Client.withKeyInfo({
    key: process.env.TEXTILE_KEY,
    secret: process.env.TEXTILE_SECRET,
  });
  try {
    async function initializeDB() {
      console.log('initializing DB');
      // first time, make a thread id
      const threadId = ThreadID.fromRandom();
      const threadIDStr = threadId.toString();
      // save this to your .env file
      console.log(threadIDStr);
      // and start a new DB
      await db.newDB(threadId);
      await db.newCollection(threadId, 'DiceGame', diceGameSchema);
      const diceGameInstance = await db.create(threadId, 'DiceGame', [diceGameDefault]);
      await console.log('diceGameInstance', diceGameInstance);
      return { db, threadId };
    }
    // const dbIfno = await db.getDBInfo(threadId);
    // console.log(dbIfno);
    // await db.updateCollection(threadId, 'txlist', txListSchema);
    const threadsList = await db.listThreads();
    // console.log('threadslist', threadsList);
    const exists = threadsList.listList.map((thread) => thread.id).includes(process.env.THREAD_ID);
    // console.log('thread exists', exists);
    if (threadsList.listList.length < 1 || !exists) {
      return await initializeDB();
    } else return { db, threadId };
  } catch (error) {
    console.log('error', error);
    return await initializeDB();
  }
};
