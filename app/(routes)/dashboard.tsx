"use client";

import {
  CreditCardIcon,
  DocumentChartBarIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AccountCard from "@/components/AccountCard";
import ModalDetailsContent from "@/components/ModalDetailsContent";
import Modal, { ModalTitleText } from "@/components/Modal";
import Loading from "../loading";
import { DashboardAccountSummary } from "@/types";
import { useAuthUser } from "@/utils/useAuthUser";
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
  const deleteRows = activeDeleteAccount
    ? [
        { label: "Account", value: activeDeleteAccount.name },
        {
          label: "Transactions",
          value: String(activeDeleteAccount.transactionCount),
        },
      ]
    : [];

  return (
    <div className="pt-24 sm:pt-30 pb-20 px-4 sm:px-6 flex flex-col justify-center items-center gap-10">
      <h2 className="text-3xl font-bold">
        {getTimeOfDayGreeting()}
        {userName || "there"}!
      </h2>
      <div className="w-full max-w-6xl grid grid-cols-1 xl:grid-cols-2 gap-5">
        {accountSummariesWithId.map((accountSummary) => (
          <AccountCard
            key={accountSummary.account.id}
            account={accountSummary}
            handleDialog={openDeleteDialog}
          />
        ))}
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
            <ModalDetailsContent
              rows={deleteRows}
              confirmValue={confirmAccountName}
              setConfirmValue={setConfirmAccountName}
              confirmTarget={activeDeleteAccount.name}
              closeDialog={closeDeleteDialog}
              isSaving={isDeleting}
              handleDelete={handleDeleteAccount}
              warning={{
                message:
                  "Warning: This account can't be recovered. Deleting it will also permanently remove all transactions related to this account.",
                checkboxLabel: "I understand this action is permanent.",
                checked: hasConfirmedWarning,
                onChange: setHasConfirmedWarning,
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
