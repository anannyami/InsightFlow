import { useSyncExternalStore } from "react";
import {
  deployments as seedDeployments,
  notifications as seedNotifications,
  type Deployment,
  type AppNotification,
} from "@/lib/mock-data";

type State = {
  deployments: Deployment[];
  notifications: AppNotification[];
  extraCount: number;
};

let state: State = {
  deployments: [...seedDeployments],
  notifications: [...seedNotifications],
  extraCount: 0,
};

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function pushDeployment(d: Deployment) {
  state = {
    ...state,
    deployments: [d, ...state.deployments],
    extraCount: state.extraCount + 1,
  };
  emit();
}

export function pushNotification(n: AppNotification) {
  state = { ...state, notifications: [n, ...state.notifications] };
  emit();
}

const getDeployments = () => state.deployments;
const getNotifications = () => state.notifications;
const getExtra = () => state.extraCount;

export function useDeployments() {
  return useSyncExternalStore(subscribe, getDeployments, getDeployments);
}
export function useNotifications() {
  return useSyncExternalStore(subscribe, getNotifications, getNotifications);
}
export function useExtraDeploymentCount() {
  return useSyncExternalStore(subscribe, getExtra, getExtra);
}
