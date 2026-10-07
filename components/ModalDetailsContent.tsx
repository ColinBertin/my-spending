import DetailRow from "./DetailRow";
import { Button } from "@/components/ui/button";
import Spinner from "./Spinner";

type ModalDetailsContentProps = {
  rows: { label: string; value: string }[];
  confirmValue: string;
  setConfirmValue: (value: string) => void;
  confirmTarget: string;
  closeDialog: () => void;
  isSaving: boolean;
  handleDelete: () => void;
  warning?: {
    message: string;
    checkboxLabel: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  };
};

export default function ModalDetailsContent({
  rows,
  confirmValue,
  setConfirmValue,
  confirmTarget,
  closeDialog,
  isSaving,
  handleDelete,
  warning,
}: ModalDetailsContentProps) {
  const canConfirmDelete =
    confirmValue.trim() === confirmTarget && (!warning || warning.checked);

  return (
    <>
      <div className="space-y-3 rounded-[10px] border border-[#E3DFD7] bg-[#FBFAF7] px-4 py-[14px]">
        {rows.map(({ label, value }) => (
          <DetailRow key={`${label}-${value}`} label={label} value={value} />
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-[12.5px] leading-[1.5] text-[#6B6760]">
          Type{" "}
          <span className="font-semibold text-[#17161A]">{confirmTarget}</span>{" "}
          to confirm deletion.
        </p>
        <input
          type="text"
          value={confirmValue}
          onChange={(event) => setConfirmValue(event.target.value)}
          className="h-11 w-full rounded-[9px] border border-[#E3DFD7] bg-[#FBFAF7] px-3 text-[13px] text-[#17161A] outline-none placeholder:text-[#A8A399] focus:border-[1.5px] focus:border-[#17161A] focus:bg-white"
          placeholder={confirmTarget}
        />
      </div>

      {warning && (
        <div className="rounded-[10px] border border-[#B0442A]/30 bg-[#B0442A]/[0.06] px-4 py-3 text-[12.5px] leading-[1.5] text-[#9E3B21]">
          <p>{warning.message}</p>
          <label className="mt-3 flex cursor-pointer items-start gap-2 text-[12.5px] leading-[1.5] text-[#9E3B21]">
            <input
              type="checkbox"
              checked={warning.checked}
              onChange={(event) => warning.onChange(event.target.checked)}
              className="mt-0.5 h-4 w-4 flex-none rounded border-[#E3DFD7] accent-[#B0442A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17161A]"
            />
            <span>{warning.checkboxLabel}</span>
          </label>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={closeDialog}
          disabled={isSaving}
          className="sm:min-w-[140px]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleDelete}
          disabled={isSaving || !canConfirmDelete}
          className="bg-[#B0442A] hover:bg-[#8F3620] focus-visible:ring-[#B0442A]/30 sm:min-w-[160px]"
        >
          {isSaving ? (
            <span className="inline-flex items-center gap-2">
              <Spinner className="-m-[15px] scale-[0.375]" />
              Deleting...
            </span>
          ) : (
            "Delete"
          )}
        </Button>
      </div>
    </>
  );
}
