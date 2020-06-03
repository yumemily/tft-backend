const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
    title:{
        type: String,
        trim: true
    },
    questions: [{
        type: mongoose.Schema.ObjectId,
        ref: ["A", "B", "C"],

        set: flag => true     //set: function, defines a custom setter for this property
    }],
    flag: {
        type:Boolean,
        set: v => v > 10 ? true : false
    },
    
})

