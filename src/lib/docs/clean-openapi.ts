/**
 * Strip decorative emoji from OpenAPI YAML so Scalar's sidebar uses clean
 * labels instead of emoji icons (reads as cheap/choppy in dark UI).
 *
 * Keeps tag identity stable by removing only leading pictographs so
 * `📡 Public APIs` and references stay matched as `Public APIs`.
 */
const LEADING_PICTOGRAPH =
  /[\p{Extended_Pictographic}\uFE0F\u200D\u20E3\uFE0E️]+/u;

function stripLeadingPictographs(value: string): string {
  return value.replace(LEADING_PICTOGRAPH, "").replace(/^\s+/, "");
}

export function stripOpenApiEmojis(yaml: string): string {
  return yaml
    .split("\n")
    .map((line) => {
      // Tag definitions: "- name: ⚙️ System"
      const nameMatch = line.match(/^(\s*- name:\s*)(.+)$/);
      if (nameMatch) {
        return `${nameMatch[1]}${stripLeadingPictographs(nameMatch[2]!)}`;
      }

      // Operation summaries: "      summary: ⛑️ healthcheck"
      const summaryMatch = line.match(/^(\s*summary:\s*)(.+)$/);
      if (summaryMatch && LEADING_PICTOGRAPH.test(summaryMatch[2]!)) {
        return `${summaryMatch[1]}${stripLeadingPictographs(summaryMatch[2]!)}`;
      }

      // Operation tag refs: "        - 📡 Public APIs"
      const tagRef = line.match(/^(\s+-\s+)(.+)$/);
      if (tagRef && LEADING_PICTOGRAPH.test(tagRef[2]!)) {
        const cleaned = stripLeadingPictographs(tagRef[2]!);
        // Only rewrite when the remainder looks like a tag label (not a YAML key/value)
        if (/^[A-Za-z]/.test(cleaned) && !cleaned.includes(":")) {
          return `${tagRef[1]}${cleaned}`;
        }
      }

      // Markdown headings inside descriptions: "# ⚡ Praxis API"
      const heading = line.match(/^(\s*#{1,6}\s+)(.+)$/);
      if (heading && LEADING_PICTOGRAPH.test(heading[2]!)) {
        return `${heading[1]}${stripLeadingPictographs(heading[2]!)}`;
      }

      return line;
    })
    .join("\n");
}
