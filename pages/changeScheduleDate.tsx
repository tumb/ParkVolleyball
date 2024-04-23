import React from "react";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { LeagueContext } from "@/context/LeagueContext";
import { findDatesForLeague, findMatchesForLeagueAndDate } from "@/components/database/fetches";
import { updateMatchDate} from "@/components/database/savesOrModifications" ;
import { isValidDate } from "@/components/admin/scheduling_functions/SchedulingUI";


export default function ChangeScheduleDate() {
	const [warningMessage, setWarningMessage] = useState("Warnings - none");
	const [successMessage, setSuccessMessage] = useState("Success - none");
	const [errorMessage, setErrorMessage] = useState("Errors - none");
	const [originalDate, setOriginalDate] = useState("yyyy-mm-dd") ;
	const [newDate, setNewDate] = useState("yyyy-mm-dd") ;
	const [possibleOriginalDates, setPossibleOriginalDates] = useState<string[]>([]) ;
	const [possibleNewDates, setPossibleNewDates] = useState<string[]>([]) ;
	const [dayOfWeek, setDayOfWeek] = useState('none') ; 
	const leagueCtx = useContext(LeagueContext);


	function addNextDate(dayOfWeek : string) {
		if(dayOfWeek == 'Testday') {
			dayOfWeek = 'Wednesday' ;
		}
		const currentDate = new Date(); // apparenty a number of time since ??? in milliseconds
		// Get the current day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
		const currentDay = currentDate.getDay();
		// Get the day of the week as an integer (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
		let targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayOfWeek.toLowerCase());
		if(targetDay == -1) {
		  targetDay = 3 ; // Using wednesday for testday or a missing day.
		}
		// Calculate the number of days until the next occurrence of the target day
		let daysUntilNext = targetDay - currentDay;
		if (daysUntilNext <= 0) {
			// If the target day is earlier in the week than the current day, add 7 days to find the next occurrence
		  daysUntilNext += 7;
		}
		// Calculate the date of the next occurrence of the target day
		const nextDate = new Date(currentDate.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
		// Format the date as YYYY-MM-DD
		const formattedDate = nextDate.toISOString().split('T')[0];
		setPossibleOriginalDates(prevDates => [...prevDates, formattedDate]);
		console.log("created date: " + formattedDate + " and now have allDates.length: " + possibleOriginalDates.length) ; 
	  }

	  function createListOfPossibleNewDates() {
		let list : string[] = [] ; 
		const dayOfWeek = leagueCtx.league.day != undefined ? leagueCtx.league.day : 'Testday'; 
		// Get the day of the week as an integer (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
		let daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] ;
		let dayIndex = daysOfWeek.indexOf(dayOfWeek.toLowerCase());
		if(dayIndex == -1) {
		  dayIndex = 3 ; // Using wednesday for testday or a missing day.
		}
		setDayOfWeek(daysOfWeek[dayIndex]) ; 

		const currentDate = new Date(); // apparenty a number of time since ??? in milliseconds
		// Get the current day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
		const currentDay = currentDate.getDay();
		let startingIndex = dayIndex - currentDay ; // This gets us the next or previous day that's a 'Monday'
		console.log("startingIndex: " + startingIndex + ", dayOfWeek: " + dayOfWeek + ", dayIndex: " + dayIndex + ", currentDay: " + currentDay) ;
		for(let i = -1 ; i < 3 ; i++ ) {
			let timeFromNow = (startingIndex + i * 7)  *  24 * 60 * 60 * 1000 ;
			const nextDate = new Date(currentDate.getTime() + timeFromNow)  ; 
			const formattedDate = nextDate.toISOString().split('T')[0];
			list.push(formattedDate) ;
		}
		setPossibleNewDates(list) ; 
	  }

	  function createListOfPossibleOriginalDates() {
		// Add in getting all the match dates currently in schedule for that league.
		async function fetchDates() {
			console.log("Looking for dates.") ; 
			const allDates: string[] = await findDatesForLeague(leagueCtx.league.leagueid as number) ;
			setPossibleOriginalDates(allDates) ; 
		}
		fetchDates() ; 
		addNextDate(leagueCtx.league.day != undefined ? leagueCtx.league.day : 'Testday') ;
		setSuccessMessage("Found " + possibleOriginalDates.length + " dates for this league") ; 
	  }

	  function datesAreValid() : boolean {
		// each date is a valid date string
		let isValid = isValidDate(originalDate) && isValidDate(newDate) ; 
		// the dates are no more than a month apart
		let monthApart = new Date(originalDate).getMonth() - new Date( newDate).getMonth() ;
		isValid = isValid && (monthApart * monthApart) <= 1 ; 
		return isValid ; 
	  }

	// eslint-disable-next-line react-hooks/exhaustive-deps  
	useEffect(() => { 
		// console.log("--- started useEffect for list of dates in changeScheduleDate after league changes. ") ;
		createListOfPossibleOriginalDates() ; 
		createListOfPossibleNewDates() ; 
	},[leagueCtx]) ;

	  function  newDateSelected(event: React.ChangeEvent<HTMLSelectElement>) {
		console.log("--- dateSelected started") ; 
		const index = parseInt(event.target.value, 10);
		setNewDate(possibleNewDates[index]) ; 
		console.log("--- dateSelected ended") ; 
	}

	async function onSaveClick() {
		console.log("--- onSaveClick started") ; 
		resetStatusMessages() ; 
		if(datesAreValid()) {
			try {
			const resultMessage = await updateMatchDate(originalDate, newDate) ; 
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
		}
		else {
			setWarningMessage("Dates not valid: " + originalDate + " newDate: " + newDate)
		}
	console.log("--- onSaveClick ended") ; 
} ;

	function  originalDateSelected(event: React.ChangeEvent<HTMLSelectElement>) {
		console.log("--- dateSelected started") ; 
		const index = parseInt(event.target.value, 10);
		setOriginalDate(possibleOriginalDates[index]) ; 
		console.log("--- dateSelected ended") ; 
	}

	function resetStatusMessages() {
		setWarningMessage("No warnings") ; 
		setErrorMessage("No errors") ; 
		setSuccessMessage("No successes") ; 
	}

	return (
		<div>
			<style>
				{`
          #debuggingInfoDiv {
            background-color: pink ; 
            margin-bottom: 10px ;
          }
		  #successDiv {
			color: green ; 
		  }
		  #warningDiv {
			color: magenta ; 
		  }
		  #errorDiv {
			color: red ; 
		  }
	  `}
			</style>
			<div id="debuggingInfoDiv">
				Change dates for a batch of matches debugging
				League day: {leagueCtx.league?.day}, leagueid: {leagueCtx.league.leagueid}
				<br/>
				Date: {newDate}
			</div> 
			<div id="infoPanelsDiv" >
				<div id="extraInputsDiv">
					<div>
						<div>
							Original Date: {dayOfWeek}
							<br/>
						</div>
						<br/>
						<label className="bigLabel">Original Date of Matches </label>
						</div>
						<div id="dateSelectionDiv"  className="columnDiv">
							<select id="dateSelect" className="date-select" size={4} multiple={false} onChange={originalDateSelected}  >
								{possibleOriginalDates.map((date, index) => (
									<option key={index} value={index}>{date}</option>
								))}
							</select>
							<br />
						</div>
						<br/>
							<label className="inputLabel">Select New Match Date </label>
						<div id="dateSelectionDiv"  >
						<br/>
							<select id="dateSelect" className="date-select" size={4} multiple={false} onChange={newDateSelected}  >
								{possibleNewDates.map((date, index) => (
									<option key={index} value={index}>{date}</option>
								))}
							</select>
							<br />
						</div>
				</div>
				<div id="newDateDiv">
					<div id="selectionsDiv" >
						<div id="matchTableDiv">
							<div>
								<br/>
								<label>Change {originalDate} into {newDate} ?</label>
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



