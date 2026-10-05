export const PERMISSIONS = Object.freeze({
  ADMIN_ACCESS: "admin.access",
  USERS_READ: "users.read",
  USERS_WRITE: "users.write",
  ROLES_MANAGE: "roles.manage",
  AUDIT_READ: "audit.read",
  PRODUCTS_READ: "products.read",
  PRODUCTS_WRITE: "products.write",
  CATEGORIES_WRITE: "categories.write",
  BRANDS_WRITE: "brands.write",
  ORDERS_READ: "orders.read",
  ORDERS_WRITE: "orders.write",
  REFUNDS_MANAGE: "refunds.manage",
  RETURNS_MANAGE: "returns.manage",
  INVENTORY_MANAGE: "inventory.manage",
  MARKETING_MANAGE: "marketing.manage",
  REVIEWS_MODERATE: "reviews.moderate",
  SUPPORT_MANAGE: "support.manage",
  ANALYTICS_READ: "analytics.read",
  SETTINGS_MANAGE: "settings.manage",
  WALLET_MANAGE: "wallet.manage"
});

export function hasPermission(session, permission) {
  const user = session?.user;

  if (!user?.id) {
    return false;
  }

  // The system Admin role always has full administrative access.
  if (user.role === "admin") {
    return true;
  }

  const permissions = Array.isArray(user.permissions)
    ? user.permissions
    : [];

  // Wildcard permission grants access to every permission.
  if (permissions.includes("*")) {
    return true;
  }

  return permissions.includes(permission);
}

export function hasAnyPermission(session, permissions = []) {
  return permissions.some((permission) =>
    hasPermission(session, permission)
  );
}

export function requireUser(session) {
  if (!session?.user?.id) {
    const error = new Error("Authentication required");
    error.status = 401;
    throw error;
  }

  return session.user;
}

export function requirePermission(session, permission) {
  requireUser(session);

  if (!hasPermission(session, permission)) {
    const error = new Error("Insufficient permissions");
    error.status = 403;
    throw error;
  }

  return session.user;
}
