"use client";

import { auth } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "../loading";

export default function Dashboard() {
  const [user] = useAuthState(auth);

  if (!user) return <Loading />;

  return (
      <div className="pt-20 flex flex-col justify-center items-center">
        <h2>Welcome, {user.email}</h2>
      </div>
  );
}
