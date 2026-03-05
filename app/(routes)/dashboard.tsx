"use client";

import {
  CreditCardIcon,
  DocumentChartBarIcon,
  TagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/Button";
import Modal, { ModalTitleText } from "@/components/Modal";
import Loading from "../loading";
import { DashboardAccountSummary } from "@/types";
import { useAuthUser } from "@/utils/useAuthUser";
import TransactionContainer from "@/components/TransactionContainer";
import { getTimeOfDayGreeting } from "@/helpers";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/components/ui/NotificationProvider";
import QuickLink from "@/components/QuickLink";

type DeletableAccount = {
  id: string;
  name: string;
  transactionCount: number;
};

function InlineSpinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
      role="status"
      aria-hidden="true"
    />
  );
}

export default function Dashboard({
  accountSummaries,
}: {
  accountSummaries: DashboardAccountSummary[];
}) {
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const showErrorNotification = useErrorNotification();
  const showSuccessNotification = useSuccessNotification();
  const [activeDeleteAccount, setActiveDeleteAccount] =
    useState<DeletableAccount | null>(null);
  const [confirmAccountName, setConfirmAccountName] = useState("");
  const [hasConfirmedWarning, setHasConfirmedWarning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const accountSummariesWithId = accountSummaries.filter(
    (
      accountSummary,
    ): accountSummary is DashboardAccountSummary & {
      account: DashboardAccountSummary["account"] & { id: string };
    } => Boolean(accountSummary.account.id),
  );

  if (loading || !user) {
    return <Loading />;
  }

  const closeDeleteDialog = () => {
    if (isDeleting) return;
    setActiveDeleteAccount(null);
    setConfirmAccountName("");
    setHasConfirmedWarning(false);
  };

  const openDeleteDialog = (account: DeletableAccount) => {
    setActiveDeleteAccount(account);
    setConfirmAccountName("");
    setHasConfirmedWarning(false);
  };

  const canConfirmDelete =
    !!activeDeleteAccount &&
    confirmAccountName.trim() === activeDeleteAccount.name &&
    hasConfirmedWarning;

  const handleDeleteAccount = async () => {
    if (!activeDeleteAccount) return;

    setIsDeleting(true);
    const res = await fetch(`/api/accounts/${activeDeleteAccount.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confirmName: confirmAccountName.trim(),
      }),
    });
    const json = await res.json().catch(() => ({}));
    setIsDeleting(false);

    if (!res.ok) {
      showErrorNotification(
        typeof json.error === "string"
          ? json.error
          : "Failed to delete account",
      );
      return;
    }

    showSuccessNotification("Account deleted");
    closeDeleteDialog();
    router.refresh();
  };

  const rawUserName = user.user_metadata?.username?.trim();
  const userName = rawUserName
    ? `${rawUserName.charAt(0).toUpperCase()}${rawUserName.slice(1)}`
    : null;
  const quickLinks = [
    {
      title: "New Account",
      description: "Create a fresh account in one step",
      href: "/accounts/create",
      Icon: CreditCardIcon,
    },
    {
      title: "New Category",
      description: "Add a category for cleaner tracking",
      href: "/categories/create",
      Icon: TagIcon,
    },
    {
      title: "Pro: Generate Ledger",
      description: "Open the professional ledger tools",
      href: "/ledger-generator",
      Icon: DocumentChartBarIcon,
    },
  ];

  return (
    <div className="pt-24 sm:pt-30 pb-20 px-4 sm:px-6 flex flex-col justify-center items-center gap-10">
      <h2 className="text-3xl font-bold">
        {getTimeOfDayGreeting()}
        {userName || "there"}!
      </h2>
      <div className="w-full max-w-6xl grid grid-cols-1 xl:grid-cols-2 gap-5">
        {accountSummariesWithId.map(
          ({ account, summary, transactionCount }) => (
            <section
              key={account.id}
              className="relative w-full max-w-[34rem] mx-auto rounded-2xl border border-blue-dark/20 bg-white p-3 sm:p-4 shadow-sm"
            >
              <button
                type="button"
                onClick={() =>
                  openDeleteDialog({
                    id: account.id,
                    name: account.name,
                    transactionCount,
                  })
                }
                aria-label={`Delete ${account.name}`}
                title={`Delete ${account.name}`}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:text-red-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <TransactionContainer
                account={account}
                initialSummary={summary}
              />
            </section>
          ),
        )}
      </div>
      {accountSummariesWithId.length === 0 && (
        <p className="text-lg font-semibold">No accounts found yet.</p>
      )}
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 justify-center gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((link) => (
            <QuickLink key={link.title} {...link} />
          ))}
        </div>
      </div>

      <Modal open={!!activeDeleteAccount} onClose={closeDeleteDialog}>
        {activeDeleteAccount && (
          <div className="space-y-5">
            <ModalTitleText className="text-blue-dark">
              Delete Account
            </ModalTitleText>

            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-500">Account</p>
              <p className="break-all text-gray-800">
                {activeDeleteAccount.name}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-500">Transactions</p>
              <p className="text-gray-800">
                {activeDeleteAccount.transactionCount}
              </p>
            </div>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-600">
                Type the account name to confirm
              </span>
              <input
                type="text"
                value={confirmAccountName}
                onChange={(event) => setConfirmAccountName(event.target.value)}
                className="w-full h-10 border border-gray-500 rounded-xl px-3 text-gray-700 font-medium outline-none focus:border-purple-300"
              />
            </label>

            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p>
                Warning: This account can&apos;t be recovered. Deleting it will
                also permanently remove all transactions related to this
                account.
              </p>
              <label className="mt-3 flex items-start gap-2 text-sm text-red-700">
                <input
                  type="checkbox"
                  checked={hasConfirmedWarning}
                  onChange={(event) =>
                    setHasConfirmedWarning(event.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-300"
                />
                <span>I understand this action is permanent.</span>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                color="neutral"
                text="Cancel"
                handleChange={closeDeleteDialog}
                disabled={isDeleting}
              />
              <Button
                type="button"
                text={
                  isDeleting ? (
                    <span className="inline-flex items-center gap-2">
                      <InlineSpinner />
                      <span>Delete</span>
                    </span>
                  ) : (
                    "Delete"
                  )
                }
                handleChange={handleDeleteAccount}
                disabled={!canConfirmDelete || isDeleting}
                className="disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
