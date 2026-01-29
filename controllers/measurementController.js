const Measurement = require("../models/Measurement");

const calculateStdDev = (values) => {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map((value) => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquareDiff);
};

exports.getMeasurements = async (req, res) => {
  try {
    const { field, start_date, end_date } = req.query;

    if (!field || !start_date || !end_date) {
      return res.status(400).json({
        error: "Missing required query parameters: field, start_date, end_date",
      });
    }

    if (!["field1", "field2", "field3"].includes(field)) {
      return res
        .status(400)
        .json({ error: "Invalid field name. Allowed: field1, field2, field3" });
    }

    const query = {
      timestamp: {
        $gte: new Date(start_date),
        $lte: new Date(end_date),
      },
    };

    const projection = { timestamp: 1, [field]: 1, _id: 0 };

    const measurements = await Measurement.find(query)
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

    if (!["field1", "field2", "field3"].includes(field)) {
      return res
        .status(400)
        .json({ error: "Invalid field name. Allowed: field1, field2, field3" });
    }

    let query = {};
    if (start_date && end_date) {
      query.timestamp = {
        $gte: new Date(start_date),
        $lte: new Date(end_date),
      };
    }

    const result = await Measurement.aggregate([
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
