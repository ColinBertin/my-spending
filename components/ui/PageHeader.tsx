import PageTitle from "./PageTitle";

type PageHeaderProps = {
  title: string;
  subTitle: string;
};

export default function PageHeader({ title, subTitle }: PageHeaderProps) {
  return (
    <header>
      <PageTitle title={title} />
      <p>{subTitle}</p>
    </header>
  );
}
