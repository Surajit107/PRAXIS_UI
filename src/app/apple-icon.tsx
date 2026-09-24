import { ImageResponse } from "next/og";
import {
  HEX_MARK_INNER,
  HEX_MARK_OUTER,
  HEX_MARK_VIEWBOX,
} from "@/components/visual/HexMark";
import { themeColors } from "@/lib/theme";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: themeColors.background,
        }}
      >
        <svg width="124" height="124" viewBox={HEX_MARK_VIEWBOX}>
          <polygon
            points={HEX_MARK_OUTER}
            fill="none"
            stroke={themeColors.accent}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <polygon points={HEX_MARK_INNER} fill={themeColors.accent} />
        </svg>
      </div>
    ),
    size,
  );
}
