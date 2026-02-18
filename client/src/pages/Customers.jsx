import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { Users, Plus, Search, Edit, Trash2, Phone, MapPin, User } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    name: '', address: '', phone: '', contact_person: '', note: ''
  });

  useEffect(() => { loadCustomers(); }, []);

  async function loadCustomers() {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      const data = await api.getCustomers(params);
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => loadCustomers(), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  function resetForm() {
    setForm({ name: '', address: '', phone: '', contact_person: '', note: '' });
    setEditId(null);
  }

  function openEdit(customer) {
    setForm({
      name: customer.name,
      address: customer.address || '',
      phone: customer.phone || '',
      contact_person: customer.contact_person || '',
      note: customer.note || ''
    });
    setEditId(customer.id);
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editId) {
        await api.updateCustomer(editId, form);
      } else {
        await api.createCustomer(form);
      }
      setShowModal(false);
      resetForm();
      loadCustomers();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('ต้องการลบลูกค้านี้? (จะถูกปิดการใช้งาน)')) return;
    try {
      await api.deleteCustomer(id);
      loadCustomers();
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
          <h1 className="text-2xl font-bold text-gray-900">ลูกค้า / สถานที่</h1>
          <p className="text-gray-500 mt-1">จัดการรายชื่อลูกค้าและสถานที่รับเช็ค</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> เพิ่มลูกค้า
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาชื่อ, ที่อยู่, ผู้ติดต่อ..."
          className="input-field pl-10"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customers List */}
      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="ไม่พบลูกค้า"
          description={searchTerm ? 'ลองเปลี่ยนคำค้นหา' : 'เริ่มเพิ่มรายชื่อลูกค้าที่ไปรับเช็ค'}
          action={!searchTerm && (
            <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary mt-2">
              <Plus className="w-4 h-4 inline mr-1" /> เพิ่มลูกค้าคนแรก
            </button>
          )}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {customers.map(customer => (
            <div key={customer.id} className={`card ${!customer.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{customer.name}</h3>
                      {!customer.is_active && <span className="text-xs text-red-500">(ปิดการใช้งาน)</span>}
                    </div>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    {customer.address && (
                      <p className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span className="truncate">{customer.address}</span>
                      </p>
                    )}
                    {customer.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        {customer.phone}
                      </p>
                    )}
                    {customer.contact_person && (
                      <p className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 flex-shrink-0" />
                        {customer.contact_person}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button onClick={() => openEdit(customer)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(customer.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editId ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">ชื่อลูกค้า / บริษัท *</label>
            <input type="text" className="input-field" placeholder="เช่น บริษัท ABC จำกัด"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">ที่อยู่</label>
            <textarea className="input-field" rows={2} placeholder="ที่อยู่สำนักงาน..."
              value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">เบอร์โทร</label>
              <input type="tel" className="input-field" placeholder="0xx-xxx-xxxx"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">ผู้ติดต่อ</label>
              <input type="text" className="input-field" placeholder="ชื่อผู้ติดต่อ"
                value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">หมายเหตุ</label>
            <textarea className="input-field" rows={2} placeholder="หมายเหตุ..."
              value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              {editId ? 'บันทึกการแก้ไข' : 'เพิ่มลูกค้า'}
            </button>
            <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary">
              ยกเลิก
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
