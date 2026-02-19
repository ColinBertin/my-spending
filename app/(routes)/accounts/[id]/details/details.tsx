"use client";

// import { getAccountById } from "@/app/lib/getAccount";
// import { getMonthlyRangeTransactions } from "@/app/lib/getMonthlyRangeTransactions";
import Button from "@/components/Button";
// import Select from "@/components/Select";
import TransactionList from "@/components/TransactionList";
// import { months } from "@/helpers";
import { Transaction } from "@/types";
import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

export default function AccountDetails({
  accountId,
  transactions,
}: {
  accountId: string;
  transactions: Transaction[];
}) {
  const router = useRouter();

  // const currentMonth = (new Date().getMonth() + 1).toString();
  // const currentYear = new Date().getFullYear().toString();

  // const [account, setAccount] = useState<Account>();
  // const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  // const [selectedYear, setSelectedYear] = useState<string>(currentYear);

  // const years = Array.from(
  //   { length: 8 },
  //   (_, i) => parseInt(currentYear) - 5 + i,
  // ).map((year) => ({ id: year.toString(), name: year.toString() }));

  // const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedMonth(e.target.value);
  // };

  // const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedYear(e.target.value);
  // };

  // useEffect(() => {
  //   getAccountById(id).then((account) => {
  //     setAccount(account);
  //   });

  //   getMonthlyRangeTransactions(id, selectedMonth, selectedYear).then(
  //     (transactions) => {
  //       setTransactions(transactions);
  //     },
  //   );
  // }, [id, selectedMonth, selectedYear]);

  return (
    <div className="flex flex-col justify-center items-center h-full mt-12">
      <h1 className="text-3xl font-semibold text-center text-red mb-10">
        {/* {account?.name} */} Account Name
      </h1>
      {/* <div className="relative flex gap-2 justify-around mb-8">
        <Select
          defaultValue={currentMonth}
          options={months}
          onChange={handleMonthChange}
        />
        <Select
          defaultValue={currentYear}
          options={years}
          onChange={handleYearChange}
        />
      </div> */}
      <div className="mb-6">
        {transactions && transactions.length > 0 ? (
          <TransactionList transactions={transactions} />
        ) : (
          <p className="font-bold">No transactions found.</p>
        )}
      </div>
      <Button
        type="button"
        handleChange={() =>
          router.push(`/accounts/${accountId}/transactions/create`)
        }
        color="primary"
        text="Add Transaction"
      />
    </div>
  );
}
