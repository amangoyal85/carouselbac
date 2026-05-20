const videos = require("../assets/videos.json");

const videoModel = require("../models/video");
const videoActivityModel = require("../models/activity");

const UAParser = require("ua-parser-js");

module.exports.getVideos = async (req, res) => {
  try {

    // Aggregate likes & shares
    const activities =
      await videoActivityModel.aggregate([
        {
          $group: {
            _id: {
              videoId: "$videoId",
              type: "$type"
            },
            count: { $sum: 1 }
          }
        }
      ]);

    const statsMap = {};

    activities.forEach((item) => {

      const videoId = item._id.videoId;

      if (!statsMap[videoId]) {

        statsMap[videoId] = {
          likes: 0,
          shares: 0
        };
      }

      if (item._id.type === "like") {

        statsMap[videoId].likes = item.count;
      }

      if (item._id.type === "share") {

        statsMap[videoId].shares = item.count;
      }
    });

    // Merge DB stats with videos.json
    const finalVideos = videos.map((video) => ({
      ...video,
      likes: statsMap[video.id]?.likes || 0,
      shares: statsMap[video.id]?.shares || 0
    }));

    return res.status(200).json({
      success: true,
      data: finalVideos
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

module.exports.likeVideo = async (req, res) => {
  try {

    const { videoId } = req.body;

    if (!videoId) {

      return res.status(400).json({
        success: false,
        message: "videoId is required"
      });
    }

    // Get IP Address
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    // Parse Browser Details
    const parser = new UAParser(
      req.headers["user-agent"]
    );

    const browserInfo = parser.getBrowser();
    const osInfo = parser.getOS();
    const deviceInfo = parser.getDevice();

    const browserName =
      `${browserInfo.name || "Unknown"}-${browserInfo.version || "0"}`;

    const deviceName =
      `${deviceInfo.vendor || "Desktop"}-${deviceInfo.model || "PC"}`;

    const osName =
      `${osInfo.name || "Unknown"}-${osInfo.version || ""}`;

    const existingLike =
      await videoActivityModel.findOne({
        videoId,
        ipAddress,
        browser: browserName,
        device: deviceName,
        type: "like"
      });

    if (existingLike) {

      const totalLikes =
        await videoActivityModel.countDocuments({
          videoId,
          type: "like"
        });

      return res.status(200).json({
        success: true,
        message: "Already liked",
        likes: totalLikes
      });
    }

    // Create video if not exists
    let video = await videoModel.findOne({
      videoId
    });

    if (!video) {

      video = await videoModel.create({
        videoId
      });
    }

    // Save like activity
    await videoActivityModel.create({
      videoId,
      type: "like",
      ipAddress,
      browser: browserName,
      os: osName,
      device: deviceName,
      userAgent: req.headers["user-agent"]
    });

    // Count total likes
    const totalLikes =
      await videoActivityModel.countDocuments({
        videoId,
        type: "like"
      });

    return res.status(200).json({
      success: true,
      likes: totalLikes
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

module.exports.shareVideo = async (req, res) => {
  try {

    const { videoId, platform } = req.body;

    if (!videoId) {

      return res.status(400).json({
        success: false,
        message: "videoId is required"
      });
    }

    // Get IP Address
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    // Parse Browser Details
    const parser = new UAParser(
      req.headers["user-agent"]
    );

    const browserInfo = parser.getBrowser();
    const osInfo = parser.getOS();
    const deviceInfo = parser.getDevice();

    const browserName =
      `${browserInfo.name || "Unknown"}-${browserInfo.version || "0"}`;

    const deviceName =
      `${deviceInfo.vendor || "Desktop"}-${deviceInfo.model || "PC"}`;

    const osName =
      `${osInfo.name || "Unknown"}-${osInfo.version || ""}`;

    // Create
    let video = await videoModel.findOne({
      videoId
    });

    if (!video) {

      video = await videoModel.create({
        videoId
      });
    }

    // Save share activity
    await videoActivityModel.create({
      videoId,
      type: "share",
      ipAddress,
      browser: browserName,
      os: osName,
      device: deviceName,
      userAgent: req.headers["user-agent"],
      platform: platform || "unknown"
    });

    // Count total shares
    const totalShares =
      await videoActivityModel.countDocuments({
        videoId,
        type: "share"
      });

    return res.status(200).json({
      success: true,
      shares: totalShares
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

module.exports.getVideoById = async (req, res) => {
  try {

    const { videoId } = req.params;

    const videoData = videos.find(
      (item) => item.id == videoId
    );

    if (!videoData) {

      return res.status(404).json({
        success: false,
        message: "Video not found"
      });
    }

    // Count likes
    const likes =
      await videoActivityModel.countDocuments({
        videoId,
        type: "like"
      });

    // Count shares
    const shares =
      await videoActivityModel.countDocuments({
        videoId,
        type: "share"
      });

    return res.status(200).json({
      success: true,
      data: {
        ...videoData,
        likes,
        shares
      }
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};