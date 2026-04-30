import { USER_ROLES, ROLE_PERMISSIONS } from '../../shared/socketEvents.js';

export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const token = JSON.parse(Buffer.from(authHeader.split(' ')[1], 'base64').toString());
    
    if (!token.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.adminUser = token;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      const token = JSON.parse(Buffer.from(authHeader.split(' ')[1], 'base64').toString());
      
      if (!allowedRoles.includes(token.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      req.adminUser = token;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      const token = JSON.parse(Buffer.from(authHeader.split(' ')[1], 'base64').toString());
      
      const userPermissions = ROLE_PERMISSIONS[token.role] || [];
      
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({ error: 'Permission denied' });
      }
      
      req.adminUser = token;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

export const checkPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

export const getUserPermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

export { USER_ROLES, ROLE_PERMISSIONS };