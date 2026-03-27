const ADMIN_PROFILE_KEY_PREFIX = "adminProfile:";

const getAdminIdentity = (user) => user?.id || user?.email || "default";

export const getAdminProfileKey = (user) =>
  `${ADMIN_PROFILE_KEY_PREFIX}${getAdminIdentity(user)}`;

export const getAdminProfile = (user) => {
  if (!user || user.role !== "admin") {
    return {};
  }

  try {
    return JSON.parse(localStorage.getItem(getAdminProfileKey(user))) || {};
  } catch {
    return {};
  }
};

export const saveAdminProfile = (user, profile) => {
  if (!user || user.role !== "admin") {
    return;
  }

  localStorage.setItem(getAdminProfileKey(user), JSON.stringify(profile));
};
