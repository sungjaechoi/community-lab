type PageHeadingProps = { eyebrow: string; title: string; description: string };

export function PageHeading({ eyebrow, title, description }: PageHeadingProps) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-description">{description}</p>
    </div>
  );
}
