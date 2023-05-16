import Navbar from "@/components/UI/Navbar";
import { LeagueContext } from "@/context/LeagueContext";
import { supabase } from "@/lib/supabase";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

let leagueId: number;

const getLeagueId = async () => {
  let { data: league, error } = await supabase.from("league").select();

  if (error) {
    console.log("🚀 ~ file: _app.tsx:11 ~ error: \n", error);
  } else {
    console.log("🚀 ~ file: _app.tsx:13 ~ league: \n", league);
    // leagueId = league[0].leagueid;
  }
};

getLeagueId();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LeagueContext.Provider value={leagueId}>
      <Navbar />
      <Component {...pageProps} />
    </LeagueContext.Provider>
  );
}
