import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { formatMoney, formatDate, todayStr, nowTimeStr } from '../lib/utils';
import { TripStatusBadge, StopStatusBadge } from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  ArrowLeft, Plus, MapPin, Clock, CheckCircle2,
  SkipForward, Trash2, FileCheck, Edit
} from 'lucide-react';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStop, setShowAddStop] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');

  useEffect(() => { loadTrip(); loadCustomers(); }, [id]);

  async function loadTrip() {
    try {
      const data = await api.getTrip(id);
      setTrip(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomers() {
    try {
      const data = await api.getCustomers({ active: 'true' });
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function addStop() {
    if (!selectedCustomer) return;
    try {
      await api.addTripStop(id, { customer_id: parseInt(selectedCustomer) });
      setShowAddStop(false);
      setSelectedCustomer('');
      loadTrip();
    } catch (err) {
      alert(err.message);
    }
  }

  async function updateStopStatus(stopId, status) {
    const updates = { status };
    if (status === 'arrived') updates.arrived_at = `${todayStr()} ${nowTimeStr()}`;
    if (status === 'completed') updates.departed_at = `${todayStr()} ${nowTimeStr()}`;

    try {
      await api.updateTripStop(stopId, updates);
      loadTrip();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteStop(stopId) {
    if (!confirm('ลบสถานที่นี้?')) return;
    try {
      await api.deleteTripStop(stopId);
      loadTrip();
    } catch (err) {
      alert(err.message);
    }
  }

  async function updateTripStatus(status) {
    try {
      await api.updateTrip(id, { status });
      loadTrip();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!trip) return <div className="text-center py-12 text-gray-500">ไม่พบทริป</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/trips')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{trip.title}</h1>
            <TripStatusBadge status={trip.status} />
          </div>
          <p className="text-sm text-gray-500">{formatDate(trip.trip_date)}</p>
        </div>
      </div>

      {/* Trip Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <MapPin className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{trip.stops?.length || 0}</p>
          <p className="text-xs text-gray-500">สถานที่</p>
        </div>
        <div className="card text-center">
          <FileCheck className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{trip.stops?.reduce((sum, s) => sum + s.check_count, 0) || 0}</p>
          <p className="text-xs text-gray-500">เช็ค</p>
        </div>
        <div className="card text-center">
          <span className="text-lg font-bold text-primary-600">{formatMoney(trip.total_amount)}</span>
          <p className="text-xs text-gray-500">ยอดรวม (บาท)</p>
        </div>
      </div>

      {/* Trip Actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setShowAddStop(true)} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus className="w-4 h-4" /> เพิ่มสถานที่
        </button>
        {trip.status === 'in_progress' && (
          <button onClick={() => updateTripStatus('completed')} className="btn-success flex items-center gap-1.5 text-sm">
            <CheckCircle2 className="w-4 h-4" /> จบทริป
          </button>
        )}
        {trip.status === 'completed' && (
          <button onClick={() => updateTripStatus('in_progress')} className="btn-secondary flex items-center gap-1.5 text-sm">
            <Edit className="w-4 h-4" /> เปิดทริปอีกครั้ง
          </button>
        )}
      </div>

      {/* Stops List */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-900">สถานที่แวะ ({trip.stops?.length || 0})</h2>
        {(!trip.stops || trip.stops.length === 0) ? (
          <div className="card text-center py-8 text-gray-400">
            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>ยังไม่มีสถานที่ กดปุ่ม "เพิ่มสถานที่" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          trip.stops.map((stop, index) => (
            <div key={stop.id} className="card">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{stop.customer_name}</h3>
                    <StopStatusBadge status={stop.status} />
                  </div>
                  {stop.customer_address && (
                    <p className="text-xs text-gray-500 mb-2">{stop.customer_address}</p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {stop.arrived_at && <span><Clock className="w-3 h-3 inline" /> เข้า: {stop.arrived_at}</span>}
                    {stop.departed_at && <span><Clock className="w-3 h-3 inline" /> ออก: {stop.departed_at}</span>}
                    {stop.check_count > 0 && (
                      <span className="text-primary-600 font-medium">
                        {stop.check_count} เช็ค = {formatMoney(stop.checks_amount)} บาท
                      </span>
                    )}
                  </div>

                  {/* Stop Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {stop.status === 'pending' && (
                      <button onClick={() => updateStopStatus(stop.id, 'arrived')}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                        <MapPin className="w-3 h-3 inline mr-1" /> ถึงแล้ว
                      </button>
                    )}
                    {stop.status === 'arrived' && (
                      <button onClick={() => updateStopStatus(stop.id, 'completed')}
                        className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
                        <CheckCircle2 className="w-3 h-3 inline mr-1" /> เสร็จแล้ว
                      </button>
                    )}
                    {(stop.status === 'pending' || stop.status === 'arrived') && (
                      <button onClick={() => updateStopStatus(stop.id, 'skipped')}
                        className="text-xs px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
                        <SkipForward className="w-3 h-3 inline mr-1" /> ข้าม
                      </button>
                    )}
                    <button onClick={() => deleteStop(stop.id)}
                      className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3 h-3 inline mr-1" /> ลบ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Stop Modal */}
      <Modal isOpen={showAddStop} onClose={() => setShowAddStop(false)} title="เพิ่มสถานที่แวะ">
        <div className="space-y-4">
          <div>
            <label className="label">เลือกลูกค้า/สถานที่ *</label>
            {customers.length === 0 ? (
              <p className="text-sm text-gray-500">
                ยังไม่มีรายชื่อลูกค้า กรุณาเพิ่มในเมนู "ลูกค้า/สถานที่" ก่อน
              </p>
            ) : (
              <select
                className="input-field"
                value={selectedCustomer}
                onChange={e => setSelectedCustomer(e.target.value)}
              >
                <option value="">-- เลือกลูกค้า --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.address ? `(${c.address})` : ''}</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={addStop} disabled={!selectedCustomer} className="btn-primary flex-1">
              เพิ่มสถานที่
            </button>
            <button onClick={() => setShowAddStop(false)} className="btn-secondary">ยกเลิก</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
