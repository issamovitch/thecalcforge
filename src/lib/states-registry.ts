/**
 * CalcForge - Central State Registry
 *
 * Imports all state tax configs and content components into a single
 * registry for use in page routes, sitemap generation, and navigation.
 */

import type { StateTaxConfig } from "@/types/calculator";

// ─── State Data ──────────────────────────────────────────────────────────────

import { stateTaxConfig as californiaConfig } from "../../content/paycheck/california/data";
import { stateTaxConfig as texasConfig } from "../../content/paycheck/texas/data";
import { stateTaxConfig as floridaConfig } from "../../content/paycheck/florida/data";
import { stateTaxConfig as newYorkConfig } from "../../content/paycheck/new-york/data";
import { stateTaxConfig as pennsylvaniaConfig } from "../../content/paycheck/pennsylvania/data";

// ─── State Content Components ───────────────────────────────────────────────

import CaliforniaContent from "../../content/paycheck/california/content";
import TexasContent from "../../content/paycheck/texas/content";
import FloridaContent from "../../content/paycheck/florida/content";
import NewYorkContent from "../../content/paycheck/new-york/content";
import PennsylvaniaContent from "../../content/paycheck/pennsylvania/content";

// ─── Registry Types ──────────────────────────────────────────────────────────

export interface StateEntry {
  slug: string;
  name: string;
  abbreviation: string;
  config: StateTaxConfig;
  ContentComponent: React.ComponentType<{ stateConfig: StateTaxConfig }>;
}

// ─── State Registry ──────────────────────────────────────────────────────────

export const STATES: readonly StateEntry[] = [
  {
    slug: "california",
    name: "California",
    abbreviation: "CA",
    config: californiaConfig,
    ContentComponent: CaliforniaContent,
  },
  {
    slug: "texas",
    name: "Texas",
    abbreviation: "TX",
    config: texasConfig,
    ContentComponent: TexasContent,
  },
  {
    slug: "florida",
    name: "Florida",
    abbreviation: "FL",
    config: floridaConfig,
    ContentComponent: FloridaContent,
  },
  {
    slug: "new-york",
    name: "New York",
    abbreviation: "NY",
    config: newYorkConfig,
    ContentComponent: NewYorkContent,
  },
  {
    slug: "pennsylvania",
    name: "Pennsylvania",
    abbreviation: "PA",
    config: pennsylvaniaConfig,
    ContentComponent: PennsylvaniaContent,
  },
] as const;

// ─── Lookup Helpers ──────────────────────────────────────────────────────────

const stateMap = new Map<string, StateEntry>(
  STATES.map((s) => [s.slug, s])
);

export function getStateBySlug(slug: string): StateEntry | undefined {
  return stateMap.get(slug);
}

export function getAllStateSlugs(): string[] {
  return STATES.map((s) => s.slug);
}