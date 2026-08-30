const AuditLog = require('../models/AuditLog');

const auditAction = (action) => {
  return async (req, res, next) => {
    // Save reference to original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      // If request was successful, log the audit
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const auditData = req.auditData || {};
          
          const logEntry = new AuditLog({
            admin: req.user._id,
            action: action,
            target: auditData.target || {},
            changes: auditData.changes || {},
            ip: req.ip || req.connection.remoteAddress
          });
          
          logEntry.save().catch(err => console.error('Error saving audit log:', err));
        } catch (error) {
          console.error('Audit logging error:', error);
        }
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = { auditAction };
