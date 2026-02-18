import { checkStatusLabels, checkStatusColors, tripStatusLabels, stopStatusLabels } from '../lib/utils';

export function CheckStatusBadge({ status }) {
  return (
    <span className={checkStatusColors[status] || 'badge bg-gray-100 text-gray-800'}>
      {checkStatusLabels[status] || status}
    </span>
  );
}

export function TripStatusBadge({ status }) {
  const colors = {
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`badge ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {tripStatusLabels[status] || status}
    </span>
  );
}

export function StopStatusBadge({ status }) {
  const colors = {
    pending: 'bg-gray-100 text-gray-700',
    arrived: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    skipped: 'bg-orange-100 text-orange-800',
  };
  return (
    <span className={`badge ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {stopStatusLabels[status] || status}
    </span>
  );
}
