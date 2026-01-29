require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const weatherRoutes = require("./routes/weatherRoutes");

const app = express();
const PORT = process.env.PORT || 3000;
const axios = require("axios");
const Weather = require("./models/Weather");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "view")));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/weather", weatherRoutes);

const fetchWeatherData = async () => {
  try {
    const city = "Astana";
    const apiKey = process.env.API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    const weatherData = response.data;

    const newWeather = new Weather({
      ...weatherData,
      timestamp: new Date(),
    });

    await newWeather.save();
    console.log(`Weather data for ${city} saved successfully.`);
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
  }
};

fetchWeatherData();
setInterval(fetchWeatherData, 10 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
