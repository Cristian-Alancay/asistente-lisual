import { useState, useCallback, useSyncExternalStore } from "react";

type PushState = "default" | "granted" | "denied" | "unsupported";

function getPermissionSnapshot(): PushState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as PushState;
}

function subscribeToPermission(onStoreChange: () => void) {
  const interval = setInterval(onStoreChange, 2000);
  return () => clearInterval(interval);
}

export function usePushNotifications() {
  const externalPermission = useSyncExternalStore(subscribeToPermission, getPermissionSnapshot, () => "unsupported" as const);
  const [overridePermission, setOverridePermission] = useState<PushState | null>(null);
  const permission = overridePermission ?? externalPermission;

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "unsupported" as const;
    const result = await Notification.requestPermission();
    setOverridePermission(result as PushState);
    return result;
  }, []);

  const sendLocalNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission !== "granted") return;
      new Notification(title, {
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        ...options,
      });
    },
    [permission],
  );

  return {
    permission,
    isSupported: permission !== "unsupported",
    isGranted: permission === "granted",
    requestPermission,
    sendLocalNotification,
  };
}
