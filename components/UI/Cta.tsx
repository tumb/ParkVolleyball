import React from "react";
import LeagueForm from "./LeagueForm";
import parkImage from "../assets/park.png";

export default function Cta() {
  return (
    <section className="overflow-hidden bg-[url('../assets/park.png')] bg-cover bg-top bg-no-repeat">

      <LeagueForm />
    </section>
  );
}
