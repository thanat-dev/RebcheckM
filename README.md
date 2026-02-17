# RebcheckM - ระบบจัดการเช็ครับ

แอปบันทึกการเดินทางไปรับเช็คในแต่ละสถานที่ พร้อมระบบนำเข้าเช็คธนาคารและส่งแจ้งเตือนเข้ากลุ่ม LINE

## Features

- **Dashboard** - ภาพรวมเช็ครับวันนี้ ยอดรวม สถานะ
- **บันทึกการเดินทาง** - สร้าง Trip ประจำวัน เพิ่มสถานที่แวะ บันทึกเวลาเข้า-ออก
- **จัดการเช็ค** - บันทึกรายละเอียดเช็ค อัพโหลดรูปเช็ค ติดตามสถานะ (รับแล้ว/นำฝาก/เคลียร์/เช็คคืน)
- **จัดการลูกค้า** - ข้อมูลลูกค้า ที่อยู่ เบอร์โทร ผู้ติดต่อ
- **ส่ง LINE** - ส่งสรุปเช็ครายวัน ส่งเช็คเดี่ยว ส่งข้อความเองเข้ากลุ่ม LINE
- **รายงาน** - สรุปยอดรายวัน/รายเดือน แยกตามธนาคาร แยกตามลูกค้า

## Tech Stack

- **Frontend:** React 18 + Vite + TailwindCSS + React Router
- **Backend:** Express.js + SQLite (better-sqlite3)
- **Notifications:** LINE Notify API
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Initialize database
npm run db:init
```

### Development

```bash
# Run both server and client in development mode
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Production

```bash
# Build client
npm run build

# Start production server
npm start
```

## LINE Notify Setup

1. ไปที่ [notify-bot.line.me/my/](https://notify-bot.line.me/my/)
2. ล็อกอินด้วยบัญชี LINE
3. กด "Generate Token"
4. ตั้งชื่อ เช่น "RebcheckM"
5. เลือกกลุ่ม LINE ที่ต้องการรับแจ้งเตือน
6. คัดลอก Token มาใส่ในหน้า Settings ของแอป

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/customers` | จัดการลูกค้า |
| GET/POST | `/api/trips` | จัดการทริป |
| POST | `/api/trips/:id/stops` | เพิ่มสถานที่แวะ |
| GET/POST | `/api/checks` | จัดการเช็ค |
| POST | `/api/line/send` | ส่งข้อความ LINE |
| POST | `/api/line/send-daily-summary` | ส่งสรุปรายวัน |
| POST | `/api/line/send-check/:id` | ส่งเช็คเดี่ยว |
| GET | `/api/reports/dashboard` | ข้อมูล Dashboard |
| GET | `/api/reports/monthly` | รายงานรายเดือน |
| GET/PUT | `/api/settings` | จัดการตั้งค่า |

## Project Structure

```
rebcheckm/
├── server/
│   ├── index.js          # Express server
│   ├── db/
│   │   ├── init.js       # Database initialization
│   │   └── connection.js # Database connection
│   ├── routes/
│   │   ├── customers.js  # Customer API
│   │   ├── trips.js      # Trip API
│   │   ├── checks.js     # Check API
│   │   ├── line.js       # LINE Notify API
│   │   ├── reports.js    # Reports API
│   │   └── settings.js   # Settings API
│   └── uploads/          # Uploaded check images
├── client/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities & API helper
│   │   ├── App.jsx       # Main app with routing
│   │   └── main.jsx      # Entry point
│   └── index.html
└── data/                 # SQLite database (auto-created)
```
