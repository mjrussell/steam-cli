export default class GameSchema {
    /**
     * Name of the game
     */
    gameName;
    gameVersion;
    availableGameStats;
    constructor(data) {
        this.gameName = data.gameName;
        this.gameVersion = data.gameVersion;
        this.availableGameStats = data.availableGameStats;
    }
}
