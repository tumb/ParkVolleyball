import React from "react";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { DivisionProps, ExtraTeamProps, TeamProps, ScheduleProps, convertToExtraTeam } from "@/lib/types";
import { LeagueContext } from "@/context/LeagueContext";
import { findSelectedDivision, findSelectedTeam, findSelectedExtraTeam } from "@/components/admin/scheduling_functions/SchedulingUI" ; 
import { fetchDivisionsForLeague, findDatesForLeague, findTeamsForLeague, findMatchesForLeagueAndDate } from "@/components/database/fetches";
import { submitResultsToDatabase, updateDivisionForATeam} from "@/components/database/savesOrModifications" ;

export default function SetDivisions() {
	const [warningMessage, setWarningMessage] = useState("Warnings - none");
	const [successMessage, setSuccessMessage] = useState("Success - none");
	const [errorMessage, setErrorMessage] = useState("Errors - none");
	const [selectedDates, setSelectedDates] = useState<string[]>([]) ;
	const [allDivisions, setAllDivisions] = useState<DivisionProps[]>([]) ;
	const [allDates, setAllDates] = useState<string[]>([]) ;
	const [allTeams, setAllTeams] = useState<ExtraTeamProps[]>([]) ;
	const [allMatches, setAllMatches] = useState<ScheduleProps[]> ([]) ; 
	const leagueCtx = useContext(LeagueContext);

	function addUpLosses(extraTeam : ExtraTeamProps) {
		const teamId = extraTeam.teamid ; 
		let losses = 0 ; 
		for(const match of allMatches) {
			if(match.team1 == teamId) {
				losses += match.team2wins ; 
			}
			else if (match.team2 == teamId) {
				losses += match.team1wins ; 
			}
		}
		return losses ; 
	}

	function addUpWins(extraTeam : ExtraTeamProps) {
		const teamId = extraTeam.teamid ; 
		let wins = 0 ; 
		for(const match of allMatches) {
			if(match.team1 == teamId) {
				wins += match.team1wins ; 
			}
			else if (match.team2 == teamId) {
				wins += match.team2wins ; 
			}
		}
		if(extraTeam.teamname == "Madi Troy") {
			console.log("allMatches.length: ", allMatches.length, " team: ", extraTeam.teamname, " wins: ", wins) ; 
		}
		return wins ; 
	}

	  function buildTableRowOfTeamForDivisionSelection(team:ExtraTeamProps) {
		const divisionColor = computeDivisionClassName(team.divisionid) ;
		if(team.teamid == 560) {
		console.log("divisionColor: ", divisionColor) ;
		console.log("team: ", team.teamname, " team.teamid: ", team.teamid, " team.newdivisionid: ", team.newdivisionid, " team.isSaved: ", team.isSaved) ; 
		}
		return (
			<>
			<td>{team.teamname}</td>
			<td className={`winInput ${divisionColor}`}>{divisionColor.substring("division-".length)}</td>
      		<td><div className="division-radio-group" id="division-radio-group">
					{allDivisions.map((division) => (
				        <label  key={division.divisionid} className={`radio-button ${computeDivisionClassName(division.divisionid)}`} htmlFor="two">
						<input type="radio"  key={team.teamid+"-"+division.divisionid} value={team.teamid+"-"+division.divisionid} 
							checked ={team.newdivisionid === division.divisionid} onChange={divisionHandler}/> {division.divisionname}</label>
          			))}
				</div></td>
      		<td> {team.wins}</td>
      		<td>{team.losses}</td>
      		<td><button className={`save-button ${team.isSaved ? 'success' : ''}`}  
				key={team.teamid + "-" + team.newdivisionid} name={team.teamid + "-" + team.maleid} 
				value={team.teamid + "-" + team.newdivisionid} onClick={() => onSaveClick(team.teamid)} > Save </button></td>
			</>
		)
	}

	function computeDivisionClassName(divisionId : number) {
		const thisDivision = findSelectedDivision(divisionId, allDivisions) ; 
		return "division-" + thisDivision?.divisionname ; 
	}

	function  dateSelected(event: React.ChangeEvent<HTMLSelectElement>) {
		console.log("--- dateSelected started") ; 
		const selectedOptions = event.target.selectedOptions ; 
		const chosenDates = Array.from(selectedOptions).map(option => option.value) ;
		console.log("chosenDates[0]: ", chosenDates[0] )
		setSelectedDates(chosenDates) ; 
		console.log("--- dateSelected ended") ; 
	}

	const divisionHandler = (e: React.ChangeEvent<HTMLInputElement>) =>  {
		// console.log("--- Started divisionHandler ---") ; 
		console.log("e.target.value: " + e.target.value) ;
		let values = e.target.value.split('-') ; 
		const teamId = Number(values[0]) ; 
		const divId = Number(values[1]) ; 
		console.log("divId: ", divId, " teamId: ", teamId) ;

		if(allDivisions) {
			const team = findSelectedExtraTeam(teamId, allTeams) ;
			console.log("team: ", team) ;
			if(team) {
				team.newdivisionid = divId ;
				console.log("set team: ", team.teamname, " to division: ", divId, " newdivisionid: ", team.newdivisionid) ; 
			}
			setAllTeams([...allTeams]) ; // Forces a rerender of the radio buttons. 
		}
	  } 

	function findDateAmongAllDates(selectionIndex : string) {
		const index = parseInt(selectionIndex, 10) ; 
		return allDates[index] ; 
	}


	async function onSaveClick(teamId: number) {
		console.log("--- onSaveClick started") ; 
		const extraTeam = findSelectedExtraTeam(teamId, allTeams) ;
		if(extraTeam) {
		try {
			const resultMessage = await updateDivisionForATeam(extraTeam) ; 
			if(resultMessage.includes("failed")) {
				setErrorMessage(resultMessage) ; 
			}
			else {
				setSuccessMessage(resultMessage) ;
				extraTeam.isSaved = true ; 
				setAllTeams([...allTeams]) ; // Force a rerender
				console.log("extraTeam.isSaved: " + extraTeam.isSaved) ;
			}
		} 
		catch (error: any) {
			// Do nothing. Error already passed in.
		}
		}
		console.log("--- onSaveClick ended") ; 
	} ;

	function teamNameFromId(teamId: number) {
		let teamName:string = "empty" ; 
		const team = allTeams.find(team => team.teamid === teamId) ;
		return team?.teamname ; 
	}

	useEffect(() => {
		async function fetchMatches() {
			let newMatches : ScheduleProps[] = [] ;
			for(const selectedDate of selectedDates) {
				if(leagueCtx.league.leagueid != undefined) {
					console.log("selectedDate: ", selectedDate, " selectedDates.length: ", selectedDates.length) ; 
					const existingMatches : ScheduleProps[] = await findMatchesForLeagueAndDate(leagueCtx.league.leagueid, selectedDate) ; 
					newMatches = newMatches.concat(existingMatches) ; 
					setAllMatches(newMatches) ;
				}
			}
		}
		fetchMatches() ;
	}, [selectedDates]) ;

	useEffect(() => {
		updateExtraTeams() ; 
	}, [allMatches]) ;

	function updateExtraTeams() {
		for(const extraTeam of allTeams) {
			extraTeam.wins = addUpWins(extraTeam) ;
			extraTeam.losses = addUpLosses(extraTeam) ; 
			allTeams.sort((a,b) => {
				if(a.divisionid != b.divisionid) {
					return getDivisionValue(b) - getDivisionValue(a) ; 
				}
				else {
					return b.wins - a.wins; 
				}
				(getDivisionValue(b) - getDivisionValue(a))
			}) ; 
			// console.log("team: ", extraTeam.teamname, " wins: ", extraTeam.wins) ; 
		}
		setAllTeams([...allTeams]) ;
	}

	useEffect(() => { // For the new league, fetch the divisions, dates, and teams that are in that league.
		console.log("--- started useEffect to set divisions after league changes. ") ;
		async function fetchDivisions() {
		const divisions: DivisionProps[] = await fetchDivisionsForLeague(leagueCtx.league?.leagueid as number) ; 
		setAllDivisions(divisions) ;
		console.log("allDivisions[0]: ", allDivisions[0]) ;
		}
		fetchDivisions() ;

		// Add in getting all the match dates currently in schedule for that league.
		async function fetchDates() {
			const allDates: string[] = await findDatesForLeague(leagueCtx.league.leagueid as number) ;
			setAllDates(allDates) ; 
		}
		fetchDates() ; 

		// get all the teams for that league
		async function fetchTeams() {
			// console.log("Looking for teams.") ; 
			const allTeams: TeamProps[] = await findTeamsForLeague(leagueCtx.league.leagueid as number) ; 
			let allExtraTeams: ExtraTeamProps[] = [] ; // create empty array
			for(const team of allTeams) {
				let extraTeam = convertToExtraTeam(team) ; 
				allExtraTeams.push(extraTeam) ; 
			}
			allExtraTeams.sort((a,b) => (getDivisionValue(b) - getDivisionValue(a))) ; // Will need a more accurate sort based on matches.
			setAllTeams(allExtraTeams) ; 
		}
		fetchTeams() ; 

		setSuccessMessage("Found " + allDivisions.length + " divisions, " + allDates.length + " dates, and " + allTeams.length + " matches for this league") ; 
	},[leagueCtx]) ;

	function getDivisionValue(team: TeamProps) : number {
		const division = allDivisions.find(division =>  division.divisionid === team.divisionid ) ; 
		return division != null ? division?.divisionvalue : 0 ; 
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
			width: 50px ; 
			background-color: white ; 
			text-align: center ; 
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
		.division-red {
			color: red ; 
			border-color: red ; 
		}
		.division-green{
			color: green ; 
			border-color: green ; 
		}
		.division-blue {
			color: blue ; 
			border-color: blue ; 
		}
		.save-button {
			background-color: lightgreen ; 
			border: solid ; 
			padding: 5px 20px ; 
		}
		.save-button.success {
			background-color: lightblue ; 
		}
	  `}
			</style>
			<div id="debuggingInfoDiv">
				SetDivisions debugging
				League day: {leagueCtx.league?.day}, leagueid: {leagueCtx.league.leagueid}
				<br/>
				allDivisions length: {allDivisions.length} 
				<br/>
				Date: {allDates.map((date, index) => (
									<option key={index} value={index}>{date}</option>
								))}
			</div> {/* End of debuggingInfoDiv */}
			<div  >
				<div id="extraInputsDiv">
					<div>
						<div className="columnDiv">
						<label className="bigLabel">Set Dates</label>
						</div>
						<div id="teamNameDiv"  className="columnDiv">
							<label className="inputLabel">Matches Date:</label>
							<select id="dateSelect" className="date-select" size={3} multiple={true} onChange={dateSelected}  >
								{allDates.map((date, index) => (
									<option key={index} value={date}>{date}</option>
								))}
							</select>
							<br />
						</div>
					</div>
				</div>
				<div id="newTeamDiv">
					<div id="selectionsDiv" >
						<div id="matchTableDiv">
							<div>
								<label>Teams and records for dates: {selectedDates.map((date, index) => (<span key={index}>{findDateAmongAllDates(date)} </span>))}</label>
								<table>
									<thead>
						            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Team</th>
									<th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Current Division</th>
									<th className="whitespace-nowrap py-2 font-medium text-gray-900">NextDivision</th>
									<th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Wins</th>
									<th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Losses</th>
									<th className="whitespace-nowrap py-2 font-medium text-gray-900">Save</th>
									</thead>
									<tbody className="resultTableBody">
										{allTeams.map((team) => <tr key={(team.teamid)}> {buildTableRowOfTeamForDivisionSelection(team)}</tr>)}
									</tbody>
								</table>
							</div>
						</div>
						<div id="buttonColumnDiv">
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
				<br/>
				<div id="errorDiv">{errorMessage}</div>
				<div id="warningDiv">{warningMessage}</div>
				<div id="successDiv">{successMessage}</div>
			</div>
		</div>
	);

}



