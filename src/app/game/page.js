"use client";
import Canvas from "@/components/canvas";
import PlanetCanvas from "@/components/planet-canvas";
import React from "react";

const Page = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      {/* <PlanetCanvas /> */}
      <Canvas />
    </div>
  );
};

export default Page;