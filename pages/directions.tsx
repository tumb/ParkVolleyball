import MapRender from "@/components/MapRender";
import Layout from "@/components/UI/Layout";
import React from "react";

export default function map() {
  return (
    <Layout>
      <div className="max-h-screen">
        <div className="p-2">
          <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">
            You can find us here
          </h1>
        </div>

        <MapRender />
      </div>
    </Layout>
  );
}
