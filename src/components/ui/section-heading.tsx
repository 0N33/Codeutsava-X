type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: "start" | "center";
};

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "start",
}: SectionHeadingProps) {
  const alignment =
    align === "center"
      ? "mx-auto items-center text-center"
      : "items-start text-left";

  return (
    <header className={`flex max-w-3xl flex-col ${alignment}`}>
      <p className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
        <span aria-hidden="true" className="h-px w-8 bg-cyan-300" />
        {eyebrow}
        <span aria-hidden="true" className="size-1 bg-pink-300" />
      </p>
      <h2
        id={id}
        className="mt-5 text-balance text-3xl font-black uppercase leading-none tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8">
          {description}
        </p>
      ) : null}
    </header>
  );
}
