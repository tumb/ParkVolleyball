import React from "react";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ScheduleData, DivisionProps, emptyDivision, TeamProps, ScheduleProps } from "@/lib/types";
import { LeagueContext } from "@/context/LeagueContext";
import { findSelectedDivision } from "@/components/admin/scheduling_functions/SchedulingUI" ; 
import { findDivisionsForLeague, findDatesForLeague, findTeamsForLeague, findMatchesForLeagueAndDate } from "@/components/database/fetches";
import { submitResultsToDatabase} from "@/components/database/savesOrModifications" ;

// import '@/styles/layouts.css' ; Not allowed to add a global style sheet. I put this into ./pages/_app.tsx but don't know that I'll use it. 

let time = '4:29';

export default function SubmitResults() {
	const [warningMessage, setWarningMessage] = useState("Warnings - none");
	const [successMessage, setSuccessMessage] = useState("Success - none");
	const [errorMessage, setErrorMessage] = useState("Errors - none");
	const [selectedDivision, setSelectedDivision] = useState(emptyDivision) ; 
	const [selectedDate, setSelectedDate] = useState("yyyy-mm-dd") ;
	const [allDivisions, setAllDivisions] = useState<DivisionProps[]>([]) ;
	const [allDates, setAllDates] = useState<string[]>([]) ;
	const [allTeams, setAllTeams] = useState<TeamProps[]>([]) ;
	const [allMatches, setAllMatches] = useState<ScheduleProps[]> ([]) ; 
	const leagueCtx = useContext(LeagueContext);

	useEffect(() => { // For the new league, fetch the divisions, dates, and teams that are in that league.
		console.log("--- started useEffect to set divisions after league changes. ") ;
		async function fetchDivisions() {
		const divisions: DivisionProps[] = await findDivisionsForLeague(leagueCtx.league?.leagueid as number) ; 
		setAllDivisions(divisions) ;
		console.log("allDivisions[0]: ", allDivisions[0]) ;
		}
		fetchDivisions() ;

		// Add in getting all the match dates currently in schedule for that league.
		async function fetchDates() {
			console.log("Looking for dates.") ; 
			const allDates: string[] = await findDatesForLeague(leagueCtx.league.leagueid as number) ;
			setAllDates(allDates) ; 
		}
		fetchDates() ; 

		// get all the teams for that league
		async function fetchTeams() {
			console.log("Looking for teams.") ; 
			const allTeams: TeamProps[] = await findTeamsForLeague(leagueCtx.league.leagueid as number) ; 
			setAllTeams(allTeams) ; 
		}
		fetchTeams() ; 

		setSuccessMessage("Found " + allDivisions.length + " divisions, " + allDates.length + " dates, and " + allTeams.length + " matches for this league") ; 
	},[leagueCtx]) ;

	const divisionHandler = (e: React.ChangeEvent<HTMLInputElement>) =>  {
		 console.log("--- Started divisionHandler ---") ; 
		 console.log("e.target.value: " + e.target.value) ;
		var divId = Number(e.currentTarget.value) ; 
		console.log("divId: ", divId) ;

		if(allDivisions) {
		const selectedDiv = findSelectedDivision(divId, allDivisions) ;
		 console.log("selectedDiv: ", selectedDiv) ;
		if(selectedDiv) {
		  setSelectedDivision(selectedDiv) ;
		}
	}
	  } 

	function  dateSelected(event: React.ChangeEvent<HTMLSelectElement>) {
		console.log("--- dateSelected started") ; 
		const index = parseInt(event.target.value, 10);
		setSelectedDate(allDates[index]) ; 
		console.log("--- dateSelected ended") ; 
	}

	useEffect(() => {
		async function fetchMatches() {
			if(leagueCtx.league.leagueid != undefined) {
				const existingMatches : ScheduleProps[] = await findMatchesForLeagueAndDate(leagueCtx.league.leagueid, selectedDate) ; 
				setAllMatches(existingMatches) ;
			}
		}
		fetchMatches() ;
	}, [selectedDate]) ;

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value} = event.target;
		console.log("name: ", name, " value: ", value) ;
		const ids: string[] = name.split("-") ;
		if(ids.length == 2) {
		const scheduleId = Number(ids[0]) ;
		const teamId = Number(ids[1]) ; 
		console.log("scheduleId: ", scheduleId, " teamid: ", teamId) ; 
		const schedule : ScheduleProps | undefined = allMatches.find(match => match.scheduleid === scheduleId) ;
		const team: TeamProps | undefined= allTeams.find(team => team.teamid === teamId) ;
		const updatedMatches = allMatches.map(match => {
            if (match.scheduleid === scheduleId) {
                if (match.team1 === teamId) {
                    return { ...match, team1wins: Number(value) };
                } else if (match.team2 === teamId) {
                    return { ...match, team2wins: Number(value) };
                }
            }
            return match;
        });

        setAllMatches(updatedMatches);		}
      };

	async function onSaveClick() {
		console.log("--- onSaveClick started") ; 
		try {
		const resultMessage = await submitResultsToDatabase(allMatches) ; 
		if(resultMessage.includes("failed")) {
			setErrorMessage(resultMessage) ; 
		}
		else {
			setSuccessMessage(resultMessage) ;
		}
		} 
		catch (error: any) {
			// Do nothing. Error already passed in.
		}
		console.log("--- onSaveClick ended") ; 
	} ;

	function buildTableRowOfMatchForInput(match:ScheduleProps) {
		return (
			<>
			<td>{match.matchdate}</td>
			<td>{teamNameFromId(match.team1)}</td>
      		<td><input type="number" className="winInput" key={match.scheduleid + "-" + match.team1} name={match.scheduleid + "-" + match.team1} 
				value={match.team1wins > 0 ? match.team1wins : 0} onChange={handleInputChange}></input></td>
      		<td> vs</td>
      		<td>{teamNameFromId(match.team2)}</td>
      		<td><input type="number" className="winInput" key={match.scheduleid + "-" + match.team2} name={match.scheduleid + "-" + match.team2} 
				value={match.team2wins > 0 ? match.team2wins : 0} onChange={handleInputChange}></input></td>
			</>
		)
	}

	function teamNameFromId(teamId: number) {
		let teamName:string = "empty" ; 
		const team = allTeams.find(team => team.teamid === teamId) ;
		return team?.teamname ; 
	}

	return (
		<div>
			<style>
				{`
          #debuggingInfoDiv {
            background-color: pink ; 
            margin-bottom: 10px ;
          }
          #infoPanelsDiv {
			  flex; flex-direction: column;
		  }
          #extraInputsDiv {
			  display: flex ;
			  justify-content: space-between ;
			  background-color: white ; 
		  }
          #buttonColumnDiv {
			display: flex ; 
          } 
          .date-select{
            margin-right: 5px;
            background-color: white ; 
            width: 80% ; 
          }
          #teamNameInput {
            width: 60% ; 
            border: solid ;
          } 
		  #successDiv {
			color: green ; 
		  }
		  #warningDiv {
			color: purple ; 
		  }
		  #errorDiv {
			color: red ; 
		  }
		  .winInput {
			border: solid ; 
			width: 50px ; 
			background-color: lightgray ; 
			text-align: right ; 
		  }
		  .resultTableBody {
			text-align: center ; 
		  }

          .inlineInputContainer {
            display: flex ;
            align-items: center ;
            margin-bottom: 5px ; 
          }
          .radio-button {
            background-color: white ; 
            padding: 10px ; 
            margin-right: 10px ;
          }
          .columnDiv {
            float: left ;
            margin-right: 10px ;  
          } 
          .bigLabel {
			  color: blue ; 
			  font-size: larger ; 
			  margin-left: 20px ; 
          } 
          .inputLabel {
			padding: 5px ; 
		} 
		.division-radio-group {
			display: flex ; 
			border: solid ; 
			height: 50px ; 
			align-items: center ; 
		}
	  `}
			</style>
			<div id="debuggingInfoDiv">
				Submit results debugging
				League day: {leagueCtx.league?.day}, leagueid: {leagueCtx.league.leagueid}
				<br/>
				allDivisions length: {allDivisions.length} 
				<br/>
				Selected division: name {selectedDivision?.divisionname}  id {selectedDivision.divisionid} 
				<br />
				Date: {selectedDate}
			</div> {/* End of debuggingInfoDiv */}
			<div id="infoPanelsDiv" >
				<div id="extraInputsDiv">
					<div>
						<div className="columnDiv">
						<label className="bigLabel">Submit Results</label>
						</div>
						<div id="teamNameDiv"  className="columnDiv">
							<label className="inputLabel">Matches Date:</label>
							<select id="dateSelect" className="date-select" size={3} multiple={false} onChange={dateSelected}  >
								{allDates.map((date, index) => (
									<option key={index} value={index}>{date}</option>
								))}
							</select>
							<br />
						</div>
						<div className="inlineInputContainer">
							<label className="inputLabel">Division:</label>
							<div className="division-radio-group" id="division-radio-group">
								{allDivisions.map((division) => (
						            <label className="radio-button" htmlFor="two"><input type="radio"  name="division" key={division.divisionid} value={division.divisionid} onChange={divisionHandler}/> {division.divisionname}</label>
          						))}
							</div>
						</div>
					</div>
				</div>
				<div id="newTeamDiv">
					<div id="selectionsDiv" >
						<div id="matchTableDiv">
							<div>
								<label>Matches for date {selectedDate}</label>
								<table>
									<thead>
						            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Match Date</th>
									<th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Team 1</th>
									<th className="whitespace-nowrap py-2 font-medium text-gray-900">Wins</th>
									<th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">VS</th>
									<th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Team2</th>
									<th className="whitespace-nowrap py-2 font-medium text-gray-900">Wins</th>
									</thead>
									<tbody className="resultTableBody">
										{allMatches.map((match) => <tr key={(match.scheduleid)}> {buildTableRowOfMatchForInput(match)}</tr>)}
									</tbody>
								</table>
							</div>
						</div>
						<div id="buttonColumnDiv">
							<button className="m-4 p-4 bg-blue-200 font-bold rounded-lg" onClick={onSaveClick} >
								Save
							</button>
							<div>
								<br />
								<Link
									className=" m-4 p-4 bg-red-200 font-bold rounded-lg text-black-800 transition hover:text-blue-800/75"
									href="/admin"
								>
									Cancel
								</Link>
								<br />
							</div>
							<br />
						</div>
					</div>

				</div>
			</div>
			<div id="Status">
				<div id="errorDiv">{errorMessage}</div>
				<div id="warningDiv">{warningMessage}</div>
				<div id="successDiv">{successMessage}</div>
			</div>
		</div>
	);

}



