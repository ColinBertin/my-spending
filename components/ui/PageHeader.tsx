import Link from "next/link";

type PageHeaderProps = {
  href: string;
  linkText: string;
  title: string;
  subTitle?: string;
};

export default function PageHeader({
  href,
  linkText,
  title,
  subTitle,
}: PageHeaderProps) {
  return (
    <>
      <Link
        href={href}
        className="text-xs leading-none font-medium text-ink-muted hover:text-ink md:hidden"
      >
        ← {linkText}
      </Link>
      <h1 className="mt-2 text-2xl leading-tight font-semibold tracking-tight md:mt-0 md:text-3xl">
        {title}
      </h1>
      {subTitle && (
        <p className="mt-1.75 max-w-md text-sm leading-relaxed text-ink-subtle">
          {subTitle}
        </p>
      )}
    </>
  );
}
