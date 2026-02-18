import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatMoney, formatDate, thaiMonths } from '../lib/utils';
import EmptyState from '../components/EmptyState';
import { BarChart3, Calendar, Banknote, Users, TrendingUp } from 'lucide-react';

export default function Reports() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReport(); }, [year, month]);

  async function loadReport() {
    setLoading(true);
    try {
      const data = await api.getMonthlyReport({ year, month });
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const maxDailyAmount = report?.daily?.reduce((max, d) => Math.max(max, d.total_amount), 0) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">รายงาน</h1>
        <p className="text-gray-500 mt-1">สรุปยอดเช็คและการเดินทาง</p>
      </div>

      {/* Period Selector */}
      <div className="card flex flex-wrap items-center gap-3">
        <Calendar className="w-5 h-5 text-gray-500" />
        <select className="input-field w-auto" value={month} onChange={e => setMonth(e.target.value)}>
          {thaiMonths.map((m, i) => (
            <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>
          ))}
        </select>
        <select className="input-field w-auto" value={year} onChange={e => setYear(parseInt(e.target.value))}>
          {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map(y => (
            <option key={y} value={y}>{y + 543}</option>
          ))}
        </select>
      </div>

      {/* Monthly Total */}
      {report && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-gray-500">ยอดรวมเดือนนี้</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(report.total.total_amount)}</p>
              <p className="text-sm text-gray-500 mt-1">บาท</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-500">จำนวนเช็ค</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{report.total.total_checks}</p>
              <p className="text-sm text-gray-500 mt-1">ฉบับ</p>
            </div>
          </div>

          {/* Daily Chart */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">ยอดเช็ครายวัน</h2>
            {report.daily.length === 0 ? (
              <EmptyState icon={BarChart3} title="ไม่มีข้อมูล" description="ยังไม่มีเช็คในเดือนนี้" />
            ) : (
              <div className="space-y-2">
                {report.daily.map((day, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20 flex-shrink-0 text-right">
                      {formatDate(day.date)}
                    </span>
                    <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-lg transition-all duration-500"
                        style={{ width: `${Math.max((day.total_amount / maxDailyAmount) * 100, 2)}%` }}
                      />
                      <span className="absolute inset-0 flex items-center px-3 text-xs font-medium">
                        <span className={day.total_amount / maxDailyAmount > 0.3 ? 'text-white' : 'text-gray-600'}>
                          {day.check_count} เช็ค - {formatMoney(day.total_amount)} บาท
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* By Bank */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">แยกตามธนาคาร</h2>
              {report.by_bank.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">ไม่มีข้อมูล</p>
              ) : (
                <div className="space-y-3">
                  {report.by_bank.map((bank, i) => {
                    const colors = [
                      'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
                      'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'
                    ];
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`} />
                          <span className="text-sm text-gray-700">{bank.bank_name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900">{formatMoney(bank.total_amount)}</span>
                          <span className="text-xs text-gray-400 ml-2">({bank.check_count})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* By Customer */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">แยกตามลูกค้า</h2>
              {report.by_customer.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">ไม่มีข้อมูล</p>
              ) : (
                <div className="space-y-3">
                  {report.by_customer.map((cust, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="w-3.5 h-3.5 text-primary-600" />
                        </div>
                        <span className="text-sm text-gray-700 truncate">{cust.customer_name || 'ไม่ระบุ'}</span>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className="text-sm font-medium text-gray-900">{formatMoney(cust.total_amount)}</span>
                        <span className="text-xs text-gray-400 ml-2">({cust.check_count})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
