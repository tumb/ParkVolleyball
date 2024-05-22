import React from "react";
import Link from "next/link";
import { useContext, useEffect, useState, useCallback } from "react";
import { LeagueContext } from "@/context/LeagueContext";
import SchedulingSetup from "@/components/UI/SchedulingSetup";
import { supabase } from "@/lib/supabase";
import {DivisionProps, ScheduleProps, TeamProps, emptyTeam } from "@/lib/types" ;
import {findSelectedDivision, findSelectedTeam, isValidDate, createMatch} from "@/components/admin/scheduling_functions/SchedulingUI" ;
import { saveToSupabase } from "@/components/database/savesOrModifications";
import { findMatchesForLeagueDateDivision, findDatesForLeague, fetchMatchesForTeam, findTeamsForLeague, findOutTeamsForLeagueAndDate } from "@/components/database/fetches";
import { deleteFromSupabase } from "@/components/database/deletes";
import { match } from "assert";

// import '@/styles/layouts.css' ; Not allowed to add a global style sheet. I put this into ./pages/_app.tsx but don't know that I'll use it. 

export default function MakeSchedule() 
    {
      const leagueCtx = useContext(LeagueContext);
        const [scheduleDate, setScheduleDate] = useState<string>("yyyy-mm-dd") ;
        const [divisions, setDivisions] = useState<DivisionProps[]>([]) ; 
        const [teamsInDivision, setTeamsInDivision] = useState<TeamProps[]>([]) ; 
        const [teamsInLeague, setTeamsInLeague] = useState<TeamProps[]>([]) ; 
        const [teamsOut, setTeamsOut] = useState<TeamProps[]>([]) ;
        const [selectedDivision, setSelectedDivsion] = useState(({divisionid: 1, leagueid: 1, divisionname: "purple", divisionvalue: 1})) ;
        const [allDates, setAllDates] = useState<string[]>([]) ; 
        const [newMatches, setNewMatches] = useState<ScheduleProps[]>([]) ;
        const [savedMatches, setSavedMatches] = useState<ScheduleProps[]>([]) ;
        const [checkSavedMatches, setCheckSavedMatches] = useState(1) ; // This is a flag. It calls a useEffect to have savedMatches refetched from the database.
        const [matchHistory, setMatchHistory] = useState<ScheduleProps[]>([]) ; // A list of previous matches against the selected team
        const [selectedTeam, setSelectedTeam] = useState<TeamProps>(emptyTeam) ;
        const [warningMessage, setWarningMessage] = useState("") ;
        const [successMessage, setSuccessMessage] = useState("") ;
        const [errorMessage, setErrorMessage] = useState("") ;
        const [tempMatchId, setTempMatchId] = useState(-1) ;
      let tempDates : string[] = [] ; 


        function computeListOfDates(dayOfWeek : string) {
          const currentDate = new Date(); // apparenty a number of time since ??? in milliseconds
          currentDate.setHours(0,0, 0, 0) ; 
          // Get the current day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
          const currentDay = currentDate.getDay();
          // Get the day of the week as an integer (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
          let targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayOfWeek.toLowerCase());
          if(targetDay == -1) {
            targetDay = 3 ; // Using wednesday for testday or a missing day.
          }
          // Calculate the number of days until the next occurrence of the target day
          let daysUntilNext = targetDay - currentDay;
          // console.log("daysUntilNext: " + daysUntilNext) ; 
          if (daysUntilNext < 0) {
              // If the target day is earlier in the week than the current day, add 7 days to find the next occurrence
            daysUntilNext += 7;
          }
          // Calculate the date of the next occurrence of the target day
          const nextDate = new Date(currentDate.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
          // Format the date as YYYY-MM-DD
          const formattedDate = nextDate.toISOString().split('T')[0];
          const index = allDates.indexOf(formattedDate) ; 
          // console.log("Adding first date: length ", allDates.length) ; 
          if( index == -1) { // If it's not already in the list then add it.
            tempDates.push(formattedDate) ; 
            // console.log("Added first date: length ", tempDates.length) ; 
          }

          // Add still one more day if today is the day of week for the league
          if(daysUntilNext == 7) {
            daysUntilNext += 7;
            const nextDate = new Date(currentDate.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
            // Format the date as YYYY-MM-DD
            const formattedDate = nextDate.toISOString().split('T')[0];
            const index = allDates.indexOf(formattedDate) ; 
            // console.log("Adding 2nd date: length ", allDates.length) ; 
            if( index == -1) {
              tempDates.push(formattedDate) ; 
            }
            // console.log("After sorting dates: length ", allDates.length) ; 
          }

          while(daysUntilNext < 21) {
            daysUntilNext += 7;
            const nextDate = new Date(currentDate.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
            // Format the date as YYYY-MM-DD
            const formattedDate = nextDate.toISOString().split('T')[0];
            const index = allDates.indexOf(formattedDate) ; 
            // console.log("Adding date:  ", formattedDate) ; 
            if( index == -1) {
              tempDates.push(formattedDate) ; 
              // console.log("Added 2nd date: length ", tempDates.length) ; 
            }
          }
          console.log("After sorting temp dates: length ", tempDates.length) ; 
          tempDates.sort() ; 
          setAllDates(tempDates) ; 
        }

        function areSameTeams(matchA: ScheduleProps, matchB: ScheduleProps) {
          let areTheSame = matchA.team1 == matchB.team1 && matchA.team2 == matchB.team2 ; 
          areTheSame = areTheSame || matchA.team1 == matchB.team2 && matchA.team2 == matchB.team1 ;
          return areTheSame ; 
        }

        function buildMatchHistoryItem(match:ScheduleProps) {
          const divisionColor = computeDivisionColor(match.divisionid) ;
          // console.log("divisionColor: ", divisionColor) ;
          const opponentName = findOpponentName(match, selectedTeam) ;
          return (
            <div className={divisionColor}>
            {match.matchdate} {opponentName} <br/> 
            </div>
          )
        }

        // A circle is where we have x vs y, y vs z, then z vs x. All weeks will have circles. We would like to avoid ones that are 3 or less.
        function checkForCircles() {
          let status = "\n No circles found."  ;
          let allTeams = teamsInDivision ;
          let allMatches = newMatches.concat(savedMatches) ; 
          let teamIndex = 0 ;
          let circleFound = false ; 
          console.log("allTeams.length: " + allTeams.length + ", allMatches.length: " + allMatches) ; 
          while(allTeams.length > teamIndex && !circleFound) {
            let startTeam = allTeams[teamIndex] ; 
            console.log("startTeam: " + startTeam.teamname + " " + startTeam.teamid + ", teamIndex: " + teamIndex) ;
            let opponents = findOpponents(startTeam.teamid) ; 
            console.log("opponents.length: " + opponents.length) ;
            if(opponents.length == 2) {
              console.log( " opponents: " + opponents[0].teamname + ", " + opponents[1].teamname) ;
              for(const match of allMatches) {
              if  ((match.team1 == opponents[0].teamid && match.team2 == opponents[1].teamid) 
                || (match.team2 == opponents[0].teamid && match.team1 == opponents[1].teamid) )
                {
                status = "\n 3 way circle found of " + startTeam.teamname + ", " + opponents[0].teamname + ", " + opponents[1].teamname ; 
                circleFound = true ; 
              }
            }
          }
          teamIndex++ ; 
          }
          return status ; 
        }

        function checkForDuplicateMatches() {
          let status = ""  ;
          let skipId = 0 ; 
          for(const match of newMatches) {
            for(const savedMatch of savedMatches) {
              if(areSameTeams(match, savedMatch)) {
                status += "\n Duplicate found for " + generateMatchName(match.scheduleid) + " among saved matches." ;
              }
            }
            for(const matchB of newMatches) {
              if(match.scheduleid != matchB.scheduleid && match.scheduleid != skipId) {
                if(areSameTeams(match, matchB)) {
                  status += "\n Duplicate found for " + generateMatchName(match.scheduleid) + " among new matches." ;
                  skipId = matchB.scheduleid ; 
                }
              }
            }
          }
          if(status.length < 1) {
            status = "No duplicate matches found."
          }
          return status ; 
        }

        function clearMessages() {
          setSuccessMessage("") ; 
          setWarningMessage("") ; 
          setErrorMessage("") ;
        }

        function computeDivisionColor(divisionId : number) {
          const thisDivision = findSelectedDivision(divisionId, divisions) ; 
          return "division-"+thisDivision?.divisionname ; 
        }
      
        function countMatchesForTeam(teamid: number) : number {
          const team1Count = newMatches.filter((match) => match.team1 === teamid).length + savedMatches.filter((match) => match.team1 === teamid).length ;
          const team2Count = newMatches.filter((match) => match.team2 === teamid).length + savedMatches.filter((match) => match.team2 === teamid).length ;
          return team1Count + team2Count ; 
        }

        const divisionHandler = (e: React.ChangeEvent<HTMLSelectElement>) =>  {
          // console.log("--- Started divisionHandler ---") ; 
          // console.log("e.target.value: " + e.target.value) ;
          var divId = parseInt(e.currentTarget.value, 10) ; 
          const selectedDiv = findSelectedDivision(divId, divisions) ;
          // console.log("selectedDiv: ", selectedDiv) ;
          if(selectedDiv) {
            setSelectedDivsion(selectedDiv) ;
          }
        }
  
        function fetchOutTeamsForLeagueAndDate() { 
          async function innerFetch() {
            const databaseOutTeamIds = await findOutTeamsForLeagueAndDate(leagueCtx.league.leagueid != undefined ? leagueCtx.league.leagueid : -1, scheduleDate ) ; 
            const databaseOutTeams = teamsInLeague.filter(team => databaseOutTeamIds.includes(team.teamid)) ;
            setTeamsOut(databaseOutTeams) ;
          }
          innerFetch() ; 
        }

        function findOpponentName(match:ScheduleProps, selectedTeam: TeamProps) : string {
          let opponentTeam = emptyTeam ; 
          if(match.team1 == selectedTeam.teamid)  {
            opponentTeam = findSelectedTeam(match.team2, teamsInLeague) || emptyTeam ; 
          }
          else if (match.team2 == selectedTeam.teamid){
            opponentTeam = findSelectedTeam(match.team1, teamsInLeague) || emptyTeam ; 
          }
          return opponentTeam.teamname ; 
        }

        function findOpponents(teamid : number) {
          console.log("teamid: " + teamid) ;
          let opponents : TeamProps[] = [] ; 
          const allMatchs = newMatches.concat(savedMatches) ;
          console.log("allMatchs.length: " + allMatchs.length) ;
          for(const match of allMatchs) {
            if(match.team1 == teamid) {
              console.log("match.team2: " + match.team2)
              const opponent : TeamProps | undefined = teamsInDivision.find((team) => match.team2 == team.teamid) ; 
              console.log("opponent: " + opponent) ;
              if(opponent != undefined) {
                console.log("adding opponent " + opponent.teamname +  " to opponents[]")
                opponents = opponents.concat(opponent) ;
              }
              else if(match.team2 == teamid) {
                const opponent : TeamProps | undefined = teamsInDivision.find((team) => match.team1 == team.teamid) ; 
                console.log("opponent: " + opponent) ;
                if(opponent != undefined) {
                  opponents = opponents.concat(opponent) ;
                }
              }
            }
          }
          return opponents ; 
        }

      function generateMatchName(scheduleId: number) : string {
          let name = "none" ; 
          let schedule = newMatches.find((match) => match.scheduleid === scheduleId )
          if(schedule == undefined) {
            schedule = savedMatches.find((match) => match.scheduleid === scheduleId )
          }
          const teamA = teamsInLeague.find((team) => team.teamid === schedule?.team1) ; 
          const teamB = teamsInLeague.find((team) => team.teamid === schedule?.team2) ; 
          name = teamA?.teamname + " vs " + teamB?.teamname + " id: " + schedule?.scheduleid ; 
          return name ; 
        }

        function getSelectedMatches(matchesList: ScheduleProps[]) : ScheduleProps[] {
          const matchesSelect = document.getElementById("matchesSelect") as HTMLSelectElement;
          const selectedOptions = Array.from(matchesSelect.selectedOptions);
          const selectedMatchIds = selectedOptions.map(option => parseInt(option.value));
          const selectedMatches = matchesList.filter(match => selectedMatchIds.includes(match.scheduleid));
          return selectedMatches ;
        }

        function getLastTwoWeeks() : string[] {
          let startingDate = new Date(scheduleDate) ; 
          let previousWeek = new Date(startingDate.getTime() - (7 * 24 * 60 * 60 * 1000) ); 
          const formattedWeek = previousWeek.toISOString().split('T')[0] ;
          let twoPrevious = new Date(previousWeek.getTime()  - (7 * 24 * 60 * 60 * 1000) ); 
          const formattedTwo = twoPrevious.toISOString().split('T')[0] ;
          return [formattedWeek, formattedTwo] ; 
        }

        function init() {
          if(leagueCtx) {
            getDivisionsForLeague() ; 
            setNextDate() ; 
            updateTeams() ; 
          }
        }

        const dateHandler = (e: React.ChangeEvent<HTMLSelectElement>) =>  {
          // console.log("-- Started dateHandler. scheduleDate: " + scheduleDate) ;
          // console.log("e.target.value: " + e.target.value) ;
          if(isValidDate(e.target.value)) {
            setScheduleDate(e.target.value) ; 
            // findDistinctDivisionsSearch() ;
            setWarningMessage("") ; 
          }
          else {
            setWarningMessage("No valid date is set") ; 
          }
          console.log("--- end of dateHandler.") ; 
        } ;

      function fetchAllTeamsForLeague () { 
        async function innerFetch() {
          const allTeams = await findTeamsForLeague(leagueCtx.league.leagueid != undefined ? leagueCtx.league.leagueid : -1 ) ; 
          setTeamsInLeague(allTeams) ;
        }
        innerFetch() ; 
      }

      const getDivisionsForLeague = async () => {
          // console.log("--- Started getDivisionsForLeague league: ", leagueCtx.league?.leagueid) ;
          const leagueId = leagueCtx.league?.leagueid ; 
          if(leagueId != undefined) {
          try {
            const { data: divisionsData, error } = await supabase
              .from("division")
              .select()
              .eq("leagueid", leagueId);
            if (error) {
              throw error;
            }
            setDivisions(divisionsData as DivisionProps[] || []); // Ensure that divisionsData is an array
            // console.log("---  getDivisionsForLeague found data:", divisionsData);
          } catch (error: any) {
            console.error("Error fetching divisions: " + error.message);
            setErrorMessage("Error fetching divisions: " + error.message) ; 
          }
        } 
        else {
          setErrorMessage("leagueId is undefined.") ; 
        }
        };

      function onBackArrowClick() {
        const matchesSelected = getSelectedMatches(newMatches) ;
        // console.log("onBackArrowClick matchesSelected.length: " + matchesSelected.length) ; 
        matchesSelected.forEach((match:ScheduleProps) => {
          let i = newMatches.indexOf(match) ; 
          const updatedMatches = newMatches.filter(match2 => match.scheduleid !== match2.scheduleid) ; 
          setNewMatches(updatedMatches) ; 
        } ) ;
        setCheckSavedMatches(checkSavedMatches + 1 ) ;
      }

      function onDeleteFromDatabase() {
        console.log('--- onDeleteFromDatabase called.') ;
        const selectedMatches = getSelectedMatches(savedMatches) ; 
        selectedMatches.forEach((match: ScheduleProps) => {
          if(match.scheduleid > 0) {
            deleteFromSupabase(match) ;
            const updatedMatches = savedMatches.filter(match2 => match.scheduleid !== match2.scheduleid ) ; 
            setSavedMatches(updatedMatches) ;
            setCheckSavedMatches(checkSavedMatches + 1) ;
            clearMessages() ; 
            setSuccessMessage("Deleted one or more matches.")
          }
        });
      }

      const onTeamSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTeamId = parseInt(e.target.value, 10);
        const selectedTeam = teamsInDivision.find(team => team.teamid === selectedTeamId);
        setSelectedTeam(selectedTeam || emptyTeam);
        async function fetchMatchHistory() {
          if(selectedTeam) {
            const allMatches: ScheduleProps[] = await fetchMatchesForTeam(selectedTeam) ;
            console.log("about to  setMatchHistory. allMatches.length: " + allMatches.length) ;
            setMatchHistory(allMatches) ; 
          }
        }
        fetchMatchHistory() ; 
      };

      function onPairTwoTeamsButtonClick() {
          // console.log("--- onPairTwoTeamsButtonClick started") ;
            // Get the teamsSelect element
            const teamsSelect = document.getElementById("teamsSelect") as HTMLSelectElement;
            const matchesSelect = document.getElementById("matchesSelect") as HTMLSelectElement;
        
            // Get the selected options
            const selectedOptions = Array.from(teamsSelect.selectedOptions);
          
            // Ensure exactly two teams are selected
            if (selectedOptions.length === 2) {
              // Extract team IDs from the selected options
              const team1Id = parseInt(selectedOptions[0].value, 10);
              const team2Id = parseInt(selectedOptions[1].value, 10);
          
              // Log or perform actions with the selected team IDs
             // console.log("Selected Team 1 ID:", team1Id);
              const team1: TeamProps | undefined = teamsInDivision.find((team: TeamProps) => team.teamid === team1Id) ; 
              const team2: TeamProps | undefined  = teamsInDivision.find((team: TeamProps) => team.teamid === team2Id) ; 
              // console.log("Selected Team 2 name:" + team2?.teamname + ", matchdate: " + scheduleDate);
              if(team1 && team2 && leagueCtx.league.leagueid && selectedDivision && isValidDate(scheduleDate)) {
                const scheduledMatch: ScheduleProps | undefined = createMatch(tempMatchId, scheduleDate, team1, team2, leagueCtx.league.leagueid, selectedDivision.divisionid, 0, 0 ) ;
                // console.log("Selected Team 1 name: ", team1?.teamname) ;
                if(scheduledMatch) {
                  newMatches.push(scheduledMatch) ;
                  setNewMatches(newMatches) ; 
                  // const newMatchOption = document.createElement("option") ;
                  // newMatchOption.value = "" + scheduledMatch.scheduleid ; 
                  // newMatchOption.text = team1.teamname + " vs " + team2.teamname + " id: " + tempMatchId ; 
                  // matchesSelect.add(newMatchOption) ; 
                  setTempMatchId(tempMatchId - 1) ; 
                }
              }
              else {
                setWarningMessage("Validation failed! Check that you set the league, matchdate, division, and both teams.")
              }
              // console.log("Matches created: ", newMatches.length) ; 
            } else {
              // Inform the user that they need to select exactly two teams
              console.error("Please select exactly two teams.");
            }
          console.log("--- onPairTwoTeamsButtonClick ended") ;
        }

        async function onSaveSchedule() {
          console.log('--- onSaveSchedule called.') ;
          try {
          await Promise.all(newMatches.map(async (match: ScheduleProps) => {
            if (match.scheduleid < 0) {
              console.log(match.leagueid, match.scheduleid, match.matchdate, match.team1, match.team2);
              await saveToSupabase(match);
            }
          }));
          setSuccessMessage("Saved " + newMatches.length + " matches for " + scheduleDate) ;
          setNewMatches([]) ; 
          setCheckSavedMatches(checkSavedMatches+1) ;
        } catch (error) {
          setErrorMessage("Problem occurred while saving. " + error)
        }
          console.log("--- onSaveSchedule ended") ;
      }
      
      async function onValidateSchedule() {
        let status = "No problems found" ;
        status = checkForDuplicateMatches() ; 
        status += "\n" + await reportRecentDuplicates() ; 
        status += "\n" + checkForCircles() ; 
        setWarningMessage(status) ; 
      }

      const refreshTeamsFromDatabase = async () => {
        // console.log("Started findTeamsSearch. league, division is: ", leagueCtx.league.leagueid, selectedDivision.divisionid) ;
        const leagueId = leagueCtx.league.leagueid ; 
        const divisionId = selectedDivision.divisionid ; 
        if(leagueId != undefined && divisionId != undefined) {
        try {
          const { data: teamData, error } = await supabase
            .from("team")
            .select()
            .eq("leagueid", leagueCtx.league?.leagueid)
            .eq("divisionid", selectedDivision.divisionid);
      
          if (error) {
            throw error;
          }
      
          setTeamsInDivision(teamData as TeamProps[] || []); 
          // console.log("findTeamsSearch found data:", teamData);
        } catch (error: any) {
          console.error("Error fetching teams:" + error.message);
        }
      }
      else {
        let message = "An undefined id found. " ; 
        if(leagueId == undefined) {
          message += " leagueId " ; 
        }
        if(divisionId == undefined) {
          message += " divisionId " ; 
        }
        setErrorMessage(message) ;
      }
      };

      /** For each team see if they've already played either of their two opponents within the last two weeks of play.  */ 
        async function reportRecentDuplicates() {
          async function fetchMatchHistory(team : TeamProps)  {
             const teamMatches = await fetchMatchesForTeam(team) ;        
             return teamMatches ; 
          }
        let status = "No recent matches found." ;
        const matchdates= getLastTwoWeeks() ;
        // for each team get matches. 
        for(const team of teamsInDivision) {
          const teamMatches  = await fetchMatchHistory(team) ; 
          const opponents = findOpponents(team.teamid) ; 
          for(const match of teamMatches) {
            const testDate = match.matchdate ; 
            if(matchdates.indexOf(testDate) > -1) {
              if(match.team1 == team.teamid) {
                if(match.team2 == opponents[0].teamid ) {
                  status = "\n " + team.teamname + " played " + opponents[0].teamname + " on " + match.matchdate ; 
                }
                else if(match.team2 == opponents[1].teamid ) {
                  status = "\n " + team.teamname + " played " + opponents[1].teamname + " on " + match.matchdate ; 
                }
              }
              else {
                if(match.team2 == opponents[0].teamid ) {
                  status = "\n " + team.teamname + " played " + opponents[0].teamname + " on " + match.matchdate ; 
                }
                else if(match.team2 == opponents[1].teamid ) {
                  status = "\n " + team.teamname + " played " + opponents[1].teamname + " on " + match.matchdate ; 
                }
              }
            }
          }
        return status ; 
      }
    }

    function setNextDate() {
      const dayName = leagueCtx.league.day ? leagueCtx.league.day : "monday"; 
      const currentDate = new Date(); // apparenty a number of time since ??? in milliseconds
      const currentDay = currentDate.getDay();
      let targetDayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayName.toLowerCase());
      let daysUntilNext = targetDayIndex - currentDay;
      if (daysUntilNext < 0) {
        daysUntilNext += 7;
      } 
      const nextDate = new Date(currentDate.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
      const formattedDate = nextDate.toISOString().split('T')[0];
      setScheduleDate(formattedDate) ; 
    }

    const updateTeams = () => {
      refreshTeamsFromDatabase() ; 
      console.log("Teams found: " + teamsInDivision.length) ; 
    }

    useEffect(() => {
      // Put code to run when the date is changed.
      console.log("Initializing page") ;
      init() ; 
    }, []) ; 
  
    // When scheduleDate changes to something valid
  useEffect(() => {
    console.log("useEffect: scheduleDate") ; 
    // Put code to run when the date is changed.
    // console.log("Made valid date: ", scheduleDate) ;
    leagueCtx.league.matchDate = scheduleDate ; 
    fetchOutTeamsForLeagueAndDate() ;
  }, [scheduleDate]) ; 

      useEffect(() => {
        if(selectedDivision) {
          leagueCtx.league.divisionName = selectedDivision.divisionname ; 
          newMatches.length = 0 ; 
          updateTeams() ;
        } 
      }, [selectedDivision]) ;

      useEffect(() => {
        console.log("useEffect: divisions") ; 
        for(const division of divisions) {
        // console.log("divisionname: " + division.divisionname) ; 
        if(division.divisionname === 'blue') {
          setSelectedDivsion(division) ; 
        }
      }
    }, [divisions]) ;


    useEffect(() => {
      console.log("useEffect: selectedDivision, scheduleDate, checkSavedMatches") ; 
      async function findMatchesForLeagueDateAndDivision(leagueId: number, matchDate: string, matchDivision: number) {
          const matches: ScheduleProps[] = await findMatchesForLeagueDateDivision(leagueId, matchDate, matchDivision) ;
          return matches ; 
        }
       async function fetchData() {
         if (isValidDate(scheduleDate) && selectedDivision.divisionid > 0) {
            try {
                const existingMatches: ScheduleProps[] = await findMatchesForLeagueDateAndDivision(
                    leagueCtx.league.leagueid !== undefined ? leagueCtx.league.leagueid : 0,
                    scheduleDate,
                    selectedDivision.divisionid
                );
                setSavedMatches(existingMatches);
            } catch (error) {
                console.error('Error fetching matches:', error);
            }
          }
        }
      fetchData();        
    }, [selectedDivision, scheduleDate] ) ;

      useEffect(() => {
        console.log("useEffect leagueCtx") ; 
        getDivisionsForLeague() ;
            // Add in getting all the match dates currently in schedule for that league.
        async function fetchDates() {
          tempDates = await findDatesForLeague(leagueCtx.league.leagueid as number) ;
          computeListOfDates(leagueCtx.league.day != undefined ? leagueCtx.league.day : 'Testday') ; 
        }
        fetchDates() ; 
        fetchAllTeamsForLeague() ;
      }, [leagueCtx.league.leagueid]) ; 

        return (
    <div>
      <style>
        {`
          #debuggingInfoDiv {
            background-color: pink ; 
            margin-bottom: 10px ;
          }       
          #selectionsDiv {
            width: 110% ; 
            margin-bottom: 10px ;
          }     
          #successDiv {
            border: solid ; 
          }
          #warningDiv {
            background-color: yellow ; 
            width: 100% ; 
            margin-top: 10px ;
            whiteSpace: pre-line ;
          }  
          #errorDiv {
            background-color: red ; 
            width: 100% ; 
            margin-top: 10px ;
          }  
          #teamsSelectionDiv {
            width: 15% ; 
            float: left ; 
            margin-left: 10px ; 
            margin-right: 5px ; 
          }     
          #buttonColumnDiv {
            background-color: lightgray ; 
            width: 10% ; 
            height: 430px ; 
            float: left ; 
            display: flex;
            flex-direction: column;
            align-items: center ;
            margin-right: 5px ;
          }       
          #matchesSelectionDiv {
            width: 30% ; 
            float: left ; 
          }     
          #teamHistoryDiv {
            width: 35% ; 
            float: left ; 
          }     
          #teamsSelect {
            background-color: #E0E8F0 ; 
            width: 100% ; 
            float: left ; 
          }     
          #teamsOutDiv {
            background-color: #E0E8F0 ; 
          }     
          #matchesSelect {
            background-color: #E0E8A0 ; 
            width: 100% ; 
            float: left ; 
          } 
          .division-red {
            color: red ; 
          }
          .division-green{
            color: green ; 
          }
          .division-blue {
            color: blue ; 
          }
          .column-button {
            display: inline-block;
            padding: 10px 20px; /* Adjust padding as needed */
            margin: 5px ;
            background-color: #BDF;
            border: none;
            text-decoration: none;
            font-weight: bold;
            color: #000;
            border-radius: 5px;
            width: 100px; /* Set the width as desired */
            text-align: center;  
          }
          .data-button {
            display: inline-block;
            padding: 10px 20px; /* Adjust padding as needed */
            margin: 5px ;
            background-color: #FAF;
            border: none;
            text-decoration: none;
            font-weight: bold;
            color: #000;
            border-radius: 5px;
            width: 100px; /* Set the width as desired */
            text-align: center;          
          }
          .dangerous-button {
            display: inline-block;
            padding: 10px 20px; /* Adjust padding as needed */
            margin: 5px ;
            background-color: #FAB;
            border: none;
            text-decoration: none;
            font-weight: bold;
            color: #000;
            border-radius: 5px;
            width: 100px; /* Set the width as desired */
            text-align: center;          
          }

        `}
      </style>
      <div id="debuggingInfoDiv">
        Make or Edit Schedule
        <br/>
        League ID: {leagueCtx.league?.leagueid}, League day: {leagueCtx.league?.day}, League year: {leagueCtx.league?.year}, dates length, {allDates.length}
        <br/>
        <SchedulingSetup divisionHandler={divisionHandler} divisionid={selectedDivision.divisionid} dateHandler={dateHandler} dateList={allDates} selectedDate={scheduleDate} allDivisions={divisions} />
        <br/>
        <p>
        League ID: {leagueCtx.league?.leagueid}, League day: {leagueCtx.league?.day} 
        <br/>
        Division Name: {selectedDivision.divisionname}, Division ID; {selectedDivision.divisionid}
        <br/>
        Date being scheduled: {scheduleDate} {warningMessage} 
        </p>
      </div>
      <div id="selectionsDiv" >
        <div id="teamsSelectionDiv">
          <div>
            <label>Select 2 teams to play each other</label>
          </div>
          <select id="teamsSelect" size={20} multiple={true} onChange={onTeamSelectChange}> 
          {teamsInDivision.map((team) => (
            <option key={team.teamid} value={team.teamid}>{countMatchesForTeam(team.teamid)} {team.teamname}</option> 
          ))}
          </select>
        </div>
        <div id="buttonColumnDiv">
          <div>
            <button className="column-button" onClick={onPairTwoTeamsButtonClick} >
		          → 
	          </button>
          </div>
          <div>
            <button className="column-button" onClick={onBackArrowClick} >
		          ← 
	          </button>
          </div>
          <div>
          <button className="column-button" onClick={onValidateSchedule} >
            Validate Schedule
	        </button>
          </div>
          <button className="data-button" onClick={onSaveSchedule} >
            Save
	        </button>
          <div>
          </div>
          <div>
          <button className="data-button" onClick={onDeleteFromDatabase} >
            Delete
	        </button>
          </div>
          <div>
            <Link
                className="data-button"
                href={`/changeScheduleDate?originalDate=${scheduleDate}`} 
                        >
                Change Date
              </Link>
          </div>
          <div>
            <Link
                className="dangerous-button"
                href="/admin"
              >
                Cancel
              </Link>
          </div>
        </div>
        <div id="matchesSelectionDiv" > 
          <div>
            <label>Matches scheduled for {leagueCtx.league.day}, {scheduleDate}</label>
          </div>
          <select id="matchesSelect" size={20} multiple={true}> 
          {savedMatches.map((match) => (
									<option key={match.scheduleid} value={match.scheduleid}>{generateMatchName(match.scheduleid)} </option>
								))}
          {newMatches.map((match) => (
									<option key={match.scheduleid} value={match.scheduleid}>{generateMatchName(match.scheduleid)} </option>
								))}
          </select>
        </div>
      <div id="teamsOutDiv">
        Teams out {scheduleDate} :
        <br/>
        {teamsOut.map((team, index) => (
          <React.Fragment key={index}>
            {team.teamname}      <br/>
          </React.Fragment>
        ))}
      </div>
      <div id="teamHistoryDiv">Team history: {selectedTeam && selectedTeam != undefined ? selectedTeam.teamname : 'No team selected'}</div>
        <br/>
        {matchHistory.map((match:ScheduleProps) => buildMatchHistoryItem(match))} ;
      </div>  
      <div id="successDiv">
        {successMessage}
      </div>
      <div id="warningDiv" style={{ whiteSpace: 'pre-line' }}>
        {warningMessage}
      </div>
      <div id="errorDiv">
        {errorMessage}
      </div>
    </div>
  );


}


