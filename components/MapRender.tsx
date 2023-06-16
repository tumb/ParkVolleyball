import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import React from "react";

export default function MapRender() {
  return (
    <div className="w-fit">
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        libraries={["places"]}
      >
        <GoogleMap
          mapContainerStyle={{
            height: "100vh",
            width: "100vw",
          }}
          zoom={14}
          center={{
            lat: 42.93183755865146,
            lng: -78.8687929694006,
          }}
        >
          <Marker
            position={{
              lat: 42.93183755865146,
              lng: -78.8687929694006,
            }}
          />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
