import Navbar from "@/components/UI/Navbar";
import { LeagueContext, LeagueProp } from "@/context/LeagueContext";
import { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useState } from "react";
import { Toaster } from "react-hot-toast";



export default function App({ Component, pageProps }: AppProps) {
  const [league, setLeague] = useState<LeagueProp>();

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
