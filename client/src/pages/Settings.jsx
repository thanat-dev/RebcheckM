import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Settings as SettingsIcon, Save, Key, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ตั้งค่า</h1>
        <p className="text-gray-500 mt-1">ตั้งค่าระบบและการเชื่อมต่อ LINE</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-xl">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">บันทึกการตั้งค่าเรียบร้อย!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* LINE Notify Settings */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Key className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">LINE Notify</h2>
              <p className="text-xs text-gray-500">เชื่อมต่อกับ LINE เพื่อส่งแจ้งเตือน</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">LINE Notify Token</label>
              <input
                type="password"
                className="input-field font-mono"
                placeholder="ใส่ Token จาก LINE Notify"
                value={settings.line_notify_token || ''}
                onChange={e => setSettings({ ...settings, line_notify_token: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1.5">
                รับ Token ได้ที่{' '}
                <a href="https://notify-bot.line.me/my/" target="_blank" rel="noopener noreferrer"
                  className="text-primary-600 hover:underline inline-flex items-center gap-0.5">
                  notify-bot.line.me <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">วิธีรับ LINE Notify Token</h3>
              <ol className="text-xs text-blue-700 space-y-1.5 list-decimal list-inside">
                <li>เข้า <strong>notify-bot.line.me/my/</strong></li>
                <li>ล็อกอินด้วยบัญชี LINE</li>
                <li>กด <strong>"Generate Token"</strong></li>
                <li>ตั้งชื่อ เช่น "RebcheckM"</li>
                <li>เลือกกลุ่ม LINE ที่ต้องการส่งแจ้งเตือน</li>
                <li>คัดลอก Token มาใส่ช่องด้านบน</li>
              </ol>
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-4 h-4 text-primary-600" />
            </div>
            <h2 className="font-semibold text-gray-900">ทั่วไป</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">ชื่อแอป</label>
              <input
                type="text"
                className="input-field"
                value={settings.app_name || ''}
                onChange={e => setSettings({ ...settings, app_name: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          {saving ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          บันทึกการตั้งค่า
        </button>
      </form>
    </div>
  );
}
