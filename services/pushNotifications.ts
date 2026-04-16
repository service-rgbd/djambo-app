import { api, PushSubscriptionPayload } from './api';

export type BrowserPushState = {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  subscribed: boolean;
};

const pushPromptDismissVersion = 'v2';

const isBrowserPushSupported = () => typeof window !== 'undefined'
  && 'Notification' in window
  && 'serviceWorker' in navigator
  && 'PushManager' in window;

const urlBase64ToUint8Array = (value: string) => {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)));
};

const serializeSubscription = (subscription: PushSubscription): PushSubscriptionPayload => {
  const json = subscription.toJSON();

  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime,
    keys: {
      p256dh: json.keys?.p256dh || '',
      auth: json.keys?.auth || '',
    },
    contentEncoding: 'aesgcm',
  };
};

const getServiceWorkerRegistration = async () => {
  if (!isBrowserPushSupported()) {
    return null;
  }

  return navigator.serviceWorker.ready;
};

export const getPushPromptDismissKey = (userId: string) => `djambo_push_prompt_dismissed:${pushPromptDismissVersion}:${userId}`;

export const clearPushPromptDismissal = (userId: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(getPushPromptDismissKey(userId));
};

export const dismissPushPromptForUser = (userId: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getPushPromptDismissKey(userId), '1');
};

export const getBrowserPushState = async (): Promise<BrowserPushState> => {
  if (!isBrowserPushSupported()) {
    return { supported: false, permission: 'unsupported', subscribed: false };
  }

  const registration = await getServiceWorkerRegistration();
  const subscription = registration ? await registration.pushManager.getSubscription() : null;

  return {
    supported: true,
    permission: Notification.permission,
    subscribed: Boolean(subscription),
  };
};

export const syncExistingPushSubscription = async () => {
  if (!isBrowserPushSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const registration = await getServiceWorkerRegistration();
  const subscription = registration ? await registration.pushManager.getSubscription() : null;
  if (!subscription) {
    return false;
  }

  await api.savePushSubscription(serializeSubscription(subscription));
  return true;
};

export const enablePushNotifications = async () => {
  if (!isBrowserPushSupported()) {
    throw new Error('Les notifications push ne sont pas supportees sur cet appareil.');
  }

  const keyResponse = await api.getPushPublicKey();
  if (!keyResponse.enabled || !keyResponse.publicKey) {
    throw new Error('Le service push n est pas encore configure sur le serveur.');
  }

  const permission = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission();

  if (permission !== 'granted') {
    throw new Error('Les notifications push doivent etre autorisees dans le navigateur.');
  }

  const registration = await getServiceWorkerRegistration();
  if (!registration) {
    throw new Error('Service worker indisponible.');
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyResponse.publicKey),
    });
  }

  await api.savePushSubscription(serializeSubscription(subscription));
  return true;
};

export const disablePushNotifications = async () => {
  if (!isBrowserPushSupported()) {
    return false;
  }

  const registration = await getServiceWorkerRegistration();
  const subscription = registration ? await registration.pushManager.getSubscription() : null;
  if (!subscription) {
    return false;
  }

  await api.deletePushSubscription(subscription.endpoint).catch(() => ({ ok: true, removed: false }));
  await subscription.unsubscribe().catch(() => false);
  return true;
};