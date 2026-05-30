import { ensureDBInitialized, getCollection, getDB, saveDB, defaultDemoUser } from './storage';

const successResponse = (data, message = 'Success') => ({ success: true, data, message, status: 200 });

export const activityLogApi = {
  getAll: async () => {
    ensureDBInitialized();
    const items = getCollection('activity_logs');
    const enrichedLogs = items.map(log => ({
      ...log,
      user: { id: log.user_id, name: log.user_id == 999 ? defaultDemoUser.name : 'Unknown User' }
    }));
    return successResponse({ data: enrichedLogs, total: enrichedLogs.length });
  },
  filter: async (params = {}) => {
    ensureDBInitialized();
    let items = getCollection('activity_logs');
    if (params.user_id) {
      const userIds = Array.isArray(params.user_id) ? params.user_id : [params.user_id];
      items = items.filter(l => userIds.includes(l.user_id));
    }
    if (params.module) {
      const modules = Array.isArray(params.module) ? params.module : [params.module];
      items = items.filter(l => modules.includes(l.module));
    }
    if (params.action) {
      const actions = Array.isArray(params.action) ? params.action : [params.action];
      items = items.filter(l => actions.includes(l.action));
    }
    const enrichedLogs = items.map(log => ({
      ...log,
      user: { id: log.user_id, name: log.user_id == 999 ? defaultDemoUser.name : 'Unknown User' }
    }));
    return successResponse({ data: enrichedLogs, total: enrichedLogs.length });
  },
  create: async (data) => {
    ensureDBInitialized();
    const now = new Date().toISOString();
    const newItem = { ...data, id: Date.now(), created_at: now };
    const db = getDB();
    db.activity_logs = [...(db.activity_logs || []), newItem];
    saveDB(db);
    return successResponse(newItem, 'Activity log created');
  },
  update: async () => {
    ensureDBInitialized();
    return successResponse(null, 'Activity log updated');
  },
  delete: async (id) => {
    ensureDBInitialized();
    const db = getDB();
    db.activity_logs = db.activity_logs.filter(l => l.id != id);
    saveDB(db);
    return successResponse(null, 'Activity log deleted');
  }
};
export default activityLogApi;