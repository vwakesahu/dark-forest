"use client";
import Globe from "@/components/magicui/globe";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const Page = () => {
  return (
    <div className="h-screen relative bg-background flex flex-col items-center justify-center">
      <img
        src={"/bgimg.png"}
        className="h-full w-full object-cover absolute inset-0 opacity-10"
      />
      <div className="absolute w-screen flex top-0 justify-end z-50 pr-12 mt-6">
        <Button
          variant="expandIcon"
          className="bg-transparent border text-white hover:bg-red-500"
          Icon={LogOutIcon}
          iconPlacement="right"
        >
          0x458..ab123
        </Button>
      </div>

      <div className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10 -mt-56">
        IncoWars
      </div>
      {/* <ShinyButton>Play Now</ShinyButton> */}
      <Link href={"/game"}>
        <Button variant="gooeyRight" className="bg-background mt-6">
          Begin the War
        </Button>
      </Link>

      <div className="absolute w-screen bottom-0">
        <GlobeContainer />
      </div>
    </div>
  );
};

export default Page;

export function GlobeContainer() {
  return (
    <div className="relative flex h-full w-full max-w-screen items-center justify-center overflow-hidden bg-transparent px-40 pb-40 pt-8 md:pb-60">
      <div className="h-28"></div>
      <Globe className="-top-10" />
    </div>
  );
}
