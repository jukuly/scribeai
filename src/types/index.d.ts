import { Timestamp } from "firebase/firestore";

export {}

declare global {
  interface Window {
    api: any;
  }
  interface ApiResponse {
    response: any;
  }
  interface UserData {
    expireDate: Timestamp
  }
}