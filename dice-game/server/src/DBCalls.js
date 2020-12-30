class DBCalls {
  constructor(DB, threadId) {
    this.DB = DB;
    this.threadId = threadId;
  }
  async saveBetRecord(record) {
    // console.log('saveBetRecord', record);
    const diceGameInstance = await this.DB.findByID(this.threadId, 'DiceGame', '1');
    // console.log('diceGameInstance', diceGameInstance);
    const betRecords = diceGameInstance.betRecords;
    // console.log('betRecords', betRecords);
    betRecords.push(record);
    await this.DB.save(this.threadId, 'DiceGame', [diceGameInstance]);
    return diceGameInstance;
  }

  async getBetRecords(rangeStart, rangeEnd, userID) {
    // console.log('getBetRecord range, user', rangeStart, rangeEnd, userID);
    const diceGameInstance = await this.DB.findByID(this.threadId, 'DiceGame', '1');
    const betRecords = diceGameInstance.betRecords;
    betRecords.reverse();
    // console.log('betRecords', betRecords);
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
    const diceGameInstance = await this.DB.findByID(this.threadId, 'DiceGame', '1');
    const seedRecords = diceGameInstance.seedRecords;
    seedRecords.push(record);
    await this.DB.save(this.threadId, 'DiceGame', [diceGameInstance]);
    return diceGameInstance;
  }

  async setTodaysSeed(lastDay, seed, seedHash) {
    // console.log('setTodaysSeed', lastDay, seed, seedHash);
    const diceGameInstance = await this.DB.findByID(this.threadId, 'DiceGame', '1');
    diceGameInstance.lastDay = lastDay;
    diceGameInstance.seed = seed;
    diceGameInstance.seedHash = seedHash;
    await this.DB.save(this.threadId, 'DiceGame', [diceGameInstance]);
    return diceGameInstance;
  }

  async getTodaysSeed() {
    const diceGameInstance = await this.DB.findByID(this.threadId, 'DiceGame', '1');
    return {
      lastDay: diceGameInstance.lastDay,
      seedHash: diceGameInstance.seedHash,
    };
  }
  async getSeedRecords() {
    const diceGameInstance = await this.DB.findByID(this.threadId, 'DiceGame', '1');
    const seedRecords = diceGameInstance.seedRecords;
    seedRecords.reverse();
    seedRecords[0].date = 'today';
    seedRecords[0].seed = 'unreleased';
    // console.log(seedRecords);
    return seedRecords.slice(0, seedRecords.length >= 100 ? 100 : seedRecords.length);
  }
}

module.exports = DBCalls;
