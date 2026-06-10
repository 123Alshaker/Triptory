const BASE_URL = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try { msg = await res.text(); } catch {}
    throw new Error(msg || res.statusText);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export function registerUser(data) {
  return request('/Users/register', { method: 'POST', body: JSON.stringify(data) });
}

export function loginUser(data) {
  return request('/Users/login', { method: 'POST', body: JSON.stringify(data) });
}

export function getAllUsers() {
  return request('/Users');
}

// ─── Travel Plans ─────────────────────────────────────────────────────────────

export function createPlan(data) {
  return request('/TravelPlans', { method: 'POST', body: JSON.stringify(data) });
}

export function getAllPlans() {
  return request('/TravelPlans');
}

export function getPlanById(id) {
  return request(`/TravelPlans/${id}`);
}

export function deletePlan(id) {
  return request(`/TravelPlans/${id}`, { method: 'DELETE' });
}

// ─── Media (uploaded trip photos) ────────────────────────────────────────────

export async function uploadMedia(planId, files) {
  const formData = new FormData();
  formData.append('plan_id', planId);
  files.forEach(file => formData.append('files', file));

  const res = await fetch(`${BASE_URL}/Media/upload`, { method: 'POST', body: formData });

  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try { msg = await res.text(); } catch {}
    throw new Error(msg || res.statusText);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export function getMediaByPlan(planId) {
  return request(`/Media/plan/${planId}`);
}

// ─── Plan Days (localStorage fallback) ───────────────────────────────────────

function lsKey(entity) { return `triptory_${entity}`; }
function lsGet(entity) { try { return JSON.parse(localStorage.getItem(lsKey(entity))) || []; } catch { return []; } }
function lsSet(entity, data) { localStorage.setItem(lsKey(entity), JSON.stringify(data)); }
function nextId(list, field) { return list.length ? Math.max(...list.map(i => i[field])) + 1 : 1; }

export const localPlanDays = {
  getByPlan: (planId) => lsGet('plan_days').filter(d => d.plan_id === planId),
  add: (day) => {
    const days = lsGet('plan_days');
    const newDay = { ...day, day_id: nextId(days, 'day_id') };
    lsSet('plan_days', [...days, newDay]);
    return newDay;
  },
  deleteByPlan: (planId) => {
    lsSet('plan_days', lsGet('plan_days').filter(d => d.plan_id !== planId));
  },
};

export const localActivities = {
  getByDay: (dayId) => lsGet('activities').filter(a => a.day_id === dayId),
  add: (activity) => {
    const acts = lsGet('activities');
    const newAct = { ...activity, activity_id: nextId(acts, 'activity_id') };
    lsSet('activities', [...acts, newAct]);
    return newAct;
  },
  deleteByDay: (dayId) => {
    lsSet('activities', lsGet('activities').filter(a => a.day_id !== dayId));
  },
};

export const localComments = {
  getByPlan: (planId) => lsGet('comments').filter(c => c.plan_id === planId),
  add: (comment) => {
    const comments = lsGet('comments');
    const newComment = { ...comment, comment_id: nextId(comments, 'comment_id'), created_at: new Date().toISOString() };
    lsSet('comments', [...comments, newComment]);
    return newComment;
  },
};

export const localSavedPlans = {
  getByUser: (userId) => lsGet('saved_plans').filter(s => s.user_id === userId),
  isSaved: (userId, planId) => lsGet('saved_plans').some(s => s.user_id === userId && s.plan_id === planId),
  save: (userId, planId) => {
    const saved = lsGet('saved_plans');
    if (!saved.some(s => s.user_id === userId && s.plan_id === planId)) {
      lsSet('saved_plans', [...saved, { saved_id: nextId(saved, 'saved_id'), user_id: userId, plan_id: planId }]);
    }
  },
  unsave: (userId, planId) => {
    lsSet('saved_plans', lsGet('saved_plans').filter(s => !(s.user_id === userId && s.plan_id === planId)));
  },
};

export const localRatings = {
  getByPlan: (planId) => lsGet('ratings').filter(r => r.plan_id === planId),
  getUserRating: (userId, planId) => lsGet('ratings').find(r => r.user_id === userId && r.plan_id === planId),
  rate: (userId, planId, score) => {
    const ratings = lsGet('ratings').filter(r => !(r.user_id === userId && r.plan_id === planId));
    lsSet('ratings', [...ratings, { user_id: userId, plan_id: planId, score }]);
  },
  avgScore: (planId) => {
    const ratings = lsGet('ratings').filter(r => r.plan_id === planId);
    if (!ratings.length) return 0;
    return ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
  },
};

export const localMedia = {
  getByPlan: (planId) => lsGet('media').filter(m => m.plan_id === planId),
  add: (planId, dataUrl, fileName) => {
    const media = lsGet('media');
    const newItem = { media_id: nextId(media, 'media_id'), plan_id: planId, file_path: dataUrl, file_name: fileName, type: 'image' };
    try {
      lsSet('media', [...media, newItem]);
    } catch (e) {
      // Storage quota exceeded — skip storing this image silently
      console.warn('Media storage quota exceeded, image skipped:', fileName);
      return null;
    }
    return newItem;
  },
  remove: (mediaId) => {
    lsSet('media', lsGet('media').filter(m => m.media_id !== mediaId));
  },
  deleteByPlan: (planId) => {
    lsSet('media', lsGet('media').filter(m => m.plan_id !== planId));
  },
};

export const localNotifications = {
  getByUser: (userId) => lsGet('notifications').filter(n => n.user_id === userId).reverse(),
  add: (userId, message) => {
    const notifs = lsGet('notifications');
    lsSet('notifications', [...notifs, { id: nextId(notifs, 'id'), user_id: userId, message, read: false, created_at: new Date().toISOString() }]);
  },
  markRead: (userId) => {
    lsSet('notifications', lsGet('notifications').map(n => n.user_id === userId ? { ...n, read: true } : n));
  },
};
