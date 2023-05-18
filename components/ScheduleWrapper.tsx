import { Waveform } from "@uiball/loaders";
import React from "react";
import { PacmanLoader } from "react-spinners";

export default function ScheduleWrapper() {
  return (
    <div>
      <div className="flex w-full items-center justify-center p-24">

        <Waveform size={40} lineWeight={3.5} speed={1} color="black" />
      </div>
    </div>
  );
}
