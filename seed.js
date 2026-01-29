require("dotenv").config();
const mongoose = require("mongoose");
const Measurement = require("./models/Measurement");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Measurement.deleteMany({});

    const measurements = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setHours(d.getHours() + 1)
    ) {
      const hour = d.getHours();
      const tempBase = 20;
      const tempFluctuation = Math.sin(((hour - 6) / 24) * 2 * Math.PI) * 5;
      const randomNoise1 = (Math.random() - 0.5) * 2;
      const field1 = parseFloat(
        (tempBase + tempFluctuation + randomNoise1).toFixed(2),
      );

      const field2 = parseFloat((30 + Math.random() * 50).toFixed(2));

      const isDay = hour > 7 && hour < 20;
      const trafficBase = isDay ? 60 : 10;
      const field3 = Math.floor(trafficBase + Math.random() * 40);

      measurements.push({
        timestamp: new Date(d),
        field1,
        field2,
        field3,
      });
    }

    await Measurement.insertMany(measurements);

    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();
