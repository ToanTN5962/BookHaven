let hotBooksSessionId = null;

const createHotBooksSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const resetHotBooksSessionId = () => {
  hotBooksSessionId = null;
};

export const getHotBooksSessionId = () => {
  if (!hotBooksSessionId) {
    hotBooksSessionId = createHotBooksSessionId();
  }

  return hotBooksSessionId;
};

if (typeof window !== 'undefined' && !window.__bookHavenHotBooksResetAttached) {
  window.addEventListener('userChanged', resetHotBooksSessionId);
  window.__bookHavenHotBooksResetAttached = true;
}
