'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase, BrandKit, DEFAULT_MODULES, DEFAULT_DEPT_COLORS, DEFAULT_LAYOUT, DashboardLayout } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const THEMES = [
  { key: 'clean_light',    label: 'Clean Light',     desc: 'White cards, colorful pills',     preview: '#F4F5F7' },
  { key: 'classic',        label: 'Classic',         desc: 'Warm ivory, formal document',     preview: '#F5F0E8' },
  { key: 'ghost_protocol', label: 'Ghost Protocol',  desc: 'White/light, classified style',   preview: '#F8F8F8' },
  { key: 'hud_cyan',       label: 'HUD Cyan',        desc: 'Dark futuristic, cyan accents',   preview: '#010B18' },
];

const FONTS = [
  { key: 'sans',  label: 'Sans-Serif',  sample: 'Aa' },
  { key: 'mono',  label: 'Monospace',   sample: 'Aa' },
  { key: 'serif', label: 'Serif',       sample: 'Aa' },
];

const WIDGET_LABELS: Record<string, string> = {
  stat_row:      'Stats Row',
  quick_actions: 'Quick Actions',
  compliance:    'Compliance',
  line_status:   'Line Status',
  task_feed:     'Task Feed',
  alerts:        'Alerts',
};

export default function DashboardPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [kit, setKit] = useState<Partial<BrandKit>>({
    brand_name: '',
    brand_primary: '#2266DD',
    brand_secondary: '#EE9900',
    brand_tertiary: '#00AA55',
    logo_url: null,
    font_family: 'sans',
    base_theme: 'clean_light',
    dashboard_layout: DEFAULT_LAYOUT,
    visible_modules: DEFAULT_MODULES.map(m => m.key),
    dept_colors: { ...DEFAULT_DEPT_COLORS },
  });
  const [activeTab, setActiveTab] = useState<'identity' | 'theme' | 'modules' | 'layout' | 'departments'>('identity');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('brandz_user');
      if (!stored) { router.push('/login'); return; }
      const user = JSON.parse(stored);
      if (!user?.organization_id) { router.push('/login'); return; }
      setOrgId(user.organization_id);
      setLoading(false);
    };
    init();
  }, [router]);

  useEffect(() => {
    if (!orgId) return;
    const load = async () => {
      const { data } = await supabase
        .from('brand_kits')
        .select('*')
        .eq('organization_id', orgId)
        .single();
      if (data) setKit(data);
    };
    load();
  }, [orgId]);

  const save = async () => {
    if (!orgId) return;
    setSaving(true);
    const payload = { ...kit, organization_id: orgId, updated_at: new Date().toISOString() };
    await supabase.from('brand_kits').upsert(payload, { onConflict: 'organization_id' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleModule = (key: string) => {
    setKit(prev => {
      const mods = prev.visible_modules || [];
      return { ...prev, visible_modules: mods.includes(key) ? mods.filter(m => m !== key) : [...mods, key] };
    });
  };

  const toggleWidget = (id: string) => {
    setKit(prev => {
      const layout = prev.dashboard_layout || DEFAULT_LAYOUT;
      return {
        ...prev,
        dashboard_layout: {
          ...layout,
          widgets: layout.widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w),
        },
      };
    });
  };

  const handleSignOut = async () => {
    localStorage.removeItem('brandz_user');
    router.push('/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F5F7' }}>
      <p style={{ color: '#888', fontSize: 14 }}>Loading...</p>
    </div>
  );

  const tabs = [
    { key: 'identity',    label: 'Identity'    },
    { key: 'theme',       label: 'Theme'       },
    { key: 'modules',     label: 'Modules'     },
    { key: 'layout',      label: 'Layout'      },
    { key: 'departments', label: 'Departments' },
  ] as const;

  return (
    <div style={{ minHeight: '100vh', background: '#F4F5F7' }}>

      {/* Top nav */}
      <div style={{ background: '#1A1A2E', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#5599DD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>TK</span>
          </div>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
            Tul<span style={{ color: '#5599DD' }}>Kenz</span> Brandz
          </span>
          {kit.brand_name && (
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginLeft: 4 }}>— {kit.brand_name}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={save} disabled={saving} style={{ padding: '6px 16px', background: saved ? '#00AA55' : '#5599DD', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Kit'}
          </button>
          <button onClick={handleSignOut} style={{ padding: '6px 12px', background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: 24 }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', border: '1px solid #E8E8EC', borderRadius: 10, padding: 4 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ flex: 1, padding: '8px 4px', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: activeTab === t.key ? '#1A1A2E' : 'transparent', color: activeTab === t.key ? '#fff' : '#888' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── IDENTITY ── */}
        {activeTab === 'identity' && (
          <Section title="Brand Identity">
            <Field label="Brand / Company Name">
              <input value={kit.brand_name || ''} onChange={e => setKit(p => ({ ...p, brand_name: e.target.value }))}
                placeholder="e.g. Chike Foods" style={inputStyle} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <Field label="Primary Color">
                <ColorRow value={kit.brand_primary || '#2266DD'} onChange={v => setKit(p => ({ ...p, brand_primary: v }))} />
              </Field>
              <Field label="Secondary Color">
                <ColorRow value={kit.brand_secondary || '#EE9900'} onChange={v => setKit(p => ({ ...p, brand_secondary: v }))} />
              </Field>
              <Field label="Tertiary Color">
                <ColorRow value={kit.brand_tertiary || '#00AA55'} onChange={v => setKit(p => ({ ...p, brand_tertiary: v }))} />
              </Field>
            </div>
            <Field label="Logo URL">
              <input value={kit.logo_url || ''} onChange={e => setKit(p => ({ ...p, logo_url: e.target.value || null }))}
                placeholder="https://your-cdn.com/logo.png" style={inputStyle} />
            </Field>
            {kit.logo_url && (
              <div style={{ marginTop: 8, padding: 12, background: '#F8F8FC', border: '1px solid #E8E8EC', borderRadius: 8, display: 'inline-block' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={kit.logo_url} alt="Logo preview" style={{ maxHeight: 48, maxWidth: 200, objectFit: 'contain' }} />
              </div>
            )}
          </Section>
        )}

        {/* ── THEME ── */}
        {activeTab === 'theme' && (
          <Section title="Base Theme">
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>The theme sets the overall UI style. Your brand colors layer on top.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {THEMES.map(t => (
                <div key={t.key} onClick={() => setKit(p => ({ ...p, base_theme: t.key as BrandKit['base_theme'] }))}
                  style={{ border: `2px solid ${kit.base_theme === t.key ? '#1A1A2E' : '#E8E8EC'}`, borderRadius: 10, padding: 14, cursor: 'pointer', background: '#fff', transition: 'border-color 0.15s' }}>
                  <div style={{ width: '100%', height: 36, borderRadius: 6, background: t.preview, border: '1px solid #E0E0E0', marginBottom: 8 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{t.desc}</div>
                  {kit.base_theme === t.key && <div style={{ marginTop: 6, fontSize: 10, color: '#5599DD', fontWeight: 600 }}>✓ Selected</div>}
                </div>
              ))}
            </div>
            <Field label="Font Family">
              <div style={{ display: 'flex', gap: 8 }}>
                {FONTS.map(f => (
                  <div key={f.key} onClick={() => setKit(p => ({ ...p, font_family: f.key as BrandKit['font_family'] }))}
                    style={{ flex: 1, border: `2px solid ${kit.font_family === f.key ? '#1A1A2E' : '#E8E8EC'}`, borderRadius: 8, padding: '10px', textAlign: 'center', cursor: 'pointer', background: '#fff' }}>
                    <div style={{ fontSize: 20, fontFamily: f.key === 'mono' ? 'monospace' : f.key === 'serif' ? 'serif' : 'sans-serif', marginBottom: 4 }}>{f.sample}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{f.label}</div>
                  </div>
                ))}
              </div>
            </Field>
          </Section>
        )}

        {/* ── MODULES ── */}
        {activeTab === 'modules' && (
          <Section title="Visible Modules">
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Choose which modules appear in the OPS navigation for this organization.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {DEFAULT_MODULES.map(m => {
                const on = (kit.visible_modules || []).includes(m.key);
                return (
                  <div key={m.key} onClick={() => toggleModule(m.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: `1.5px solid ${on ? m.color : '#E8E8EC'}`, borderRadius: 8, cursor: 'pointer', background: on ? `${m.color}0A` : '#fff', transition: 'all 0.15s' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: on ? m.color : '#DDD', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: on ? '#1A1A2E' : '#AAA' }}>{m.label}</span>
                    {on && <span style={{ marginLeft: 'auto', fontSize: 10, color: m.color, fontWeight: 600 }}>ON</span>}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── LAYOUT ── */}
        {activeTab === 'layout' && (
          <Section title="Dashboard Layout">
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Toggle which widgets appear on the dashboard.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(kit.dashboard_layout || DEFAULT_LAYOUT).widgets
                .sort((a, b) => a.order - b.order)
                .map(w => (
                  <div key={w.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', border: `1.5px solid ${w.visible ? '#1A1A2E' : '#E8E8EC'}`, borderRadius: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: '#F0F0F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888', fontWeight: 600 }}>
                      {w.order}
                    </div>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#1A1A2E' }}>{WIDGET_LABELS[w.type] || w.type}</span>
                    <button onClick={() => toggleWidget(w.id)}
                      style={{ padding: '4px 12px', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: w.visible ? '#1A1A2E' : '#F0F0F0', color: w.visible ? '#fff' : '#AAA' }}>
                      {w.visible ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                ))}
            </div>
          </Section>
        )}

        {/* ── DEPARTMENTS ── */}
        {activeTab === 'departments' && (
          <Section title="Department Colors">
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>These colors appear on department pills, badges, and category filters throughout OPS.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {Object.entries(kit.dept_colors || DEFAULT_DEPT_COLORS).map(([dept, color]) => (
                <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff', border: '1px solid #E8E8EC', borderRadius: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E', flex: 1, textTransform: 'capitalize' }}>{dept}</span>
                  <input type="color" value={color}
                    onChange={e => setKit(p => ({ ...p, dept_colors: { ...(p.dept_colors || {}), [dept]: e.target.value } }))}
                    style={{ width: 32, height: 28, border: '1px solid #E0E0E0', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                  <span style={{ fontSize: 11, color: '#AAA', fontFamily: 'monospace' }}>{color}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Save footer */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={save} disabled={saving}
            style={{ padding: '10px 28px', background: saved ? '#00AA55' : '#1A1A2E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {saving ? 'Saving...' : saved ? '✓ Brand Kit Saved' : 'Save Brand Kit'}
          </button>
        </div>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E8E8EC', borderRadius: 10, padding: 20, marginBottom: 16 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', margin: '0 0 16px', letterSpacing: 0.5 }}>{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#888', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function ColorRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        style={{ width: 36, height: 36, border: '1px solid #E0E0E0', borderRadius: 6, padding: 2, cursor: 'pointer' }} />
      <input value={value} onChange={e => onChange(e.target.value)} maxLength={7}
        style={{ ...inputStyle, fontFamily: 'monospace', flex: 1 }} />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid #E0E0E8',
  borderRadius: 8, fontSize: 13, outline: 'none', background: '#FAFAFA', color: '#1A1A2E',
};
