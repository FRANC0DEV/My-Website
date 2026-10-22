import getElement from "../../utils/getElement";

/** Design space the wind coordinates were authored for (original 900x600). */
const DESIGN_WIDTH = 900;
const DESIGN_HEIGHT = 600;

/** Fade in/out windows (seconds) so gusts never pop abruptly. */
const FADE_IN = 0.3;
const FADE_OUT = 0.4;

/** Cap the device pixel ratio to keep fill-rate sane on 3x screens. */
const MAX_DPR = 2;

interface WindConfig {
  x: number;
  y: number;
  startTime: number;
  duration: number;
  loopInterval: number;
  scale: number;
  strokeWidth: number;
  strokeColor: string;
}

interface Point {
  x: number;
  y: number;
}

interface WindInstance {
  config: WindConfig;
  /** Path points in design space (computed once). */
  basePoints: Point[];
  /** Path points mapped to current CSS pixels (recomputed on resize). */
  points: Point[];
  /** Cumulative arc-length per point, for constant-speed travel. */
  lengths: number[];
  totalLength: number;
  lineWidth: number;
  trailLength: number;
}

const canvas = getElement("wind-canvas", HTMLCanvasElement);
const ctx = canvas.getContext("2d");

if (ctx === null) {
  throw new Error("Context for wind animation is null");
}

const context: CanvasRenderingContext2D = ctx;

// Define your winds here with configuration
const winds: WindConfig[] = [
  {
    x: 50,
    y: 80,
    startTime: 0,
    duration: 3,
    loopInterval: 10,
    scale: 0.5,
    strokeWidth: 3,
    strokeColor: "#c5c5c5",
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
  },
];

// Function to create path points with scaling and positioning
function getPathPoints(x: number, y: number, scale: number): Point[] {
  const points: Point[] = [];

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

const instances: WindInstance[] = winds.map((config) => {
  const basePoints = getPathPoints(config.x, config.y, config.scale);
  return {
    config,
    basePoints,
    points: basePoints.map((point) => ({ ...point })),
    lengths: [],
    totalLength: 0,
    lineWidth: config.strokeWidth * config.scale,
    trailLength: 0,
  };
});

/** Current canvas size in CSS pixels (drawing happens in this space). */
let cssWidth = 0;
let cssHeight = 0;

/**
 * Map the 900x600 design space onto the real canvas size and precompute
 * arc-lengths. Called on start and on every resize so the composition
 * always fills the hero without stretching artifacts.
 */
function layout() {
  cssWidth = canvas.clientWidth;
  cssHeight = canvas.clientHeight;
  if (cssWidth === 0 || cssHeight === 0) return;

  const scaleX = cssWidth / DESIGN_WIDTH;
  const scaleY = cssHeight / DESIGN_HEIGHT;
  const strokeScale = Math.sqrt(scaleX * scaleY);

  for (const instance of instances) {
    instance.points = instance.basePoints.map((point) => ({
      x: point.x * scaleX,
      y: point.y * scaleY,
    }));

    // Cumulative arc-length so gusts travel at constant speed along curves.
    const lengths: number[] = [0];
    let total = 0;
    for (let i = 1; i < instance.points.length; i++) {
      const dx = instance.points[i].x - instance.points[i - 1].x;
      const dy = instance.points[i].y - instance.points[i - 1].y;
      total += Math.hypot(dx, dy);
      lengths.push(total);
    }
    instance.lengths = lengths;
    instance.totalLength = total;
    instance.lineWidth = Math.max(
      1,
      instance.config.strokeWidth * instance.config.scale * strokeScale,
    );
    // The trail covers a bit over half the path: long enough to read as a
    // gust, short enough to keep a clear comet head.
    instance.trailLength = total * 0.55;
  }
}

/** Resize the backing store for the current DPR (crisp lines on HiDPI). */
function resizeBackingStore() {
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  const width = Math.round(cssWidth * dpr);
  const height = Math.round(cssHeight * dpr);
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  // Draw in CSS pixels; touching width/height resets the context transform.
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/** Point at a given arc-length distance along the mapped path. */
function sampleAt(instance: WindInstance, distance: number): Point {
  const { points, lengths, totalLength } = instance;
  const clamped = Math.max(0, Math.min(totalLength, distance));

  // Linear scan is fine: paths are short (~300 points) and precomputed.
  let i = 1;
  while (i < lengths.length - 1 && lengths[i] < clamped) i++;

  const segmentLength = lengths[i] - lengths[i - 1] || 1;
  const t = (clamped - lengths[i - 1]) / segmentLength;
  const from = points[i - 1];
  const to = points[i];
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}

/** Convert "#rrggbb" to an rgba() string for gradient stops. */
function withAlpha(hex: string, alpha: number): string {
  const value = parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

/**
 * Draw one gust as a comet trail: a single stroke whose color fades from
 * transparent at the tail to solid at the head (linear gradient along the
 * visible chord). No background-colored "eraser" is used, so gusts never
 * punch holes through each other and the canvas stays transparent.
 */
function drawTrail(
  instance: WindInstance,
  start: number,
  end: number,
  envelope: number,
) {
  const from = Math.max(0, start);
  const to = Math.min(instance.totalLength, end);
  if (to - from < 0.5) return;

  const color = instance.config.strokeColor;
  const tail = sampleAt(instance, from);
  const head = sampleAt(instance, to);
  const { points, lengths } = instance;

  // Index of the first/last path points inside the visible span.
  let first = 1;
  while (first < lengths.length - 1 && lengths[first] < from) first++;
  let last = first;
  while (last < lengths.length - 1 && lengths[last] < to) last++;

  const gradient = context.createLinearGradient(
    tail.x,
    tail.y,
    head.x,
    head.y,
  );
  gradient.addColorStop(0, withAlpha(color, 0));
  gradient.addColorStop(0.45, withAlpha(color, 0.16));
  gradient.addColorStop(1, withAlpha(color, 0.95));

  context.globalAlpha = envelope;
  context.strokeStyle = gradient;
  context.lineWidth = instance.lineWidth;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(tail.x, tail.y);
  for (let i = first; i <= last && i < points.length; i++) {
    context.lineTo(points[i].x, points[i].y);
  }
  context.lineTo(head.x, head.y);
  context.stroke();

  // Extra-bright tip for a crisp comet head.
  const glowLength = Math.min(instance.lineWidth * 3, (to - from) * 0.2);
  if (glowLength > 0.5) {
    const glowStart = sampleAt(instance, to - glowLength);
    const glowGradient = context.createLinearGradient(
      glowStart.x,
      glowStart.y,
      head.x,
      head.y,
    );
    glowGradient.addColorStop(0, withAlpha(color, 0));
    glowGradient.addColorStop(1, withAlpha(color, 0.9));

    let glowIndex = last;
    while (glowIndex > 1 && lengths[glowIndex] > to - glowLength) glowIndex--;

    context.globalAlpha = 0.5 * envelope;
    context.strokeStyle = glowGradient;
    context.beginPath();
    context.moveTo(glowStart.x, glowStart.y);
    for (let i = glowIndex; i < last && i < points.length; i++) {
      context.lineTo(points[i].x, points[i].y);
    }
    context.lineTo(head.x, head.y);
    context.stroke();
  }

  context.globalAlpha = 1;
}

let elapsed = 0;
let lastTimestamp: number | null = null;
let animationFrameId: number | null = null;
let isRunning = false;

function drawFrame(timestamp: number) {
  // Accumulate time from rAF timestamps (clamped) so hidden tabs or a
  // paused canvas never make the animation jump forward.
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
  lastTimestamp = timestamp;
  elapsed += delta;

  // The canvas is transparent now: it composites over the hero background
  // in any theme instead of covering it with an opaque rectangle.
  context.clearRect(0, 0, cssWidth, cssHeight);

  for (const instance of instances) {
    const { config, totalLength, trailLength } = instance;
    if (totalLength === 0) continue;

    const time = elapsed - config.startTime;
    if (time < 0) continue;

    const cycle = time % config.loopInterval;
    if (cycle > config.duration) continue; // idle gap between gusts

    const fadeIn = Math.min(1, cycle / FADE_IN);
    const fadeOut = Math.min(1, (config.duration - cycle) / FADE_OUT);
    const envelope = Math.min(fadeIn, fadeOut);
    if (envelope <= 0) continue;

    // The head travels the whole path plus the trail length, so every gust
    // fully enters and fully leaves the canvas each cycle.
    const headDistance =
      (cycle / config.duration) * (totalLength + trailLength);
    drawTrail(instance, headDistance - trailLength, headDistance, envelope);
  }

  animationFrameId = requestAnimationFrame(drawFrame);
}

function startLoop() {
  if (isRunning) return;
  isRunning = true;
  lastTimestamp = null;
  animationFrameId = requestAnimationFrame(drawFrame);
}

function pauseLoop() {
  isRunning = false;
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

let visibilityObserver: IntersectionObserver | null = null;
let resizeObserver: ResizeObserver | null = null;

function setupObservers() {
  // Pause whenever the canvas leaves the viewport or becomes hidden (e.g.
  // the window shrinks below the `lg` breakpoint) and resume automatically
  // when it is visible again — no indefinite pause after resizing.
  visibilityObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        startLoop();
      } else {
        pauseLoop();
      }
    }
  });
  visibilityObserver.observe(canvas);

  // Re-map paths and backing store on any resize (window drag, zoom...).
  resizeObserver = new ResizeObserver(() => {
    if (canvas.clientWidth === 0 || canvas.clientHeight === 0) return;
    layout();
    resizeBackingStore();
  });
  resizeObserver.observe(canvas);
}

export default function StartWindAnimation() {
  if (canvas.offsetParent === null) {
    console.log("Wind animation skipped: canvas is not visible");
    return;
  }

  layout();
  resizeBackingStore();
  setupObservers();
  startLoop();
}

// Teardown helper in case the animation needs to be stopped manually
export function stopWindAnimation() {
  pauseLoop();
  visibilityObserver?.disconnect();
  resizeObserver?.disconnect();
  visibilityObserver = null;
  resizeObserver = null;
}
