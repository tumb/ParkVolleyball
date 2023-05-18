import { StandingProp } from "@/pages/standings";
import { useEffect, useState } from "react";
import StandingsTable from "./UI/StandingsTable";
import { supabase } from "@/lib/supabase";
import { Waveform } from "@uiball/loaders";

export default function StandingsWrapper() {
  const [standings, setStandings] = useState<StandingProp[] | null>([]);
  const [loading, setLoading] = useState(false);

  async function getStandingData() {

    setLoading(true);
    const { data, error } = await supabase.rpc("calculate_standings4");

    if (data) {
      setLoading(false);

      setStandings(data);
    } else {
      console.error(error);
    }
  }

  useEffect(() => {
    getStandingData();
  }, []);

  return (
    <div>
      {/* <pre>{JSON.stringify(standings, null, 2)}</pre> */}
      {loading ? (
        <div className="flex w-full items-center justify-center p-24">
          <Waveform size={40} lineWeight={3.5} speed={1} color="black" />
        </div>
      ) : (
        <StandingsTable standings={standings} />
      )}
    </div>
  );
}
