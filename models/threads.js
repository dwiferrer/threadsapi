const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{
    timestamps:true
})
const threadSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    comments:[commentSchema]
},{
    timestamps:true
});

var Threads = mongoose.model("Threads", threadSchema);
 module.exports = Threads;