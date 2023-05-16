import HeroCta from "@/components/UI/HeroCta";
import LeagueForm from "@/components/UI/LeagueForm";
import ScheduleForm from "@/components/UI/ScheduleForm";
import Tabs from "@/components/UI/Tabs";
import UnderLineTabs from "@/components/UI/UnderLineTabs";
import React from "react";

export default function Home() {
  return (
    <div>
      <HeroCta />
      <LeagueForm />
      <UnderLineTabs />
    </div>
  );
}
