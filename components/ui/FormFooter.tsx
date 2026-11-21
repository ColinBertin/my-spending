import { useRouter } from "next/navigation";
import { Button } from "./Button";

type FormFooterProps = {
  actionText: string;
  isMutating: boolean;
  mutationText: string;
};

export default function FormFooter({
  actionText,
  isMutating,
  mutationText,
}: FormFooterProps) {
  const router = useRouter();

  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row-reverse sm:justify-start">
      <Button
        type="submit"
        size="lg"
        disabled={isMutating}
        className="sm:min-w-50"
      >
        {isMutating ? mutationText : actionText}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => router.back()}
        disabled={isMutating}
        className="sm:min-w-40"
      >
        Cancel
      </Button>
    </div>
  );
}
