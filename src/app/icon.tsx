import { ImageResponse } from "next/og";
import {
  HEX_MARK_INNER,
  HEX_MARK_OUTER,
  HEX_MARK_VIEWBOX,
} from "@/components/visual/HexMark";
import { themeColors } from "@/lib/theme";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** App icon — generated PNG avoids static SVG readlink issues on some volumes. */
export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <svg width="26" height="26" viewBox={HEX_MARK_VIEWBOX}>
          <polygon
            points={HEX_MARK_OUTER}
            fill="none"
            stroke={themeColors.accent}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <polygon points={HEX_MARK_INNER} fill={themeColors.accent} />
        </svg>
      </div>
    ),
    { ...size },
  );
}
