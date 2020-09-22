class DBCalls {
  constructor(DB, threadId) {
    this.DB = DB;
    this.threadId = threadId;
  }
  async saveBetRecord(record) {
    // console.log('saveBetRecord', record);
    const diceGameInstanceResult = await this.DB.findByID(this.threadId, 'DiceGame', '1');

    const diceGameInstance = diceGameInstanceResult.instance;
    // console.log('diceGameInstance', diceGameInstance);

    const betRecords = diceGameInstance.betRecords;
    // console.log('betRecords', betRecords);

    betRecords.push(record);
    await this.DB.save(this.threadId, 'DiceGame', [diceGameInstance]);
    return diceGameInstance;
  }
  async getBetRecords(rangeStart, rangeEnd, userID) {
    // console.log('getBetRecord range, user', rangeStart, rangeEnd, userID);
    const diceGameInstanceResult = await this.DB.findByID(this.threadId, 'DiceGame', '1');

    const diceGameInstance = diceGameInstanceResult.instance;
    // console.log('diceGameInstance', diceGameInstance);

    const betRecords = diceGameInstance.betRecords;
    betRecords.reverse();
    let range = [];
    if (userID) {
      let results = [];
      for (const record of betRecords) {
        // console.log('compare ID', record.userID, userID);
        if (results.length >= 10) break;
        if (record.userID === userID) results.push(record);
        // console.log('results', results);
      }
      range = results.splice(rangeStart, rangeEnd);
    } else range = betRecords.slice(rangeStart, rangeEnd);
    // console.log('betRecords selections in range', range);
    return range;
  }
  async saveSeedRecord(record) {
    // console.log('saveSeedRecord', record);
    const diceGameInstanceResult = await this.DB.findByID(this.threadId, 'DiceGame', '1');
    const diceGameInstance = diceGameInstanceResult.instance;
    const seedRecords = diceGameInstance.seedRecords;
    seedRecords.push(record);
    await this.DB.save(this.threadId, 'DiceGame', [diceGameInstance]);
    return diceGameInstance;
  }

  async setTodaysSeed(lastDay, seed, seedHash) {
    // console.log('setTodaysSeed', lastDay, seed, seedHash);
    const diceGameInstanceResult = await this.DB.findByID(this.threadId, 'DiceGame', '1');
    const diceGameInstance = diceGameInstanceResult.instance;
    diceGameInstance.lastDay = lastDay;
    diceGameInstance.seed = seed;
    diceGameInstance.seedHash = seedHash;
    await this.DB.save(this.threadId, 'DiceGame', [diceGameInstance]);
    return diceGameInstance;
  }

  async getTodaysSeed() {
    const diceGameInstanceResult = await this.DB.findByID(this.threadId, 'DiceGame', '1');
    const diceGameInstance = diceGameInstanceResult.instance;
    return {
      lastDay: diceGameInstance.lastDay,
      seedHash: diceGameInstance.seedHash,
    };
  }
}

module.exports = DBCalls;
