import { Section } from "@/components/layout/Section";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { siteConfig } from "@/lib/site";
import { TelemetryMetrics } from "./TelemetryMetrics";

const points = [
  {
    title: "Backends that look like products",
    body: "Auth, ecommerce, social, and chat — practice the domains interviews and portfolios actually use.",
  },
  {
    title: "Data that looks like a business",
    body: "Invoices, shipments, appointments, companies — dashboards stop looking like todo apps.",
  },
  {
    title: "Consistent by design",
    body: "One response envelope, predictable pagination, documented in OpenAPI.",
  },
] as const;

export function WhySection() {
  return (
    <Section
      label={`Why ${siteConfig.name}`}
      title="Practice what you will ship."
      description="Production-shaped domains, business datasets, and a single consistent envelope — not toy endpoints."
    >
      <Stagger
        as="ul"
        columns={1}
        spring="soft"
        className="glass divide-y divide-white/[0.06] rounded-[var(--radius-lg)]"
      >
        {points.map((point, index) => (
          <StaggerItem
            as="li"
            key={point.title}
            index={index}
            className="grid gap-2 px-5 py-6 sm:grid-cols-[minmax(0,240px)_1fr] sm:gap-10 sm:px-7"
          >
            <h3 className="text-base font-semibold tracking-tight text-foreground">{point.title}</h3>
            <p className="text-[15px] leading-relaxed text-muted">{point.body}</p>
          </StaggerItem>
        ))}
      </Stagger>

      <TelemetryMetrics />
    </Section>
  );
}
