const Top = require("../models/topTenChallengers")

const mongoose = require("mongoose")

exports.readTopTen = async function(req, res){
    const players = await Top.find({}, "leaguePoints losses wins summonerName rank puuid profileIconId")
    res.json({status: "success", data: players})
}


//o0ZY2QZYTiglumSG6VPtEVuECz502ZxUWSohDRiPOntGptQUAjQ3Bq1oPtqQIBBAjGacc0uQKLFzOA