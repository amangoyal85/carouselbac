const express = require("express");

const indexController = require("../controllers/index");

const router = express.Router();

// Video routes
router.get("/videos", indexController.getVideos);
router.post("/like", indexController.likeVideo);
router.post("/share", indexController.shareVideo);
router.post('/videos-by-id', indexController.getVideoById);

module.exports = router;