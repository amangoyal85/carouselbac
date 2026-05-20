const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    index: true
  },

  type: {
    type: String,
    enum: ["like", "share"],
    required: true
  },

  ipAddress: {
    type: String,
    required: true
  },

  browser: String,

  userAgent: String,

  platform: String

}, {
  timestamps: true
});

// Prevent duplicate likes
activitySchema.index({
  videoId: 1,
  ipAddress: 1,
  type: 1
});

module.exports = mongoose.model(
  "VideoActivity",
  activitySchema
);