import type { Dispatch, SetStateAction } from "react";
import { Category, TransactionType } from "@/types";
import Button from "./Button";

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
  "w-full h-10 border border-gray-500 rounded-xl px-3 text-gray-700 font-medium outline-none focus:border-purple-300";

function InlineSpinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
      role="status"
      aria-hidden="true"
    />
  );
}

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
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-600">Title</span>
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

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-600">Type</span>
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

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-gray-600">Category</span>
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

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-600">Amount</span>
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
            className={formFieldClassName}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-600">Currency</span>
          <select
            value={values.currency}
            onChange={(event) =>
              setValues((current) =>
                current
                  ? {
                      ...current,
                      currency: event.target.value as "JPY" | "EUR" | "USD",
                    }
                  : current,
              )
            }
            className={formFieldClassName}
          >
            <option value="JPY">JPY</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-gray-600">Date</span>
          <input
            type="date"
            value={values.date}
            onChange={(event) =>
              setValues((current) =>
                current ? { ...current, date: event.target.value } : current,
              )
            }
            className={formFieldClassName}
          />
        </label>
      </div>

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
                Saving...
              </span>
            ) : (
              "Save Changes"
            )
          }
          color="primary"
          handleChange={handleSave}
          disabled={isSaving}
          className="disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </>
  );
}
