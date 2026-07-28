export interface AppEventMap {
  "heart:completed": { heartId: number; markerPoint: { x: number; y: number } };
}

export type AppEventName = keyof AppEventMap;

class AppEventBus extends EventTarget {
  emit<K extends AppEventName>(name: K, detail: AppEventMap[K]) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  on<K extends AppEventName>(name: K, listener: (detail: AppEventMap[K]) => void) {
    const handler = (event: Event) => listener((event as CustomEvent<AppEventMap[K]>).detail);
    this.addEventListener(name, handler);
    return () => this.removeEventListener(name, handler);
  }
}

export const appEvents = new AppEventBus();
