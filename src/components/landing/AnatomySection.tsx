import { Section } from "@/components/layout/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { JsonHighlight } from "@/components/ui/JsonHighlight";

const ENVELOPE_JSON = `{
  "statusCode": 404,
  "data": {},
  "message": "Product does not exist",
  "success": false
}`;

const fields = [
  {
    key: "statusCode",
    body: "Mirrors the HTTP status so clients can branch without reading headers.",
  },
  {
    key: "data",
    body: "Always an object — lists ship with page, limit, and totals.",
  },
  {
    key: "message",
    body: "Human-readable and safe to surface in toasts.",
  },
  {
    key: "success",
    body: "One boolean to gate UI state. Errors keep the same shape.",
  },
] as const;

export function AnatomySection() {
  return (
    <Section
      label="Response shape"
      title="One envelope. Every route."
      description="Parse once and reuse everywhere — success and failure share the same predictable shape."
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-start">
        <Reveal direction="left" distance={80}>
          <div className="glass rounded-[var(--radius-lg)]">
            <pre className="min-w-0 overflow-x-auto whitespace-pre-wrap break-words p-6 font-mono text-[13px] leading-8 sm:p-8">
              <JsonHighlight source={ENVELOPE_JSON} />
            </pre>
          </div>
        </Reveal>

        <Stagger as="ol" columns={1} spring="soft" className="space-y-0 divide-y divide-white/[0.06] border-y border-white/[0.08]">
          {fields.map((field, index) => (
            <StaggerItem as="li" key={field.key} index={index} className="grid grid-cols-[2rem_1fr] gap-4 py-5">
              <span className="font-mono text-sm text-accent">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-mono text-sm text-foreground">{field.key}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{field.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
