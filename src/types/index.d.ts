import { Timestamp } from "firebase/firestore";

export {}

declare global {
  interface Window {
    api: any;
  }
  interface ApiResponse {
    response: any;
  }
  interface UserDataReadOnly {
    expireDate: Timestamp
  }
  interface UserData {
    name: string,
    lastName: string
  }
}