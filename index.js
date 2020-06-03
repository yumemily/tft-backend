const app = require("./app.js")
// const https = require("https")
const http = require("http")
const fs = require("fs")
const path = require("path")
const cors = require("cors");

app.use(cors()); //?  i have it in app.js too

// const server = https.createServer({
//     key: fs.readFileSync(path.join(__dirname,"server.key")),
//     cert: fs.readFileSync(path.join(__dirname,"server.cert"))
// },app)


const server = http.createServer(app)


server.listen(process.env.PORT, () => {
    console.log("app running on port", process.env.PORT)
})