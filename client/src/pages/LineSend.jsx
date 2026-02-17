import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { todayStr, formatDateTime } from '../lib/utils';
import EmptyState from '../components/EmptyState';
import {
  Send, MessageCircle, Calendar, CheckCircle2,
  XCircle, Clock, History, FileText
} from 'lucide-react';

export default function LineSend() {
  const [customMessage, setCustomMessage] = useState('');
  const [summaryDate, setSummaryDate] = useState(todayStr());
  const [sending, setSending] = useState(false);
  const [sendingSummary, setSendingSummary] = useState(false);
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    try {
      const data = await api.getLineHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!customMessage.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await api.sendLine({ message: customMessage });
      setResult({ success: res.success, message: 'ส่งข้อความสำเร็จ!' });
      setCustomMessage('');
      loadHistory();
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setSending(false);
    }
  }

  async function handleSendDailySummary() {
    setSendingSummary(true);
    setResult(null);
    try {
      const res = await api.sendDailySummary({ date: summaryDate });
      if (res.message && !res.success) {
        setResult({ success: true, message: res.message });
      } else {
        setResult({ success: res.success, message: res.success ? 'ส่งสรุปรายวันสำเร็จ!' : 'ส่งไม่สำเร็จ' });
      }
      loadHistory();
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setSendingSummary(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ส่ง LINE</h1>
        <p className="text-gray-500 mt-1">ส่งข้อมูลเช็คและสรุปรายวันเข้ากลุ่ม LINE</p>
      </div>

      {/* Result Banner */}
      {result && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${result.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {result.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm">{result.message}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Send Daily Summary */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="font-semibold text-gray-900">ส่งสรุปเช็ครายวัน</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            ส่งสรุปเช็คทั้งหมดที่รับในวันที่เลือกเข้ากลุ่ม LINE
          </p>
          <div className="space-y-3">
            <div>
              <label className="label">เลือกวันที่</label>
              <input
                type="date"
                className="input-field"
                value={summaryDate}
                onChange={e => setSummaryDate(e.target.value)}
              />
            </div>
            <button
              onClick={handleSendDailySummary}
              disabled={sendingSummary}
              className="btn-line w-full flex items-center justify-center gap-2"
            >
              {sendingSummary ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              ส่งสรุปรายวัน
            </button>
          </div>
        </div>

        {/* Send Custom Message */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">ส่งข้อความเอง</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            ส่งข้อความอะไรก็ได้เข้ากลุ่ม LINE
          </p>
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div>
              <label className="label">ข้อความ</label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="พิมพ์ข้อความที่ต้องการส่ง..."
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={sending || !customMessage.trim()}
              className="btn-line w-full flex items-center justify-center gap-2"
            >
              {sending ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              ส่งข้อความ
            </button>
          </form>
        </div>
      </div>

      {/* Send History */}
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
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words line-clamp-3">{item.message}</p>
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
