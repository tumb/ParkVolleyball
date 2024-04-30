import { LeagueContext, LeagueProp} from "@/context/LeagueContext";
import React, { useContext, useEffect, useState } from "react";
import { ChangeEvent } from "react";
import {DivisionProps, SchedulingSetupProps } from "@/lib/types" ;


export default function SchedulingSetup({divisionHandler, divisionid, allDivisions, dateHandler, dateList, selectedDate }:SchedulingSetupProps ) {

  const [divId, setDivId] = useState(divisionid );
  useEffect(() => {setDivId(divisionid);}, [divisionid]);

  return (
    <div className="mx-auto px-4 ">
      <div className="mx-auto">
        <form
          action=""
          className="mb-0 mt-6 space-y-1 rounded-lg bg-white p-4 shadow-lg "
        >
          <div className="flex items-center justify-between sm:flex-row">
            <div className="w-full flex-col">
              <label className="text-sm font-semibold">
                Select Division 
              </label>
              <div className="relative">
                <select
                  className="bg-gray-100 sm:px-6 "
                  placeholder="Enter Division"
                  value={divisionid}  
                  onChange={(e) => {
                    console.log('e.target.value is: ', e.target.value) ;
                    setDivId(parseInt(e.target.value, 10)) ; 
                    divisionHandler(e) ;
                  }
                  } 
                >
                  {allDivisions.map((division:DivisionProps) => (
                    <option key={division.divisionid} value={division.divisionid}>{division.divisionname}</option>
                  ) ) } 
                </select>
                </div>
              </div>
            </div>
            <div>
                <label>Date (yyyy-mm-dd)</label>
                <div className="relative">
                <select
                  className="bg-gray-100 sm:px-6 "
                  placeholder="2024-01-01"
                  value={selectedDate}  
                    onChange={(e) => dateHandler(e)}
                >
                  {dateList.map((date:string)  => (
                    <option key={date} value={date}>{date}</option> 
                  ))}
                </select>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

