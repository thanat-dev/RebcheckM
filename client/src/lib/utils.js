export function formatMoney(amount) {
  return Number(amount || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function todayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function nowTimeStr() {
  const d = new Date();
  return d.toTimeString().substring(0, 5);
}

export const checkStatusLabels = {
  received: 'รับแล้ว',
  deposited: 'นำฝากแล้ว',
  cleared: 'เคลียร์แล้ว',
  bounced: 'เช็คคืน',
  cancelled: 'ยกเลิก',
};

export const checkStatusColors = {
  received: 'badge-received',
  deposited: 'badge-deposited',
  cleared: 'badge-cleared',
  bounced: 'badge-bounced',
  cancelled: 'badge-cancelled',
};

export const tripStatusLabels = {
  in_progress: 'กำลังเดินทาง',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
};

export const stopStatusLabels = {
  pending: 'รอไป',
  arrived: 'ถึงแล้ว',
  completed: 'เสร็จ',
  skipped: 'ข้าม',
};

export const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const bankList = [
  'ธนาคารกรุงเทพ',
  'ธนาคารกสิกรไทย',
  'ธนาคารกรุงไทย',
  'ธนาคารไทยพาณิชย์',
  'ธนาคารกรุงศรีอยุธยา',
  'ธนาคารทหารไทยธนชาต',
  'ธนาคารเกียรตินาคินภัทร',
  'ธนาคารซีไอเอ็มบีไทย',
  'ธนาคารทิสโก้',
  'ธนาคารยูโอบี',
  'ธนาคารแลนด์ แอนด์ เฮ้าส์',
  'ธนาคารสแตนดาร์ดชาร์เตอร์ด',
  'ธนาคารออมสิน',
  'ธนาคาร ธ.ก.ส.',
  'อื่นๆ',
];
