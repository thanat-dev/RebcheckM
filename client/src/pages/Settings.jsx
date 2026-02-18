import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import {
  Settings as SettingsIcon, Save, Key, ExternalLink,
  CheckCircle2, BookOpen, Smartphone, Copy, EyeOff, Eye
} from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

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

  function handlePasteToken() {
    navigator.clipboard.readText().then(text => {
      if (text) {
        setSettings({ ...settings, line_notify_token: text.trim() });
      }
    }).catch(() => {
      // Clipboard API not available, user needs to paste manually
    });
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

      {/* Link to Guide */}
      <Link to="/guide" className="card flex items-center gap-3 hover:shadow-md transition-shadow border-l-4 border-l-primary-500">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">คู่มือตั้งค่าผ่านมือถือ</h3>
          <p className="text-xs text-gray-500">ดูวิธีตั้งค่า LINE, เพิ่มเป็นแอปบนหน้าจอ, และขั้นตอนใช้งาน</p>
        </div>
        <BookOpen className="w-5 h-5 text-primary-400 flex-shrink-0" />
      </Link>

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
              <p className="text-xs text-gray-500">เชื่อมต่อกับ LINE เพื่อส่งแจ้งเตือนเข้ากลุ่ม</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">LINE Notify Token</label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  className="input-field font-mono pr-20"
                  placeholder="วาง Token ที่ได้จาก LINE Notify ที่นี่"
                  value={settings.line_notify_token || ''}
                  onChange={e => setSettings({ ...settings, line_notify_token: e.target.value })}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    title={showToken ? 'ซ่อน' : 'แสดง'}
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handlePasteToken}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    title="วางจาก clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {settings.line_notify_token ? (
                <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ตั้งค่า Token แล้ว
                </p>
              ) : (
                <p className="text-xs text-amber-600 mt-1.5">ยังไม่ได้ตั้งค่า Token</p>
              )}
            </div>

            {/* Quick steps for mobile */}
            <div className="bg-[#06C755]/5 border border-[#06C755]/20 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#06C755]" />
                วิธีรับ Token ผ่านมือถือ (3 นาที)
              </h3>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#06C755] text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div className="text-sm text-gray-700">
                    <p>เปิดลิงก์นี้บน Browser มือถือ:</p>
                    <a
                      href="https://notify-bot.line.me/my/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#06C755] text-white rounded-lg px-3 py-1.5 text-xs font-medium mt-1 hover:bg-[#05b34d]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      เปิด LINE Notify
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#06C755] text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <p className="text-sm text-gray-700">ล็อกอินด้วย <strong>อีเมล + รหัสผ่าน</strong> บัญชี LINE</p>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#06C755] text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <p className="text-sm text-gray-700">กด <strong>"Generate token"</strong> &gt; ตั้งชื่อ <strong>"RebcheckM"</strong></p>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#06C755] text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <p className="text-sm text-gray-700"><strong>เลือกกลุ่ม LINE</strong> ที่ต้องการส่งแจ้งเตือน</p>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#06C755] text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
                  <p className="text-sm text-gray-700">กด <strong>"Copy"</strong> แล้ว<strong>วาง Token</strong> ในช่องด้านบน</p>
                </div>
              </div>

              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 flex gap-2">
                <span>⚠️</span>
                <span>อย่าลืม <strong>เชิญ LINE Notify เข้ากลุ่ม</strong> ด้วย! (ไปที่กลุ่ม &gt; เชิญ &gt; ค้นหา "LINE Notify" &gt; เพิ่ม)</span>
              </div>
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
