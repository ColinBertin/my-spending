export function isMockEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
    process.env.USE_MOCK === "true"
  );
}
