export interface AppItem {
  key: string;
  name: string;
  link: string;
  category: "internet" | "dev" | "random" | "apk" | "";
  description?: string;
  imageUrl?: string;
}

export interface AdItem {
  key: string;
  username: string;
  adTitle: string;
  adLink: string;
  topCode: string;
  bottomCode: string;
  popupCode?: string;
  hours: number;
  startTime: number;
  endTime: number;
  isPermanent: boolean;
  active: boolean;
  views?: number;
  clicks?: number;
}

export interface VisitStat {
  total: number;
  daily: Record<string, number | { visits: number }>;
  countries?: Record<string, number | { visits: number; daily?: Record<string, number | { visits: number }> }>;
}

export type CategoryKey = "internet" | "dev" | "random" | "apk" | "";

export interface CategoryDetail {
  icon: string;
  bg: string;
  color: string;
  fill: boolean;
  label: string;
}

export interface AdUnit {
  code: string;
  active: boolean;
}

export interface AdUnits {
  unit1?: AdUnit;
  unit2?: AdUnit;
  unit3?: AdUnit;
  unit4?: AdUnit;
  unit5?: AdUnit;
  [key: string]: AdUnit | undefined;
}

export interface UserReport {
  key: string;
  name: string;
  email: string;
  description: string;
  appName?: string;
  timestamp: number;
}
