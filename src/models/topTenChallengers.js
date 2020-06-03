const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    "summonerId": String,
    "summonerName": String,
    "leaguePoints": Number,
    "rank": String,
    "wins": Number,
    "losses": Number,
    "veteran": Boolean,
    "inactive": Boolean,
    "freshBlood": Boolean,
    "hotStreak": Boolean,
    "id": String,
    "accountId": String,
    "puuid": String,
    "name": String,
    "profileIconId": Number,
    "revisionDate": Number,
    "summonerLevel": Number,
    "matches": []
})

module.exports = mongoose.model("Top", schema)