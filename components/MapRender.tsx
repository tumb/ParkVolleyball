import { GoogleMap, LoadScript } from "@react-google-maps/api";
import React from "react";

export default function MapRender() {
  return (
    <div className="h-screen w-screen">
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        libraries={["places"]}
      >
        <GoogleMap
          mapContainerStyle={{
            height: "100vh",
            width: "100vw",
          }}
          zoom={7}
          center={{
            lat: -3.745,
            lng: -38.523,
          }}
        />
      </LoadScript>
    </div>
  );
}
