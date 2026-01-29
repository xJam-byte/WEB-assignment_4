const Weather = require("../models/Weather");

exports.getWeatherData = async (req, res) => {
  try {
    const { field, start_date, end_date } = req.query;

    if (!field || !start_date || !end_date) {
      return res.status(400).json({
        error: "Missing required query parameters: field, start_date, end_date",
      });
    }

    // Allowed fields mapping for validation
    const allowedFields = [
      "main.temp",
      "main.humidity",
      "main.pressure",
      "wind.speed",
    ];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        error:
          "Invalid field name. Allowed: main.temp, main.humidity, main.pressure, wind.speed",
      });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    end.setUTCHours(23, 59, 59, 999);

    const query = {
      timestamp: {
        $gte: start,
        $lte: end,
      },
    };

    const projection = { timestamp: 1, [field]: 1, _id: 0 };

    const measurements = await Weather.find(query)
      .select(projection)
      .sort({ timestamp: 1 });

    res.json(measurements);
  } catch (error) {
    console.error("Error fetching measurements:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getMetrics = async (req, res) => {
  try {
    const { field, start_date, end_date } = req.query;

    if (!field) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter: field" });
    }

    const allowedFields = [
      "main.temp",
      "main.humidity",
      "main.pressure",
      "wind.speed",
    ];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        error:
          "Invalid field name. Allowed: main.temp, main.humidity, main.pressure, wind.speed",
      });
    }

    let query = {};
    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      end.setUTCHours(23, 59, 59, 999);

      query.timestamp = {
        $gte: start,
        $lte: end,
      };
    }

    const result = await Weather.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          average: { $avg: `$${field}` },
          min: { $min: `$${field}` },
          max: { $max: `$${field}` },
          stdDev: { $stdDevPop: `$${field}` },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return res.json({
        average: 0,
        min: 0,
        max: 0,
        stdDev: 0,
        count: 0,
      });
    }

    const metrics = result[0];
    delete metrics._id;

    res.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
