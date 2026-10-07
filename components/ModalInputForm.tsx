import type { Dispatch, SetStateAction } from "react";
import { Category, TransactionType } from "@/types";
import { Button } from "@/components/ui/button";
import Spinner from "./Spinner";

type ModalInputValues = {
  title: string;
  type: TransactionType;
  categoryId: string;
  amount: string;
  date: string;
  currency: "JPY" | "EUR" | "USD";
};

type ModalInputFormProps = {
  values: ModalInputValues;
  setValues: Dispatch<SetStateAction<ModalInputValues | null>>;
  categories: Category[];
  isSaving: boolean;
  closeDialog: () => void;
  handleSave: () => void;
};

const formFieldClassName =
  "h-11 w-full rounded-[9px] border border-[#E3DFD7] bg-[#FBFAF7] px-3 text-[13px] text-[#17161A] outline-none focus:border-[1.5px] focus:border-[#17161A] focus:bg-white";

const labelClassName = "flex flex-col gap-2";

const labelTextClassName =
  "text-[11px] leading-none font-medium text-[#6B6760]";

export default function ModalInputForm({
  values,
  setValues,
  categories,
  isSaving,
  closeDialog,
  handleSave,
}: ModalInputFormProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClassName}>
          <span className={labelTextClassName}>Title</span>
          <input
            type="text"
            value={values.title}
            onChange={(event) =>
              setValues((current) =>
                current ? { ...current, title: event.target.value } : current,
              )
            }
            className={formFieldClassName}
          />
        </label>

        <label className={labelClassName}>
          <span className={labelTextClassName}>Type</span>
          <select
            value={values.type}
            onChange={(event) =>
              setValues((current) =>
                current
                  ? {
                      ...current,
                      type: event.target.value as TransactionType,
                    }
                  : current,
              )
            }
            className={formFieldClassName}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        <label className={`${labelClassName} sm:col-span-2`}>
          <span className={labelTextClassName}>Category</span>
          <select
            value={values.categoryId}
            onChange={(event) =>
              setValues((current) =>
                current
                  ? { ...current, categoryId: event.target.value }
                  : current,
              )
            }
            className={formFieldClassName}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClassName}>
          <span className={labelTextClassName}>Amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.amount}
            onChange={(event) =>
              setValues((current) =>
                current ? { ...current, amount: event.target.value } : current,
              )
            }
            className={`${formFieldClassName} font-mono tabular-nums`}
          />
        </label>

        <label className={labelClassName}>
          <span className={labelTextClassName}>Currency</span>
          <input
            type="text"
            readOnly
            value={values.currency}
            className={`${formFieldClassName} cursor-default bg-[#F1EEE8] font-mono text-[#6B6760] focus:border-[#E3DFD7] focus:bg-[#F1EEE8]`}
          />
        </label>

        <label className={`${labelClassName} sm:col-span-2`}>
          <span className={labelTextClassName}>Date</span>
          <input
            type="date"
            value={values.date}
            onChange={(event) =>
              setValues((current) =>
                current ? { ...current, date: event.target.value } : current,
              )
            }
            className={`${formFieldClassName} font-mono tabular-nums`}
          />
        </label>
      </div>

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
          onClick={handleSave}
          disabled={isSaving}
          className="sm:min-w-[160px]"
        >
          {isSaving ? (
            <span className="inline-flex items-center gap-2">
              <Spinner className="-m-[15px] scale-[0.375]" />
              Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </>
  );
}
