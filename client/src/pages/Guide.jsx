import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import {
  Smartphone, Wifi, Globe, Plus, Key, Send, MapPin,
  FileCheck, Users, ChevronDown, ChevronRight, CheckCircle2,
  ExternalLink, Share2, MoreVertical, Download,
  ArrowRight, Bookmark, Settings, CircleDot, QrCode,
  Monitor, Copy, Phone, AlertTriangle
} from 'lucide-react';

function StepCard({ stepNum, title, children, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return (
    <div className="flex gap-3">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colors[color]} border flex items-center justify-center font-bold text-sm`}>
        {stepNum}
      </div>
      <div className="flex-1 min-w-0 pb-6">
        <h4 className="font-medium text-gray-900 mb-1.5">{title}</h4>
        <div className="text-sm text-gray-600 space-y-2">{children}</div>
      </div>
    </div>
  );
}

function DeviceLabel({ type }) {
  if (type === 'computer') {
    return (
      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
        <Monitor className="w-3 h-3" /> คอมพิวเตอร์
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
      <Smartphone className="w-3 h-3" /> มือถือ
    </span>
  );
}

function Section({ id, icon: Icon, title, subtitle, color, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const bgColors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    primary: 'bg-primary-500',
  };
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 text-left"
      >
        <div className={`w-10 h-10 ${bgColors[color]} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        {open ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </button>
      {open && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

function MockPhone({ children, title }) {
  return (
    <div className="mx-auto max-w-[260px] my-4">
      <div className="bg-gray-900 rounded-[2rem] p-2 shadow-xl">
        <div className="bg-white rounded-[1.5rem] overflow-hidden">
          <div className="bg-gray-100 px-4 py-1.5 flex items-center justify-between text-[10px] text-gray-500">
            <span>9:41</span>
            <span className="font-medium text-gray-700">{title}</span>
            <span>100%</span>
          </div>
          <div className="p-3 min-h-[180px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tip({ children }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 flex gap-2">
      <span className="flex-shrink-0">💡</span>
      <span>{children}</span>
    </div>
  );
}

export default function Guide() {
  const [serverInfo, setServerInfo] = useState(null);

  useEffect(() => {
    api.getServerInfo().then(setServerInfo).catch(() => {});
  }, []);

  const wifiUrl = serverInfo?.urls?.[0]?.url;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Smartphone className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">คู่มือตั้งค่าผ่านมือถือ</h1>
        <p className="text-gray-500 mt-1">ขั้นตอนตั้งค่าและใช้งาน RebcheckM บนมือถือ</p>
      </div>

      {/* ========= แอปทำงานยังไง ========= */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200 rounded-2xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3 text-center">แอปนี้ทำงานยังไง?</h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl p-3 text-center border border-blue-200">
            <Monitor className="w-8 h-8 text-blue-500 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">คอมพิวเตอร์</p>
            <p className="text-[11px] text-gray-500 mt-1">รันแอป (เปิดทิ้งไว้)</p>
            <p className="text-[10px] text-blue-600 font-medium mt-1">ทำครั้งเดียว</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-emerald-200">
            <Smartphone className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">มือถือ</p>
            <p className="text-[11px] text-gray-500 mt-1">เปิด Browser ใช้งาน</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-1">ใช้ทุกวัน</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 text-center">
          <p className="text-sm text-gray-700">
            <strong>คอมพิวเตอร์</strong> เป็นตัวเก็บข้อมูล → <strong>มือถือ</strong> เปิดใช้งานผ่าน <strong>Chrome / Safari</strong>
          </p>
        </div>

        <div className="bg-emerald-100 rounded-xl p-3 mt-3 text-center">
          <p className="text-sm text-emerald-800 font-medium">
            ✅ ไม่ต้องติดตั้งแอปบนมือถือ<br />
            ✅ ไม่ต้องเปิด Terminal บนมือถือ<br />
            ✅ แค่เปิด Browser อย่างเดียว
          </p>
        </div>
      </div>

      {/* ========= Section 1: ตั้งค่าบนคอมพิวเตอร์ (ครั้งแรก) ========= */}
      <Section
        id="computer-setup"
        icon={Monitor}
        title="1. ตั้งค่าบนคอมพิวเตอร์ (ทำครั้งแรกครั้งเดียว)"
        subtitle="รันแอปบนคอม แล้วเปิดทิ้งไว้"
        color="blue"
        defaultOpen={true}
      >
        <div className="flex items-center gap-2 mb-4">
          <DeviceLabel type="computer" />
          <span className="text-xs text-gray-400">ทำทั้งหมดบนคอมพิวเตอร์</span>
        </div>

        <StepCard stepNum="1" title="เปิดโปรแกรม Terminal / Command Prompt บนคอม" color="blue">
          <p><strong>Windows:</strong> กด <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">Win + R</code> → พิมพ์ <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">cmd</code> → กด Enter</p>
          <p><strong>Mac:</strong> กด <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">Cmd + Space</code> → พิมพ์ <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">Terminal</code> → กด Enter</p>
          <Tip>Terminal / Command Prompt คือหน้าจอดำบนคอมพิวเตอร์ ไม่ใช่บนมือถือ!</Tip>
        </StepCard>

        <StepCard stepNum="2" title="พิมพ์คำสั่งรันแอป" color="blue">
          <p>พิมพ์คำสั่งนี้ในหน้าจอ Terminal แล้วกด Enter:</p>
          <div className="bg-gray-900 rounded-lg px-3 py-2 mt-1 font-mono text-sm text-green-400">
            npm start
          </div>
        </StepCard>

        <StepCard stepNum="3" title="จะเห็น URL แสดงขึ้นมา" color="blue">
          <p>แอปจะแสดง URL สำหรับเปิดจากมือถือ:</p>
          <div className="bg-gray-900 rounded-lg px-3 py-2 mt-1 font-mono text-xs">
            <p className="text-gray-500">╔════════════════════════════════╗</p>
            <p className="text-gray-500">║  Local:   <span className="text-blue-400">http://localhost:3001</span></p>
            <p className="text-gray-500">║  WiFi:    <span className="text-green-400 font-bold">http://192.168.1.100:3001</span>  ← <span className="text-yellow-300">ใช้อันนี้!</span></p>
            <p className="text-gray-500">╚════════════════════════════════╝</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2 text-xs text-green-800">
            <strong>⭐ สำคัญ:</strong> จดหรือจำ URL บรรทัด <strong>"WiFi:"</strong> ไว้ อันนี้คือที่อยู่สำหรับเปิดจากมือถือ<br />
            <span className="text-green-600">(ตัวเลข 192.168.x.x จะแตกต่างกันในแต่ละเครื่อง แอปหาให้อัตโนมัติ)</span>
          </div>
        </StepCard>

        <StepCard stepNum="4" title="เปิดทิ้งไว้ อย่าปิด Terminal" color="blue">
          <p>ปล่อยหน้าจอ Terminal เปิดทิ้งไว้ <strong>ห้ามปิด</strong></p>
          <p className="text-xs text-gray-400">ถ้าปิด Terminal แอปจะหยุดทำงาน มือถือจะเปิดไม่ได้</p>
        </StepCard>

        {/* Link to Connect page for QR */}
        {wifiUrl && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-center">
            <p className="text-sm font-medium text-primary-800 mb-2">URL ของเครื่องนี้:</p>
            <p className="font-mono text-lg font-bold text-primary-700 mb-3">{wifiUrl}</p>
            <Link to="/connect" className="inline-flex items-center gap-2 btn-primary text-sm">
              <QrCode className="w-4 h-4" />
              ดู QR Code สแกนจากมือถือ
            </Link>
          </div>
        )}
      </Section>

      {/* ========= Section 2: เปิดจากมือถือ ========= */}
      <Section
        id="phone-open"
        icon={Smartphone}
        title="2. เปิดแอปจากมือถือ"
        subtitle="แค่เปิด Chrome/Safari พิมพ์ URL เท่านั้น"
        color="green"
      >
        <div className="flex items-center gap-2 mb-4">
          <DeviceLabel type="phone" />
          <span className="text-xs text-gray-400">ทำทั้งหมดบนมือถือ</span>
        </div>

        <StepCard stepNum="1" title="เชื่อมต่อ WiFi เดียวกับคอม" color="green">
          <p>เปิด WiFi บนมือถือ เชื่อมต่อ <strong>WiFi ตัวเดียวกัน</strong>กับคอมพิวเตอร์ที่รันแอป</p>
          <Tip>ถ้ามือถือใช้ 4G/5G จะเปิดไม่ได้ ต้องต่อ WiFi เดียวกันเท่านั้น!</Tip>
        </StepCard>

        <StepCard stepNum="2" title="เปิด Chrome หรือ Safari" color="green">
          <div className="flex gap-3 mt-1">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1">
              <span className="text-lg">🌐</span>
              <div>
                <p className="text-xs font-medium">Android</p>
                <p className="text-[10px] text-gray-500">เปิด Chrome</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1">
              <span className="text-lg">🧭</span>
              <div>
                <p className="text-xs font-medium">iPhone</p>
                <p className="text-[10px] text-gray-500">เปิด Safari</p>
              </div>
            </div>
          </div>
        </StepCard>

        <StepCard stepNum="3" title='พิมพ์ URL ใน "ช่องที่อยู่" ด้านบน' color="green">
          <p>พิมพ์ URL ที่ได้จากขั้นตอนก่อนหน้า:</p>
          {wifiUrl ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg px-4 py-3 mt-1 text-center">
              <p className="font-mono text-base font-bold text-emerald-700">{wifiUrl}</p>
              <p className="text-[10px] text-emerald-500 mt-1">พิมพ์ตามนี้เลยแล้วกด Enter / ไป</p>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg px-4 py-3 mt-1 text-center">
              <p className="font-mono text-base font-bold text-gray-700">http://192.168.x.x:3001</p>
              <p className="text-[10px] text-gray-500 mt-1">ใส่ IP ที่ได้จากคอม แล้วกด Enter</p>
            </div>
          )}
          <MockPhone title="Chrome">
            <div className="bg-gray-100 rounded-lg px-2 py-1.5 flex items-center gap-1 mb-3">
              <Globe className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] text-gray-600 font-mono">{wifiUrl || 'http://192.168.1.100:3001'}</span>
            </div>
            <div className="text-center text-gray-300 py-6">
              <p className="text-xs">⬆️ พิมพ์ URL ในช่องนี้</p>
              <p className="text-[10px] text-gray-400 mt-1">แล้วกด Enter</p>
            </div>
          </MockPhone>
        </StepCard>

        <StepCard stepNum="4" title="เสร็จ! แอปจะแสดงขึ้นมาบนมือถือ" color="green">
          <MockPhone title="RebcheckM">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FileCheck className="w-3 h-3 text-white" />
                </div>
                <span className="font-bold text-sm text-primary-600">RebcheckM</span>
              </div>
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-gray-500">เช็ควันนี้</p>
                <p className="text-sm font-bold">0 ฉบับ</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-gray-500">การเดินทาง</p>
                <p className="text-sm font-bold">0 ทริป</p>
              </div>
            </div>
          </MockPhone>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-700 mt-2 text-center">
            ✅ ใช้งานได้แล้ว! เหมือนเปิดเว็บทั่วไปเลย
          </div>
        </StepCard>
      </Section>

      {/* ========= Section 3: เพิ่มเป็นแอปบนหน้าจอ ========= */}
      <Section
        id="homescreen"
        icon={Download}
        title="3. เพิ่มเป็นแอปบนหน้าจอ (ไม่บังคับ)"
        subtitle="เปิดได้ง่ายขึ้น ไม่ต้องพิมพ์ URL ทุกครั้ง"
        color="purple"
      >
        <div className="flex items-center gap-2 mb-4">
          <DeviceLabel type="phone" />
          <span className="text-xs text-gray-400">ทำบนมือถือ หลังจากเปิดแอปได้แล้ว</span>
        </div>

        {/* Android */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <h3 className="font-semibold text-gray-900">Android (Chrome)</h3>
          </div>

          <StepCard stepNum="1" title="เปิดเมนู Chrome" color="purple">
            <p>กดจุด 3 จุด <MoreVertical className="w-4 h-4 inline text-gray-500" /> ที่มุมขวาบน</p>
          </StepCard>

          <StepCard stepNum="2" title='กด "เพิ่มลงหน้าจอหลัก"' color="purple">
            <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-3">
              <Plus className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-800">เพิ่มลงหน้าจอหลัก</p>
                <p className="text-[10px] text-gray-500">Add to Home screen</p>
              </div>
            </div>
          </StepCard>

          <StepCard stepNum="3" title='กด "เพิ่ม"' color="purple">
            <p>ตั้งชื่อ <strong>"RebcheckM"</strong> แล้วกดเพิ่ม</p>
          </StepCard>
        </div>

        {/* iPhone */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🍎</span>
            <h3 className="font-semibold text-gray-900">iPhone (Safari)</h3>
          </div>

          <StepCard stepNum="1" title="กดปุ่ม Share" color="purple">
            <p>กดปุ่ม <Share2 className="w-4 h-4 inline text-blue-500" /> ที่แถบด้านล่าง</p>
          </StepCard>

          <StepCard stepNum="2" title='เลือก "เพิ่มไปยังหน้าจอโฮม"' color="purple">
            <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-3">
              <div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">เพิ่มไปยังหน้าจอโฮม</p>
                <p className="text-[10px] text-gray-500">Add to Home Screen</p>
              </div>
            </div>
          </StepCard>

          <StepCard stepNum="3" title='กด "เพิ่ม"' color="purple">
            <p>กด <strong>"เพิ่ม"</strong> ที่มุมขวาบน</p>
          </StepCard>
        </div>

        <Tip>หลังจากเพิ่มแล้ว จะมีไอคอน RebcheckM บนหน้าจอมือถือ กดเปิดได้เลยไม่ต้องพิมพ์ URL อีก!</Tip>
      </Section>

      {/* ========= Section 4: ตั้งค่า LINE Notify ========= */}
      <Section
        id="line-setup"
        icon={Key}
        title="4. ตั้งค่า LINE Notify (ส่งเข้ากลุ่ม)"
        subtitle="ทำบนมือถือได้เลย"
        color="green"
      >
        <div className="flex items-center gap-2 mb-4">
          <DeviceLabel type="phone" />
          <span className="text-xs text-gray-400">ทำบนมือถือได้</span>
        </div>

        <StepCard stepNum="1" title="เปิดลิงก์ LINE Notify" color="green">
          <a
            href="https://notify-bot.line.me/my/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#06C755] text-white rounded-lg px-4 py-2.5 text-sm font-medium mt-1 hover:bg-[#05b34d] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            เปิด notify-bot.line.me
          </a>
        </StepCard>

        <StepCard stepNum="2" title="ล็อกอินด้วยบัญชี LINE" color="green">
          <p>ใช้ <strong>อีเมล + รหัสผ่าน</strong> ของ LINE</p>
          <Tip>ถ้ายังไม่มีอีเมลใน LINE ให้ไปที่ LINE &gt; ตั้งค่า &gt; บัญชี &gt; อีเมล แล้วตั้งค่าก่อน</Tip>
        </StepCard>

        <StepCard stepNum="3" title='กด "Generate token"' color="green">
          <p>เลื่อนลงล่างสุด แล้วกดปุ่ม <strong>"Generate token"</strong></p>
        </StepCard>

        <StepCard stepNum="4" title='ตั้งชื่อ + เลือกกลุ่ม' color="green">
          <p>ตั้งชื่อ: <strong>RebcheckM</strong></p>
          <p>เลือกกลุ่ม LINE ที่ต้องการส่ง</p>
          <Tip>ต้อง <strong>เชิญ LINE Notify เข้ากลุ่มก่อน!</strong> ไปที่กลุ่ม &gt; เชิญ &gt; ค้นหา "LINE Notify" &gt; เพิ่ม</Tip>
        </StepCard>

        <StepCard stepNum="5" title="คัดลอก Token" color="green">
          <p>กด <strong>"Copy"</strong> เก็บ Token ไว้</p>
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 mt-1 flex gap-2">
            <span>⚠️</span>
            <span>Token จะแสดง<strong>แค่ครั้งเดียว</strong> กด Copy ทันที!</span>
          </div>
        </StepCard>

        <StepCard stepNum="6" title="วาง Token ในแอป" color="green">
          <p>กลับมาที่ RebcheckM &gt; เมนู <strong>ตั้งค่า</strong> &gt; วาง Token &gt; กด <strong>บันทึก</strong></p>
        </StepCard>
      </Section>

      {/* ========= Section 5: วิธีใช้งานประจำวัน ========= */}
      <Section
        id="daily-usage"
        icon={MapPin}
        title="5. วิธีใช้งานประจำวัน"
        subtitle="ขั้นตอนการทำงานในแต่ละวัน (ทำบนมือถือ)"
        color="amber"
      >
        <div className="flex items-center gap-2 mb-4">
          <DeviceLabel type="phone" />
          <span className="text-xs text-gray-400">ทำทั้งหมดบนมือถือ</span>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-medium text-amber-800 mb-2">Flow ประจำวัน</h3>
          <div className="flex flex-wrap items-center gap-1 text-xs text-amber-700">
            <span className="bg-white rounded px-2 py-1 font-medium">เช้า: สร้างทริป</span>
            <ArrowRight className="w-3 h-3" />
            <span className="bg-white rounded px-2 py-1 font-medium">ส่งแผน LINE</span>
            <ArrowRight className="w-3 h-3" />
            <span className="bg-white rounded px-2 py-1 font-medium">ออกรับเช็ค</span>
            <ArrowRight className="w-3 h-3" />
            <span className="bg-white rounded px-2 py-1 font-medium">บันทึกเช็ค</span>
            <ArrowRight className="w-3 h-3" />
            <span className="bg-white rounded px-2 py-1 font-medium">เย็น: ส่งสรุป LINE</span>
          </div>
        </div>

        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-sm bg-amber-100 text-amber-700 rounded-lg px-2 py-0.5">ช่วงเช้า</span>
        </h3>

        <StepCard stepNum="1" title="เพิ่มลูกค้า (ครั้งแรกเท่านั้น)" color="amber">
          <p><strong>ลูกค้า/สถานที่</strong> &gt; <strong>+ เพิ่มลูกค้า</strong></p>
          <p className="text-xs text-gray-400">เช่น รพ.ภูมิพลอดุลยเดช, บริษัท XYZ จำกัด</p>
        </StepCard>

        <StepCard stepNum="2" title="สร้างทริปวันนี้" color="amber">
          <p><strong>การเดินทาง</strong> &gt; <strong>+ สร้างทริป</strong> เลือกวันที่วันนี้</p>
        </StepCard>

        <StepCard stepNum="3" title="เพิ่มสถานที่ที่จะไป" color="amber">
          <p>เข้าไปในทริป &gt; <strong>+ เพิ่มสถานที่</strong> เลือกลูกค้า</p>
        </StepCard>

        <StepCard stepNum="4" title="ส่งแผนเดินทางเข้า LINE" color="amber">
          <p><strong>ส่ง LINE</strong> &gt; <strong>"ส่งแผนเดินทางเข้า LINE"</strong></p>
        </StepCard>

        <h3 className="font-medium text-gray-900 mb-3 mt-2 flex items-center gap-2">
          <span className="text-sm bg-blue-100 text-blue-700 rounded-lg px-2 py-0.5">ระหว่างวัน</span>
        </h3>

        <StepCard stepNum="5" title="ถึงสถานที่ → กด 'ถึงแล้ว'" color="blue">
          <p>เข้าไปในทริป &gt; กดปุ่ม <strong>"ถึงแล้ว"</strong></p>
        </StepCard>

        <StepCard stepNum="6" title="รับเช็ค → บันทึกรายละเอียด" color="blue">
          <p><strong>เช็ครับ</strong> &gt; <strong>+ เพิ่มเช็ค</strong> &gt; ใส่เลขเช็ค ธนาคาร จำนวนเงิน &gt; <strong>ถ่ายรูปเช็ค</strong></p>
        </StepCard>

        <StepCard stepNum="7" title="เสร็จ → กด 'เสร็จแล้ว'" color="blue">
          <p>กลับไปที่ทริป &gt; กดปุ่ม <strong>"เสร็จแล้ว"</strong></p>
        </StepCard>

        <h3 className="font-medium text-gray-900 mb-3 mt-2 flex items-center gap-2">
          <span className="text-sm bg-emerald-100 text-emerald-700 rounded-lg px-2 py-0.5">ช่วงเย็น</span>
        </h3>

        <StepCard stepNum="8" title='เช็คที่นำเข้าธนาคาร → กด "นำฝาก"' color="green">
          <p><strong>เช็ครับ</strong> &gt; หาเช็คที่นำเข้าแล้ว &gt; กดปุ่ม <strong>"นำฝาก"</strong></p>
        </StepCard>

        <StepCard stepNum="9" title="ส่งสรุปสถานะเช็คเข้า LINE" color="green">
          <p><strong>ส่ง LINE</strong> &gt; <strong>"ส่งสรุปสถานะเช็คเข้า LINE"</strong></p>
        </StepCard>

        <StepCard stepNum="10" title="จบทริป" color="green">
          <p>กลับไปที่ทริป &gt; กดปุ่ม <strong>"จบทริป"</strong></p>
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1" />
        </StepCard>
      </Section>

      {/* ========= Section 6: Tips ========= */}
      <Section
        id="tips"
        icon={Bookmark}
        title="6. เทคนิคการใช้งาน"
        subtitle="ทิปส์ช่วยให้ใช้งานได้สะดวกขึ้น"
        color="primary"
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-lg">📸</span>
            <div>
              <p className="text-sm font-medium text-gray-900">ถ่ายรูปเช็คทันทีจากมือถือ</p>
              <p className="text-xs text-gray-600">ตอนเพิ่มเช็ค กดช่อง "รูปเช็ค" จะเปิดกล้องให้ถ่ายได้เลย</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
            <span className="text-lg">📤</span>
            <div>
              <p className="text-sm font-medium text-gray-900">ส่งเช็คเดี่ยวเข้า LINE</p>
              <p className="text-xs text-gray-600">ในหน้า "เช็ครับ" กดปุ่ม "LINE" ที่เช็คแต่ละใบ จะส่งรูปและรายละเอียดเข้ากลุ่มได้</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
            <span className="text-lg">🔖</span>
            <div>
              <p className="text-sm font-medium text-gray-900">เพิ่มเป็นแอปบนหน้าจอ</p>
              <p className="text-xs text-gray-600">ไม่ต้องพิมพ์ URL ทุกครั้ง เพิ่มเป็นไอคอนบนหน้าจอ กดเปิดได้เลย (ดูขั้นตอนที่ 3)</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
            <span className="text-lg">⚡</span>
            <div>
              <p className="text-sm font-medium text-gray-900">คอมต้องเปิดอยู่ + WiFi เดียวกัน</p>
              <p className="text-xs text-gray-600">ถ้าคอมปิด หรือมือถือสลับไปใช้ 4G แอปจะเปิดไม่ได้</p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
