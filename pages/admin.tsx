import React from "react";
import Link from "next/link";

let time = '12:55' ;

export default function admin() 
    {
    return (
    <div >
        Admin page {time}
        <br/>
      <div>
        <br/>
        <Link className=" m-4 p-4 bg-blue-200 font-bold rounded-lgtext-green-800 transition hover:text-blue-800/75"
              href="/makeSchedule" >
                    Make or Edit Schedule
        </Link>
      </div>
      <br/>
      <div>
        <br/>
        <Link className=" m-4 p-4 bg-blue-200 font-bold rounded-lgtext-green-800 transition hover:text-blue-800/75"
              href="/addPlayer" >
                    Add a Player
        </Link>
      </div>
      <br/>
      <div>
        <br/>
        <Link className=" m-4 p-4 bg-blue-200 font-bold rounded-lgtext-green-800 transition hover:text-blue-800/75"
              href="/addLeague" >
                    Create New League
        </Link>
      </div>
    </div>
  );
}

