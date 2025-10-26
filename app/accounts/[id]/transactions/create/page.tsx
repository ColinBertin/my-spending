import CreateTransaction from "./create-transaction";

export default async function CreateTransactions({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return (
    <CreateTransaction id={id} />
  );
}