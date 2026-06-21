import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle } from 'lucide-react';

const formatNotificationTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Notification fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setOpen((value) => !value);
    if (!open) fetchNotifications();
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token || unreadCount === 0) return;

    try {
      const res = await fetch('http://localhost:3000/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Notification read error:', error);
    }
  };

  const markNotificationRead = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const updated = await res.json();

      setNotifications((items) => items.map((it) => (it.id === updated.id ? updated : it)));
      setUnreadCount((n) => Math.max(0, n - (updated.isRead ? 1 : 0)));
    } catch (error) {
      console.error('Mark single notification read error:', error);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-4 h-4 px-1 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center text-white border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-100 rounded-2xl shadow-2xl z-[60] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900">Notifications</h3>
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:text-gray-300"
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet.</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => { if (!item.isRead) markNotificationRead(item.id); }}
                  className={`px-4 py-3 border-b border-gray-50 last:border-b-0 ${item.isRead ? 'bg-white' : 'bg-indigo-50/60'} cursor-pointer`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 ${item.isRead ? 'text-gray-300' : 'text-indigo-600'}`}>
                      <CheckCircle size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.message}</p>
                      <p className="text-[11px] text-gray-400 mt-2">{formatNotificationTime(item.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
