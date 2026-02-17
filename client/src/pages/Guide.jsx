import { useState } from 'react';
import {
  Smartphone, Wifi, Globe, Plus, Key, Send, MapPin,
  FileCheck, Users, ChevronDown, ChevronRight, CheckCircle2,
  ExternalLink, Share2, MoreVertical, Download,
  ArrowRight, Bookmark, Settings, CircleDot
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

function Section({ id, icon: Icon, title, subtitle, color, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const bgColors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    primary: 'bg-primary-500',
  };
  const lightBgColors = {
    blue: 'bg-blue-50',
    green: 'bg-emerald-50',
    amber: 'bg-amber-50',
    purple: 'bg-purple-50',
    primary: 'bg-primary-50',
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
        <div className={`mt-4 pt-4 border-t border-gray-100`}>
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
          {/* Status bar */}
          <div className="bg-gray-100 px-4 py-1.5 flex items-center justify-between text-[10px] text-gray-500">
            <span>9:41</span>
            <span className="font-medium text-gray-700">{title}</span>
            <span>100%</span>
          </div>
          {/* Content */}
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
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Smartphone className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">คู่มือตั้งค่าผ่านมือถือ</h1>
        <p className="text-gray-500 mt-1">ขั้นตอนตั้งค่าและใช้งาน RebcheckM บนมือถือ</p>
      </div>

      {/* ========= Section 1: เปิดเว็บแอป ========= */}
      <Section
        id="access"
        icon={Globe}
        title="1. เปิดใช้งานผ่านมือถือ"
        subtitle="เข้าเว็บแอปจาก Browser บนมือถือ"
        color="blue"
        defaultOpen={true}
      >
        <StepCard stepNum="1" title="เปิด Browser บนมือถือ" color="blue">
          <p>เปิด <strong>Chrome</strong> (Android) หรือ <strong>Safari</strong> (iPhone)</p>
        </StepCard>

        <StepCard stepNum="2" title="พิมพ์ที่อยู่เว็บ" color="blue">
          <p>พิมพ์ URL ของ RebcheckM ลงใน address bar:</p>
          <div className="bg-gray-100 rounded-lg px-3 py-2 font-mono text-sm text-gray-800 flex items-center gap-2 mt-1">
            <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>http://&lt;IP-เครื่อง&gt;:3001</span>
          </div>
          <Tip>
            ถ้ารันบนเครื่องเดียวกัน ใช้ <strong>http://localhost:3001</strong> ได้เลย
            ถ้าอยู่วง WiFi เดียวกัน ให้ใช้ IP ของเครื่องที่รัน เช่น <strong>http://192.168.1.xx:3001</strong>
          </Tip>
        </StepCard>

        <StepCard stepNum="3" title="หน้าจอ RebcheckM จะแสดงขึ้น" color="blue">
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
          <p className="text-center text-gray-500 text-xs">ตัวอย่างหน้า Dashboard</p>
        </StepCard>
      </Section>

      {/* ========= Section 2: เพิ่มเป็นแอปบนหน้าจอ ========= */}
      <Section
        id="homescreen"
        icon={Download}
        title="2. เพิ่มเป็นแอปบนหน้าจอ"
        subtitle="เปิดใช้ได้เหมือนแอปจริง ไม่ต้องเปิด Browser"
        color="purple"
      >
        {/* Android */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <h3 className="font-semibold text-gray-900">สำหรับ Android (Chrome)</h3>
          </div>

          <StepCard stepNum="1" title="เปิดเมนู Chrome" color="purple">
            <p>กดจุด 3 จุด <MoreVertical className="w-4 h-4 inline text-gray-500" /> ที่มุมขวาบนของ Chrome</p>
          </StepCard>

          <StepCard stepNum="2" title='กด "เพิ่มลงหน้าจอหลัก"' color="purple">
            <p>เลือก <strong>"เพิ่มลงหน้าจอหลัก"</strong> หรือ <strong>"Add to Home screen"</strong></p>
            <div className="bg-gray-100 rounded-lg p-3 mt-2 flex items-center gap-3">
              <Plus className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-800">เพิ่มลงหน้าจอหลัก</p>
                <p className="text-[10px] text-gray-500">Add to Home screen</p>
              </div>
            </div>
          </StepCard>

          <StepCard stepNum="3" title='ตั้งชื่อแล้วกด "เพิ่ม"' color="purple">
            <p>ตั้งชื่อเป็น <strong>"RebcheckM"</strong> แล้วกด <strong>"เพิ่ม"</strong></p>
          </StepCard>
        </div>

        {/* iPhone */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🍎</span>
            <h3 className="font-semibold text-gray-900">สำหรับ iPhone (Safari)</h3>
          </div>

          <StepCard stepNum="1" title="กดปุ่ม Share" color="purple">
            <p>กดปุ่ม <Share2 className="w-4 h-4 inline text-blue-500" /> Share (สี่เหลี่ยมมีลูกศรขึ้น) ที่แถบด้านล่าง</p>
          </StepCard>

          <StepCard stepNum="2" title='เลื่อนลงหา "เพิ่มไปยังหน้าจอโฮม"' color="purple">
            <p>เลือก <strong>"เพิ่มไปยังหน้าจอโฮม"</strong> หรือ <strong>"Add to Home Screen"</strong></p>
            <div className="bg-gray-100 rounded-lg p-3 mt-2 flex items-center gap-3">
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
            <p>ตั้งชื่อ <strong>"RebcheckM"</strong> แล้วกด <strong>"เพิ่ม"</strong> ที่มุมขวาบน</p>
          </StepCard>
        </div>

        <Tip>หลังจากเพิ่มแล้ว จะมีไอคอน RebcheckM อยู่บนหน้าจอ เปิดใช้ได้ทันทีเหมือนแอปจริง!</Tip>
      </Section>

      {/* ========= Section 3: ตั้งค่า LINE Notify ========= */}
      <Section
        id="line-setup"
        icon={Key}
        title="3. ตั้งค่า LINE Notify (ส่งเข้ากลุ่ม)"
        subtitle="เชื่อมต่อ LINE เพื่อส่งข้อมูลเช็คเข้ากลุ่ม"
        color="green"
      >
        <StepCard stepNum="1" title="เปิดเว็บ LINE Notify" color="green">
          <p>เปิด Browser แล้วไปที่:</p>
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
          <p>ใช้ <strong>อีเมล + รหัสผ่าน</strong> ของบัญชี LINE ในการล็อกอิน</p>
          <Tip>
            ถ้ายังไม่เคยตั้งอีเมลใน LINE ให้ไปที่ LINE &gt; ตั้งค่า &gt; บัญชี &gt; อีเมล แล้วตั้งค่าก่อน
          </Tip>
        </StepCard>

        <StepCard stepNum="3" title='กด "Generate token" (ออก Token)' color="green">
          <p>เลื่อนลงล่างสุดแล้วกดปุ่ม:</p>
          <div className="bg-gray-100 rounded-lg p-3 mt-1 text-center">
            <div className="inline-block bg-[#06C755] text-white rounded-lg px-6 py-2 text-sm font-medium">
              Generate token
            </div>
          </div>
        </StepCard>

        <StepCard stepNum="4" title="ตั้งชื่อ Token" color="green">
          <p>พิมพ์ชื่อ Token เช่น:</p>
          <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm mt-1">
            <span className="text-gray-800 font-medium">RebcheckM</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">ชื่อนี้จะแสดงเป็นชื่อผู้ส่งในกลุ่ม LINE</p>
        </StepCard>

        <StepCard stepNum="5" title="เลือกกลุ่ม LINE ที่ต้องการส่ง" color="green">
          <p>เลือกกลุ่มที่ต้องการให้ส่งข้อมูลเช็คเข้าไป เช่น:</p>
          <div className="space-y-1.5 mt-2">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <CircleDot className="w-4 h-4 text-[#06C755]" />
              <span className="text-sm">กลุ่ม "ทีมรับเช็ค"</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <CircleDot className="w-4 h-4 text-gray-300" />
              <span className="text-sm text-gray-500">กลุ่ม "บัญชี"</span>
            </div>
          </div>
          <Tip>
            ต้อง <strong>เชิญ LINE Notify เข้ากลุ่มก่อน!</strong> ไปที่กลุ่ม LINE &gt; เชิญ &gt; ค้นหา "LINE Notify" &gt; เพิ่ม
          </Tip>
        </StepCard>

        <StepCard stepNum="6" title="คัดลอก Token" color="green">
          <p>ระบบจะแสดง Token ขึ้นมา เช่น:</p>
          <div className="bg-gray-900 rounded-lg px-3 py-2 font-mono text-sm text-green-400 mt-1 break-all">
            AbCdEfGhIjKlMnOpQrStUvWxYz...
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 mt-2 flex gap-2">
            <span className="flex-shrink-0">⚠️</span>
            <span><strong>สำคัญ!</strong> Token จะแสดงแค่ครั้งเดียว กด <strong>"Copy"</strong> เก็บไว้ทันที</span>
          </div>
        </StepCard>

        <StepCard stepNum="7" title="นำ Token มาใส่ใน RebcheckM" color="green">
          <p>กลับมาที่แอป RebcheckM:</p>
          <ol className="list-decimal list-inside space-y-1 mt-1">
            <li>ไปที่เมนู <strong>ตั้งค่า</strong> <Settings className="w-3.5 h-3.5 inline text-gray-500" /></li>
            <li>วาง Token ในช่อง <strong>"LINE Notify Token"</strong></li>
            <li>กด <strong>"บันทึกการตั้งค่า"</strong></li>
          </ol>
          <MockPhone title="ตั้งค่า">
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 font-medium">LINE Notify Token</p>
              <div className="bg-gray-100 rounded px-2 py-1.5 text-[10px] font-mono text-gray-600 truncate">
                AbCdEfGhIjKlMnOp...
              </div>
              <div className="bg-primary-600 text-white rounded-lg py-1.5 text-center text-[10px] font-medium">
                บันทึกการตั้งค่า
              </div>
            </div>
          </MockPhone>
        </StepCard>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-800">เสร็จแล้ว!</p>
            <p className="text-xs text-emerald-700 mt-0.5">ตอนนี้สามารถส่งข้อมูลเช็คเข้ากลุ่ม LINE ได้แล้ว</p>
          </div>
        </div>
      </Section>

      {/* ========= Section 4: วิธีใช้งานประจำวัน ========= */}
      <Section
        id="daily-usage"
        icon={MapPin}
        title="4. วิธีใช้งานประจำวัน"
        subtitle="ขั้นตอนการทำงานในแต่ละวัน"
        color="amber"
      >
        <div className="bg-amber-50 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-medium text-amber-800 mb-2">Flow การทำงานแต่ละวัน</h3>
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
          <p>ไปที่ <strong>ลูกค้า/สถานที่</strong> <Users className="w-3.5 h-3.5 inline text-gray-500" /></p>
          <p>กด <strong>+ เพิ่มลูกค้า</strong> ใส่ชื่อ ที่อยู่ เบอร์โทร</p>
          <p className="text-xs text-gray-400">เช่น รพ.ภูมิพลอดุลยเดช, บริษัท XYZ จำกัด</p>
        </StepCard>

        <StepCard stepNum="2" title="สร้างทริปวันนี้" color="amber">
          <p>ไปที่ <strong>การเดินทาง</strong> <MapPin className="w-3.5 h-3.5 inline text-gray-500" /></p>
          <p>กด <strong>+ สร้างทริป</strong> เลือกวันที่วันนี้</p>
        </StepCard>

        <StepCard stepNum="3" title="เพิ่มสถานที่ที่จะไป" color="amber">
          <p>เข้าไปในทริป แล้วกด <strong>+ เพิ่มสถานที่</strong></p>
          <p>เลือกลูกค้าที่จะไปรับเช็ค เช่น รพ.ภูมิพลอดุลยเดช</p>
        </StepCard>

        <StepCard stepNum="4" title="ส่งแผนเดินทางเข้า LINE" color="amber">
          <p>ไปที่ <strong>ส่ง LINE</strong> <Send className="w-3.5 h-3.5 inline text-gray-500" /></p>
          <p>กด <strong>"ส่งแผนเดินทางเข้า LINE"</strong></p>
          <p className="text-xs text-gray-400">ทีมจะเห็นรายชื่อสถานที่ที่ต้องไปวันนี้ทั้งหมด</p>
        </StepCard>

        <h3 className="font-medium text-gray-900 mb-3 mt-2 flex items-center gap-2">
          <span className="text-sm bg-blue-100 text-blue-700 rounded-lg px-2 py-0.5">ระหว่างวัน - ออกรับเช็ค</span>
        </h3>

        <StepCard stepNum="5" title="ถึงสถานที่ - กดเช็คอิน" color="blue">
          <p>เข้าไปในทริป กดปุ่ม <strong>"ถึงแล้ว"</strong> ที่สถานที่นั้น</p>
          <p className="text-xs text-gray-400">ระบบจะบันทึกเวลาเข้าให้อัตโนมัติ</p>
        </StepCard>

        <StepCard stepNum="6" title="รับเช็ค - บันทึกรายละเอียด" color="blue">
          <p>ไปที่ <strong>เช็ครับ</strong> <FileCheck className="w-3.5 h-3.5 inline text-gray-500" /> กด <strong>+ เพิ่มเช็ค</strong></p>
          <ol className="list-decimal list-inside space-y-0.5 mt-1">
            <li>ใส่เลขที่เช็ค</li>
            <li>เลือกธนาคาร</li>
            <li>ใส่จำนวนเงิน</li>
            <li>เลือกลูกค้า</li>
            <li><strong>ถ่ายรูปเช็ค</strong> (กดช่อง "รูปเช็ค")</li>
            <li>กด "เพิ่มเช็ค"</li>
          </ol>
        </StepCard>

        <StepCard stepNum="7" title="เสร็จ - กดเช็คเอาท์" color="blue">
          <p>กลับไปที่ทริป กดปุ่ม <strong>"เสร็จแล้ว"</strong> ที่สถานที่นั้น</p>
          <p className="text-xs text-gray-400">ระบบจะบันทึกเวลาออกให้</p>
        </StepCard>

        <h3 className="font-medium text-gray-900 mb-3 mt-2 flex items-center gap-2">
          <span className="text-sm bg-emerald-100 text-emerald-700 rounded-lg px-2 py-0.5">ช่วงเย็น - นำเข้าธนาคาร</span>
        </h3>

        <StepCard stepNum="8" title='เช็คที่นำเข้าธนาคาร - กด "นำฝาก"' color="green">
          <p>ไปที่ <strong>เช็ครับ</strong> หาเช็คที่นำเข้าธนาคารแล้ว</p>
          <p>กดปุ่ม <strong>"นำฝาก"</strong> เพื่อเปลี่ยนสถานะ</p>
          <p className="text-xs text-gray-400">เช็คที่ยังไม่ได้นำเข้าจะยังเป็นสถานะ "รับแล้ว"</p>
        </StepCard>

        <StepCard stepNum="9" title="ส่งสรุปสถานะเช็คเข้า LINE" color="green">
          <p>ไปที่ <strong>ส่ง LINE</strong> <Send className="w-3.5 h-3.5 inline text-gray-500" /></p>
          <p>กด <strong>"ส่งสรุปสถานะเช็คเข้า LINE"</strong></p>
          <p className="text-xs text-gray-400">ทีมจะเห็นว่าเช็คไหนเข้าธนาคารแล้ว / ยังไม่เข้า</p>
        </StepCard>

        <StepCard stepNum="10" title="จบทริป" color="green">
          <p>กลับไปที่ทริป กดปุ่ม <strong>"จบทริป"</strong></p>
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1" />
        </StepCard>
      </Section>

      {/* ========= Section 5: Tips ========= */}
      <Section
        id="tips"
        icon={Bookmark}
        title="5. เทคนิคการใช้งาน"
        subtitle="ทิปส์ช่วยให้ใช้งานได้สะดวกขึ้น"
        color="primary"
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-lg">📸</span>
            <div>
              <p className="text-sm font-medium text-gray-900">ถ่ายรูปเช็คทันที</p>
              <p className="text-xs text-gray-600">ตอนเพิ่มเช็ค กดช่อง "รูปเช็ค" จะเปิดกล้องบนมือถือให้ถ่ายได้เลย</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
            <span className="text-lg">📤</span>
            <div>
              <p className="text-sm font-medium text-gray-900">ส่งเช็คเดี่ยวเข้า LINE</p>
              <p className="text-xs text-gray-600">ในหน้า "เช็ครับ" กดปุ่ม "LINE" ที่เช็คแต่ละใบ จะส่งรูปและรายละเอียดเข้ากลุ่มได้เลย</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
            <span className="text-lg">🔍</span>
            <div>
              <p className="text-sm font-medium text-gray-900">ค้นหาเช็คได้</p>
              <p className="text-xs text-gray-600">หน้า "เช็ครับ" มีช่องค้นหา สามารถค้นด้วยเลขเช็ค, ชื่อธนาคาร, หรือชื่อลูกค้า</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-lg">📊</span>
            <div>
              <p className="text-sm font-medium text-gray-900">ดูรายงานรายเดือน</p>
              <p className="text-xs text-gray-600">หน้า "รายงาน" มีสรุปยอดแยกตามธนาคาร แยกตามลูกค้า ดูกราฟรายวันได้</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
            <span className="text-lg">⚡</span>
            <div>
              <p className="text-sm font-medium text-gray-900">ต้องอยู่ WiFi เดียวกัน</p>
              <p className="text-xs text-gray-600">มือถือกับเครื่องที่รันแอปต้องอยู่วง WiFi เดียวกัน หรือเปิดผ่านอินเทอร์เน็ตได้ถ้า deploy ขึ้น server</p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
