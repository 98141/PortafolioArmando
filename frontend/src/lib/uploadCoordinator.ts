/** Synchronous guards: React rendering must not be the lock for async operations. */
export function createUploadCoordinator() {
  const pending = new Set<symbol>();
  const listeners = new Set<() => void>();
  let snapshot = { pending: 0, saving: false };
  const publish = (saving = snapshot.saving) => {
    snapshot = { pending: pending.size, saving };
    listeners.forEach((listener) => listener());
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    beginUpload() {
      if (snapshot.saving) return null;
      const token = Symbol();
      pending.add(token);
      publish();
      return () => { if (pending.delete(token)) publish(); };
    },
    async submit(save: () => void | Promise<void>) {
      if (pending.size || snapshot.saving) return false;
      publish(true);
      try { await save(); return true; }
      finally { publish(false); }
    },
  };
}
