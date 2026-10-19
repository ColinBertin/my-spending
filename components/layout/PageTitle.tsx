export default function PageTitle({ title }: { title: string }) {
  return (
    <h1 className="text-[22px] leading-[1.2] font-semibold tracking-[-0.02em] md:text-[27px]">
      {title}
    </h1>
  );
}
