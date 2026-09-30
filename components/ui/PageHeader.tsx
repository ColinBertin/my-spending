import { ReactNode } from "react";
import PageTitle from "./PageTitle";

type PageHeaderProps = {
  title: string;
  subTitle?: string;
  hoverTitle?: string | ReactNode;
  actionButtons?: ReactNode[];
};

export default function PageHeader({
  title,
  subTitle,
  hoverTitle,
  actionButtons,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row justify-between mb-12 gap-2">
      <div>
        {hoverTitle && hoverTitle}
        <PageTitle title={title} />
        {subTitle && (
          <p className="mt-2 font-mono text-[11px] text-[#5C5952]">
            {subTitle}
          </p>
        )}
      </div>
      {actionButtons && (
        <div className="flex flex-wrap items-center gap-2">
          {actionButtons.map((button) => button)}
        </div>
      )}
    </header>
  );
}
