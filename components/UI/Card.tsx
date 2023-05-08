import React from "react";

export default function Card() {
  return (
    <div className="group flex justify-between items-center space-x-4 rounded-sm bg-white p-4 shadow-xl transition-shadow hover:shadow-lg sm:p-6 lg:p-8 cursor-pointer">
      <h2 className="text-3xl font-bold text-indigo-600 sm:text-5xl">Team 1</h2>
      <p className="text-sm font-medium uppercase text-gray-500">VS</p>
      <h2 className="text-3xl font-bold text-indigo-600 sm:text-5xl">Team 2</h2>
    </div>
  );
}
