"use client";
import Canvas from "@/components/canvas";
import PlanetCanvas from "@/components/planet-canvas";
import React from "react";

const Page = () => {
  return (
    <div className="flex items-center justify-center h-screen relative">
      <img src="canvas.gif" className="absolute h-screen w-screen opacity-10" />
      {/* <PlanetCanvas /> */}
      <Canvas />
    </div>
  );
};

export default Page;
