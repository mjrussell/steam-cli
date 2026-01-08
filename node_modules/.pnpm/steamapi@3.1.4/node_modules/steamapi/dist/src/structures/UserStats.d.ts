import User from './User.js';
import UserAchievement from './UserAchievement.js';
import UserStat from './UserStat.js';
export default class UserStats extends User {
    /** Name of this game */
    game: string;
    /** The achievements this user has unlocked */
    achievements?: UserAchievement[];
    /** Some game stats about the user */
    stats?: UserStat[];
    constructor(data: any);
}
