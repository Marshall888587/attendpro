import { useNavigate } from "react-router-dom";
import { AppNotification, NotificationType } from "../types";
import { useNotifications } from "../hooks/useNotifications";
import { IconBook, IconCheck, IconChart, IconHistory, IconUsers, IconWarning } from "./Icons";

const TYPE_ICON: Record<NotificationType, JSX.Element> = {
  ABSENCE: <IconWarning className="h-4 w-4" />,
  RETARD: <IconHistory className="h-4 w-4" />,
  PLANNING_MODIFIE: <IconChart className="h-4 w-4" />,
  JUSTIFICATIF: <IconBook className="h-4 w-4" />,
  NOUVEAU_COMPTE: <IconUsers className="h-4 w-4" />,
  CHANGEMENT_STATUT: <IconCheck className="h-4 w-4" />,
  INFO_ADMIN: <IconBook className="h-4 w-4" />,
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  function handleClick(n: AppNotification) {
    if (!n.isRead) markAsRead(n.id);
    if (n.link) navigate(n.link);
    onClose();
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[90vw] rounded-xl border border-slate-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={() => markAllAsRead()} className="text-xs font-medium text-primary-700 transition-colors hover:text-primary-900">
            Tout marquer comme lu
          </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-400">Aucune notification.</p>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left text-sm hover:bg-slate-50 ${
                n.isRead ? "" : "bg-primary-50/50"
              }`}
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                {TYPE_ICON[n.type]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{n.title}</span>
                  {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />}
                </span>
                <span className="mt-0.5 block truncate text-slate-500">{n.message}</span>
                <span className="mt-0.5 block text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
