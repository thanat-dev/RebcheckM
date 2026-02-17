import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { todayStr, formatDateTime, formatMoney, checkStatusLabels } from '../lib/utils';
import EmptyState from '../components/EmptyState';
import {
  Send, MessageCircle, Calendar, CheckCircle2,
  XCircle, Clock, History, FileText, MapPin,
  Building2, Phone, ChevronDown, ChevronUp, Eye
} from 'lucide-react';

export default function LineSend() {
  const [customMessage, setCustomMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [sending, setSending] = useState({});
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);

  // Preview data
  const [planPreview, setPlanPreview] = useState(null);
  const [depositPreview, setDepositPreview] = useState(null);
  const [showPlanPreview, setShowPlanPreview] = useState(false);
  const [showDepositPreview, setShowDepositPreview] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState({});

  useEffect(() => { loadHistory(); }, []);

  useEffect(() => {
    loadPreviews();
  }, [selectedDate]);

  async function loadPreviews() {
    setLoadingPreview({ plan: true, deposit: true });
    try {
      const [plan, deposit] = await Promise.all([
        api.previewTodayPlan({ date: selectedDate }),
        api.previewDepositStatus({ date: selectedDate }),
      ]);
      setPlanPreview(plan);
      setDepositPreview(deposit);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPreview({});
    }
  }

  async function loadHistory() {
    try {
      const data = await api.getLineHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  }

  function clearResult() {
    setTimeout(() => setResult(null), 5000);
  }

  // ส่งแผนเดินทางวันนี้
  async function handleSendTodayPlan() {
    setSending(s => ({ ...s, plan: true }));
    setResult(null);
    try {
      const res = await api.sendTodayPlan({ date: selectedDate });
      if (res.message && res.success === undefined) {
        setResult({ success: true, message: res.message });
      } else {
        setResult({ success: res.success, message: res.success ? 'ส่งแผนเดินทางเข้า LINE สำเร็จ!' : (res.message || 'ส่งไม่สำเร็จ') });
      }
      loadHistory();
      clearResult();
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setSending(s => ({ ...s, plan: false }));
    }
  }

  // ส่งสรุปสถานะนำเช็คเข้าธนาคาร
  async function handleSendDepositStatus() {
    setSending(s => ({ ...s, deposit: true }));
    setResult(null);
    try {
      const res = await api.sendDepositStatus({ date: selectedDate });
      if (res.message && res.success === undefined) {
        setResult({ success: true, message: res.message });
      } else {
        setResult({ success: res.success, message: res.success ? 'ส่งสรุปสถานะเช็คเข้า LINE สำเร็จ!' : (res.message || 'ส่งไม่สำเร็จ') });
      }
      loadHistory();
      clearResult();
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setSending(s => ({ ...s, deposit: false }));
    }
  }

  // ส่งสรุปเช็ครายวัน
  async function handleSendDailySummary() {
    setSending(s => ({ ...s, summary: true }));
    setResult(null);
    try {
      const res = await api.sendDailySummary({ date: selectedDate });
      if (res.message && !res.success) {
        setResult({ success: true, message: res.message });
      } else {
        setResult({ success: res.success, message: res.success ? 'ส่งสรุปรายวันสำเร็จ!' : 'ส่งไม่สำเร็จ' });
      }
      loadHistory();
      clearResult();
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setSending(s => ({ ...s, summary: false }));
    }
  }

  // ส่งข้อความเอง
  async function handleSendMessage(e) {
    e.preventDefault();
    if (!customMessage.trim()) return;
    setSending(s => ({ ...s, custom: true }));
    setResult(null);
    try {
      const res = await api.sendLine({ message: customMessage });
      setResult({ success: res.success, message: 'ส่งข้อความสำเร็จ!' });
      setCustomMessage('');
      loadHistory();
      clearResult();
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setSending(s => ({ ...s, custom: false }));
    }
  }

  const totalPlanStops = planPreview?.trips?.reduce((sum, t) => sum + (t.stops?.length || 0), 0) || 0;
  const totalDepositChecks = depositPreview?.total_count || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ส่ง LINE</h1>
        <p className="text-gray-500 mt-1">ส่งแผนเดินทาง สถานะเช็ค และสรุปข้อมูลเข้ากลุ่ม LINE</p>
      </div>

      {/* Date Selector - ใช้ร่วมกันทุก section */}
      <div className="card flex items-center gap-3">
        <Calendar className="w-5 h-5 text-primary-500" />
        <label className="text-sm font-medium text-gray-600">เลือกวันที่:</label>
        <input
          type="date"
          className="input-field w-auto"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
        {selectedDate === todayStr() && (
          <span className="badge bg-primary-100 text-primary-700">วันนี้</span>
        )}
      </div>

      {/* Result Banner */}
      {result && (
        <div className={`flex items-center gap-3 p-4 rounded-xl transition-all ${result.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {result.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-medium">{result.message}</span>
        </div>
      )}

      {/* === 1. ส่งแผนเดินทางวันนี้ === */}
      <div className="card border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">ส่งแผนเดินทางวันนี้</h2>
              <p className="text-xs text-gray-500">แจ้งรายชื่อสถานที่ที่ต้องไปรับเช็คเข้ากลุ่ม LINE</p>
            </div>
          </div>
          {totalPlanStops > 0 && (
            <span className="badge bg-blue-100 text-blue-700 text-sm">
              {totalPlanStops} สถานที่
            </span>
          )}
        </div>

        {/* Preview */}
        {loadingPreview.plan ? (
          <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full" /> กำลังโหลด...
          </div>
        ) : totalPlanStops === 0 ? (
          <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-400 text-sm mb-3">
            <MapPin className="w-8 h-8 mx-auto mb-1 opacity-40" />
            ไม่มีทริป/สถานที่ในวันที่เลือก
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowPlanPreview(!showPlanPreview)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 mb-3"
            >
              <Eye className="w-3.5 h-3.5" />
              {showPlanPreview ? 'ซ่อนตัวอย่าง' : 'ดูตัวอย่างข้อความ'}
              {showPlanPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showPlanPreview && (
              <div className="bg-gray-50 rounded-xl p-4 mb-3 space-y-2">
                {planPreview.trips.map((trip, ti) => (
                  <div key={ti}>
                    {planPreview.trips.length > 1 && (
                      <p className="text-xs font-medium text-gray-500 mb-1">🚗 {trip.title}</p>
                    )}
                    {trip.stops.map((stop, si) => {
                      const statusIcon = stop.stop_status === 'completed' ? '✅' :
                                          stop.stop_status === 'arrived' ? '📌' :
                                          stop.stop_status === 'skipped' ? '⏭️' : '⬜';
                      return (
                        <div key={si} className="flex items-start gap-2 py-1.5 border-b border-gray-100 last:border-0">
                          <span className="text-sm">{statusIcon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{si + 1}. {stop.customer_name}</p>
                            {stop.customer_address && (
                              <p className="text-xs text-gray-500 flex items-start gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" /> {stop.customer_address}
                              </p>
                            )}
                            {stop.customer_phone && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3 flex-shrink-0" /> {stop.customer_phone}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <button
          onClick={handleSendTodayPlan}
          disabled={sending.plan || totalPlanStops === 0}
          className="btn-line w-full flex items-center justify-center gap-2"
        >
          {sending.plan ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          ส่งแผนเดินทางเข้า LINE
        </button>
      </div>

      {/* === 2. ส่งสรุปสถานะนำเช็คเข้าธนาคาร === */}
      <div className="card border-l-4 border-l-emerald-500">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">สรุปสถานะนำเช็คเข้าธนาคาร</h2>
              <p className="text-xs text-gray-500">แจ้งว่าเช็คไหนนำเข้าแล้ว / ยังไม่ได้นำเข้า</p>
            </div>
          </div>
          {totalDepositChecks > 0 && (
            <span className="badge bg-emerald-100 text-emerald-700 text-sm">
              {totalDepositChecks} เช็ค
            </span>
          )}
        </div>

        {/* Preview */}
        {loadingPreview.deposit ? (
          <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full" /> กำลังโหลด...
          </div>
        ) : totalDepositChecks === 0 ? (
          <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-400 text-sm mb-3">
            <Building2 className="w-8 h-8 mx-auto mb-1 opacity-40" />
            ไม่มีเช็คในวันที่เลือก
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowDepositPreview(!showDepositPreview)}
              className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 mb-3"
            >
              <Eye className="w-3.5 h-3.5" />
              {showDepositPreview ? 'ซ่อนตัวอย่าง' : 'ดูตัวอย่างข้อความ'}
              {showDepositPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDepositPreview && (
              <div className="bg-gray-50 rounded-xl p-4 mb-3 space-y-4">
                {/* นำเข้าแล้ว */}
                {depositPreview.deposited.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-emerald-700 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      นำเข้าธนาคารแล้ว ({depositPreview.deposited.length} ฉบับ)
                    </p>
                    {depositPreview.deposited.map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-1 text-sm border-b border-gray-100 last:border-0">
                        <div className="min-w-0">
                          <span className="text-gray-700">{c.customer_name || 'ไม่ระบุ'}</span>
                          <span className="text-gray-400 text-xs ml-2">{c.bank_name} #{c.check_number}</span>
                        </div>
                        <span className="text-emerald-600 font-medium flex-shrink-0 ml-2">{formatMoney(c.amount)}</span>
                      </div>
                    ))}
                    <p className="text-xs text-emerald-600 font-medium mt-1 text-right">
                      รวม: {formatMoney(depositPreview.deposited_total)} บาท
                    </p>
                  </div>
                )}

                {/* ยังไม่ได้นำเข้า */}
                {depositPreview.not_deposited.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      ยังไม่ได้นำเข้าธนาคาร ({depositPreview.not_deposited.length} ฉบับ)
                    </p>
                    {depositPreview.not_deposited.map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-1 text-sm border-b border-gray-100 last:border-0">
                        <div className="min-w-0">
                          <span className="text-gray-700">{c.customer_name || 'ไม่ระบุ'}</span>
                          <span className="text-gray-400 text-xs ml-2">{c.bank_name} #{c.check_number}</span>
                        </div>
                        <span className="text-red-600 font-medium flex-shrink-0 ml-2">{formatMoney(c.amount)}</span>
                      </div>
                    ))}
                    <p className="text-xs text-red-600 font-medium mt-1 text-right">
                      รวม: {formatMoney(depositPreview.not_deposited_total)} บาท
                    </p>
                  </div>
                )}

                {/* เช็คคืน */}
                {depositPreview.bounced.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-orange-600 mb-2">
                      ⚠️ เช็คคืน ({depositPreview.bounced.length} ฉบับ)
                    </p>
                    {depositPreview.bounced.map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-1 text-sm">
                        <span className="text-gray-700">{c.customer_name || 'ไม่ระบุ'} - {c.bank_name} #{c.check_number}</span>
                        <span className="text-orange-600 font-medium">{formatMoney(c.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Summary bar */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    ✅ เข้าแล้ว {depositPreview.deposited.length} | ❌ ยังไม่เข้า {depositPreview.not_deposited.length}
                    {depositPreview.bounced.length > 0 && ` | ⚠️ คืน ${depositPreview.bounced.length}`}
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    รวม {totalDepositChecks} ฉบับ
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        <button
          onClick={handleSendDepositStatus}
          disabled={sending.deposit || totalDepositChecks === 0}
          className="btn-line w-full flex items-center justify-center gap-2"
        >
          {sending.deposit ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          ส่งสรุปสถานะเช็คเข้า LINE
        </button>
      </div>

      {/* === 3 & 4: สรุปเช็ครายวัน + ข้อความเอง === */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* ส่งสรุปเช็ครายวัน */}
        <div className="card border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">สรุปเช็ครายวัน</h2>
              <p className="text-xs text-gray-500">ส่งรายการเช็คทั้งหมดที่รับในวันนี้</p>
            </div>
          </div>
          <button
            onClick={handleSendDailySummary}
            disabled={sending.summary}
            className="btn-line w-full flex items-center justify-center gap-2"
          >
            {sending.summary ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            ส่งสรุปเช็ครายวัน
          </button>
        </div>

        {/* ส่งข้อความเอง */}
        <div className="card border-l-4 border-l-purple-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">ส่งข้อความเอง</h2>
              <p className="text-xs text-gray-500">พิมพ์ข้อความอะไรก็ได้ส่งเข้ากลุ่ม</p>
            </div>
          </div>
          <form onSubmit={handleSendMessage} className="space-y-3">
            <textarea
              className="input-field"
              rows={3}
              placeholder="พิมพ์ข้อความที่ต้องการส่ง..."
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={sending.custom || !customMessage.trim()}
              className="btn-line w-full flex items-center justify-center gap-2"
            >
              {sending.custom ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              ส่งข้อความ
            </button>
          </form>
        </div>
      </div>

      {/* === ประวัติการส่ง === */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">ประวัติการส่ง</h2>
        </div>
        {history.length === 0 ? (
          <EmptyState
            icon={Send}
            title="ยังไม่มีประวัติ"
            description="เมื่อส่งข้อความไป LINE ประวัติจะแสดงที่นี่"
          />
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`mt-0.5 flex-shrink-0 ${item.status === 'sent' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {item.status === 'sent' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words line-clamp-4">{item.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {item.sent_at ? formatDateTime(item.sent_at) : formatDateTime(item.created_at)}
                    <span className={`badge ${item.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {item.status === 'sent' ? 'สำเร็จ' : 'ล้มเหลว'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
