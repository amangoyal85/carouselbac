const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Video", videoSchema);