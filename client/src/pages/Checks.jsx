import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatMoney, formatDate, todayStr, bankList, checkStatusLabels } from '../lib/utils';
import { CheckStatusBadge } from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import {
  FileCheck, Plus, Search, Filter, Trash2, Edit, Send,
  Image, Camera, Eye, Download
} from 'lucide-react';

export default function Checks() {
  const [checks, setChecks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showImage, setShowImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({
    check_number: '', bank_name: '', branch: '', amount: '',
    check_date: todayStr(), received_date: todayStr(), due_date: '',
    customer_id: '', payee: '', note: '', image: null
  });

  useEffect(() => { loadChecks(); loadCustomers(); }, []);

  async function loadChecks() {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus) params.status = filterStatus;
      const data = await api.getChecks(params);
      setChecks(data);
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

  useEffect(() => {
    const timer = setTimeout(() => loadChecks(), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  function resetForm() {
    setForm({
      check_number: '', bank_name: '', branch: '', amount: '',
      check_date: todayStr(), received_date: todayStr(), due_date: '',
      customer_id: '', payee: '', note: '', image: null
    });
    setEditId(null);
  }

  function openCreate() {
    resetForm();
    setShowModal(true);
  }

  function openEdit(check) {
    setForm({
      check_number: check.check_number,
      bank_name: check.bank_name,
      branch: check.branch || '',
      amount: check.amount,
      check_date: check.check_date,
      received_date: check.received_date || todayStr(),
      due_date: check.due_date || '',
      customer_id: check.customer_id || '',
      payee: check.payee || '',
      note: check.note || '',
      image: null,
      status: check.status
    });
    setEditId(check.id);
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'image') {
        if (value) formData.append('image', value);
      } else if (value !== '' && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    try {
      if (editId) {
        await api.updateCheck(editId, formData);
      } else {
        await api.createCheck(formData);
      }
      setShowModal(false);
      resetForm();
      loadChecks();
    } catch (err) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  }

  async function handleDelete(id) {
    if (!confirm('ต้องการลบเช็คนี้?')) return;
    try {
      await api.deleteCheck(id);
      loadChecks();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleStatusChange(id, status) {
    const formData = new FormData();
    formData.append('status', status);
    try {
      await api.updateCheck(id, formData);
      loadChecks();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSendToLine(checkId) {
    try {
      const result = await api.sendCheckToLine(checkId);
      if (result.success) {
        alert('ส่งเข้า LINE สำเร็จ!');
      } else {
        alert('ส่งไม่สำเร็จ: ' + JSON.stringify(result));
      }
    } catch (err) {
      alert(err.message);
    }
  }

  const totalAmount = checks.reduce((sum, c) => sum + c.amount, 0);

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
          <h1 className="text-2xl font-bold text-gray-900">เช็ครับ</h1>
          <p className="text-gray-500 mt-1">จัดการเช็คที่รับจากลูกค้า</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> เพิ่มเช็ค
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาเลขเช็ค, ธนาคาร, ลูกค้า..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input-field w-auto"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">ทุกสถานะ</option>
          {Object.entries(checkStatusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Summary Bar */}
      <div className="bg-primary-50 rounded-xl px-5 py-3 flex items-center justify-between">
        <span className="text-sm text-primary-700">
          แสดง {checks.length} รายการ
        </span>
        <span className="text-sm font-semibold text-primary-700">
          รวม {formatMoney(totalAmount)} บาท
        </span>
      </div>

      {/* Checks List */}
      {checks.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="ไม่พบเช็ค"
          description={searchTerm || filterStatus ? 'ลองเปลี่ยนเงื่อนไขค้นหา' : 'เริ่มเพิ่มเช็คที่รับจากลูกค้า'}
        />
      ) : (
        <div className="space-y-3">
          {checks.map(check => (
            <div key={check.id} className="card">
              <div className="flex items-start gap-3">
                {check.image_path ? (
                  <button
                    onClick={() => setShowImage(check.image_path)}
                    className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity"
                  >
                    <img src={check.image_path} alt="check" className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-gray-900">{check.bank_name}</span>
                    <span className="text-gray-400 text-sm">#{check.check_number}</span>
                    <CheckStatusBadge status={check.status} />
                  </div>
                  <p className="text-sm text-gray-500">{check.customer_name || 'ไม่ระบุลูกค้า'}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-lg font-bold text-primary-600">{formatMoney(check.amount)}</span>
                    <span className="text-xs text-gray-400">วันที่เช็ค: {formatDate(check.check_date)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {check.status === 'received' && (
                      <button onClick={() => handleStatusChange(check.id, 'deposited')}
                        className="text-xs px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100">
                        นำฝาก
                      </button>
                    )}
                    {check.status === 'deposited' && (
                      <button onClick={() => handleStatusChange(check.id, 'cleared')}
                        className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100">
                        เคลียร์แล้ว
                      </button>
                    )}
                    <button onClick={() => openEdit(check)}
                      className="text-xs px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                      <Edit className="w-3 h-3 inline mr-0.5" /> แก้ไข
                    </button>
                    <button onClick={() => handleSendToLine(check.id)}
                      className="text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                      <Send className="w-3 h-3 inline mr-0.5" /> LINE
                    </button>
                    <button onClick={() => handleDelete(check.id)}
                      className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                      <Trash2 className="w-3 h-3 inline mr-0.5" /> ลบ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Check Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editId ? 'แก้ไขเช็ค' : 'เพิ่มเช็คใหม่'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">เลขที่เช็ค *</label>
              <input type="text" className="input-field" placeholder="เช่น 1234567"
                value={form.check_number} onChange={e => setForm({ ...form, check_number: e.target.value })} required />
            </div>
            <div>
              <label className="label">ธนาคาร *</label>
              <select className="input-field" value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} required>
                <option value="">-- เลือกธนาคาร --</option>
                {bankList.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">สาขา</label>
              <input type="text" className="input-field" placeholder="สาขาธนาคาร"
                value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} />
            </div>
            <div>
              <label className="label">จำนวนเงิน (บาท) *</label>
              <input type="number" step="0.01" className="input-field" placeholder="0.00"
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <label className="label">วันที่บนเช็ค *</label>
              <input type="date" className="input-field"
                value={form.check_date} onChange={e => setForm({ ...form, check_date: e.target.value })} required />
            </div>
            <div>
              <label className="label">วันที่รับ</label>
              <input type="date" className="input-field"
                value={form.received_date} onChange={e => setForm({ ...form, received_date: e.target.value })} />
            </div>
            <div>
              <label className="label">วันครบกำหนด</label>
              <input type="date" className="input-field"
                value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div>
              <label className="label">ลูกค้า</label>
              <select className="input-field" value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
                <option value="">-- เลือกลูกค้า --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">ผู้สั่งจ่าย</label>
              <input type="text" className="input-field" placeholder="ชื่อผู้สั่งจ่าย"
                value={form.payee} onChange={e => setForm({ ...form, payee: e.target.value })} />
            </div>
            {editId && (
              <div>
                <label className="label">สถานะ</label>
                <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {Object.entries(checkStatusLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="label">รูปเช็ค</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-400 transition-colors">
              <input type="file" accept="image/*" className="hidden" id="check-image"
                onChange={e => setForm({ ...form, image: e.target.files[0] })} />
              <label htmlFor="check-image" className="cursor-pointer">
                {form.image ? (
                  <div className="flex items-center justify-center gap-2 text-primary-600">
                    <Image className="w-5 h-5" />
                    <span className="text-sm">{form.image.name}</span>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <Camera className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-sm">คลิกเพื่อเลือกรูป หรือถ่ายภาพ</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="label">หมายเหตุ</label>
            <textarea className="input-field" rows={2} placeholder="หมายเหตุเพิ่มเติม..."
              value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              {editId ? 'บันทึกการแก้ไข' : 'เพิ่มเช็ค'}
            </button>
            <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary">
              ยกเลิก
            </button>
          </div>
        </form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal isOpen={!!showImage} onClose={() => setShowImage(null)} title="รูปเช็ค" size="lg">
        {showImage && <img src={showImage} alt="check" className="w-full rounded-xl" />}
      </Modal>
    </div>
  );
}
