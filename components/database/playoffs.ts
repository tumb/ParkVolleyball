import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

/**
 * New playoff tables only:
 * - bracket
 * - seed
 * - playoff_match
 *
 * Legacy tables (*_old) are intentionally not referenced here.
 */

type NextSlot = Database["public"]["Enums"]["playoff_next_slot"];

export type BracketRow = Database["public"]["Tables"]["bracket"]["Row"];
export type BracketInsert = Database["public"]["Tables"]["bracket"]["Insert"];
export type BracketUpdate = Database["public"]["Tables"]["bracket"]["Update"];

export type DivisionRow = Database["public"]["Tables"]["division"]["Row"];
export type DivisionInsert = Database["public"]["Tables"]["division"]["Insert"];
export type DivisionUpdate = Database["public"]["Tables"]["division"]["Update"];

export type SeedRow = Database["public"]["Tables"]["seed"]["Row"];
export type SeedInsert = Database["public"]["Tables"]["seed"]["Insert"];
export type SeedUpdate = Database["public"]["Tables"]["seed"]["Update"];

export type PlayoffMatchRow =
  Database["public"]["Tables"]["playoff_match"]["Row"];
export type PlayoffMatchInsert =
  Database["public"]["Tables"]["playoff_match"]["Insert"];
export type PlayoffMatchUpdate =
  Database["public"]["Tables"]["playoff_match"]["Update"];

export type TeamRow = Database["public"]["Tables"]["team"]["Row"];
export type TeamUpdate = Database["public"]["Tables"]["team"]["Update"];

export type CreateBracketInput = {
  leagueid: number;
  divisionid: number;
  bracketname?: string | null;
};

export type SeedAssignmentInput = {
  seed: number;
  teamid: number;
};

export type SaveSeedsOptions = {
  force?: boolean;
};

export type CreatePlayoffMatchInput = {
  bracketid: number;
  round: number;
  location: number;
  teamaid?: number | null;
  teambid?: number | null;
  winnerteamid?: number | null;
  is_completed?: boolean;
  nextplayoffmatchid?: number | null;
  nextslot?: NextSlot | null;
};

export type CompletePlayoffMatchInput = {
  playoffmatchid: number;
  winnerteamid: number;
};

export type ClearPlayoffMatchResultInput = {
  playoffmatchid: number;
};

export type PlayoffBracketData = {
  bracket: BracketRow | null;
  seeds: SeedRow[];
  matches: PlayoffMatchRow[];
};

export type TeamDivisionAssignmentInput = {
  teamid: number;
  divisionid: number;
};

export type PlayoffDivisionCapacity = {
  existingDivisions: DivisionRow[];
  desiredDivisionCount: number;
  missingDivisionCount: number;
};

export type EnsurePlayoffDivisionsInput = {
  leagueid: number;
  desiredDivisionCount: number;
  newDivisionNames?: string[];
};

export type DeleteDivisionOptions = {
  force?: boolean;
};

export type DivisionReferenceCounts = {
  teams: number;
  schedules: number;
  brackets: number;
  playoffMatches: number;
};

export type BracketProvisionResult = {
  divisions: DivisionRow[];
  brackets: BracketRow[];
};

type MatchBuildNode = {
  round: number;
  location: number;
  teamaid: number | null;
  teambid: number | null;
  next: {
    round: number;
    location: number;
    slot: NextSlot;
  } | null;
};

function makeMatchKey(round: number, location: number): string {
  return `${round}-${location}`;
}

function largestPowerOfTwoAtMost(n: number): number {
  let p = 1;
  while (p * 2 <= n) {
    p *= 2;
  }
  return p;
}

/**
 * Returns standard fixed-bracket seed positions for a power-of-2 field.
 * Example size 8 -> [1,8,4,5,2,7,3,6]
 */
function buildSeedPositions(size: number): number[] {
  if (size === 1) {
    return [1];
  }

  const previous = buildSeedPositions(size / 2);
  const positions: number[] = [];
  for (const seed of previous) {
    positions.push(seed);
    positions.push(size + 1 - seed);
  }
  return positions;
}

function ensureContiguousSeeds(sortedSeeds: SeedRow[]): void {
  for (let i = 0; i < sortedSeeds.length; i++) {
    const expected = i + 1;
    if (sortedSeeds[i].seed !== expected) {
      throw new Error(
        `Seeds must be contiguous starting at 1. Missing or out-of-order seed near ${expected}.`
      );
    }
  }
}

function sortDivisionsForPlayoffSetup(divisions: DivisionRow[]): DivisionRow[] {
  return [...divisions].sort((a, b) => {
    const valueA = a.divisionvalue ?? 0;
    const valueB = b.divisionvalue ?? 0;
    if (valueB !== valueA) {
      return valueB - valueA;
    }
    return a.divisionid - b.divisionid;
  });
}

async function requireDivisionInLeague(
  leagueid: number,
  divisionid: number
): Promise<DivisionRow> {
  const { data, error } = await supabase
    .from("division")
    .select()
    .eq("leagueid", leagueid)
    .eq("divisionid", divisionid)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error(
      `Division ${divisionid} was not found in league ${leagueid}. Refusing to continue with a missing division reference.`
    );
  }

  return data;
}

export async function findDivisionsForLeagueRaw(leagueid: number): Promise<DivisionRow[]> {
  const { data, error } = await supabase
    .from("division")
    .select()
    .eq("leagueid", leagueid);

  if (error) {
    throw error;
  }

  return sortDivisionsForPlayoffSetup(data ?? []);
}

export async function createBracket(input: CreateBracketInput): Promise<BracketRow> {
  const { data, error } = await supabase
    .from("bracket")
    .insert({
      leagueid: input.leagueid,
      divisionid: input.divisionid,
      bracketname: input.bracketname ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function findBracketByLeagueDivision(
  leagueid: number,
  divisionid: number
): Promise<BracketRow | null> {
  const { data, error } = await supabase
    .from("bracket")
    .select()
    .eq("leagueid", leagueid)
    .eq("divisionid", divisionid)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
}

export async function findBracketsForLeague(leagueid: number): Promise<BracketRow[]> {
  const { data, error } = await supabase
    .from("bracket")
    .select()
    .eq("leagueid", leagueid)
    .order("divisionid", { ascending: true });

  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function getPlayoffDivisionCapacity(
  leagueid: number,
  desiredDivisionCount: number
): Promise<PlayoffDivisionCapacity> {
  if (desiredDivisionCount < 2 || desiredDivisionCount > 4) {
    throw new Error("desiredDivisionCount must be 2, 3, or 4.");
  }

  const existingDivisions = await findDivisionsForLeagueRaw(leagueid);
  return {
    existingDivisions,
    desiredDivisionCount,
    missingDivisionCount: Math.max(0, desiredDivisionCount - existingDivisions.length),
  };
}

export async function ensurePlayoffDivisionsForLeague(
  input: EnsurePlayoffDivisionsInput
): Promise<DivisionRow[]> {
  const capacity = await getPlayoffDivisionCapacity(
    input.leagueid,
    input.desiredDivisionCount
  );

  if (capacity.missingDivisionCount === 0) {
    return capacity.existingDivisions.slice(0, input.desiredDivisionCount);
  }

  const providedNames = input.newDivisionNames ?? [];
  if (providedNames.length < capacity.missingDivisionCount) {
    throw new Error(
      `Need ${capacity.missingDivisionCount} new division names, but received ${providedNames.length}.`
    );
  }

  const maxDivisionValue = capacity.existingDivisions.reduce((maxValue, division) => {
    const divisionValue = division.divisionvalue ?? 0;
    return Math.max(maxValue, divisionValue);
  }, 0);

  let nextDivisionValue = maxDivisionValue > 0 ? maxDivisionValue * 2 : 1;
  const newDivisionsToInsert: DivisionInsert[] = [];
  for (let i = 0; i < capacity.missingDivisionCount; i++) {
    const divisionName = providedNames[i]?.trim();
    if (!divisionName) {
      throw new Error(`Missing or empty division name for new division #${i + 1}.`);
    }

    newDivisionsToInsert.push({
      leagueid: input.leagueid,
      divisionname: divisionName,
      divisionvalue: nextDivisionValue,
    });
    nextDivisionValue *= 2;
  }

  const { error } = await supabase.from("division").insert(newDivisionsToInsert);
  if (error) {
    throw error;
  }

  const refreshedDivisions = await findDivisionsForLeagueRaw(input.leagueid);
  if (refreshedDivisions.length < capacity.existingDivisions.length) {
    throw new Error(
      `Division count decreased unexpectedly for league ${input.leagueid} (${capacity.existingDivisions.length} -> ${refreshedDivisions.length}). Blocking automatic recovery to avoid silent data mutation.`
    );
  }
  return refreshedDivisions.slice(0, input.desiredDivisionCount);
}

export async function countDivisionReferences(
  leagueid: number,
  divisionid: number
): Promise<DivisionReferenceCounts> {
  await requireDivisionInLeague(leagueid, divisionid);

  const [{ count: teamCount, error: teamError }, { count: scheduleCount, error: scheduleError }, { count: bracketCount, error: bracketError }] =
    await Promise.all([
      supabase
        .from("team")
        .select("teamid", { count: "exact", head: true })
        .eq("leagueid", leagueid)
        .eq("divisionid", divisionid),
      supabase
        .from("schedule")
        .select("scheduleid", { count: "exact", head: true })
        .eq("leagueid", leagueid)
        .eq("divisionid", divisionid),
      supabase
        .from("bracket")
        .select("bracketid", { count: "exact", head: true })
        .eq("leagueid", leagueid)
        .eq("divisionid", divisionid),
    ]);

  if (teamError) {
    throw teamError;
  }
  if (scheduleError) {
    throw scheduleError;
  }
  if (bracketError) {
    throw bracketError;
  }

  const { data: bracketRows, error: bracketRowsError } = await supabase
    .from("bracket")
    .select("bracketid")
    .eq("leagueid", leagueid)
    .eq("divisionid", divisionid);
  if (bracketRowsError) {
    throw bracketRowsError;
  }

  const bracketIds = (bracketRows ?? []).map((row) => row.bracketid);
  let playoffMatchCount = 0;
  if (bracketIds.length > 0) {
    const { count, error } = await supabase
      .from("playoff_match")
      .select("playoffmatchid", { count: "exact", head: true })
      .in("bracketid", bracketIds);
    if (error) {
      throw error;
    }
    playoffMatchCount = count ?? 0;
  }

  return {
    teams: teamCount ?? 0,
    schedules: scheduleCount ?? 0,
    brackets: bracketCount ?? 0,
    playoffMatches: playoffMatchCount,
  };
}

export async function deleteDivisionForLeague(
  leagueid: number,
  divisionid: number,
  options?: DeleteDivisionOptions
): Promise<void> {
  if (options?.force !== true) {
    throw new Error(
      `CONFIRMATION_REQUIRED: Deleting division ${divisionid} in league ${leagueid} is destructive. Re-submit with force=true and only after dependency checks.`
    );
  }

  const refs = await countDivisionReferences(leagueid, divisionid);
  if (
    refs.teams > 0 ||
    refs.schedules > 0 ||
    refs.brackets > 0 ||
    refs.playoffMatches > 0
  ) {
    throw new Error(
      `DIVISION_DELETE_BLOCKED: division ${divisionid} in league ${leagueid} is still referenced (team=${refs.teams}, schedule=${refs.schedules}, bracket=${refs.brackets}, playoff_match=${refs.playoffMatches}).`
    );
  }

  const { error } = await supabase
    .from("division")
    .delete()
    .eq("leagueid", leagueid)
    .eq("divisionid", divisionid);
  if (error) {
    throw error;
  }
}

export async function createBracketsForDivisions(
  leagueid: number,
  divisionids: number[]
): Promise<BracketRow[]> {
  if (divisionids.length === 0) {
    return [];
  }

  const createdOrExisting: BracketRow[] = [];
  for (const divisionid of divisionids) {
    const existing = await findBracketByLeagueDivision(leagueid, divisionid);
    if (existing) {
      createdOrExisting.push(existing);
      continue;
    }

    const { data: division, error: divisionError } = await supabase
      .from("division")
      .select()
      .eq("divisionid", divisionid)
      .eq("leagueid", leagueid)
      .maybeSingle();
    if (divisionError) {
      throw divisionError;
    }
    if (!division) {
      throw new Error(
        `Division ${divisionid} was not found in league ${leagueid}; cannot create bracket.`
      );
    }

    const created = await createBracket({
      leagueid,
      divisionid,
      bracketname: division.divisionname ?? null,
    });
    createdOrExisting.push(created);
  }

  return createdOrExisting.sort((a, b) => a.divisionid - b.divisionid);
}

export async function createPlayoffBracketsForLeague(
  input: EnsurePlayoffDivisionsInput
): Promise<BracketProvisionResult> {
  const divisions = await ensurePlayoffDivisionsForLeague(input);
  const divisionids = divisions.map((division) => division.divisionid);
  const brackets = await createBracketsForDivisions(input.leagueid, divisionids);
  return { divisions, brackets };
}

export async function saveTeamPlayoffDivisionAssignments(
  assignments: TeamDivisionAssignmentInput[]
): Promise<TeamRow[]> {
  if (assignments.length === 0) {
    return [];
  }

  const updatedTeams: TeamRow[] = [];
  for (const assignment of assignments) {
    const { data: existingTeam, error: existingTeamError } = await supabase
      .from("team")
      .select("teamid,leagueid")
      .eq("teamid", assignment.teamid)
      .maybeSingle();
    if (existingTeamError) {
      throw existingTeamError;
    }
    if (!existingTeam) {
      throw new Error(`Team ${assignment.teamid} was not found.`);
    }

    await requireDivisionInLeague(existingTeam.leagueid, assignment.divisionid);

    const { data, error } = await supabase
      .from("team")
      .update({ divisionid: assignment.divisionid } as TeamUpdate)
      .eq("teamid", assignment.teamid)
      .select()
      .single();
    if (error) {
      throw error;
    }
    updatedTeams.push(data);
  }

  return updatedTeams;
}

export async function assignSeeds(
  bracketid: number,
  seeds: SeedAssignmentInput[],
  options?: SaveSeedsOptions
): Promise<SeedRow[]> {
  if (seeds.length === 0) {
    return [];
  }

  const { data: existingMatches, error: existingMatchesError } = await supabase
    .from("playoff_match")
    .select("playoffmatchid")
    .eq("bracketid", bracketid)
    .limit(1);
  if (existingMatchesError) {
    throw existingMatchesError;
  }
  if ((existingMatches ?? []).length > 0 && options?.force !== true) {
    throw new Error(
      `CONFIRMATION_REQUIRED: Playoff matches already exist for bracket ${bracketid}. Saving seeds now may make existing matches inconsistent. Re-submit with force=true to continue.`
    );
  }

  const payload: SeedInsert[] = seeds.map((seed) => ({
    bracketid,
    seed: seed.seed,
    teamid: seed.teamid,
  }));

  const { data, error } = await supabase
    .from("seed")
    .upsert(payload, { onConflict: "bracketid,seed" })
    .select();

  if (error) {
    throw error;
  }

  const seededRows = data ?? [];
  seededRows.sort((a, b) => a.seed - b.seed);
  return seededRows;
}

export async function saveSeedsForBracket(
  bracketid: number,
  seeds: SeedAssignmentInput[],
  options?: SaveSeedsOptions
): Promise<SeedRow[]> {
  return assignSeeds(bracketid, seeds, options);
}

export async function saveSeedsForLeagueDivision(
  leagueid: number,
  divisionid: number,
  seeds: SeedAssignmentInput[],
  options?: SaveSeedsOptions
): Promise<SeedRow[]> {
  const bracket = await findBracketByLeagueDivision(leagueid, divisionid);
  if (!bracket) {
    throw new Error(
      `No bracket exists for league ${leagueid} and division ${divisionid}.`
    );
  }
  return assignSeeds(bracket.bracketid, seeds, options);
}

export async function findSeedsForBracket(bracketid: number): Promise<SeedRow[]> {
  const { data, error } = await supabase
    .from("seed")
    .select()
    .eq("bracketid", bracketid)
    .order("seed", { ascending: true });

  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function createPlayoffMatches(
  matches: CreatePlayoffMatchInput[]
): Promise<PlayoffMatchRow[]> {
  if (matches.length === 0) {
    return [];
  }

  const payload: PlayoffMatchInsert[] = matches.map((match) => ({
    bracketid: match.bracketid,
    round: match.round,
    location: match.location,
    teamaid: match.teamaid ?? null,
    teambid: match.teambid ?? null,
    winnerteamid: match.winnerteamid ?? null,
    is_completed: match.is_completed ?? false,
    nextplayoffmatchid: match.nextplayoffmatchid ?? null,
    nextslot: match.nextslot ?? null,
  }));

  const { data, error } = await supabase
    .from("playoff_match")
    .insert(payload)
    .select();

  if (error) {
    throw error;
  }

  const inserted = data ?? [];
  inserted.sort((a, b) => {
    if (a.round !== b.round) {
      return a.round - b.round;
    }
    return a.location - b.location;
  });
  return inserted;
}

export async function findPlayoffMatchesForBracket(
  bracketid: number
): Promise<PlayoffMatchRow[]> {
  const { data, error } = await supabase
    .from("playoff_match")
    .select()
    .eq("bracketid", bracketid)
    .order("round", { ascending: true })
    .order("location", { ascending: true });

  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function findPlayoffBracketData(
  bracketid: number
): Promise<PlayoffBracketData> {
  const { data: bracket, error: bracketError } = await supabase
    .from("bracket")
    .select()
    .eq("bracketid", bracketid)
    .maybeSingle();

  if (bracketError) {
    throw bracketError;
  }

  const [seeds, matches] = await Promise.all([
    findSeedsForBracket(bracketid),
    findPlayoffMatchesForBracket(bracketid),
  ]);

  return {
    bracket,
    seeds,
    matches,
  };
}

export async function completePlayoffMatch(
  input: CompletePlayoffMatchInput
): Promise<PlayoffMatchRow> {
  const { data: currentMatch, error: currentMatchError } = await supabase
    .from("playoff_match")
    .select()
    .eq("playoffmatchid", input.playoffmatchid)
    .maybeSingle();

  if (currentMatchError) {
    throw currentMatchError;
  }
  if (!currentMatch) {
    throw new Error(`playoff_match ${input.playoffmatchid} not found.`);
  }

  const winnerIsParticipant =
    currentMatch.teamaid === input.winnerteamid ||
    currentMatch.teambid === input.winnerteamid;
  if (!winnerIsParticipant) {
    throw new Error(
      `winnerteamid ${input.winnerteamid} must match teamaid or teambid for match ${input.playoffmatchid}.`
    );
  }

  if (currentMatch.is_completed) {
    throw new Error(`playoff_match ${input.playoffmatchid} is already completed.`);
  }

  if (currentMatch.nextplayoffmatchid == null) {
    const { data: updatedCurrentMatch, error: updateCurrentMatchError } = await supabase
      .from("playoff_match")
      .update({
        winnerteamid: input.winnerteamid,
        is_completed: true,
      })
      .eq("playoffmatchid", input.playoffmatchid)
      .eq("is_completed", false)
      .select()
      .single();

    if (updateCurrentMatchError) {
      throw updateCurrentMatchError;
    }
    return updatedCurrentMatch;
  }

  if (currentMatch.nextslot == null) {
    throw new Error(
      `playoff_match ${input.playoffmatchid} has nextplayoffmatchid but nextslot is null.`
    );
  }

  const { data: nextMatch, error: nextMatchError } = await supabase
    .from("playoff_match")
    .select()
    .eq("playoffmatchid", currentMatch.nextplayoffmatchid)
    .maybeSingle();

  if (nextMatchError) {
    throw nextMatchError;
  }
  if (!nextMatch) {
    throw new Error(
      `next playoff_match ${currentMatch.nextplayoffmatchid} not found.`
    );
  }

  if (nextMatch.bracketid !== currentMatch.bracketid) {
    throw new Error(
      `Invalid next match linkage: playoff_match ${input.playoffmatchid} and ${nextMatch.playoffmatchid} are in different brackets.`
    );
  }

  if (nextMatch.is_completed) {
    throw new Error(
      `Cannot advance winner: next playoff_match ${nextMatch.playoffmatchid} is already completed.`
    );
  }

  if (currentMatch.nextslot === "A") {
    if (nextMatch.teamaid != null && nextMatch.teamaid !== input.winnerteamid) {
      throw new Error(
        `Cannot place winner in teamaid for playoff_match ${nextMatch.playoffmatchid}: slot already occupied by a different team.`
      );
    }
  } else if (currentMatch.nextslot === "B") {
    if (nextMatch.teambid != null && nextMatch.teambid !== input.winnerteamid) {
      throw new Error(
        `Cannot place winner in teambid for playoff_match ${nextMatch.playoffmatchid}: slot already occupied by a different team.`
      );
    }
  } else {
    throw new Error(
      `Unsupported nextslot value "${currentMatch.nextslot}" on playoff_match ${input.playoffmatchid}.`
    );
  }

  const { data: updatedCurrentMatch, error: updateCurrentMatchError } = await supabase
    .from("playoff_match")
    .update({
      winnerteamid: input.winnerteamid,
      is_completed: true,
    })
    .eq("playoffmatchid", input.playoffmatchid)
    .eq("is_completed", false)
    .select()
    .single();

  if (updateCurrentMatchError) {
    throw updateCurrentMatchError;
  }

  try {
    if (currentMatch.nextslot === "A") {
      const { error } = await supabase
        .from("playoff_match")
        .update({ teamaid: input.winnerteamid })
        .eq("playoffmatchid", nextMatch.playoffmatchid)
        .eq("is_completed", false);
      if (error) {
        throw error;
      }
    } else {
      const { error } = await supabase
        .from("playoff_match")
        .update({ teambid: input.winnerteamid })
        .eq("playoffmatchid", nextMatch.playoffmatchid)
        .eq("is_completed", false);
      if (error) {
        throw error;
      }
    }
  } catch (advanceError) {
    // Best-effort compensation: revert current match if downstream placement fails.
    await supabase
      .from("playoff_match")
      .update({
        winnerteamid: null,
        is_completed: false,
      })
      .eq("playoffmatchid", input.playoffmatchid);
    throw advanceError;
  }

  return updatedCurrentMatch;
}

export async function clearPlayoffMatchResult(
  input: ClearPlayoffMatchResultInput
): Promise<PlayoffMatchRow> {
  const { data: currentMatch, error: currentMatchError } = await supabase
    .from("playoff_match")
    .select()
    .eq("playoffmatchid", input.playoffmatchid)
    .maybeSingle();

  if (currentMatchError) {
    throw currentMatchError;
  }
  if (!currentMatch) {
    throw new Error(`playoff_match ${input.playoffmatchid} not found.`);
  }

  if (currentMatch.winnerteamid == null && !currentMatch.is_completed) {
    return currentMatch;
  }

  if (currentMatch.nextplayoffmatchid != null) {
    const { data: nextMatch, error: nextMatchError } = await supabase
      .from("playoff_match")
      .select()
      .eq("playoffmatchid", currentMatch.nextplayoffmatchid)
      .maybeSingle();

    if (nextMatchError) {
      throw nextMatchError;
    }
    if (!nextMatch) {
      throw new Error(
        `next playoff_match ${currentMatch.nextplayoffmatchid} not found.`
      );
    }

    if (nextMatch.bracketid !== currentMatch.bracketid) {
      throw new Error(
        `Invalid next match linkage: playoff_match ${input.playoffmatchid} and ${nextMatch.playoffmatchid} are in different brackets.`
      );
    }

    if (nextMatch.is_completed) {
      throw new Error(
        `Cannot clear playoff_match ${input.playoffmatchid}: next playoff_match ${nextMatch.playoffmatchid} is already completed.`
      );
    }

    if (currentMatch.nextslot == null) {
      throw new Error(
        `playoff_match ${input.playoffmatchid} has nextplayoffmatchid but nextslot is null.`
      );
    }

    let clearedNextSlot = false;

    if (
      currentMatch.nextslot === "A" &&
      currentMatch.winnerteamid != null &&
      nextMatch.teamaid === currentMatch.winnerteamid
    ) {
      const { error } = await supabase
        .from("playoff_match")
        .update({ teamaid: null })
        .eq("playoffmatchid", nextMatch.playoffmatchid);
      if (error) {
        throw error;
      }
      clearedNextSlot = true;
    }

    if (
      currentMatch.nextslot === "B" &&
      currentMatch.winnerteamid != null &&
      nextMatch.teambid === currentMatch.winnerteamid
    ) {
      const { error } = await supabase
        .from("playoff_match")
        .update({ teambid: null })
        .eq("playoffmatchid", nextMatch.playoffmatchid);
      if (error) {
        throw error;
      }
      clearedNextSlot = true;
    }

    const { data: clearedMatch, error: clearCurrentMatchError } = await supabase
      .from("playoff_match")
      .update({
        winnerteamid: null,
        is_completed: false,
      })
      .eq("playoffmatchid", input.playoffmatchid)
      .select()
      .single();

    if (clearCurrentMatchError) {
      // Best-effort compensation: restore next slot if we removed it.
      if (clearedNextSlot && currentMatch.winnerteamid != null) {
        if (currentMatch.nextslot === "A") {
          await supabase
            .from("playoff_match")
            .update({ teamaid: currentMatch.winnerteamid })
            .eq("playoffmatchid", nextMatch.playoffmatchid)
            .eq("is_completed", false);
        } else if (currentMatch.nextslot === "B") {
          await supabase
            .from("playoff_match")
            .update({ teambid: currentMatch.winnerteamid })
            .eq("playoffmatchid", nextMatch.playoffmatchid)
            .eq("is_completed", false);
        }
      }
      throw clearCurrentMatchError;
    }

    return clearedMatch;
  }

  const { data: clearedMatch, error: clearCurrentMatchError } = await supabase
    .from("playoff_match")
    .update({
      winnerteamid: null,
      is_completed: false,
    })
    .eq("playoffmatchid", input.playoffmatchid)
    .select()
    .single();

  if (clearCurrentMatchError) {
    throw clearCurrentMatchError;
  }
  return clearedMatch;
}

/**
 * Generates deterministic single-elimination structure for an existing bracket.
 * - Power-of-2 teams: standard seeded bracket.
 * - Non-power-of-2 teams: play-in matches + byes.
 *
 * This function only creates structure and next-match links.
 * It does not propagate winners or include any score logic.
 */
export async function generateBracketStructure(
  bracketid: number
): Promise<PlayoffMatchRow[]> {
  const seeds = await findSeedsForBracket(bracketid);
  if (seeds.length < 2) {
    throw new Error("At least two seeded teams are required to generate a bracket.");
  }

  const sortedSeeds = [...seeds].sort((a, b) => a.seed - b.seed);
  ensureContiguousSeeds(sortedSeeds);

  const existingMatches = await findPlayoffMatchesForBracket(bracketid);
  if (existingMatches.length > 0) {
    throw new Error(
      `Bracket ${bracketid} already has ${existingMatches.length} playoff matches. Clear them before generating.`
    );
  }

  const teamBySeed = new Map<number, number>();
  for (const seed of sortedSeeds) {
    teamBySeed.set(seed.seed, seed.teamid);
  }

  const n = sortedSeeds.length;
  const p = largestPowerOfTwoAtMost(n);
  const preliminaryMatchCount = n - p;
  const hasPlayIns = preliminaryMatchCount > 0;
  const directMainSlots = hasPlayIns ? 2 * p - n : p;
  const firstMainRound = hasPlayIns ? 2 : 1;

  const nodes: MatchBuildNode[] = [];
  const nodeByKey = new Map<string, MatchBuildNode>();
  const playInMatchKeyByMainSlotSeed = new Map<number, string>();

  function addNode(node: MatchBuildNode): string {
    const key = makeMatchKey(node.round, node.location);
    nodes.push(node);
    nodeByKey.set(key, node);
    return key;
  }

  // Round 1 play-ins for non-power-of-2 fields.
  // Example n=10: direct slots=6, slot seeds 7 and 8 come from:
  // 7v10 and 8v9.
  if (hasPlayIns) {
    for (let i = 0; i < preliminaryMatchCount; i++) {
      const slotSeed = directMainSlots + 1 + i;
      const lowerSeed = n - i;
      const teamaid = teamBySeed.get(slotSeed) ?? null;
      const teambid = teamBySeed.get(lowerSeed) ?? null;

      if (teamaid == null || teambid == null) {
        throw new Error(
          `Missing team assignment for play-in seeds ${slotSeed} and/or ${lowerSeed}.`
        );
      }

      const key = addNode({
        round: 1,
        location: i + 1,
        teamaid,
        teambid,
        next: null,
      });

      playInMatchKeyByMainSlotSeed.set(slotSeed, key);
    }
  }

  // Main bracket seed positions in standard fixed-bracket order.
  const positions = buildSeedPositions(p);
  const firstMainRoundKeys: string[] = [];

  for (let i = 0; i < p / 2; i++) {
    const seedA = positions[2 * i];
    const seedB = positions[2 * i + 1];

    let teamaid: number | null = null;
    let teambid: number | null = null;
    let feederAKey: string | null = null;
    let feederBKey: string | null = null;

    if (seedA <= directMainSlots) {
      teamaid = teamBySeed.get(seedA) ?? null;
    } else {
      feederAKey = playInMatchKeyByMainSlotSeed.get(seedA) ?? null;
    }

    if (seedB <= directMainSlots) {
      teambid = teamBySeed.get(seedB) ?? null;
    } else {
      feederBKey = playInMatchKeyByMainSlotSeed.get(seedB) ?? null;
    }

    const mainMatch: MatchBuildNode = {
      round: firstMainRound,
      location: i + 1,
      teamaid,
      teambid,
      next: null,
    };

    const mainKey = addNode(mainMatch);
    firstMainRoundKeys.push(mainKey);

    if (feederAKey) {
      const feeder = nodeByKey.get(feederAKey);
      if (feeder) {
        feeder.next = {
          round: mainMatch.round,
          location: mainMatch.location,
          slot: "A",
        };
      }
    }
    if (feederBKey) {
      const feeder = nodeByKey.get(feederBKey);
      if (feeder) {
        feeder.next = {
          round: mainMatch.round,
          location: mainMatch.location,
          slot: "B",
        };
      }
    }
  }

  // Build later main rounds and connect feeders.
  let feederRoundKeys = firstMainRoundKeys;
  let round = firstMainRound + 1;
  while (feederRoundKeys.length > 1) {
    const nextRoundKeys: string[] = [];

    for (let i = 0; i < feederRoundKeys.length; i += 2) {
      const feederA = feederRoundKeys[i];
      const feederB = feederRoundKeys[i + 1];
      if (!feederA || !feederB) {
        throw new Error("Invalid bracket generation state: feeder pair missing.");
      }

      const nextLocation = i / 2 + 1;
      const nextMatch: MatchBuildNode = {
        round,
        location: nextLocation,
        teamaid: null,
        teambid: null,
        next: null,
      };
      const nextKey = addNode(nextMatch);
      nextRoundKeys.push(nextKey);

      const feederANode = nodeByKey.get(feederA);
      const feederBNode = nodeByKey.get(feederB);
      if (!feederANode || !feederBNode) {
        throw new Error("Invalid bracket generation state: feeder node not found.");
      }

      feederANode.next = { round, location: nextLocation, slot: "A" };
      feederBNode.next = { round, location: nextLocation, slot: "B" };
    }

    feederRoundKeys = nextRoundKeys;
    round++;
  }

  nodes.sort((a, b) => {
    if (a.round !== b.round) {
      return a.round - b.round;
    }
    return a.location - b.location;
  });

  const inserts: PlayoffMatchInsert[] = nodes.map((node) => ({
    bracketid,
    round: node.round,
    location: node.location,
    teamaid: node.teamaid,
    teambid: node.teambid,
    winnerteamid: null,
    is_completed: false,
    nextplayoffmatchid: null,
    nextslot: null,
  }));

  const { data: insertedRows, error: insertError } = await supabase
    .from("playoff_match")
    .insert(inserts)
    .select();

  if (insertError) {
    throw insertError;
  }

  const createdRows = insertedRows ?? [];
  const idByKey = new Map<string, number>();
  for (const row of createdRows) {
    idByKey.set(makeMatchKey(row.round, row.location), row.playoffmatchid);
  }

  for (const node of nodes) {
    if (!node.next) {
      continue;
    }

    const currentId = idByKey.get(makeMatchKey(node.round, node.location));
    const nextId = idByKey.get(makeMatchKey(node.next.round, node.next.location));
    if (!currentId || !nextId) {
      throw new Error("Unable to map generated matches to inserted match IDs.");
    }

    const { error } = await supabase
      .from("playoff_match")
      .update({
        nextplayoffmatchid: nextId,
        nextslot: node.next.slot,
      })
      .eq("playoffmatchid", currentId);
    if (error) {
      throw error;
    }
  }

  return findPlayoffMatchesForBracket(bracketid);
}
