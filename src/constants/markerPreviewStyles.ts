import type { Rule } from "../types";

type MarkerSeverity = Rule["eventSettings"]["severity"];

export type MarkerPreviewStyle = {
  markerFill: string;
  markerBorder: string;
  iconColor: string;
  labelFill: string;
  labelBorder: string;
  labelText: string;
};

export const markerPreviewStyles: Record<MarkerSeverity, MarkerPreviewStyle> = {
  high: {
    markerFill: "#FEE2E2",
    markerBorder: "#F04438",
    iconColor: "#FFFFFF",
    labelFill: "#FDE8E8",
    labelBorder: "#F04438",
    labelText: "#B42318",
  },
  medium: {
    markerFill: "#FFF1E5",
    markerBorder: "#F79009",
    iconColor: "#FFFFFF",
    labelFill: "#FFE8D0",
    labelBorder: "#F79009",
    labelText: "#B45309",
  },
  low: {
    markerFill: "#DBEAFE",
    markerBorder: "#1D4ED8",
    iconColor: "#FFFFFF",
    labelFill: "#E0EDFF",
    labelBorder: "#1D4ED8",
    labelText: "#1E3A8A",
  },
  informative: {
    markerFill: "#CFFAFE",
    markerBorder: "#0891B2",
    iconColor: "#FFFFFF",
    labelFill: "#D9FBFF",
    labelBorder: "#0891B2",
    labelText: "#0E7490",
  },
};
