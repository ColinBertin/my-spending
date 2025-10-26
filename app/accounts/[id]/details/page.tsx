import AccountDetails from "./details";

export default async function AccountDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return (
    <AccountDetails id={id} />
  );
}
