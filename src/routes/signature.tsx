import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

export const Route = createFileRoute("/signature")({
  component: RouteComponent,
});

type Point = {
  x: number;
  y: number;
};

type Stroke = {
  points: Point[];
};

const WIDTH = 800;
const HEIGHT = 300;

function RouteComponent() {
  const svgRef = useRef<SVGSVGElement>(null);

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [drawing, setDrawing] = useState(false);

  function getPoint(e: React.PointerEvent<SVGSVGElement>): Point {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const rect = svg.getBoundingClientRect();

    return {
      x: ((e.clientX - rect.left) / rect.width) * WIDTH,
      y: ((e.clientY - rect.top) / rect.height) * HEIGHT,
    };
  }

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    e.preventDefault();

    const svg = svgRef.current;
    if (!svg) return;

    svg.setPointerCapture(e.pointerId);

    const point = getPoint(e);
    setDrawing(true);
    setStrokes((prev) => [...prev, { points: [point] }]);
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!drawing) return;

    const point = getPoint(e);

    setStrokes((prev) => {
      if (prev.length === 0) return prev;

      const next = [...prev];
      const lastStroke = next[next.length - 1];

      next[next.length - 1] = {
        ...lastStroke,
        points: [...lastStroke.points, point],
      };

      return next;
    });
  }

  function endStroke() {
    setDrawing(false);
  }

  function pointsToPath(points: Point[]) {
    if (points.length === 0) return "";

    if (points.length === 1) {
      const p = points[0];
      return `M ${p.x} ${p.y} L ${p.x + 0.01} ${p.y + 0.01}`;
    }

    return `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
  }

  function clear() {
    setStrokes([]);
  }

  function undo() {
    setStrokes((prev) => prev.slice(0, -1));
  }

  function downloadSVG() {
    if (strokes.length === 0) return;

    const PADDING = 8;
    const allPoints = strokes.flatMap((s) => s.points);

    const minX = Math.min(...allPoints.map((p) => p.x));
    const minY = Math.min(...allPoints.map((p) => p.y));
    const maxX = Math.max(...allPoints.map((p) => p.x));
    const maxY = Math.max(...allPoints.map((p) => p.y));

    const width = maxX - minX + PADDING * 2;
    const height = maxY - minY + PADDING * 2;

    const paths = strokes
      .map((stroke) => {
        const d = stroke.points
          .map((p, i) => {
            const x = p.x - minX + PADDING;
            const y = p.y - minY + PADDING;
            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
          })
          .join(" ");

        return `<path
  d="${d}"
  fill="none"
  stroke="black"
  stroke-width="3"
  stroke-linecap="round"
  stroke-linejoin="round"
/>`;
      })
      .join("\n");

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
>
${paths}
</svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "signature.svg";
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-8">
      <div>
        <h2 className="text-3xl font-bold">Capture Signature Tool</h2>
        <p className="mt-2 text-muted-foreground">
          Draw your signature below. When you're done, download it as SVG.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white touch-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="block h-[300px] w-full cursor-crosshair select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          onPointerLeave={endStroke}
        >
          {strokes.map((stroke, i) => (
            <path
              key={i}
              d={pointsToPath(stroke.points)}
              fill="none"
              stroke="black"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={undo}
          disabled={strokes.length === 0}
          className="rounded-lg border px-4 py-2 transition hover:bg-neutral-100 disabled:opacity-50"
        >
          Undo Stroke
        </button>

        <button
          onClick={clear}
          disabled={strokes.length === 0}
          className="rounded-lg border px-4 py-2 transition hover:bg-neutral-100 disabled:opacity-50"
        >
          Erase All
        </button>

        <button
          onClick={downloadSVG}
          disabled={strokes.length === 0}
          className="rounded-lg bg-primary px-4 py-2 text-white transition hover:bg-primary/90 disabled:opacity-50"
        >
          Download SVG
        </button>
      </div>
    </div>
  );
}
