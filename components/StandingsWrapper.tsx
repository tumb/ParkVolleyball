import { StandingProp } from "@/pages/standings";
import { useContext, useEffect, useState } from "react";
import StandingsTable from "./UI/StandingsTable";
import { supabase } from "@/lib/supabase";
import { Waveform } from "@uiball/loaders";
import { LeagueContext } from "@/context/LeagueContext";

export default function StandingsWrapper() {
  const [standings, setStandings] = useState<StandingProp[] | null>([]);
  const [loading, setLoading] = useState(false);
  const leagueCtx = useContext(LeagueContext);

  async function getStandingData() {
    setLoading(true);

    if (leagueCtx.league?.leagueid === undefined) {
      return;
    }

    const { data, error } = await supabase.rpc("calculate_standings", {
      leagueid: leagueCtx.league?.leagueid,
    });

    if (data?.length) {
      setLoading(false);

      setStandings(data);
    } else if (data?.length === 0) {
      setLoading(false);
      setStandings(null);
    } else {
      console.error(error);
    }
  }

  useEffect(() => {
    getStandingData();
  }, [leagueCtx]);

  return (
    <div className="">
      {leagueCtx.league?.leagueid === undefined ? (
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 ">
          <div className="mx-auto max-w-lg">
            <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">
              Please select a league first!
            </h1>
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="flex w-full items-center justify-center p-24">
              <Waveform size={40} lineWeight={3.5} speed={1} color="black" />
            </div>
          ) : (
            <>
              <StandingsTable standings={standings} />
            </>
          )}
        </>
      )}
    </div>
  );
}
