'use client';

import Link from 'next/link';
import { useState } from 'react';

export interface NotificationItem {
  id: string;
  project_id: string | null;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

export function NotificationList({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const markAsRead = async (notificationId: string) => {
    setBusyId(notificationId);
    setError(null);
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Notification could not be marked as read.');
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((notification) => (
        notification.id === notificationId ? { ...notification, read_at: readAt } : notification
      )));
      window.dispatchEvent(new Event('gardenia:notifications-updated'));
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Notification could not be marked as read.');
    } finally {
      setBusyId(null);
    }
  };

  const unreadCount = notifications.filter((notification) => notification.read_at === null).length;

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">{unreadCount} unread</p>
        <p className="mt-1 text-sm text-slate-500">Unread status is saved to your account.</p>
      </div>
      {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
      {notifications.length ? (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {notifications.map((notification) => (
            <li key={notification.id} className={`flex flex-wrap items-start gap-4 px-5 py-4 ${notification.read_at ? 'bg-white' : 'bg-teal-50/50'}`}>
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.read_at ? 'bg-slate-300' : 'bg-teal-600'}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-slate-900">{notification.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                <time className="mt-2 block text-xs text-slate-500" dateTime={notification.created_at}>
                  {new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(notification.created_at))}
                </time>
                {notification.project_id && (
                  <Link className="mt-2 inline-block text-xs font-semibold text-teal-800 hover:underline" href={`/projects/${notification.project_id}`}>
                    Open project
                  </Link>
                )}
              </div>
              {notification.read_at ? (
                <span className="text-xs text-slate-500">Read</span>
              ) : (
                <button
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-60"
                  disabled={busyId === notification.id}
                  onClick={() => void markAsRead(notification.id)}
                  type="button"
                >
                  {busyId === notification.id ? 'Saving…' : 'Mark as read'}
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
          You don’t have any notifications yet.
        </div>
      )}
    </section>
  );
}
