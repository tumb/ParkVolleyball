import Hero from "@/components/UI/Hero";
import HeroCta from "@/components/UI/Hero";
import LeagueForm from "@/components/UI/LeagueForm";
import ScheduleForm from "@/components/UI/ScheduleForm";
import Tabs from "@/components/UI/Tabs";
import UnderLineTabs from "@/components/UI/UnderLineTabs";
import React from "react";

export default function Home() {
  return (
    <div>
      <LeagueForm />
      <Hero />
    </div>
  );
}
