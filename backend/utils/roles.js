const ROLE_MAP = {
  patient: "Patient",
  doctor: "Doctor",
  admin: "Admin"
};

const normalizeRole = (role) => {
  if (typeof role !== "string") {
    return null;
  }

  return ROLE_MAP[role.trim().toLowerCase()] || null;
};

module.exports = {
  normalizeRole
};
