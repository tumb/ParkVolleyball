import DynamicTeamWrapper from "@/components/teamRecords/DynamicTeamWrapper";
import { useRouter } from "next/router";

export default function TeamPage() {
  const router = useRouter();
  const { team, teamId } = router.query;

  return (
    <div>
      {teamId && (
        <DynamicTeamWrapper routerTeamName={team?.toString()} teamId={teamId} />
      )}
    </div>
  );
}
