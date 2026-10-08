(function (root) {
  'use strict';
  const KEY = 'desert-strike-progress-v1', MAX_BYTES = 8192;
  const fresh = () => ({ schemaVersion: 1, checkpoint: null, best: 0, jakeUnlocked: false });
  function validate(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
        value.schemaVersion !== 1 || typeof value.jakeUnlocked !== 'boolean' ||
        !Number.isSafeInteger(value.best) || value.best < 0 ||
        Object.keys(value).sort().join(',') !== 'best,checkpoint,jakeUnlocked,schemaVersion') {
      throw new Error('Choose a Desert Strike progress backup.');
    }
    const c = value.checkpoint;
    if (c !== null && (!c || typeof c !== 'object' || Array.isArray(c) ||
        Object.keys(c).sort().join(',') !== 'level,score' ||
        !Number.isInteger(c.level) || c.level < 1 || c.level > 4 ||
        !Number.isSafeInteger(c.score) || c.score < 0 || c.score % 1000 !== 0)) {
      throw new Error('The saved campaign or score is invalid.');
    }
    return { schemaVersion: 1, checkpoint: c ? { level: c.level, score: c.score } : null,
      best: value.best, jakeUnlocked: value.jakeUnlocked };
  }
  function decode(text) {
    if (typeof text !== 'string' || text.length > MAX_BYTES) throw new Error('The progress backup is too large.');
    return validate(JSON.parse(text));
  }
  function load(storage) {
    try {
      const raw = storage.getItem(KEY);
      if (raw !== null) return { value: decode(raw), status: 'ready' };
      const value = fresh(), oldBest = Number(storage.getItem('desert-strike-best'));
      if (Number.isSafeInteger(oldBest) && oldBest >= 0) value.best = oldBest;
      value.jakeUnlocked = storage.getItem('desert-strike-jake') === 'true';
      const old = storage.getItem('desert-strike-checkpoint');
      if (old !== null) {
        const candidate = JSON.parse(old);
        value.checkpoint = validate({ ...value, checkpoint: candidate }).checkpoint;
      }
      return { value, status: 'ready' };
    } catch {
      return { value: fresh(), status: 'unavailable',
        message: 'Saved progress is unavailable. Existing browser data was left untouched. Import a backup or export this session before closing.' };
    }
  }
  function save(storage, value) {
    storage.setItem(KEY, JSON.stringify(validate(value)));
  }
  const api = { KEY, MAX_BYTES, fresh, validate, decode, load, save };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DesertProgress = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
