'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and access code required'); return; }
    if (password.length < 4) { setError('Invalid access code'); return; }
    setLoading(true);
    try {
      const { data: user, error: userError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      if (userError || !user) { setError('Invalid email or access code'); setLoading(false); return; }
      if (!['super_admin', 'platform_admin', 'admin'].includes(user.role)) {
        setError('Access denied — Super Admin only'); setLoading(false); return;
      }
      localStorage.setItem('brandz_user', JSON.stringify({
        id: user.id, email: user.email,
        first_name: user.first_name, last_name: user.last_name,
        role: user.role, organization_id: user.organization_id,
      }));
      router.push('/dashboard');
    } catch { setError('Unable to connect. Check your connection.'); }
    setLoading(false);
  };

  const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #E0E0E8', borderRadius: 8, fontSize: 14, outline: 'none', background: '#FAFAFA', color: '#1A1A2E', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>TK</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E', letterSpacing: 1 }}>
              Tul<span style={{ color: '#5599DD' }}>Kenz</span> Brandz
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Brand kit configurator for TulKenz OPS</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E8E8EC', borderRadius: 12, padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A2E', margin: '0 0 20px' }}>Sign in</h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#666', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inp} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#666', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Access Code</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your access code" style={inp} />
            </div>
            {error && <div style={{ background: '#FFF0F0', border: '1px solid #FFCCCC', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 13, color: '#CC2233' }}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '11px', background: loading ? '#888' : '#1A1A2E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#AAA', marginTop: 16 }}>TulKenz Brandz — Super Admin access only</p>
      </div>
    </div>
  );
}
