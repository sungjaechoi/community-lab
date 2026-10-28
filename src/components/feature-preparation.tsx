import { LoginInvitation } from "./login-invitation";
import { PageHeading } from "@/components/page-heading";
import { StatePanel } from "@/components/ui/state-panel";

type FeaturePreparationProps = { eyebrow: string; title: string; description: string; stateTitle: string; stateDescription: string; note: string };

export function FeaturePreparation({ eyebrow, title, description, stateTitle, stateDescription, note }: FeaturePreparationProps) {
  return (
    <>
      <PageHeading eyebrow={eyebrow} title={title} description={description} />
      <section className="feature-card" aria-label={`${title} 준비 안내`}>
        <div className="section-heading"><h2>나의 {title}</h2><span className="status-badge"><span />준비 중</span></div>
        <StatePanel kind="preparing" title={stateTitle} description={stateDescription} action={<LoginInvitation />} />
      </section>
      <p className="feature-note">{note}</p>
    </>
  );
}
