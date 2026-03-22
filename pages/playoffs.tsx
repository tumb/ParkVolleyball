import React, { useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LeagueContext } from "@/context/LeagueContext";
import {
  findDatesForLeague,
  findOutTeamsForLeagueAndDate,
  findRegularSeasonStandingsForLeague,
  findTeamsForLeague,
  type RegularSeasonStandingRow,
} from "@/components/database/fetches";
import {
  createPlayoffBracketsForLeague,
  findBracketsForLeague,
  findPlayoffBracketData,
  findDivisionsForLeagueRaw,
  generateBracketStructure,
  saveSeedsForBracket,
  saveTeamPlayoffDivisionAssignments,
  type BracketRow,
  type DivisionRow,
  type PlayoffBracketData,
  type TeamDivisionAssignmentInput,
  type TeamRow,
} from "@/components/database/playoffs";

type PlayoffDivisionCount = 2 | 3 | 4;
type ProposedDivisionSlot = 1 | 2 | 3 | 4;
type ProposalDivisionSlotEntry = {
  slot: ProposedDivisionSlot;
  division: DivisionRow | null;
};

const SLOT_THEME: Record<ProposedDivisionSlot, { name: string; color: string }> = {
  1: { name: "Red", color: "#b91c1c" },
  2: { name: "Green", color: "#166534" },
  3: { name: "Blue", color: "#1d4ed8" },
  4: { name: "Purple", color: "#7e22ce" },
};

function normalizeLabel(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function targetWeekdayForLeagueDay(day: string | null | undefined): number {
  const normalized = normalizeLabel(day);
  if (normalized.includes("thursday")) {
    return 4;
  }
  return 1;
}

function alignToWeekdayOnOrAfter(date: Date, targetWeekday: number): Date {
  const offset = (targetWeekday - date.getDay() + 7) % 7;
  return addDays(date, offset);
}

function buildPlayoffDateOptions(defaultDate: string, count: number = 10): string[] {
  const start = parseDateOnly(defaultDate);
  const options: string[] = [];
  for (let i = 0; i < count; i++) {
    options.push(formatDateOnly(addDays(start, i * 7)));
  }
  return options;
}

function isByeTeam(team: Pick<TeamRow, "teamname">): boolean {
  const normalizedName = normalizeLabel(team.teamname);
  return normalizedName === "bye" || normalizedName.startsWith("bye ");
}

function detectSlotFromDivisionName(name: string | null | undefined): ProposedDivisionSlot | null {
  const normalized = normalizeLabel(name);
  if (normalized.includes("red")) {
    return 1;
  }
  if (normalized.includes("green")) {
    return 2;
  }
  if (normalized.includes("blue")) {
    return 3;
  }
  if (normalized.includes("purple")) {
    return 4;
  }
  return null;
}

function sortDivisionsByValueDescending(divisions: DivisionRow[]): DivisionRow[] {
  return [...divisions].sort((a, b) => {
    const valueA = a.divisionvalue ?? Number.NEGATIVE_INFINITY;
    const valueB = b.divisionvalue ?? Number.NEGATIVE_INFINITY;
    if (valueB !== valueA) {
      return valueB - valueA;
    }
    return a.divisionid - b.divisionid;
  });
}

function buildProposalDivisionSlots(
  existingDivisions: DivisionRow[],
  desiredDivisionCount: PlayoffDivisionCount
): ProposalDivisionSlotEntry[] {
  const slots: ProposalDivisionSlotEntry[] = [];
  for (let i = 0; i < desiredDivisionCount; i++) {
    slots.push({
      slot: (i + 1) as ProposedDivisionSlot,
      division: null,
    });
  }

  const usedDivisionIds = new Set<number>();
  for (const division of existingDivisions) {
    const detectedSlot = detectSlotFromDivisionName(division.divisionname);
    if (!detectedSlot || detectedSlot > desiredDivisionCount) {
      continue;
    }
    const slotEntry = slots[detectedSlot - 1];
    if (!slotEntry.division) {
      slotEntry.division = division;
      usedDivisionIds.add(division.divisionid);
    }
  }

  const remainingDivisions = sortDivisionsByValueDescending(
    existingDivisions.filter((division) => !usedDivisionIds.has(division.divisionid))
  );
  const openSlots = slots.filter((entry) => entry.division == null);
  for (let i = 0; i < remainingDivisions.length && i < openSlots.length; i++) {
    openSlots[i].division = remainingDivisions[i];
  }

  return slots;
}

function buildStandingsOrderedTeamIds(
  standings: RegularSeasonStandingRow[],
  teamsInLeagueForSetup: TeamRow[]
): number[] {
  const pointsByTeamId = new Map<number, number>();
  for (const row of standings) {
    pointsByTeamId.set(row.teamid, row.totalpoints);
  }

  const ranked = [...teamsInLeagueForSetup].sort((a, b) => {
    const pointsA = pointsByTeamId.get(a.teamid) ?? 0;
    const pointsB = pointsByTeamId.get(b.teamid) ?? 0;
    if (pointsB !== pointsA) {
      return pointsB - pointsA;
    }
    return (a.teamname ?? "").localeCompare(b.teamname ?? "");
  });

  return ranked.map((team) => team.teamid);
}

function buildProposedDivisionAssignmentsFromStandings(
  orderedTeamIds: number[],
  desiredDivisionCount: PlayoffDivisionCount
): Map<number, ProposedDivisionSlot> {
  const map = new Map<number, ProposedDivisionSlot>();
  if (orderedTeamIds.length === 0) {
    return map;
  }

  for (let index = 0; index < orderedTeamIds.length; index++) {
    const slotIndex = Math.floor((index * desiredDivisionCount) / orderedTeamIds.length);
    const slot = Math.min(desiredDivisionCount - 1, slotIndex) + 1;
    map.set(orderedTeamIds[index], slot as ProposedDivisionSlot);
  }

  return map;
}

export default function PlayoffsAdmin() {
  const leagueCtx = useContext(LeagueContext);

  const [desiredDivisionCount, setDesiredDivisionCount] = useState<PlayoffDivisionCount>(3);
  const [allDivisions, setAllDivisions] = useState<DivisionRow[]>([]);
  const [allBrackets, setAllBrackets] = useState<BracketRow[]>([]);
  const [selectedDivisionSlot, setSelectedDivisionSlot] = useState<ProposedDivisionSlot>(1);

  const [teamsInLeague, setTeamsInLeague] = useState<TeamRow[]>([]);
  const [scheduleDates, setScheduleDates] = useState<string[]>([]);
  const [selectedPlayoffDate, setSelectedPlayoffDate] = useState<string>("");
  const [playoffDateOptions, setPlayoffDateOptions] = useState<string[]>([]);
  const [outTeamIdSet, setOutTeamIdSet] = useState<Set<number>>(new Set());
  const [standingsRows, setStandingsRows] = useState<RegularSeasonStandingRow[]>([]);
  const [savedDivisionByTeamId, setSavedDivisionByTeamId] = useState<Map<number, number>>(
    new Map()
  );
  const [proposedDivisionByTeamId, setProposedDivisionByTeamId] = useState<
    Map<number, ProposedDivisionSlot>
  >(new Map());

  const [playoffData, setPlayoffData] = useState<PlayoffBracketData | null>(null);
  const [seedByTeamId, setSeedByTeamId] = useState<Map<number, string>>(new Map());
  const [pendingForceSeedPayload, setPendingForceSeedPayload] = useState<
    { bracketid: number; seeds: { seed: number; teamid: number }[] } | null
  >(null);

  const [newDivisionNameBySlot, setNewDivisionNameBySlot] = useState<
    Map<ProposedDivisionSlot, string>
  >(new Map());
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasManuallyChangedDivisionCount, setHasManuallyChangedDivisionCount] = useState<boolean>(false);

  const standingsByTeamId = useMemo(() => {
    const map = new Map<number, number>();
    for (const standing of standingsRows) {
      map.set(standing.teamid, standing.totalpoints);
    }
    return map;
  }, [standingsRows]);

  const byeTeamIdSet = useMemo(() => {
    const ids = new Set<number>();
    for (const team of teamsInLeague) {
      if (isByeTeam(team)) {
        ids.add(team.teamid);
      }
    }
    return ids;
  }, [teamsInLeague]);

  const teamsInLeagueForSetup = useMemo(
    () => teamsInLeague.filter((team) => !byeTeamIdSet.has(team.teamid) && !outTeamIdSet.has(team.teamid)),
    [byeTeamIdSet, outTeamIdSet, teamsInLeague]
  );

  const standingsRowsForSetup = useMemo(
    () => standingsRows.filter((standing) => !byeTeamIdSet.has(standing.teamid)),
    [byeTeamIdSet, standingsRows]
  );

  const standingsOrderedTeamIds = useMemo(
    () => buildStandingsOrderedTeamIds(standingsRowsForSetup, teamsInLeagueForSetup),
    [standingsRowsForSetup, teamsInLeagueForSetup]
  );

  const proposalDivisionSlots = useMemo(() => {
    return buildProposalDivisionSlots(allDivisions, desiredDivisionCount);
  }, [allDivisions, desiredDivisionCount]);

  const missingSlots = useMemo(
    () => proposalDivisionSlots.filter((entry) => entry.division == null).map((entry) => entry.slot),
    [proposalDivisionSlots]
  );

  const selectedSlotDivision = useMemo(() => {
    return proposalDivisionSlots.find((slot) => slot.slot === selectedDivisionSlot)?.division ?? null;
  }, [proposalDivisionSlots, selectedDivisionSlot]);

  const selectedBracket = useMemo(() => {
    if (!selectedSlotDivision) {
      return null;
    }
    return allBrackets.find((bracket) => bracket.divisionid === selectedSlotDivision.divisionid) ?? null;
  }, [allBrackets, selectedSlotDivision]);

  const teamsForSelectedDivision = useMemo(() => {
    return teamsInLeagueForSetup
      .filter(
        (team) => proposedDivisionByTeamId.get(team.teamid) === selectedDivisionSlot
      )
      .sort((a, b) => {
        const pointsA = standingsByTeamId.get(a.teamid) ?? 0;
        const pointsB = standingsByTeamId.get(b.teamid) ?? 0;
        if (pointsB !== pointsA) {
          return pointsB - pointsA;
        }
        return (a.teamname ?? "").localeCompare(b.teamname ?? "");
      });
  }, [proposedDivisionByTeamId, selectedDivisionSlot, standingsByTeamId, teamsInLeagueForSetup]);

  async function loadLeagueData(leagueid: number, applyDefaultDivisionCountForLeague: boolean = false) {
    setIsLoading(true);
    setErrorMessage("");
    setWarningMessage("");
    setStatusMessage("");
    try {
      const [divisions, teams, dates, standings, brackets] = await Promise.all([
        findDivisionsForLeagueRaw(leagueid),
        findTeamsForLeague(leagueid),
        findDatesForLeague(leagueid),
        findRegularSeasonStandingsForLeague(leagueid),
        findBracketsForLeague(leagueid),
      ]);
      setAllDivisions(divisions);
      setTeamsInLeague(teams as TeamRow[]);
      setScheduleDates(dates);
      setStandingsRows(standings);
      setAllBrackets(brackets);

      const savedAssignmentMap = new Map<number, number>();
      for (const team of teams) {
        savedAssignmentMap.set(team.teamid, team.divisionid ?? 0);
      }
      setSavedDivisionByTeamId(savedAssignmentMap);

      if (applyDefaultDivisionCountForLeague) {
        const setupTeamCount = (teams as TeamRow[]).filter((team) => !isByeTeam(team)).length;
        const nextDefaultCount: PlayoffDivisionCount = setupTeamCount > 17 ? 3 : 2;
        setDesiredDivisionCount(nextDefaultCount);
        setHasManuallyChangedDivisionCount(false);
      }
    } catch (error: any) {
      setErrorMessage(`Failed to load playoff setup data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const leagueid = leagueCtx.league.leagueid;
    if (!leagueid || leagueid <= 0) {
      setAllDivisions([]);
      setAllBrackets([]);
      setSelectedDivisionSlot(1);
      setTeamsInLeague([]);
      setScheduleDates([]);
      setSelectedPlayoffDate("");
      setPlayoffDateOptions([]);
      setOutTeamIdSet(new Set());
      setStandingsRows([]);
      setSavedDivisionByTeamId(new Map());
      setProposedDivisionByTeamId(new Map());
      setNewDivisionNameBySlot(new Map());
      setPlayoffData(null);
      setSeedByTeamId(new Map());
      setHasManuallyChangedDivisionCount(false);
      setStatusMessage("Select a league to configure playoffs.");
      return;
    }

    loadLeagueData(leagueid, true);
  }, [leagueCtx.league.leagueid]);

  useEffect(() => {
    const targetWeekday = targetWeekdayForLeagueDay(leagueCtx.league.day ?? null);
    const sortedDates = [...scheduleDates].sort((a, b) => a.localeCompare(b));
    const lastScheduledDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : "";

    let defaultDate = "";
    if (lastScheduledDate) {
      const nextWeekBase = addDays(parseDateOnly(lastScheduledDate), 7);
      defaultDate = formatDateOnly(alignToWeekdayOnOrAfter(nextWeekBase, targetWeekday));
    } else {
      const oneWeekFromNow = addDays(new Date(), 7);
      defaultDate = formatDateOnly(alignToWeekdayOnOrAfter(oneWeekFromNow, targetWeekday));
    }

    const options = buildPlayoffDateOptions(defaultDate);
    setPlayoffDateOptions(options);
    setSelectedPlayoffDate((current) => (current && options.includes(current) ? current : defaultDate));
  }, [leagueCtx.league.day, scheduleDates]);

  useEffect(() => {
    async function loadOutTeams() {
      const leagueid = leagueCtx.league.leagueid;
      if (!leagueid || leagueid <= 0 || !selectedPlayoffDate) {
        setOutTeamIdSet(new Set());
        return;
      }

      try {
        const outTeamIds = await findOutTeamsForLeagueAndDate(leagueid, selectedPlayoffDate);
        setOutTeamIdSet(new Set(outTeamIds));
      } catch (error: any) {
        setErrorMessage(`Failed to load Team Out data for playoff date: ${error.message}`);
        setOutTeamIdSet(new Set());
      }
    }

    loadOutTeams();
  }, [leagueCtx.league.leagueid, selectedPlayoffDate]);

  useEffect(() => {
    setSelectedDivisionSlot((current) => {
      const clamped = Math.max(1, Math.min(desiredDivisionCount, current));
      return clamped as ProposedDivisionSlot;
    });
  }, [desiredDivisionCount]);

  useEffect(() => {
    setNewDivisionNameBySlot((previous) => {
      const next = new Map<ProposedDivisionSlot, string>();
      for (const slot of missingSlots) {
        const existing = (previous.get(slot) ?? "").trim();
        const defaultName = SLOT_THEME[slot]?.name ?? `Division ${slot}`;
        next.set(slot, existing.length > 0 ? existing : defaultName);
      }
      return next;
    });
  }, [missingSlots]);

  useEffect(() => {
    const nextProposal = buildProposedDivisionAssignmentsFromStandings(
      standingsOrderedTeamIds,
      desiredDivisionCount
    );
    setProposedDivisionByTeamId(nextProposal);
  }, [desiredDivisionCount, standingsOrderedTeamIds]);

  useEffect(() => {
    async function loadBracketData() {
      if (!selectedBracket) {
        setPlayoffData(null);
        return;
      }
      try {
        setPlayoffData(null);
        const data = await findPlayoffBracketData(selectedBracket.bracketid);
        setPlayoffData(data);
      } catch (error: any) {
        setErrorMessage(`Failed to load bracket data: ${error.message}`);
      }
    }

    loadBracketData();
  }, [selectedBracket?.bracketid]);

  useEffect(() => {
    const newSeedMap = new Map<number, string>();
    for (const team of teamsForSelectedDivision) {
      newSeedMap.set(team.teamid, "");
    }

    const savedSeeds = playoffData?.seeds ?? [];
    if (savedSeeds.length > 0) {
      for (const seedRow of savedSeeds) {
        newSeedMap.set(seedRow.teamid, String(seedRow.seed));
      }
    } else {
      teamsForSelectedDivision.forEach((team, index) => {
        newSeedMap.set(team.teamid, String(index + 1));
      });
    }
    setSeedByTeamId(newSeedMap);
    setPendingForceSeedPayload(null);
    setWarningMessage("");
  }, [selectedDivisionSlot, teamsForSelectedDivision, playoffData?.seeds, playoffData?.bracket?.bracketid]);

  function formatTeamLabel(teamid: number | null): string {
    if (teamid == null) {
      return "TBD";
    }
    const team = teamsInLeague.find((t) => t.teamid === teamid);
    if (!team) {
      return `Unknown Team (id ${teamid})`;
    }
    if (isByeTeam(team)) {
      return "BYE";
    }
    return `${team.teamname ?? "Unknown"} (id ${teamid})`;
  }

  function formatDivisionLabel(slot: ProposedDivisionSlot): string {
    const slotEntry = proposalDivisionSlots.find((entry) => entry.slot === slot);
    const slotName = SLOT_THEME[slot]?.name ?? `Division ${slot}`;
    if (!slotEntry) {
      return `${slotName} (proposed)`;
    }

    if (slotEntry.division) {
      return `${slotName} Division (id ${slotEntry.division.divisionid})`;
    }

    const proposedName = (newDivisionNameBySlot.get(slot) ?? "").trim();
    return `${proposedName || slotName} (proposed)`;
  }

  function getDivisionColor(slot: ProposedDivisionSlot): string {
    return SLOT_THEME[slot]?.color ?? "#334155";
  }

  function onDesiredDivisionCountChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextCount = parseInt(e.target.value, 10);
    if (nextCount === 2 || nextCount === 3 || nextCount === 4) {
      setDesiredDivisionCount(nextCount);
      setHasManuallyChangedDivisionCount(true);
      setStatusMessage("");
      setWarningMessage("");
      setErrorMessage("");
    }
  }

  function onNewDivisionNameChange(slot: ProposedDivisionSlot, value: string) {
    const next = new Map(newDivisionNameBySlot);
    next.set(slot, value);
    setNewDivisionNameBySlot(next);
  }

  function onTeamDivisionChange(teamid: number, slot: ProposedDivisionSlot) {
    const next = new Map(proposedDivisionByTeamId);
    next.set(teamid, slot);
    setProposedDivisionByTeamId(next);
  }

  async function onSaveDivisionAssignments() {
    const leagueid = leagueCtx.league.leagueid;
    if (!leagueid || leagueid <= 0) {
      setErrorMessage("Select a league before saving division assignments.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      setWarningMessage("");
      setStatusMessage("");

      const namesForCreate = missingSlots.map((slot) => {
        return (newDivisionNameBySlot.get(slot) ?? SLOT_THEME[slot]?.name ?? `Division ${slot}`).trim();
      });

      const provisioned = await createPlayoffBracketsForLeague({
        leagueid,
        desiredDivisionCount,
        newDivisionNames: namesForCreate.length > 0 ? namesForCreate : undefined,
      });
      const savedDivisionSlots = buildProposalDivisionSlots(provisioned.divisions, desiredDivisionCount);
      const savedDivisionIdBySlot = new Map<ProposedDivisionSlot, number>();
      for (const slotEntry of savedDivisionSlots) {
        if (slotEntry.division) {
          savedDivisionIdBySlot.set(slotEntry.slot, slotEntry.division.divisionid);
        }
      }

      const assignments: TeamDivisionAssignmentInput[] = teamsInLeagueForSetup.map((team) => {
        const proposedSlot = proposedDivisionByTeamId.get(team.teamid);
        if (!proposedSlot) {
          throw new Error(
            `Team ${team.teamname ?? "Unknown"} (id ${team.teamid}) has no proposed playoff division assignment.`
          );
        }

        const targetDivisionId = savedDivisionIdBySlot.get(proposedSlot);
        if (!targetDivisionId) {
          throw new Error(
            `No saved division exists for proposed slot ${proposedSlot}.`
          );
        }

        return {
          teamid: team.teamid,
          divisionid: targetDivisionId,
        };
      });

      await saveTeamPlayoffDivisionAssignments(assignments);

      await loadLeagueData(leagueid);
      setStatusMessage("Division assignments saved, including any required division/bracket creation.");
    } catch (error: any) {
      setErrorMessage(`Save Division Assignments failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  function onSeedChange(teamid: number, value: string) {
    const next = new Map(seedByTeamId);
    next.set(teamid, value);
    setSeedByTeamId(next);
  }

  function buildSeedsPayloadForSelectedDivision(): { seed: number; teamid: number }[] {
    const payload: { seed: number; teamid: number }[] = [];

    for (const team of teamsForSelectedDivision) {
      const raw = (seedByTeamId.get(team.teamid) ?? "").trim();
      if (raw.length === 0) {
        continue;
      }
      const parsed = parseInt(raw, 10);
      if (Number.isNaN(parsed) || parsed <= 0) {
        throw new Error(
          `Invalid seed "${raw}" for ${team.teamname ?? "Unknown"} (id ${team.teamid}).`
        );
      }
      payload.push({ seed: parsed, teamid: team.teamid });
    }

    const uniqueSeeds = new Set(payload.map((item) => item.seed));
    if (uniqueSeeds.size !== payload.length) {
      throw new Error("Seed numbers must be unique within a bracket.");
    }

    return payload;
  }

  async function onSaveSeeds(force: boolean) {
    if (!selectedBracket) {
      setErrorMessage("No saved bracket exists for the selected proposed division slot.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      setStatusMessage("");

      const seedsPayload =
        force && pendingForceSeedPayload
          ? pendingForceSeedPayload.seeds
          : buildSeedsPayloadForSelectedDivision();

      await saveSeedsForBracket(selectedBracket.bracketid, seedsPayload, { force });

      const refreshed = await findPlayoffBracketData(selectedBracket.bracketid);
      setPlayoffData(refreshed);
      setPendingForceSeedPayload(null);
      setWarningMessage("");
      setStatusMessage(force ? "Seeds force-saved." : "Seeds saved.");
    } catch (error: any) {
      const message = error?.message ?? "Unknown error";
      if (!force && message.includes("CONFIRMATION_REQUIRED")) {
        try {
          const payload = buildSeedsPayloadForSelectedDivision();
          setPendingForceSeedPayload({
            bracketid: selectedBracket.bracketid,
            seeds: payload,
          });
        } catch {
          // If payload can't be rebuilt, keep warning but no force payload.
        }
        setWarningMessage(message);
      } else {
        setErrorMessage(`Save Seeds failed: ${message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const generateMatchesDisabledReason = useMemo(() => {
    if (!selectedBracket) {
      return "Select a saved bracket/division first.";
    }
    const savedSeedCount = playoffData?.seeds?.length ?? 0;
    if (savedSeedCount < 2) {
      return "At least 2 saved seeds are required before generating matches.";
    }
    const existingMatchCount = playoffData?.matches?.length ?? 0;
    if (existingMatchCount > 0) {
      return "Matches already exist for this bracket.";
    }
    return "";
  }, [playoffData?.matches?.length, playoffData?.seeds?.length, selectedBracket]);

  async function onGenerateMatches() {
    if (!selectedBracket) {
      setErrorMessage("No saved bracket exists for the selected division.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      setWarningMessage("");
      setStatusMessage("");

      const latestData = await findPlayoffBracketData(selectedBracket.bracketid);
      const savedSeedCount = latestData.seeds.length;
      const existingMatchCount = latestData.matches.length;

      if (savedSeedCount < 2) {
        setErrorMessage("Generate Matches requires at least 2 saved seeds for this bracket.");
        return;
      }
      if (existingMatchCount > 0) {
        setWarningMessage(
          `Matches already exist for bracket ${selectedBracket.bracketid}; generation was not run.`
        );
        return;
      }

      await generateBracketStructure(selectedBracket.bracketid);

      const refreshed = await findPlayoffBracketData(selectedBracket.bracketid);
      setPlayoffData(refreshed);
      setStatusMessage(`Generated ${refreshed.matches.length} playoff matches for bracket ${selectedBracket.bracketid}.`);
    } catch (error: any) {
      setErrorMessage(`Generate Matches failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <style>
        {`
          :root {
            --ink-main: #162238;
            --surface-main: #f7fafc;
            --surface-card: #ffffff;
            --line-soft: #d7e1ef;
            --accent: #1767a8;
            --accent-soft: #d9ebf8;
            --status-ok: #0f766e;
            --status-warn: #9a5c00;
            --status-error: #b91c1c;
          }
          .link-button {
            display: inline-block;
            padding: 10px 20px;
            margin: 5px;
            background-color: var(--accent-soft);
            border: 1px solid #b5d3ec;
            text-decoration: none;
            font-weight: bold;
            color: var(--ink-main);
            border-radius: 5px;
            width: 220px;
            text-align: center;
            cursor: pointer;
          }
          #container {
            max-width: 1180px;
            margin: 10px auto;
            padding: 10px;
            border-radius: 8px;
            background: linear-gradient(180deg, #f7fbff 0%, #eef4fb 100%);
            color: var(--ink-main);
          }
          #controls, #section-card {
            background-color: var(--surface-card);
            border: 1px solid var(--line-soft);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 14px;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
            max-width: 1040px;
            margin-left: auto;
            margin-right: auto;
          }
          #status {
            margin-bottom: 10px;
            color: var(--status-ok);
            font-weight: 600;
          }
          #warning {
            margin-bottom: 10px;
            color: var(--status-warn);
            font-weight: 600;
          }
          #error {
            margin-bottom: 10px;
            color: var(--status-error);
            font-weight: 600;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 12px;
            background-color: var(--surface-main);
          }
          th, td {
            border: 1px solid var(--line-soft);
            padding: 6px;
            text-align: left;
          }
          th {
            background-color: #edf5fd;
            font-weight: 700;
          }
          .inline-input {
            margin-right: 8px;
            margin-bottom: 8px;
          }
          .small-button {
            padding: 5px 10px;
            margin-right: 8px;
            margin-top: 5px;
            background-color: var(--accent-soft);
            border: 1px solid #b5d3ec;
            border-radius: 4px;
            color: var(--ink-main);
            cursor: pointer;
          }
          .danger-button {
            padding: 5px 10px;
            margin-top: 5px;
            background-color: #f3c4a0;
            border: 1px solid #dea67a;
            border-radius: 4px;
            color: #4a260b;
            cursor: pointer;
          }
          .team-name {
            font-weight: 600;
          }
          .division-pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            color: #fff;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.01em;
          }
          .division-radio-wrap {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .division-radio-option {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 8px;
            border-radius: 999px;
            border: 1px solid var(--line-soft);
            background-color: #fff;
          }
          .division-radio-option input {
            margin: 0;
          }
          .division-radio-label {
            font-size: 12px;
            font-weight: 700;
          }
          .subtle-line {
            color: #334155;
          }
          .control-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
          }
          .control-item {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            border: 1px solid var(--line-soft);
            border-radius: 6px;
            background-color: #f8fbff;
          }
          .control-label {
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
            white-space: nowrap;
          }
          .control-item select,
          .control-item input {
            min-width: 120px;
            border: 1px solid #bfd4ea;
            border-radius: 5px;
            padding: 4px 6px;
            background: #fff;
            color: var(--ink-main);
          }
          .actions-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
          }
          .table-wrap {
            overflow-x: auto;
            max-width: 100%;
          }
          .compact-table {
            min-width: 680px;
          }
          .seed-input {
            width: 88px;
            border: 1px solid #bfd4ea;
            border-radius: 5px;
            padding: 4px 6px;
          }
          .division-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
          }
          .division-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border: 1px solid var(--line-soft);
            border-radius: 999px;
            padding: 4px 10px;
            background: #fff;
            font-size: 12px;
            font-weight: 700;
          }
          .workflow-note {
            margin-top: 8px;
            padding: 8px 10px;
            border: 1px solid #e3c88a;
            background-color: #fff7e8;
            border-radius: 6px;
            color: #7a4c05;
            font-size: 13px;
            font-weight: 600;
          }
        `}
      </style>

      <div id="container">
        <h1>Playoff Setup Admin</h1>

        <div id="controls">
          <div className="control-grid">
            <div className="control-item">
              <span className="control-label">League</span>
              <span>
                {leagueCtx.league.day} {leagueCtx.league.year} (id {leagueCtx.league.leagueid ?? 0})
              </span>
            </div>
            <div className="control-item">
              <label className="control-label" htmlFor="playoffDivisionCount">
                Playoff Divisions
              </label>
              <select
                id="playoffDivisionCount"
                value={desiredDivisionCount}
                onChange={onDesiredDivisionCountChange}
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
            <div className="control-item">
              <label className="control-label" htmlFor="playoffDateSelect">
                Playoff Date
              </label>
              <select
                id="playoffDateSelect"
                value={selectedPlayoffDate}
                onChange={(e) => setSelectedPlayoffDate(e.target.value)}
              >
                {playoffDateOptions.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>
            <div className="control-item">
              <span className="control-label">Divisions</span>
              <span>
                Selected: {desiredDivisionCount}
              </span>
            </div>
            <div className="control-item">
              <span className="control-label">Eligible Teams</span>
              <span>
                {teamsInLeagueForSetup.length} ({outTeamIdSet.size} marked out on {selectedPlayoffDate || "N/A"})
              </span>
            </div>
            <div className="control-item">
              <span className="control-label">Default Rule</span>
              <span>
                {teamsInLeagueForSetup.length > 17
                  ? "Auto set to 3 divisions (>17 teams)"
                  : "Auto fallback to 2 divisions (<=17 teams)"}
                {hasManuallyChangedDivisionCount ? ", manually overridden" : ""}
              </span>
            </div>
          </div>
          <div className="division-list">
            {proposalDivisionSlots.length > 0 ? (
              proposalDivisionSlots.map((slotEntry) => (
                <span
                  key={`division-slot-${slotEntry.slot}`}
                  className="division-chip"
                  style={{ color: getDivisionColor(slotEntry.slot) }}
                >
                  {formatDivisionLabel(slotEntry.slot)}
                </span>
              ))
            ) : (
              <span className="subtle-line">No existing divisions for this league yet.</span>
            )}
          </div>
          {missingSlots.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <div className="control-label" style={{ marginBottom: "6px" }}>
                Names For New Divisions
              </div>
              {missingSlots.map((slot) => (
                <input
                  key={`new-division-slot-${slot}`}
                  className="inline-input"
                  value={newDivisionNameBySlot.get(slot) ?? ""}
                  placeholder={`${SLOT_THEME[slot]?.name ?? `Division ${slot}`} (proposed)`}
                  onChange={(e) => onNewDivisionNameChange(slot, e.target.value)}
                />
              ))}
              <div className="workflow-note">
                New divisions are proposal-only until Save Division Assignments.
              </div>
            </div>
          )}
        </div>

        {isLoading && <div id="status">Working...</div>}
        {statusMessage && <div id="status">{statusMessage}</div>}
        {warningMessage && <div id="warning">{warningMessage}</div>}
        {errorMessage && <div id="error">{errorMessage}</div>}

        <div id="section-card">
          <h2>Regular-Season Standings (For Seeding)</h2>
          <div className="table-wrap">
            <table className="compact-table">
              <thead>
                <tr>
                  <th>team</th>
                  <th>total points</th>
                  <th>saved division</th>
                  <th>proposed playoff division assignment</th>
                </tr>
              </thead>
              <tbody>
                {standingsRowsForSetup.map((standing) => {
                  const team = teamsInLeagueForSetup.find((row) => row.teamid === standing.teamid);
                  const proposedSlot = proposedDivisionByTeamId.get(standing.teamid) ?? 1;
                  const teamColor = getDivisionColor(proposedSlot as ProposedDivisionSlot);
                  const savedDivisionId = savedDivisionByTeamId.get(standing.teamid) ?? team?.divisionid ?? 0;
                  const savedDivision = allDivisions.find((div) => div.divisionid === savedDivisionId) ?? null;
                  return (
                    <tr key={`standing-${standing.teamid}`}>
                      <td>
                        <span className="team-name" style={{ color: teamColor }}>
                          {standing.teamname}
                        </span>{" "}
                        (id {standing.teamid})
                      </td>
                      <td>{standing.totalpoints}</td>
                      <td>
                        {savedDivision
                          ? `${savedDivision.divisionname ?? "Unnamed Division"} (id ${savedDivision.divisionid})`
                          : `Unknown Division (id ${savedDivisionId})`}
                      </td>
                      <td>
                        <div className="division-radio-wrap">
                          {proposalDivisionSlots.map((slotEntry) => (
                            <label
                              key={`team-${standing.teamid}-slot-${slotEntry.slot}`}
                              className="division-radio-option"
                            >
                              <input
                                type="radio"
                                name={`team-division-${standing.teamid}`}
                                value={slotEntry.slot}
                                checked={proposedSlot === slotEntry.slot}
                                onChange={() =>
                                  onTeamDivisionChange(standing.teamid, slotEntry.slot)
                                }
                              />
                              <span
                                className="division-radio-label"
                                style={{ color: getDivisionColor(slotEntry.slot) }}
                              >
                                {formatDivisionLabel(slotEntry.slot)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button className="link-button" onClick={onSaveDivisionAssignments}>
            Save Division Assignments (and Create Missing Divisions/Brackets)
          </button>
        </div>

        <div id="section-card">
          <h2>Bracket / Seeding (One Division At A Time)</h2>
          <div className="control-grid" style={{ marginBottom: "8px" }}>
            <div className="control-item">
              <label className="control-label" htmlFor="divisionSelect">
                Division
              </label>
              <select
                id="divisionSelect"
                value={selectedDivisionSlot}
                onChange={(e) => setSelectedDivisionSlot(parseInt(e.target.value, 10) as ProposedDivisionSlot)}
              >
                {proposalDivisionSlots.map((slotEntry) => (
                  <option key={`slot-option-${slotEntry.slot}`} value={slotEntry.slot}>
                    {formatDivisionLabel(slotEntry.slot)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedBracket ? (
            <div style={{ marginBottom: "8px" }}>
              Bracket: {selectedBracket.bracketname ?? "Unnamed"} (id {selectedBracket.bracketid}), League{" "}
              {selectedBracket.leagueid}, Division{" "}
              <span className="division-pill" style={{ backgroundColor: getDivisionColor(selectedDivisionSlot) }}>
                {formatDivisionLabel(selectedDivisionSlot)}
              </span>
            </div>
          ) : (
            <div style={{ marginBottom: "8px" }}>
              No saved playoff bracket exists yet for this proposed division slot.
            </div>
          )}

          {selectedBracket ? (
            <>
              <div className="table-wrap">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>team</th>
                      <th>regular-season points</th>
                      <th>seed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamsForSelectedDivision.length > 0 ? (
                      teamsForSelectedDivision.map((team) => (
                        <tr key={`seed-team-${team.teamid}`}>
                          <td>
                            <span
                              className="team-name"
                              style={{
                                color: getDivisionColor(
                                  proposedDivisionByTeamId.get(team.teamid) ?? selectedDivisionSlot
                                ),
                              }}
                            >
                              {team.teamname ?? "Unknown"}
                            </span>{" "}
                            (id {team.teamid})
                          </td>
                          <td>{standingsByTeamId.get(team.teamid) ?? 0}</td>
                          <td>
                            <input
                              className="seed-input"
                              type="number"
                              min={1}
                              value={seedByTeamId.get(team.teamid) ?? ""}
                              onChange={(e) => onSeedChange(team.teamid, e.target.value)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3}>No teams currently assigned to this playoff division.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="actions-row">
                <button className="small-button" onClick={() => onSaveSeeds(false)}>
                  Save Seeds
                </button>
                {pendingForceSeedPayload && (
                  <button className="danger-button" onClick={() => onSaveSeeds(true)}>
                    Confirm Force Save Seeds
                  </button>
                )}
                <button
                  className="small-button"
                  onClick={onGenerateMatches}
                  disabled={isLoading || generateMatchesDisabledReason.length > 0}
                  title={generateMatchesDisabledReason || "Generate playoff matches from saved seeds"}
                >
                  Generate Matches
                </button>
              </div>
              {generateMatchesDisabledReason && (
                <div className="subtle-line" style={{ marginTop: "6px" }}>
                  {generateMatchesDisabledReason}
                </div>
              )}
            </>
          ) : null}

          <h3 style={{ marginTop: "12px" }}>Existing Seeds</h3>
          {selectedBracket ? (
            playoffData?.seeds && playoffData.seeds.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>seed</th>
                      <th>team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playoffData.seeds.map((seedRow) => (
                      <tr key={`seed-row-${seedRow.seed}`}>
                        <td>{seedRow.seed}</td>
                        <td>
                          {byeTeamIdSet.has(seedRow.teamid) ? (
                            <span className="subtle-line">BYE (suppressed from setup lists)</span>
                          ) : (
                            formatTeamLabel(seedRow.teamid)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>No seeds assigned yet.</div>
            )
          ) : (
            <div>No seeds assigned yet.</div>
          )}

          <h3 style={{ marginTop: "12px" }}>Existing Matches</h3>
          {selectedBracket ? (
            playoffData?.matches && playoffData.matches.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>round</th>
                      <th>location</th>
                      <th>team A</th>
                      <th>team B</th>
                      <th>winner</th>
                      <th>is_completed</th>
                      <th>nextplayoffmatchid</th>
                      <th>nextslot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playoffData.matches.map((match) => (
                      <tr key={`match-row-${match.playoffmatchid}`}>
                        <td>{match.round}</td>
                        <td>{match.location}</td>
                        <td>{formatTeamLabel(match.teamaid)}</td>
                        <td>{formatTeamLabel(match.teambid)}</td>
                        <td>{formatTeamLabel(match.winnerteamid)}</td>
                        <td>{match.is_completed ? "true" : "false"}</td>
                        <td>{match.nextplayoffmatchid ?? ""}</td>
                        <td>{match.nextslot ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>No playoff matches generated yet.</div>
            )
          ) : (
            <div>No playoff matches generated yet.</div>
          )}
        </div>

        <div>
          <Link className="link-button" href="/admin">
            Back to Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
