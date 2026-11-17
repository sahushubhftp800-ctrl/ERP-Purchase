const db = require('../config/db');

/**
 * Non-blocking safe audit logger.
 * Handles strings, objects, and guarantees that audit failures don't disrupt core transactions.
 */
async function logAudit(userId, action, details, connection = null) {
  try {
    const executor = connection || db;
    const detailStr = typeof details === 'object' ? JSON.stringify(details) : String(details);
    await executor.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [userId || null, action, detailStr]
    );
  } catch (err) {
    console.warn('⚠️ Audit log warning (non-fatal):', err.message);
  }
}

module.exports = logAudit;
