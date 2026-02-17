import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { formatMoney, formatDate, todayStr, tripStatusLabels } from '../lib/utils';
import { TripStatusBadge } from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { MapPin, Plus, Eye, Trash2, Calendar, FileCheck } from 'lucide-react';

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ trip_date: todayStr(), title: '', note: '' });

  useEffect(() => { loadTrips(); }, []);

  async function loadTrips() {
    try {
      const data = await api.getTrips();
      setTrips(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.createTrip(form);
      setShowModal(false);
      setForm({ trip_date: todayStr(), title: '', note: '' });
      loadTrips();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('ต้องการลบทริปนี้?')) return;
    try {
      await api.deleteTrip(id);
      loadTrips();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">การเดินทาง</h1>
          <p className="text-gray-500 mt-1">บันทึกการเดินทางไปรับเช็ค</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> สร้างทริป
        </button>
      </div>

      {trips.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="ยังไม่มีทริป"
          description="เริ่มสร้างทริปเดินทางรับเช็ควันนี้"
          action={
            <button onClick={() => setShowModal(true)} className="btn-primary mt-2">
              <Plus className="w-4 h-4 inline mr-1" /> สร้างทริปแรก
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {trips.map(trip => (
            <div key={trip.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{trip.title}</h3>
                    <TripStatusBadge status={trip.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(trip.trip_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {trip.completed_stops}/{trip.stop_count} สถานที่
                    </span>
                    <span className="flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      {trip.check_count} เช็ค
                    </span>
                  </div>
                  {trip.total_amount > 0 && (
                    <p className="text-sm font-medium text-primary-600 mt-1">
                      รวม {formatMoney(trip.total_amount)} บาท
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Link to={`/trips/${trip.id}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(trip.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Trip Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="สร้างทริปใหม่">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">วันที่เดินทาง *</label>
            <input
              type="date"
              className="input-field"
              value={form.trip_date}
              onChange={e => setForm({ ...form, trip_date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">ชื่อทริป</label>
            <input
              type="text"
              className="input-field"
              placeholder="เช่น เดินทางรับเช็ค โซนรังสิต"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">หมายเหตุ</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="รายละเอียดเพิ่มเติม..."
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">สร้างทริป</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">ยกเลิก</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
