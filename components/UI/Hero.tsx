import React, { useState } from "react";
import UnderLineTabs from "./UnderLineTabs";
import StandingsWrapper from "../StandingsWrapper";
import ScheduleWrapper from "../ScheduleWrapper";

export default function Hero() {
  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [standingsOpen, setStandingsOpen] = useState(false);
  return (
    <div className="">
      <UnderLineTabs
        setScheduleOpen={setScheduleOpen}
        setStandingsOpen={setStandingsOpen}
        standingsOpen={standingsOpen}
        scheduleOpen={scheduleOpen}
      />
      {scheduleOpen && <ScheduleWrapper />}
      {standingsOpen && <StandingsWrapper />}
    </div>
  );
}
