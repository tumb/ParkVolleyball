import StandingsTable from "@/components/UI/StandingsTable";
import { supabase } from "@/lib/supabase";
import React from "react";

type StandingProp = {
  teamname: string;
  total: number;
};

export default function standings({
  standings,
}: {
  standings: StandingProp[];
}) {
  return (
    <div>
      {/* <pre>{JSON.stringify(standings, null, 2)}</pre> */}
      <StandingsTable standings={standings} />
    </div>
  );
}

export async function getServerSideProps() {
  const { data, error } = await supabase.rpc("calculate_standings4");

  if (error) {
    console.error(error);
    return {
      props: {
        standings: error,
      },
    };
  }

  return {
    props: {
      standings: data,
    },
  };
}
