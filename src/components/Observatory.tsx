"use client";

import { useEffect, useRef } from "react";
import { initRender } from "@/lib/render";

export default function Observatory() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initRender(canvasRef.current!);
  }, []);

  return <canvas className="" ref={canvasRef} height={100} width={100} />;
}
