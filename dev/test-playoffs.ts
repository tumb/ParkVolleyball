import { supabase } from "@/lib/supabase";
import {
  assignSeeds,
  clearPlayoffMatchResult,
  completePlayoffMatch,
  createBracket,
  findBracketByLeagueDivision,
  findPlayoffMatchesForBracket,
  generateBracketStructure,
} from "@/components/database/playoffs";

// DEV-ONLY: manual playoff helper test runner
// Safe to delete

const TEST_LEAGUE_ID = 1;
const TEST_DIVISION_ID = 1;

const TEAM_IDS_4 = [14, 16, 10, 5];
const TEAM_IDS_5 = [14, 16, 10, 5, 9];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

function divider(title: string) {
  console.log(`\n${"=".repeat(20)} ${title} ${"=".repeat(20)}`);
}

function summarizeMatch(match: {
  playoffmatchid: number;
  round: number;
  location: number;
  teamaid: number | null;
  teambid: number | null;
  winnerteamid: number | null;
  is_completed: boolean;
  nextplayoffmatchid: number | null;
  nextslot: string | null;
}) {
  return {
    playoffmatchid: match.playoffmatchid,
    round: match.round,
    location: match.location,
    teamaid: match.teamaid,
    teambid: match.teambid,
    winnerteamid: match.winnerteamid,
    is_completed: match.is_completed,
    nextplayoffmatchid: match.nextplayoffmatchid,
    nextslot: match.nextslot,
  };
}

function logMatches(label: string, matches: Array<any>) {
  console.log(label);
  console.table(matches.map(summarizeMatch));
}

function getMatch(
  matches: Array<any>,
  round: number,
  location: number,
  label: string
) {
  const match = matches.find((m) => m.round === round && m.location === location);
  assert(match, `Expected ${label} at round ${round}, location ${location}.`);
  return match;
}

async function reloadMatches(bracketid: number, label: string) {
  const matches = await findPlayoffMatchesForBracket(bracketid);
  logMatches(label, matches);
  return matches;
}

async function deleteExistingTestBracket(): Promise<void> {
  const existingBracket = await findBracketByLeagueDivision(
    TEST_LEAGUE_ID,
    TEST_DIVISION_ID
  );

  if (!existingBracket) {
    console.log("No existing test bracket found. Nothing to delete.");
    return;
  }

  console.log(
    `Deleting existing test bracket ${existingBracket.bracketid} for league ${TEST_LEAGUE_ID}, division ${TEST_DIVISION_ID}...`
  );

  const { error } = await supabase
    .from("bracket")
    .delete()
    .eq("bracketid", existingBracket.bracketid);

  if (error) {
    throw error;
  }

  console.log("Existing test bracket deleted.");
}

async function createFreshTestBracket(name: string) {
  const bracket = await createBracket({
    leagueid: TEST_LEAGUE_ID,
    divisionid: TEST_DIVISION_ID,
    bracketname: name,
  });

  console.log("Created bracket:", bracket);
  return bracket;
}

async function assignScenarioSeeds(bracketid: number, teamIds: number[]) {
  const seeds = await assignSeeds(
    bracketid,
    teamIds.map((teamid, index) => ({
      seed: index + 1,
      teamid,
    }))
  );

  console.table(seeds);
  assert(
    seeds.length === teamIds.length,
    `Expected ${teamIds.length} assigned seeds.`
  );

  for (let i = 0; i < teamIds.length; i++) {
    assert(seeds[i].seed === i + 1, `Expected returned seed ${i + 1}.`);
  }

  return seeds;
}

async function setupScenario(name: string, teamIds: number[]) {
  divider(`SETUP: ${name}`);
  console.log({
    TEST_LEAGUE_ID,
    TEST_DIVISION_ID,
    teamIds,
  });

  await deleteExistingTestBracket();
  const bracket = await createFreshTestBracket(name);
  await assignScenarioSeeds(bracket.bracketid, teamIds);

  const matches = await generateBracketStructure(bracket.bracketid);
  logMatches("Generated matches:", matches);

  return {
    bracketid: bracket.bracketid,
    matches,
  };
}

async function runScenario4Team() {
  divider("SCENARIO A: 4-TEAM BRACKET");

  const { bracketid, matches } = await setupScenario(
    "Dev Test Bracket - 4 Team",
    TEAM_IDS_4
  );

  assert(matches.length === 3, "Expected 3 matches for a 4-team bracket.");

  const semifinal1 = getMatch(matches, 1, 1, "semifinal 1");
  const semifinal2 = getMatch(matches, 1, 2, "semifinal 2");
  const finalMatch = getMatch(matches, 2, 1, "final");

  assert(
    semifinal1.teamaid === TEAM_IDS_4[0] && semifinal1.teambid === TEAM_IDS_4[3],
    "Expected R1 L1 = seed 1 vs seed 4."
  );
  assert(
    semifinal2.teamaid === TEAM_IDS_4[1] && semifinal2.teambid === TEAM_IDS_4[2],
    "Expected R1 L2 = seed 2 vs seed 3."
  );
  assert(
    semifinal1.nextplayoffmatchid === finalMatch.playoffmatchid &&
      semifinal1.nextslot === "A",
    "Expected semifinal 1 to feed final slot A."
  );
  assert(
    semifinal2.nextplayoffmatchid === finalMatch.playoffmatchid &&
      semifinal2.nextslot === "B",
    "Expected semifinal 2 to feed final slot B."
  );
  assert(
    finalMatch.teamaid == null && finalMatch.teambid == null,
    "Expected final to start empty."
  );

  divider("SCENARIO A: COMPLETE SEMIFINAL 1");
  await completePlayoffMatch({
    playoffmatchid: semifinal1.playoffmatchid,
    winnerteamid: semifinal1.teamaid,
  });

  let reloaded = await reloadMatches(
    bracketid,
    "After completing semifinal 1:"
  );

  let reloadedFinal = getMatch(reloaded, 2, 1, "final after semifinal 1");
  assert(
    reloadedFinal.teamaid === semifinal1.teamaid,
    "Expected final teamaid to equal semifinal 1 winner."
  );
  assert(
    reloadedFinal.teambid == null,
    "Expected final teambid to remain null after semifinal 1."
  );

  divider("SCENARIO A: COMPLETE SEMIFINAL 2");
  await completePlayoffMatch({
    playoffmatchid: semifinal2.playoffmatchid,
    winnerteamid: semifinal2.teamaid,
  });

  reloaded = await reloadMatches(bracketid, "After completing semifinal 2:");
  reloadedFinal = getMatch(reloaded, 2, 1, "final after semifinal 2");

  assert(
    reloadedFinal.teamaid === semifinal1.teamaid,
    "Expected final teamaid to remain semifinal 1 winner."
  );
  assert(
    reloadedFinal.teambid === semifinal2.teamaid,
    "Expected final teambid to equal semifinal 2 winner."
  );

  divider("SCENARIO A: CLEAR SEMIFINAL 1");
  await clearPlayoffMatchResult({
    playoffmatchid: semifinal1.playoffmatchid,
  });

  reloaded = await reloadMatches(bracketid, "After clearing semifinal 1:");
  const reloadedSemifinal1 = getMatch(
    reloaded,
    1,
    1,
    "semifinal 1 after clear"
  );
  reloadedFinal = getMatch(reloaded, 2, 1, "final after clear");

  assert(
    reloadedSemifinal1.winnerteamid == null &&
      reloadedSemifinal1.is_completed === false,
    "Expected semifinal 1 to be cleared."
  );
  assert(
    reloadedFinal.teamaid == null,
    "Expected final teamaid to be cleared after clearing semifinal 1."
  );
  assert(
    reloadedFinal.teambid === semifinal2.teamaid,
    "Expected final teambid to remain semifinal 2 winner."
  );

  divider("SCENARIO A COMPLETE");
}

async function runScenario5Team() {
  divider("SCENARIO B: 5-TEAM BRACKET");

  const { bracketid, matches } = await setupScenario(
    "Dev Test Bracket - 5 Team",
    TEAM_IDS_5
  );

  assert(matches.length === 4, "Expected 4 matches for a 5-team bracket.");

  const playIn = getMatch(matches, 1, 1, "play-in");
  const byeSideSemifinal = getMatch(matches, 2, 1, "bye-side semifinal");
  const standardSemifinal = getMatch(matches, 2, 2, "standard semifinal");
  const finalMatch = getMatch(matches, 3, 1, "final");

  assert(
    playIn.teamaid === TEAM_IDS_5[3] && playIn.teambid === TEAM_IDS_5[4],
    "Expected play-in to be seed 4 vs seed 5."
  );
  assert(
    playIn.nextplayoffmatchid === byeSideSemifinal.playoffmatchid &&
      playIn.nextslot === "B",
    "Expected play-in winner to feed bye-side semifinal slot B."
  );

  assert(
    byeSideSemifinal.teamaid === TEAM_IDS_5[0] &&
      byeSideSemifinal.teambid == null,
    "Expected bye-side semifinal to start as seed 1 vs null."
  );

  assert(
    standardSemifinal.teamaid === TEAM_IDS_5[1] &&
      standardSemifinal.teambid === TEAM_IDS_5[2],
    "Expected standard semifinal to be seed 2 vs seed 3."
  );

  assert(
    byeSideSemifinal.nextplayoffmatchid === finalMatch.playoffmatchid &&
      byeSideSemifinal.nextslot === "A",
    "Expected bye-side semifinal to feed final slot A."
  );
  assert(
    standardSemifinal.nextplayoffmatchid === finalMatch.playoffmatchid &&
      standardSemifinal.nextslot === "B",
    "Expected standard semifinal to feed final slot B."
  );

  assert(
    finalMatch.teamaid == null && finalMatch.teambid == null,
    "Expected final to start empty."
  );

  divider("SCENARIO B: COMPLETE PLAY-IN");
  await completePlayoffMatch({
    playoffmatchid: playIn.playoffmatchid,
    winnerteamid: playIn.teamaid, // seed 4
  });

  let reloaded = await reloadMatches(bracketid, "After completing play-in:");
  let reloadedByeSemi = getMatch(
    reloaded,
    2,
    1,
    "bye-side semifinal after play-in"
  );

  assert(
    reloadedByeSemi.teamaid === TEAM_IDS_5[0],
    "Expected seed 1 to remain in slot A."
  );
  assert(
    reloadedByeSemi.teambid === playIn.teamaid,
    "Expected play-in winner to populate slot B."
  );

  divider("SCENARIO B: CLEAR PLAY-IN BEFORE DOWNSTREAM COMPLETION");
  await clearPlayoffMatchResult({
    playoffmatchid: playIn.playoffmatchid,
  });

  reloaded = await reloadMatches(
    bracketid,
    "After clearing play-in before downstream completion:"
  );
  let reloadedPlayIn = getMatch(
    reloaded,
    1,
    1,
    "play-in after safe clear"
  );
  reloadedByeSemi = getMatch(
    reloaded,
    2,
    1,
    "bye-side semifinal after safe clear"
  );

  assert(
    reloadedPlayIn.winnerteamid == null && reloadedPlayIn.is_completed === false,
    "Expected play-in to be cleared safely."
  );
  assert(
    reloadedByeSemi.teamaid === TEAM_IDS_5[0],
    "Expected seed 1 to remain in slot A after safe clear."
  );
  assert(
    reloadedByeSemi.teambid == null,
    "Expected slot B to be cleared after safe clear."
  );

  divider("SCENARIO B: RE-COMPLETE PLAY-IN");
  await completePlayoffMatch({
    playoffmatchid: reloadedPlayIn.playoffmatchid,
    winnerteamid: reloadedPlayIn.teamaid, // seed 4 again
  });

  reloaded = await reloadMatches(bracketid, "After re-completing play-in:");
  reloadedByeSemi = getMatch(
    reloaded,
    2,
    1,
    "bye-side semifinal after re-completing play-in"
  );

  assert(
    reloadedByeSemi.teambid === TEAM_IDS_5[3],
    "Expected play-in winner to be restored into slot B."
  );

  divider("SCENARIO B: COMPLETE STANDARD SEMIFINAL");
  await completePlayoffMatch({
    playoffmatchid: standardSemifinal.playoffmatchid,
    winnerteamid: standardSemifinal.teamaid, // seed 2
  });

  reloaded = await reloadMatches(
    bracketid,
    "After completing standard semifinal:"
  );
  let reloadedFinal = getMatch(
    reloaded,
    3,
    1,
    "final after standard semifinal"
  );

  assert(
    reloadedFinal.teamaid == null,
    "Expected final slot A to remain empty until bye-side semifinal is completed."
  );
  assert(
    reloadedFinal.teambid === standardSemifinal.teamaid,
    "Expected final slot B to equal standard semifinal winner."
  );

  divider("SCENARIO B: COMPLETE BYE-SIDE SEMIFINAL");
  reloaded = await reloadMatches(
    bracketid,
    "Reload before completing bye-side semifinal:"
  );
  reloadedByeSemi = getMatch(
    reloaded,
    2,
    1,
    "bye-side semifinal before completion"
  );

  await completePlayoffMatch({
    playoffmatchid: reloadedByeSemi.playoffmatchid,
    winnerteamid: reloadedByeSemi.teamaid, // seed 1
  });

  reloaded = await reloadMatches(
    bracketid,
    "After completing bye-side semifinal:"
  );
  reloadedFinal = getMatch(
    reloaded,
    3,
    1,
    "final after bye-side semifinal"
  );

  assert(
    reloadedFinal.teamaid === TEAM_IDS_5[0],
    "Expected final slot A to equal seed 1 after bye-side semifinal completion."
  );
  assert(
    reloadedFinal.teambid === standardSemifinal.teamaid,
    "Expected final slot B to remain standard semifinal winner."
  );

  divider("SCENARIO B: UNSAFE CLEAR PLAY-IN AFTER DOWNSTREAM COMPLETION (EXPECTED FAILURE)");
  let gotExpectedError = false;

  try {
    await clearPlayoffMatchResult({
      playoffmatchid: playIn.playoffmatchid,
    });
  } catch (error) {
    gotExpectedError = true;
    console.log("Received expected error:", error);
  }

  assert(
    gotExpectedError,
    "Expected clearing play-in after downstream completion to fail."
  );

  reloaded = await reloadMatches(
    bracketid,
    "After attempted unsafe clear of play-in:"
  );
  reloadedPlayIn = getMatch(
    reloaded,
    1,
    1,
    "play-in after failed unsafe clear"
  );
  reloadedByeSemi = getMatch(
    reloaded,
    2,
    1,
    "bye-side semifinal after failed unsafe clear"
  );
  reloadedFinal = getMatch(
    reloaded,
    3,
    1,
    "final after failed unsafe clear"
  );

  assert(
    reloadedPlayIn.winnerteamid === TEAM_IDS_5[3] &&
      reloadedPlayIn.is_completed === true,
    "Expected play-in to remain completed after failed unsafe clear."
  );
  assert(
    reloadedByeSemi.winnerteamid === TEAM_IDS_5[0] &&
      reloadedByeSemi.is_completed === true,
    "Expected bye-side semifinal to remain completed after failed unsafe clear."
  );
  assert(
    reloadedFinal.teamaid === TEAM_IDS_5[0] &&
      reloadedFinal.teambid === TEAM_IDS_5[1],
    "Expected final participants to remain unchanged after failed unsafe clear."
  );

  divider("SCENARIO B COMPLETE");
}

async function main() {
  divider("START");
  console.log({
    TEST_LEAGUE_ID,
    TEST_DIVISION_ID,
    TEAM_IDS_4,
    TEAM_IDS_5,
  });

  await runScenario4Team();
  await runScenario5Team();

  divider("DONE");
  console.log("All scripted playoff test steps completed successfully.");
}

main().catch((error) => {
  console.error("\nTEST RUN FAILED:");
  console.error(error);
  process.exit(1);
});