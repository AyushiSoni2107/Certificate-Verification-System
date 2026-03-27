const STUDENT_PROFILE_KEY_PREFIX = "studentProfile:";

const getStudentIdentity = (user) => user?.id || user?.email || "default";

export const getStudentProfileKey = (user) =>
  `${STUDENT_PROFILE_KEY_PREFIX}${getStudentIdentity(user)}`;

export const getStudentProfile = (user) => {
  if (!user || user.role !== "student") {
    return {};
  }

  try {
    return JSON.parse(localStorage.getItem(getStudentProfileKey(user))) || {};
  } catch {
    return {};
  }
};

export const saveStudentProfile = (user, profile) => {
  if (!user || user.role !== "student") {
    return;
  }

  localStorage.setItem(getStudentProfileKey(user), JSON.stringify(profile));
};
