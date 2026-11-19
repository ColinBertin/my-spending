import CreateUpdateCategory from "./create-update-category";

export const metadata = {
  title: "Add Category",
};

export default async function CreateCategoryPage() {
  return (
    <CreateUpdateCategory category={{ id: "", name: "", type: "normal" }} />
  );
}
