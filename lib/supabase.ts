import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type BrandKit = {
  id: string;
  organization_id: string;
  brand_name: string | null;
  brand_primary: string;
  brand_secondary: string;
  brand_tertiary: string | null;
  logo_url: string | null;
  font_family: 'sans' | 'mono' | 'serif';
  base_theme: 'clean_light' | 'classic' | 'ghost_protocol' | 'hud_cyan';
  dashboard_layout: DashboardLayout;
  visible_modules: string[];
  dept_colors: Record<string, string>;
  updated_at: string;
  updated_by: string | null;
};

export type DashboardLayout = {
  widgets: WidgetConfig[];
};

export type WidgetConfig = {
  id: string;
  type: 'stat_row' | 'compliance' | 'line_status' | 'quick_actions' | 'task_feed' | 'alerts';
  order: number;
  visible: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
};

export const DEFAULT_MODULES = [
  { key: 'dashboard',    label: 'Dashboard',      color: '#2266DD' },
  { key: 'task_feed',    label: 'Task Feed',       color: '#00BBAA' },
  { key: 'time_clock',   label: 'Time Clock',      color: '#8844BB' },
  { key: 'cmms',         label: 'CMMS',            color: '#2266DD' },
  { key: 'inventory',    label: 'Inventory',       color: '#EE9900' },
  { key: 'documents',    label: 'Documents',       color: '#6655AA' },
  { key: 'labor',        label: 'Labor Tracking',  color: '#00AA55' },
  { key: 'procurement',  label: 'Procurement',     color: '#DD6600' },
  { key: 'approvals',    label: 'Approvals',       color: '#CC3333' },
  { key: 'quality',      label: 'Quality',         color: '#2299BB' },
  { key: 'safety',       label: 'Safety',          color: '#EE3344' },
  { key: 'sanitation',   label: 'Sanitation',      color: '#00AA55' },
  { key: 'production',   label: 'Production',      color: '#EE9900' },
  { key: 'compliance',   label: 'Compliance',      color: '#AA44BB' },
  { key: 'hr',           label: 'HR',              color: '#EE4499' },
  { key: 'reports',      label: 'Reports',         color: '#555577' },
];

export const DEFAULT_DEPT_COLORS: Record<string, string> = {
  maintenance:  '#2266DD',
  sanitation:   '#00AA55',
  production:   '#EE9900',
  quality:      '#AA44BB',
  safety:       '#EE3344',
  hr:           '#EE4499',
  warehouse:    '#44BB44',
  projects:     '#00BBAA',
};

export const DEFAULT_LAYOUT: DashboardLayout = {
  widgets: [
    { id: 'stat_row',      type: 'stat_row',      order: 1, visible: true, size: 'full'   },
    { id: 'quick_actions', type: 'quick_actions', order: 2, visible: true, size: 'medium' },
    { id: 'compliance',    type: 'compliance',    order: 3, visible: true, size: 'medium' },
    { id: 'line_status',   type: 'line_status',   order: 4, visible: true, size: 'full'   },
    { id: 'task_feed',     type: 'task_feed',     order: 5, visible: true, size: 'full'   },
    { id: 'alerts',        type: 'alerts',        order: 6, visible: true, size: 'medium' },
  ],
};
