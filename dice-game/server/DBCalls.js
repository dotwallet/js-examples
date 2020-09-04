class DBCalls {
  constructor(DB, threadId) {
    this.DB = DB;
    this.threadId = threadId;
  }
  async saveBetRecord(record) {
    console.log('saveBetRecord', record);
    const diceGameInstanceResult = await this.DB.findByID(this.threadId, 'DiceGame', '1');

    const diceGameInstance = diceGameInstanceResult.instance;
    console.log('diceGameInstance', diceGameInstance);

    const betRecords = diceGameInstance.betRecords;
    // console.log('betRecords', betRecords);

    betRecords.push(record);
    await this.DB.save(this.threadId, 'DiceGame', [diceGameInstance]);
    return diceGameInstance;
  }

  async saveSeedRecord(record) {
    console.log('saveSeedRecord', record);
    const diceGameInstanceResult = await this.DB.findByID(this.threadId, 'DiceGame', '1');
    const diceGameInstance = diceGameInstanceResult.instance;
    const seedRecords = diceGameInstance.seedRecords;
    seedRecords.push(record);
    await this.DB.save(this.threadId, 'DiceGame', [diceGameInstance]);
    return diceGameInstance;
  }

  async setTodaysSeed(lastDay, seed, seedHash) {
    console.log('setTodaysSeed', lastDay, seed, seedHash);
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
