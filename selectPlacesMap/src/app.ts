import axios, { AxiosResponse, AxiosError } from "axios";

// DOM elements
const form: HTMLFormElement = document.querySelector("form")!;
const addressInput: HTMLInputElement = document.getElementById(
  "address"
)! as HTMLInputElement;
const mapElement: HTMLElement | null = document.getElementById("map");

// Environment
const GOOGLE_API_KEY: string = process.env.GOOGLE_MAPS_API_KEY as string;

// API Response Types
interface Coordinates {
  lat: number;
  lng: number;
}

interface Geometry {
  location: Coordinates;
}

interface GeocodingResult {
  geometry: Geometry;
}

type GeocodingStatus =
  | "OK"
  | "ZERO_RESULTS"
  | "OVER_QUERY_LIMIT"
  | "REQUEST_DENIED"
  | "INVALID_REQUEST"
  | "UNKNOWN_ERROR";

interface GoogleGeocodingResponse {
  results: GeocodingResult[];
  status: GeocodingStatus;
}

function searchAddressHandler(event: SubmitEvent): void {
  event.preventDefault();
  const enteredAddress: string = addressInput.value;

  axios
    .get<GoogleGeocodingResponse>(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(
        enteredAddress
      )}&key=${GOOGLE_API_KEY}`
    )
    .then((response: AxiosResponse<GoogleGeocodingResponse>) => {
      if (response.data.status !== "OK") {
        throw new Error(
          `Geocoding failed with status: ${response.data.status}`
        );
      }

      if (!mapElement) {
        throw new Error("Map element not found");
      }

      const coordinates: Coordinates =
        response.data.results[0].geometry.location;
      const map: google.maps.Map = new google.maps.Map(mapElement, {
        center: coordinates,
        zoom: 16,
      });

      new google.maps.Marker({
        position: coordinates,
        map: map,
      });
    })
    .catch((err: Error | AxiosError<GoogleGeocodingResponse>) => {
      const errorMessage: string = axios.isAxiosError(err)
        ? err.response?.data.status || err.message
        : err.message;

      alert(errorMessage);
      console.error("Geocoding error:", err);
    });
}

form.addEventListener("submit", (event: Event) =>
  searchAddressHandler(event as SubmitEvent)
);
