export default class GameDetails {
    /** Type of app. Usually "game" */
    type;
    /** Display name of the app */
    name;
    /** App ID for this game */
    id;
    /** Age restriction for purchasing */
    requiredAge;
    /** If this game is free */
    isFree;
    /**
     * Enum indicating level of support. E.G. "full"
     * NOTE: I'm not sure what the possible values are
    */
    controllerSupport;
    /** List of DLC app IDs for this game */
    dlc;
    /**
     * Detailed HTML from main body of the store page
     * NOTE: This appears to be the same as aboutTheGame
    */
    detailedDescription;
    /**
     * Detailed HTML from main body of the store page
     * NOTE: This appears to be the same as detailedDescription
    */
    aboutTheGame;
    /** Short description of the game under the game banner on the store page */
    shortDescription;
    /** Supported languages in game */
    supportedLanguages;
    /** URL to the header image */
    headerImage;
    /** URL to the capsule image 231x87px */
    capsuleImage;
    /** URL to the capsule image 184x69px */
    capsuleImagev5;
    /** URL to the game's website */
    website;
    /** HTML specs for minimum and recommended PC hardware */
    pcRequirements;
    /** HTML specs for minimum and recommended Mac hardware */
    macRequirements;
    /** HTML specs for minimum and recommended Linux hardware */
    linuxRequirements;
    /** Legal notice for the game */
    legalNotice;
    /** Array of developer names */
    developers;
    /** Array of publisher names */
    publishers;
    /** Price overview including discounts. Calculated in the given currency when requesting app details */
    priceOverview;
    /** Array of IDs for the purchasing options of the game */
    packages;
    /** Array of package groups containing purchase details for each package */
    packageGroups;
    /** Supported platforms */
    platforms;
    /** Metacritic score and website URL */
    metacritic;
    /** Array of Steam categories with IDs and short descriptions */
    categories;
    /**
     * Array of Steam genres with IDs and short descriptions
     * NOTE: ID is a string for genres rather than a number like most other ID in Steam
    */
    genres;
    /** Array of screenshot thumbnail and full path URLs */
    screenshots;
    /** Array of movie information including thumbnail and video URLs */
    movies;
    /** Number of positive reviews */
    recommendations;
    /** Number of achievements and array of achievements from the right column of the store page */
    achievements;
    /** Release date information */
    releaseDate;
    /** Support information including URL and email */
    supportInfo;
    /** Background image URL scaled for store page */
    background;
    /** Raw background image URL */
    backgroundRaw;
    /** Unsure what this is. It has always been an empty array of ids and null notes for games tested */
    contentDescriptors;
    /**
     * Ratings for different rating systems
     * NOTE: These appear to have a different object structure based on the game
    */
    ratings;
    constructor(data) {
        this.type = data.type;
        this.name = data.name;
        this.id = data.steam_appid;
        this.requiredAge = data.required_age;
        this.isFree = data.is_free;
        this.controllerSupport = data.controller_support;
        this.dlc = data.dlc;
        this.detailedDescription = data.detailed_description;
        this.aboutTheGame = data.about_the_game;
        this.shortDescription = data.short_description;
        this.supportedLanguages = data.supported_languages;
        this.headerImage = data.header_image;
        this.capsuleImage = data.capsule_image;
        this.capsuleImagev5 = data.capsule_image;
        this.website = data.website;
        this.pcRequirements = data.pc_requirements;
        this.macRequirements = data.mac_requirements;
        this.linuxRequirements = data.linux_requirements;
        this.legalNotice = data.legal_notice;
        this.developers = data.developers;
        this.publishers = data.publishers;
        this.priceOverview = data.price_overview;
        this.packages = data.packages;
        this.packageGroups = data.package_groups;
        this.platforms = data.platforms;
        this.metacritic = data.metacritic;
        this.categories = data.categories;
        this.genres = data.genres;
        this.screenshots = data.screenshots;
        this.movies = data.movies;
        this.recommendations = data.recommendations;
        this.achievements = data.achievements;
        this.releaseDate = data.release_date;
        this.supportInfo = data.support_info;
        this.background = data.background;
        this.backgroundRaw = data.background_raw;
        this.contentDescriptors = data.content_descriptors;
        this.ratings = data.ratings;
    }
}
