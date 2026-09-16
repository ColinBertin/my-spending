import { ReactElement } from "react";

export default function PageLayout({ children }: { children: ReactElement }) {
  return <div className="p-12">{children}</div>;
}
