const catchAsync = require("../utils/catchAsync")


exports.updateOne = Model => catchAsync(async (req, res) => {
    let allows = []
    let id;
    switch (Model.modelName) {
        case "User":
            allows = ["password", "summonerName"]
            id = req.user._id
            user = req.user._id
            console.log("ID", req.user.id)
            break;
        default:
            id = req.params.id
    }
    Object.keys(req.body).forEach(el => { // Object.keys returns an array of fields inside of req.body
        if (!allows.includes(el))
            delete req.body[el]
    })
    // find one and update docs with that id and if the user ids match

    const updatedItem = await Model.findOneAndUpdate({ _id: id}, req.body, { new: true })
    console.log("========",updatedItem)
    if(!updatedItem) return res.status(403).json({status: "fail", message: "You do not have access to this."})
    res.status(200).json({ status: "ok", data: updatedItem })
})