const express = require("express");
const router = express.Router();
const weatherController = require("../controllers/weatherController");

router.get("/", weatherController.getWeatherData);
router.get("/metrics", weatherController.getMetrics);

module.exports = router;
