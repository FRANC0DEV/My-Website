import type { BrowserTheme } from "../../types/theme";
import getElement from "../../utils/getElement";
import getTheme from "../../utils/getTheme";

interface WindAnimation {
  x: number;
  y: number;
  startTime: number;
  duration: number;
  loopInterval: number;
  scale: number;
  strokeWidth: number;
  strokeColor: string;
  strokeColorDark?: string; // Optional dark theme color
}

interface Point {
  x: number;
  y: number;
}

interface WindData extends WindAnimation {
  pathPoints: Point[];
}

const canvas = getElement("wind-canvas", HTMLCanvasElement);

const ctx = canvas.getContext("2d");

if (ctx === null) {
  throw new Error("Context for wind animation is null");
}

// Define your winds here with configuration
const winds: WindAnimation[] = [
  {
    x: 50,
    y: 80,
    startTime: 0,
    duration: 3,
    loopInterval: 10,
    scale: 0.5,
    strokeWidth: 3,
    strokeColor: "#c5c5c5", // Light theme
    strokeColorDark: "#323232", // Dark theme
  },
  {
    x: 150,
    y: 200,
    startTime: 4,
    duration: 3,
    loopInterval: 10,
    scale: 0.5,
    strokeWidth: 3,
    strokeColor: "#b7b7b7",
    strokeColorDark: "#252525",
  },
  {
    x: 600,
    y: 400,
    startTime: 6,
    duration: 2.5,
    loopInterval: 2.8,
    scale: 0.5,
    strokeWidth: 2.5,
    strokeColor: "#b7b7b7",
    strokeColorDark: "#555555",
  },
  {
    x: 500,
    y: 450,
    startTime: 9,
    duration: 3.5,
    loopInterval: 4,
    scale: 0.5,
    strokeWidth: 3.5,
    strokeColor: "#b7b7b7",
    strokeColorDark: "#555555",
  },
  {
    x: 650,
    y: 250,
    startTime: 12,
    duration: 2,
    loopInterval: 3.2,
    scale: 0.5,
    strokeWidth: 2,
    strokeColor: "#b7b7b7",
    strokeColorDark: "#555555",
  },
  {
    x: 100,
    y: 500,
    startTime: 2,
    duration: 1.7,
    loopInterval: 2.8,
    scale: 0.5,
    strokeWidth: 2.5,
    strokeColor: "#b7b7b7",
    strokeColorDark: "#555555",
  },
  {
    x: 100,
    y: 350,
    startTime: 1.5,
    duration: 1.5,
    loopInterval: 2.8,
    scale: 0.5,
    strokeWidth: 2.5,
    strokeColor: "#b7b7b7",
    strokeColorDark: "#555555",
  },
  {
    x: 750,
    y: 150,
    startTime: 4,
    duration: 4,
    loopInterval: 5,
    scale: 0.5,
    strokeWidth: 2.5,
    strokeColor: "#b7b7b7",
    strokeColorDark: "#555555",
  },
  {
    x: 700,
    y: 50,
    startTime: 1.8,
    duration: 3,
    loopInterval: 4,
    scale: 0.5,
    strokeWidth: 2.5,
    strokeColor: "#b7b7b7",
    strokeColorDark: "#555555",
  },
];

// Function to create path points with scaling and positioning
function getPathPoints(x: number, y: number, scale: number): Point[] {
  const points = [];

  // Base control points (relative to origin)
  const baseControlPoints = [
    { x: 0, y: 0 },
    { x: 60, y: -12 },
    { x: 120, y: 10 },
    { x: 213, y: 0 },
  ];

  // Scale and position the control points
  const scaledControlPoints = baseControlPoints.map((point) => ({
    x: x + point.x * scale,
    y: y + point.y * scale,
  }));

  // Generate smooth curve points using Catmull-Rom spline
  for (let i = 0; i < scaledControlPoints.length - 1; i++) {
    const p0 = scaledControlPoints[Math.max(0, i - 1)];
    const p1 = scaledControlPoints[i];
    const p2 = scaledControlPoints[i + 1];
    const p3 =
      scaledControlPoints[Math.min(scaledControlPoints.length - 1, i + 2)];

    // Catmull-Rom spline
    for (let t = 0; t <= 1; t += 0.01) {
      const t2 = t * t;
      const t3 = t2 * t;

      const q =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

      const r =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

      points.push({ x: q, y: r });
    }
  }

  return points;
}

// Pre-calculate path points for each wind
const windData = winds.map((wind) => ({
  ...wind,
  pathPoints: getPathPoints(wind.x, wind.y, wind.scale),
}));

let globalStartTime = Date.now();

function getBackgroundColor(theme: BrowserTheme): string {
  return theme === "dark" ? "#1a1a1a" : "#faf9f9";
}

function getEraserColor(theme: BrowserTheme): string {
  return theme === "dark" ? "#1a1a1a" : "#faf9f9";
}

function drawWind(windInfo: WindData, progress: number, theme: BrowserTheme) {
  const totalCycleDuration = windInfo.loopInterval;
  const cycleProgress = progress / totalCycleDuration;

  if (cycleProgress > windInfo.duration / windInfo.loopInterval) {
    return;
  }

  const pathPoints = windInfo.pathPoints;
  const lineWidth = (windInfo.strokeWidth || 3) * windInfo.scale;
  const eraserWidth = (windInfo.strokeWidth || 3) * windInfo.scale * 6.67;

  // Choose color based on theme
  const strokeColor =
    theme === "dark" && windInfo.strokeColorDark
      ? windInfo.strokeColorDark
      : windInfo.strokeColor;

  const animProgress =
    cycleProgress / (windInfo.duration / windInfo.loopInterval);

  const eraserColor = getEraserColor(theme);

  if (animProgress <= 0.5) {
    // Drawing phase
    const drawProgress = animProgress * 2;
    const particleIndex = Math.floor(drawProgress * (pathPoints.length - 1));

    // Front layer with custom color (no background layers since you eliminated them)
    ctx!.strokeStyle = strokeColor;
    ctx!.lineWidth = lineWidth;
    ctx!.lineCap = "round";
    ctx!.lineJoin = "round";
    ctx!.beginPath();
    ctx!.moveTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 1; i <= particleIndex && i < pathPoints.length; i++) {
      ctx!.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    ctx!.stroke();

    // Draw eraser trail
    const eraserTrailStart = Math.max(0, particleIndex - 5);
    ctx!.strokeStyle = eraserColor;
    ctx!.lineWidth = eraserWidth;
    ctx!.lineCap = "round";
    ctx!.lineJoin = "round";
    ctx!.beginPath();
    ctx!.moveTo(pathPoints[eraserTrailStart].x, pathPoints[eraserTrailStart].y);
    for (let i = eraserTrailStart + 1; i <= particleIndex; i++) {
      ctx!.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    ctx!.stroke();
  } else if (animProgress <= 1) {
    // Erasing phase
    const eraseProgress = (animProgress - 0.5) * 2;
    const eraseStartIndex = Math.floor(eraseProgress * (pathPoints.length - 1));

    // Front layer with custom color
    ctx!.strokeStyle = strokeColor;
    ctx!.lineWidth = lineWidth;
    ctx!.lineCap = "round";
    ctx!.lineJoin = "round";
    ctx!.beginPath();
    ctx!.moveTo(pathPoints[eraseStartIndex].x, pathPoints[eraseStartIndex].y);
    for (let i = eraseStartIndex + 1; i < pathPoints.length; i++) {
      ctx!.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    ctx!.stroke();
  }
}

export default function StartWindAnimation() {
  if (canvas.style.display === "hidden") {
    return;
  }

  const theme = getTheme();
  const backgroundColor = getBackgroundColor(theme);

  const elapsed = (Date.now() - globalStartTime) / 1000;

  // Clear canvas with theme-appropriate background
  ctx!.fillStyle = backgroundColor;
  ctx!.fillRect(0, 0, canvas.width, canvas.height);

  // Draw each wind
  windData.forEach((windInfo) => {
    if (elapsed >= windInfo.startTime) {
      const windElapsed = elapsed - windInfo.startTime;
      const windProgress = windElapsed % windInfo.loopInterval;
      drawWind(windInfo, windProgress, theme);
    }
  });

  requestAnimationFrame(StartWindAnimation);
}
