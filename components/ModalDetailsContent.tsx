import DetailRow from "./DetailRow";
import Button from "./Button";

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

function InlineSpinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
      role="status"
      aria-hidden="true"
    />
  );
}

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
      <div className="space-y-3 border border-gray-200 bg-gray-50 p-4">
        {rows.map(({ label, value }) => (
          <DetailRow key={`${label}-${value}`} label={label} value={value} />
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Type <span className="font-semibold">{confirmTarget}</span> to confirm
          deletion.
        </p>
        <input
          type="text"
          value={confirmValue}
          onChange={(event) => setConfirmValue(event.target.value)}
          className="w-full h-10 border border-gray-500 rounded-xl px-3 text-gray-700 font-medium outline-none focus:border-purple-300"
          placeholder={confirmTarget}
        />
      </div>

      {warning && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{warning.message}</p>
          <label className="mt-3 flex items-start gap-2 text-sm text-red-700">
            <input
              type="checkbox"
              checked={warning.checked}
              onChange={(event) => warning.onChange(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-300"
            />
            <span>{warning.checkboxLabel}</span>
          </label>
        </div>
      )}

      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          text="Cancel"
          color="neutral"
          handleChange={closeDialog}
          disabled={isSaving}
          className="disabled:cursor-not-allowed disabled:opacity-60"
        />
        <Button
          type="button"
          text={
            isSaving ? (
              <span className="inline-flex items-center gap-2">
                <InlineSpinner />
                Deleting...
              </span>
            ) : (
              "Delete"
            )
          }
          handleChange={handleDelete}
          disabled={isSaving || !canConfirmDelete}
          className="disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </>
  );
}
