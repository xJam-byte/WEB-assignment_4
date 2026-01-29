document.addEventListener("DOMContentLoaded", () => {
  // Set default date range (last 7 days)
  const endDateInput = document.getElementById("endDate");
  const startDateInput = document.getElementById("startDate");

  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);

  endDateInput.valueAsDate = today;
  startDateInput.valueAsDate = lastWeek;

  const form = document.getElementById("filterForm");
  const chartCtx = document.getElementById("timeSeriesChart").getContext("2d");
  let myChart = null;

  const fetchData = async () => {
    const field = document.getElementById("field").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    try {
      // Fetch time series data
      const response = await fetch(
        `/api/measurements?field=${field}&start_date=${startDate}&end_date=${endDate}`,
      );
      const data = await response.json();

      // Fetch metrics
      const metricsResponse = await fetch(
        `/api/measurements/metrics?field=${field}&start_date=${startDate}&end_date=${endDate}`,
      );
      const metrics = await metricsResponse.json();

      updateStats(metrics);
      updateChart(data, field);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data. See console for details.");
    }
  };

  const updateStats = (metrics) => {
    document.getElementById("avgValue").textContent = metrics.average
      ? metrics.average.toFixed(2)
      : "-";
    document.getElementById("minValue").textContent = metrics.min
      ? metrics.min.toFixed(2)
      : "-";
    document.getElementById("maxValue").textContent = metrics.max
      ? metrics.max.toFixed(2)
      : "-";
    document.getElementById("stdDevValue").textContent = metrics.stdDev
      ? metrics.stdDev.toFixed(2)
      : "-";
  };

  const updateChart = (data, field) => {
    const labels = data.map((d) => new Date(d.timestamp).toLocaleString());
    const values = data.map((d) => d[field]);

    if (myChart) {
      myChart.destroy();
    }

    const fieldLabels = {
      field1: "Temperature",
      field2: "Humidity",
      field3: "Traffic",
    };

    myChart = new Chart(chartCtx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: fieldLabels[field],
            data: values,
            borderColor: "#3498db",
            backgroundColor: "rgba(52, 152, 219, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.1, // Smooth curves
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              maxTicksLimit: 10,
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Time Series Analysis",
          },
        },
      },
    });
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    fetchData();
  });

  // Initial load
  fetchData();
});
