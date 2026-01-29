require("dotenv").config();
const mongoose = require("mongoose");
const Weather = require("./models/Weather");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await Weather.deleteMany({});

    const city = "Astana";
    const now = new Date();
    const dataPoints = [];

    for (let d = 7; d >= 0; d--) {
      for (let h = 0; h < 24; h++) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);
        date.setHours(h, 0, 0, 0);

        const baseTemp = -15;
        const hourOffset = (h - 5 + 24) % 24;
        const tempVariation = Math.sin((hourOffset / 24) * Math.PI * 2) * 5;
        const randomNoise = (Math.random() - 0.5) * 2;

        const temp = baseTemp + tempVariation + randomNoise;

        dataPoints.push({
          coord: { lon: 71.449, lat: 51.1605 },
          weather: [
            { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
          ],
          base: "stations",
          main: {
            temp: parseFloat(temp.toFixed(2)),
            feels_like: parseFloat((temp - 5).toFixed(2)),
            temp_min: parseFloat((temp - 1).toFixed(2)),
            temp_max: parseFloat((temp + 1).toFixed(2)),
            pressure: 1010 + Math.floor((Math.random() - 0.5) * 10),
            humidity: 60 + Math.floor((Math.random() - 0.5) * 20),
          },
          visibility: 10000,
          wind: {
            speed: parseFloat((3 + Math.random() * 5).toFixed(2)),
            deg: Math.floor(Math.random() * 360),
          },
          clouds: { all: Math.floor(Math.random() * 20) },
          dt: Math.floor(date.getTime() / 1000),
          sys: {
            type: 1,
            id: 8820,
            country: "KZ",
            sunrise: 1675130000, // Placeholder
            sunset: 1675165000, // Placeholder
          },
          timezone: 18000,
          id: 1526273,
          name: city,
          cod: 200,
          timestamp: date,
        });
      }
    }

    await Weather.insertMany(dataPoints);
    console.log(`Successfully seeded ${dataPoints.length} weather records.`);

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
