const express = require("express");
const router = express.Router();
const measurementController = require("../controllers/measurementController");

router.get("/", measurementController.getMeasurements);
router.get("/metrics", measurementController.getMetrics);

module.exports = router;
