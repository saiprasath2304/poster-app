// Core domain types for the monthly schedule poster application

export interface ScheduleEvent {
  id: string;
  date: string; // e.g. "04 Jul"
  day: string; // e.g. "Saturday"
  isoDate: string; // "2026-07-04" - used for sorting/auto-generation
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  color?: string; // hex color override for this event's text
  highlight?: boolean; // renders in the theme's highlight color (e.g. red)
  order: number;
  recurrenceId?: string; // links back to the RecurrenceRule that generated it
}

export type RecurrenceType = 'weekly' | 'monthly' | 'custom';

export interface RecurrenceItem {
  id: string;
  time: string;
  label: string;
}

export interface RecurrenceRule {
  id: string;
  type: RecurrenceType;
  dayOfWeek?: number; // 0 = Sunday .. 6 = Saturday, used for 'weekly'
  dayOfMonth?: number; // used for 'monthly'
  customDates?: string[]; // ISO dates, used for 'custom'
  title: string;
  description?: string;
  items: RecurrenceItem[];
  highlight?: boolean;
}

export interface FooterItem {
  id: string;
  time: string;
  label: string;
}

export interface FooterSection {
  id: string;
  title: string;
  dates: string[]; // display strings e.g. "02.07.26"
  items: FooterItem[];
  position: 'left' | 'right';
  visible: boolean;
  order: number;
}

export interface PosterTheme {
  id: string;
  name: string;
  bgGradientFrom: string;
  bgGradientTo: string;
  headerTextColor: string;
  headerTextShadow: string;
  tableHeaderBg: string;
  tableHeaderText: string;
  rowBgA: string;
  rowBgB: string;
  bodyTextColor: string;
  highlightColor: string;
  footerBg: string;
  footerTitleColor: string;
  borderColor: string;
}

export type LogoPosition = 'top-left' | 'top-right' | 'center-watermark';

export interface LogoConfig {
  dataUrl: string | null;
  position: LogoPosition;
  size: number; // px
  opacity: number; // 0-1, mainly for watermark mode
}

export interface PosterData {
  id: string;
  organization: string;
  month: string;
  year: number;
  tableTitle: string; // e.g. "July Regular Offerings"
  dateColumnLabel: string;
  events: ScheduleEvent[];
  recurrenceRules: RecurrenceRule[];
  footerSections: FooterSection[];
  themeId: string;
  logo: LogoConfig;
  fontScale: number; // 0.75 - 1.5
  updatedAt: string;
}

export interface PosterTemplate {
  id: string;
  name: string;
  data: PosterData;
  createdAt: string;
  updatedAt: string;
}

export type ExportFormat = 'png' | 'jpg' | 'pdf';

export interface PosterJsonExport {
  organization: string;
  month: string;
  year: number;
  events: ScheduleEvent[];
  footerSections: FooterSection[];
}
