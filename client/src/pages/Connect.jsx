import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../lib/api';
import {
  Smartphone, Wifi, Copy, CheckCircle2, Globe,
  Monitor, RefreshCw, QrCode, ExternalLink, Info
} from 'lucide-react';

export default function Connect() {
  const [serverInfo, setServerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState(null);

  useEffect(() => { loadServerInfo(); }, []);

  async function loadServerInfo() {
    setLoading(true);
    try {
      const data = await api.getServerInfo();
      setServerInfo(data);
      if (data.urls.length > 0) {
        setSelectedUrl(data.urls[0].url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => {
      // Fallback: select text
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!serverInfo) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Wifi className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>ไม่สามารถโหลดข้อมูลเซิร์ฟเวอร์ได้</p>
        <button onClick={loadServerInfo} className="btn-secondary mt-3">ลองใหม่</button>
      </div>
    );
  }

  const hasNetwork = serverInfo.urls.length > 0;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">เชื่อมต่อมือถือ</h1>
        <p className="text-gray-500 mt-1">
          {isMobile
            ? 'คุณกำลังเปิดจากมือถืออยู่แล้ว! ใช้งานได้เลย'
            : 'สแกน QR Code หรือพิมพ์ URL เพื่อเปิดแอปบนมือถือ'
          }
        </p>
      </div>

      {/* ถ้าเปิดจากมือถืออยู่แล้ว */}
      {isMobile && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h2 className="font-semibold text-emerald-800 text-lg">เชื่อมต่อสำเร็จแล้ว!</h2>
          <p className="text-sm text-emerald-700 mt-1">คุณกำลังใช้งาน RebcheckM บนมือถืออยู่</p>
          <p className="text-xs text-emerald-600 mt-2">
            หน้านี้ไว้สำหรับเปิดบนคอมพิวเตอร์ เพื่อแสดง QR Code ให้มือถือสแกน
          </p>
        </div>
      )}

      {/* QR Code Card */}
      {hasNetwork ? (
        <div className="card text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">สแกน QR Code นี้จากมือถือ</h2>
          </div>

          {/* QR Code */}
          <div className="inline-block bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <QRCodeSVG
              value={selectedUrl}
              size={200}
              level="M"
              bgColor="#ffffff"
              fgColor="#1e1b4b"
              includeMargin={false}
            />
          </div>

          <p className="text-xs text-gray-400 mb-4">เปิดกล้องมือถือแล้วส่องที่ QR Code เพื่อเปิดแอป</p>

          {/* URL display */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">หรือพิมพ์ URL นี้ใน Browser มือถือ:</p>

            {serverInfo.urls.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  onClick={() => setSelectedUrl(item.url)}
                  className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                    selectedUrl === item.url
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Wifi className={`w-4 h-4 flex-shrink-0 ${selectedUrl === item.url ? 'text-primary-600' : 'text-gray-400'}`} />
                  <div className="flex-1 text-left min-w-0">
                    <p className={`font-mono text-sm font-medium ${selectedUrl === item.url ? 'text-primary-700' : 'text-gray-700'}`}>
                      {item.url}
                    </p>
                    <p className="text-xs text-gray-400">{item.interface}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(item.url, item.url)}
                  className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex-shrink-0"
                  title="คัดลอก URL"
                >
                  {copied === item.url ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-8">
          <Wifi className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="font-medium text-gray-700 mb-1">ไม่พบเครือข่าย WiFi</h3>
          <p className="text-sm text-gray-500 mb-3">เครื่องที่รันแอปยังไม่ได้เชื่อมต่อ WiFi</p>
          <button onClick={loadServerInfo} className="btn-secondary inline-flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" /> ลองใหม่
          </button>
        </div>
      )}

      {/* ขั้นตอนสั้นๆ */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">ขั้นตอนเชื่อมต่อ (1 นาที)</h2>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">1</div>
            <div>
              <p className="text-sm font-medium text-gray-900">มือถือต้องต่อ WiFi เดียวกับเครื่องนี้</p>
              <p className="text-xs text-gray-500 mt-0.5">เปิด WiFi บนมือถือ แล้วเชื่อมต่อ WiFi เดียวกันกับคอมพิวเตอร์/เครื่องที่รันแอป</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">2</div>
            <div>
              <p className="text-sm font-medium text-gray-900">สแกน QR Code ด้านบน</p>
              <p className="text-xs text-gray-500 mt-0.5">เปิดกล้องมือถือ แล้วส่องที่ QR Code ด้านบน กดลิงก์ที่ขึ้นมา</p>
              <p className="text-xs text-gray-500">หรือเปิด Chrome/Safari พิมพ์ URL ที่แสดงด้านบน</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">3</div>
            <div>
              <p className="text-sm font-medium text-gray-900">เริ่มใช้งานได้เลย!</p>
              <p className="text-xs text-gray-500 mt-0.5">หน้า RebcheckM จะแสดงขึ้นบนมือถือ ใช้งานได้ทุกเมนูเหมือนบนคอมเลย</p>
            </div>
          </div>
        </div>
      </div>

      {/* วิธีหา IP เอง (กรณี QR Code ใช้ไม่ได้) */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-2">หา IP เอง (กรณีสแกนไม่ได้)</h2>
        <p className="text-xs text-gray-500 mb-4">ถ้า QR Code ข้างบนใช้ไม่ได้ สามารถหา IP ของเครื่องเองได้:</p>

        {/* Windows */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-900">Windows</h3>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 space-y-1">
            <p className="text-xs text-gray-400">เปิด Command Prompt แล้วพิมพ์:</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm text-green-400 font-mono">ipconfig</code>
              <button onClick={() => copyToClipboard('ipconfig', 'ipconfig')} className="text-gray-500 hover:text-white p-1">
                {copied === 'ipconfig' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">ดูที่ <span className="text-yellow-300">IPv4 Address</span> เช่น 192.168.1.100</p>
          </div>
        </div>

        {/* Mac */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">Mac</h3>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 space-y-1">
            <p className="text-xs text-gray-400">เปิด Terminal แล้วพิมพ์:</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm text-green-400 font-mono">ifconfig | grep "inet "</code>
              <button onClick={() => copyToClipboard('ifconfig | grep "inet "', 'ifconfig')} className="text-gray-500 hover:text-white p-1">
                {copied === 'ifconfig' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">หรือไปที่ System Preferences &gt; Network &gt; ดู IP Address</p>
          </div>
        </div>

        {/* Phone shortcut */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-medium text-gray-900">หา IP จากมือถือ (วิธีง่ายสุด)</h3>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-sm text-purple-800 space-y-2">
            <p><strong>Android:</strong> ตั้งค่า &gt; Wi-Fi &gt; กด WiFi ที่เชื่อมอยู่ &gt; ดู "IP Address" ของเราเตอร์ (Gateway)</p>
            <p><strong>iPhone:</strong> ตั้งค่า &gt; Wi-Fi &gt; กด (i) ข้าง WiFi &gt; ดู "เราเตอร์" (Router)</p>
            <div className="bg-purple-100 rounded-lg px-3 py-2 text-xs text-purple-700 mt-1">
              <strong>💡 หมายเหตุ:</strong> IP ที่ต้องใช้คือ IP ของ <strong>คอมพิวเตอร์ที่รันแอป</strong> ไม่ใช่ IP ของมือถือ สะดวกที่สุดคือดูจากหน้าจอนี้ (ด้านบน) แล้วจำ IP ไปพิมพ์บนมือถือ
            </div>
          </div>
        </div>
      </div>

      {/* Server Info */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-medium text-gray-700">ข้อมูลเซิร์ฟเวอร์</h2>
          </div>
          <button onClick={loadServerInfo} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">Hostname</p>
            <p className="font-mono text-gray-700">{serverInfo.hostname}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">Port</p>
            <p className="font-mono text-gray-700">{serverInfo.port}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">Platform</p>
            <p className="font-mono text-gray-700">{serverInfo.platform}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">Localhost</p>
            <p className="font-mono text-gray-700 text-xs">{serverInfo.localhost}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
