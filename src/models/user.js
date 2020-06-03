const mongoose = require("mongoose");
const validator = require("validator");
require("dotenv").config();

const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken")

const axios = require('axios');

//Set up User Schema and Model

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, "email is required"],
        trim: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value)
            }
        }
    },
    name: {
        type: String,
        required: [true, "name is required"],
        trim: true
    },
    summonerName: {
        type: String,
        required: [true, "summoner name is required"],
        trim: true
    },
    password: {
        type: String,
        // required: [true, "password is required"]
    },
    tokens: [String],
    info: {}
})

//Encrypt password before we save it
userSchema.pre("save", async function (next) { //this is a document
    if (!this.isModified("password")) return next(); //pass in the name of the field, password
    this.password = await bcrypt.hash(this.password, saltRounds)
    next();
})

userSchema.pre("findOneAndUpdate", async function (next) { //this is not a document, it's a query
    if (!this._update.password) return next(); //pass in the name of the field, password
    this._update.password = await bcrypt.hash(this._update.password, saltRounds)
    next();
})

//login
userSchema.statics.loginWithCredentials = async (email, password) => {
    const user = await User.findOne({ email: email })
    if (!user) throw new Error("user not found")
    const allow = await bcrypt.compare(password.toString(), user.password)
    if (!allow) throw new Error("incorrect password")
    return user
}


userSchema.methods.generateToken = async function () {
    const jsonToken = jwt.sign({ email: this.email, id: this._id }, process.env.SECRET)
    this.tokens.push(jsonToken)
    await this.save()
    return jsonToken
}

//Delete fields we don't want to show (the password and version number)
userSchema.methods.toJSON = function () {
    // console.log(this) //this is the user object, we want to delete password and __v so user can't see them
    const newObj = this.toObject()
    delete newObj.password;
    delete newObj.__v
    return newObj
}


userSchema.methods.fetchPlayerInfo = async function () {
    try{
        const response = await axios.get(`https://na1.api.riotgames.com/tft/summoner/v1/summoners/by-name/${this.summonerName}`,
        { headers: { "X-Riot-Token": process.env.RIOT_TOKEN } });
        const data = await response.data

    const summonerId = data.id
    const puuid = data.puuid


    //get more player info
    const reqPlayerInfo = await axios.get(`https://na1.api.riotgames.com/tft/league/v1/entries/by-summoner/${summonerId}`,
        { headers: { "X-Riot-Token": process.env.RIOT_TOKEN } })
    const additionalInfo = await reqPlayerInfo.data[0]


    const reqMatchIds = await axios.get(`https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?count=20`,
        { headers: { "X-Riot-Token": process.env.RIOT_TOKEN } });
    const matchIds = await reqMatchIds.data
    console.log("matchIds", matchIds)

    const getMatchInfo = async matchIds => {
        return new Promise((ok, fail) => {
            setTimeout(async () => {
                ok(await Promise.all(matchIds.map( el => reqMatchInfo(el))))
            }, 500)
        })
    }

    async function reqMatchInfo(matchID) {
        const res = await axios.get(`https://americas.api.riotgames.com/tft/match/v1/matches/${matchID}`,
            { headers: { "X-Riot-Token": process.env.RIOT_TOKEN } })
        return res.data
    }

    const matches = await getMatchInfo(matchIds)
    console.log("MATCHESS====", matches)
    const participants =  matches.map(el => el.info.participants.filter(participant => participant.puuid === puuid)[0])
    console.log("============", participants)

    return {data: data, matches: participants, info: additionalInfo}
}catch(e){
    return null
}

}

userSchema.virtual("compBuild", {
    ref: "compBuild", //the model to use
    localField: "_id",
    foreignField: "_id"
});


userSchema.statics.findOneOrCreate = async ({ name, email }) => {
    let user = await User.findOne({ email })
    if (!user) {
        user = await User.create({ email, name })
    }
    user.token = await user.generateToken()
    return user
}

const User = mongoose.model("User", userSchema)
module.exports = User