import Navbar from "@/components/UI/Navbar";
import { LeagueContext, LeagueProp } from "@/context/LeagueContext";
import "@/styles/globals.css";
import "@/styles/layouts.css" ; 
import type { AppProps } from "next/app";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  const [league, setLeague] = useState<LeagueProp>({
    day: "Monday",
    year: 2023,
  });

  return (
    <LeagueContext.Provider
      value={{
        league: league,
        onUpdate: (value: LeagueProp) => {
          setLeague(value);
        },
      }}
    >
      <Toaster />
      <Navbar />
      <Component {...pageProps} />
    </LeagueContext.Provider>
  );
}
