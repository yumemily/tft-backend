const mongoose = require("mongoose");
const User = require("./user")

const schema = mongoose.Schema({
    comp: {
        type: Array,
        required: [true, "Can't save an empty team composition."]
    },
    title: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "Comp needs a title."]
    },
    count :{
        type: Number,
        default: 0,
        min: 0
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: [true, "Comp needs a user"]
    },
    favorited : [mongoose.SchemaTypes.ObjectId]
}, {
    timestamps: true,
    toJSON: { virtuals: true }, // vmongoose creates a virtual object we can define logic about what we want/dont want to show
    toObject: { virtuals: true }
}
)

const CompBuild = mongoose.model("CompBuild", schema)
module.exports = CompBuild