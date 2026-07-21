// frontend/src/constants/constants.js
export const ROLES = {
  SUPER_ADMIN: 1,
  FACULTY: 2,
  STUDENT: 3,
  PARENT_VISITOR: 4,
  GUEST: 5,
};

export const ROLE_LABELS = {
  1: "Super Admin",
  2: "Faculty",
  3: "Student",
  4: "Parent Visitor",
  5: "Guest",
};

export const DEPARTMENTS = [
  "CSE",
  "ECE",
  "EEE",
  "AI&DS",
  "Mechanical",
  "Civil",
  "MBA"
];

export const STUDENT_YEARS = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" }
];

export const GUEST_DURATIONS = [
  "2 Hours",
  "4 Hours",
  "8 Hours",
  "1 Day"
];

export const RELATIONSHIPS = [
  "Father",
  "Mother",
  "Guardian",
  "Sibling",
  "Spouse",
  "Other"
];

export const ACCOUNT_STATUSES = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
  LOCKED: 'Locked'
};
