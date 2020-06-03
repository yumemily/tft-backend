const mongoose = require("mongoose");

const typeSchema = mongoose.Schema({
    type: {
        type: String,
        trim: true,
        unique: true
    }
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    })

const Type = mongoose.model("Type", typeSchema)