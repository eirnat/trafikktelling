/**
 * Diagrammer for statistikksiden.
 * Periodefilter og tall ligger i statsModel.ts. update() tegner på nytt.
 */
import Chart from "chart.js/auto";
import { buildView } from "./statsModel";

/** Tailwind-farger, samme som i komponentene */
const THEME = {
  background: "#ffffff",
  foreground: "#475569",
  title: "#0f172a",
  blue: "#2563eb",
  emerald: "#059669",
  amber: "#f59e0b",
  violet: "#7c3aed",
  rose: "#e11d48",
  gray: "#94a3b8",
};

const FONT_FALLBACK = "Arial, Helvetica, sans-serif";
const CAR_PALETTE = [
  THEME.blue,
  THEME.emerald,
  THEME.amber,
  THEME.violet,
  THEME.rose,
  THEME.gray,
];

function chartOptions(fontFamily) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: THEME.foreground,
          font: { family: fontFamily, size: 12 },
        },
      },
      tooltip: {
        bodyFont: { family: fontFamily },
        titleFont: { family: fontFamily },
      },
    },
  };
}

function axisScale(fontFamily) {
  return {
    ticks: { color: THEME.foreground, font: { family: fontFamily, size: 11 } },
    grid: { color: `${THEME.foreground}18` },
  };
}

function titlePlugin(fontFamily, text) {
  return {
    display: true,
    text,
    color: THEME.title,
    font: { family: fontFamily, size: 15, weight: "700" },
  };
}

/**
 * @param {HTMLElement} root
 * @returns {{ update: (rows: unknown[], period: { from: Date | null, to: Date | null, incomplete: boolean, id: string }) => void, destroy: () => void }}
 */
export function createDashboard(root) {
  const fontFamily = getComputedStyle(root).fontFamily || FONT_FALLBACK;
  const commonChartOptions = chartOptions(fontFamily);
  const timeCanvas = root.querySelector('[data-chart="time"]');
  const barCanvas = root.querySelector('[data-chart="bars"]');
  const trafficCanvas = root.querySelector('[data-chart="traffic"]');
  const carTypesCanvas = root.querySelector('[data-chart="car-types"]');

  if (!timeCanvas || !barCanvas || !trafficCanvas || !carTypesCanvas) {
    console.warn("createDashboard: mangler DOM-elementer");
    return { update() {}, destroy() {} };
  }

  Chart.defaults.color = THEME.foreground;
  Chart.defaults.font.family = fontFamily;

  const live = { trafficTotal: 0, carTotal: 0 };

  const timeChart = new Chart(timeCanvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Antall tellinger",
          data: [],
          backgroundColor: THEME.blue,
          borderWidth: 0,
          borderRadius: 6,
        },
      ],
    },
    options: {
      ...commonChartOptions,
      scales: {
        x: axisScale(fontFamily),
        y: {
          ...axisScale(fontFamily),
          beginAtZero: true,
          ticks: { ...axisScale(fontFamily).ticks, precision: 0 },
        },
      },
      plugins: {
        ...commonChartOptions.plugins,
        legend: { display: false },
        title: titlePlugin(fontFamily, "Tellinger over tid"),
      },
    },
  });

  const barChart = new Chart(barCanvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Antall tellinger",
          data: [],
          backgroundColor: THEME.emerald,
          borderWidth: 0,
          borderRadius: 6,
        },
      ],
    },
    options: {
      ...commonChartOptions,
      scales: {
        x: axisScale(fontFamily),
        y: {
          ...axisScale(fontFamily),
          beginAtZero: true,
          ticks: { ...axisScale(fontFamily).ticks, precision: 0 },
        },
      },
      plugins: {
        ...commonChartOptions.plugins,
        legend: { display: false },
        title: titlePlugin(fontFamily, "Tellinger per land"),
      },
    },
  });

  const trafficChart = new Chart(trafficCanvas.getContext("2d"), {
    type: "pie",
    data: {
      labels: ["Ingen data"],
      datasets: [
        {
          data: [1],
          backgroundColor: [`${THEME.foreground}33`],
          borderColor: THEME.background,
          borderWidth: 2,
        },
      ],
    },
    options: {
      ...commonChartOptions,
      plugins: {
        ...commonChartOptions.plugins,
        title: titlePlugin(fontFamily, "Trafikktype"),
        tooltip: {
          ...commonChartOptions.plugins.tooltip,
          callbacks: {
            label(ctx) {
              if (live.trafficTotal === 0) return "Ingen tellinger";
              const value = Number(ctx.raw);
              const pct = Math.round((value / live.trafficTotal) * 100);
              return `${ctx.label}: ${value} (${pct}%)`;
            },
          },
        },
      },
    },
  });

  const carTypeChart = new Chart(carTypesCanvas.getContext("2d"), {
    type: "pie",
    data: {
      labels: ["Ingen data"],
      datasets: [
        {
          data: [1],
          backgroundColor: [`${THEME.foreground}33`],
          borderColor: THEME.background,
          borderWidth: 2,
        },
      ],
    },
    options: {
      ...commonChartOptions,
      plugins: {
        ...commonChartOptions.plugins,
        title: titlePlugin(fontFamily, "Biltyper"),
        tooltip: {
          ...commonChartOptions.plugins.tooltip,
          callbacks: {
            label(ctx) {
              if (live.carTotal === 0) return "Ingen tellinger";
              const value = Number(ctx.raw);
              const pct = Math.round((value / live.carTotal) * 100);
              return `${ctx.label}: ${value} (${pct}%)`;
            },
          },
        },
      },
    },
  });

  let destroyed = false;

  function update(rows, period) {
    if (destroyed) return;
    const view = buildView(rows, period);
    live.trafficTotal = view.privat + view.yrkes + view.ukjent;
    live.carTotal = view.carTypes.reduce((sum, item) => sum + item.count, 0);

    timeChart.data.labels =
      view.buckets.length > 0 ? view.buckets.map((bucket) => bucket.label) : ["Ingen data"];
    timeChart.data.datasets[0].data =
      view.buckets.length > 0 ? view.buckets.map((bucket) => bucket.count) : [0];
    timeChart.options.plugins.title.text = view.bucketTitle;
    timeChart.update();

    const hasCountries = view.countries.length > 0;
    barChart.data.labels = hasCountries
      ? view.countries.map((country) => country.name)
      : ["Ingen data"];
    barChart.data.datasets[0].data = hasCountries
      ? view.countries.map((country) => country.count)
      : [0];
    barChart.update();

    if (live.trafficTotal > 0) {
      trafficChart.data.labels = ["Privat", "Yrkestrafikk", "Ukjent"];
      trafficChart.data.datasets[0].data = [view.privat, view.yrkes, view.ukjent];
      trafficChart.data.datasets[0].backgroundColor = [THEME.blue, THEME.emerald, THEME.gray];
    } else {
      trafficChart.data.labels = ["Ingen data"];
      trafficChart.data.datasets[0].data = [1];
      trafficChart.data.datasets[0].backgroundColor = [`${THEME.foreground}33`];
    }
    trafficChart.update();

    if (live.carTotal > 0) {
      carTypeChart.data.labels = view.carTypes.map((item) => item.label);
      carTypeChart.data.datasets[0].data = view.carTypes.map((item) => item.count);
      carTypeChart.data.datasets[0].backgroundColor = CAR_PALETTE;
    } else {
      carTypeChart.data.labels = ["Ingen data"];
      carTypeChart.data.datasets[0].data = [1];
      carTypeChart.data.datasets[0].backgroundColor = [`${THEME.foreground}33`];
    }
    carTypeChart.update();
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    timeChart.destroy();
    barChart.destroy();
    trafficChart.destroy();
    carTypeChart.destroy();
  }

  return { update, destroy };
}
