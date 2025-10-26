"use client";

import { auth } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "../loading";
// import LineChart from "@/components/Chart";
// import BarChart from "@/components/BarChart";
// import DoughnutChart from "@/components/Doughnut";
import { useEffect, useState } from "react";
import { getAccounts } from "../lib/getAccounts";
import { Account } from "@/types/firestore";

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [accounts, setAccounts] = useState<Account[]>();

  useEffect(() => {
    getAccounts().then((accounts) => {
      setAccounts(accounts);
      console.log(accounts)
    });
  }, []);

  if (!user) return <Loading />;

  return (
    <div className="pt-20 pb-20 flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold">
        Welcome{user.displayName && `, ${user.displayName}!`}
      </h2>
      {/* <div className="flex flex-col justify-center md:flex-row gap-2 mt-4 flex-wrap">
        <BarChart />
        <LineChart />
        <DoughnutChart />
      </div> */}
      <ul>
        {accounts &&
          accounts.map((account) => <li key={account.name}><a href={`/accounts/${account.id}/details`}>{account.name}</a></li>)}
      </ul>
    </div>
  );
}
