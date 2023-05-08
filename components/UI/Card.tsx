import React from "react";

type CardProps = {
  team1: string;
  team2: string;
};

export default function Card({ team1, team2 }: CardProps) {
  return (
    <div className="group m-4 flex w-full cursor-pointer items-center justify-between space-x-20 rounded-xl bg-white p-4 shadow-xl transition-shadow hover:shadow-lg sm:p-6 lg:p-8">
      <h2 className="text-xl font-bold text-indigo-600">{team1}</h2>
      <p className="text-sm font-medium uppercase text-gray-500">VS</p>
      <h2 className="text-xl font-bold text-indigo-600">{team2}</h2>
    </div>
  );
}
