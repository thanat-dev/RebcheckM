import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { formatMoney, formatDate, checkStatusLabels } from '../lib/utils';
import { CheckStatusBadge } from '../components/StatusBadge';
import {
  FileCheck, Banknote, MapPin, Clock,
  TrendingUp, ArrowRight, AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const result = await api.getDashboard();
      setData(result);
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

  if (!data) return null;

  const statCards = [
    {
      title: 'เช็ควันนี้',
      value: `${data.today.checks} ฉบับ`,
      sub: `${formatMoney(data.today.amount)} บาท`,
      icon: FileCheck,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
    },
    {
      title: 'การเดินทางวันนี้',
      value: `${data.today.trips} ทริป`,
      sub: formatDate(data.today.date),
      icon: MapPin,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
    },
    {
      title: 'เช็ครอนำฝาก',
      value: `${data.pending.count} ฉบับ`,
      sub: `${formatMoney(data.pending.amount)} บาท`,
      icon: Clock,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50',
    },
    {
      title: 'ยอดเดือนนี้',
      value: `${data.monthly.total_checks} ฉบับ`,
      sub: `${formatMoney(data.monthly.total_amount)} บาท`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="text-gray-500 mt-1">ภาพรวมระบบจัดการเช็ครับ</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.sub}</p>
              </div>
              <div className={`${stat.lightColor} p-2.5 rounded-xl`}>
                <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Checks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">เช็คล่าสุด</h2>
            <Link to="/checks" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              ดูทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {data.recent_checks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">ยังไม่มีเช็ค</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recent_checks.map(check => (
                <div key={check.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {check.customer_name || 'ไม่ระบุลูกค้า'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {check.bank_name} #{check.check_number}
                    </p>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{formatMoney(check.amount)}</p>
                    <CheckStatusBadge status={check.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Summary */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">สรุปสถานะเช็ค</h2>
          {data.status_summary.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">ยังไม่มีข้อมูล</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.status_summary.map((s, i) => {
                const total = data.status_summary.reduce((sum, x) => sum + x.count, 0);
                const pct = total > 0 ? (s.count / total) * 100 : 0;
                const colors = {
                  received: 'bg-blue-500',
                  deposited: 'bg-yellow-500',
                  cleared: 'bg-emerald-500',
                  bounced: 'bg-red-500',
                  cancelled: 'bg-gray-400',
                };
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        {checkStatusLabels[s.status] || s.status}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {s.count} ({formatMoney(s.amount)} บาท)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[s.status] || 'bg-gray-400'} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">เมนูลัด</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/trips" className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">สร้างทริป</span>
          </Link>
          <Link to="/checks" className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors">
            <FileCheck className="w-6 h-6 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">เพิ่มเช็ค</span>
          </Link>
          <Link to="/line" className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
            <Banknote className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-700">ส่ง LINE</span>
          </Link>
          <Link to="/reports" className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">รายงาน</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
