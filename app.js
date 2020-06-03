const express = require("express")
require("dotenv").config();

const app = express();
const router = express.Router();

const mongoose = require("mongoose")
const bodyParser = require("body-parser")

const cors = require("cors")
const axios = require('axios');
const Promise = require('promise');

const path = require("path")
const fs = require("fs")

const compRouter = require("./src/routers/compRouter")
const userRouter = require("./src/routers/userRouter")
const authRouter = require("./src/routers/authRouter")



mongoose.connect(process.env.DB_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => console.log("Connected to database")).catch(err => console.log(err))

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //?

const Top = require("./src/models/topTenChallengers")


const { readTopTen } = require("./src/controllers/topTenController")

router.route("/").get((req, res) => {
    res.send("OK")
})

router.use("/auth", authRouter)
router.use("/users", userRouter)
router.use("/comp-builder", compRouter)

//top ten players route
router.get("/topten/players/:id", async (req, res) => {

    const id = req.params.id
    console.log("PID", id)
    const p = await Top.findOne({ "puuid": id }, "leaguePoints rank win losses name profileIconId")
    let me = []
    const dt = await Top.find({ 'matches.info.participants.puuid': id })
    dt.forEach(e => {
        if (e.name === p.name)
            e.matches.forEach(l => l.info.participants.forEach(n => {
                if (n.puuid === id) {
                    //  n.name = e.name
                    me.push(n)
                }
            }))
    })
    res.json({ matches: me, count: me.length, player: p })
})

router.route("/test/:key").get(getChallengers)
router.route("/topten")
    .get(readTopTen)

const errorHandler = require("./src/utils/errorHandler")
app.use(errorHandler)
// router.route("*").all(notFound)

// 0. request GET /tft/league/v1/challenger  (return data) (1 request)
async function getChallengers(req, res) {
    const riotToken  = req.params.key

    try {
        let first = []
        const response = await axios.get('https://na1.api.riotgames.com/tft/league/v1/challenger',
            { headers: { "X-Riot-Token": riotToken } });

        const data = await response.data

        // let requests = data.entries.map(el => axios.get(`https://na1.api.riotgames.com/tft/summoner/v1/summoners/${el.summonerId}`,
        //     { headers: { "X-Riot-Token": "RGAPI-5fbf719f-8c4a-4bff-bfe2-7aa74b8a536c" } }));

        //get player info for each challenger
        async function getPlayerInfo(id) {
            const res = await axios.get(`https://na1.api.riotgames.com/tft/summoner/v1/summoners/${id}`,
                { headers: { "X-Riot-Token": riotToken } })
            return res.data
        }
        async function getPlayerInfoByPuuid(id) {
            const res = await axios.get(`https://na1.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${id}`,
                { headers: { "X-Riot-Token": riotToken } })
            return res.data
        }
        async function getPlayerInfoByPuuidGroup(arr) {
            return await axios.all([
                getPlayerInfoByPuuid(arr[0]),
                getPlayerInfoByPuuid(arr[1]),
                getPlayerInfoByPuuid(arr[2]),
                getPlayerInfoByPuuid(arr[3])
                , getPlayerInfoByPuuid(arr[4])
                , getPlayerInfoByPuuid(arr[5])
                , getPlayerInfoByPuuid(arr[6])
                , getPlayerInfoByPuuid(arr[7])
            ])
        }
        data.entries = data.entries.slice(0, 10)
        let requests = [
            getPlayerInfo(data.entries[0].summonerId),
            getPlayerInfo(data.entries[1].summonerId),
            getPlayerInfo(data.entries[2].summonerId),
            getPlayerInfo(data.entries[3].summonerId),
            getPlayerInfo(data.entries[4].summonerId),
            getPlayerInfo(data.entries[5].summonerId),
            getPlayerInfo(data.entries[6].summonerId),
            getPlayerInfo(data.entries[7].summonerId),
            getPlayerInfo(data.entries[8].summonerId),
            getPlayerInfo(data.entries[9].summonerId),
        ]
        first = await axios.all(requests)
        // console.log("first", first)
        first.forEach((e, idx) => { data.entries[idx] = { ...data.entries[idx], ...e } });
        // console.log("updated", data.entries[0], data.entries[1])

        //get 10 match IDS for each challenger
        async function getMatchID(puuid) {
            let count = 10;
            const res = await axios.get(`https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?count=${count}`,
                { headers: { "X-Riot-Token": riotToken } })
            return res.data
        }
        matchIdRequests = [
            getMatchID(data.entries[0].puuid),
            getMatchID(data.entries[1].puuid),
            getMatchID(data.entries[2].puuid),
            getMatchID(data.entries[3].puuid),
            getMatchID(data.entries[4].puuid),
            getMatchID(data.entries[5].puuid),
            getMatchID(data.entries[6].puuid),
            getMatchID(data.entries[7].puuid),
            getMatchID(data.entries[8].puuid),
            getMatchID(data.entries[9].puuid),
        ]

        let matchIDs = []

        async function getMatchInfoEACH(matchID) {
            const res = await axios.get(`https://americas.api.riotgames.com/tft/match/v1/matches/${matchID}`,
                { headers: { "X-Riot-Token": riotToken } })
            return res.data
        }

        const newGetMatchInfoGroup = async group => {
            return new Promise((ok, fail) => {
                setTimeout(async () => {
                    ok(await Promise.all(group.map(async el => await getMatchInfoEACH(el))))
                }, 2000)
            })
        }

        const magic = async (array) => {
            let arr  = []
            return new Promise((ok,fail)=>[
                setTimeout(async ()=>{
                    for (let i=0; i < array.length;i++ ){
                        console.log("before", arr)
                    arr.push(await newGetMatchInfoGroup(array[i]))
                    console.log("after", arr)
                };
                ok(arr)
            }, 120000)
            ])
        }

            matchIDs = await axios.all(matchIdRequests)

            let matchInfos = []
                matchInfos =  await magic(matchIDs)

                data.entries.forEach((e, i) => e.matches = matchInfos[i])

                // use promise to replace participants [string]

                fs.writeFileSync(path.join(__dirname, "top.json"), JSON.stringify(data))
                await Top.insertMany(data.entries)
                console.log("done")

            
            // [
            //   [ 'NA1_3431517848', 'NA1_3431096376' ],
            //   [ 'NA1_3429439412', 'NA1_3429384741' ]
            // ]




        res.send("yea i know i doing it")
    } catch (error) {
        console.error(error);
        res.json(error)
    }
}

///////////
// fs.writeFileSync(path.join(__dirname, "top.json"), JSON.stringify(data))
// await Top.insertMany(data.entries)
// console.log("done")
////
module.exports = app

