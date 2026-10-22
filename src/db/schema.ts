import { pgTable, integer, text, boolean, date, uniqueIndex } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ============================================================
//  USERS
// ============================================================

// Emails are matched case-insensitively against the login email, so each
// user table gets a lower(email) unique index to make that a DB guarantee.

// ---------------- student_user_data ----------------
// student_id is the school-issued ID, so it is not generated.
export const studentUserData = pgTable("student_user_data", {
  studentId: integer("student_id").primaryKey(),
  email:     text("email"),
  fName:     text("f_name"),
  lName:     text("l_name"),
  gradClass: integer("grad_class"),
}, (t) => ({
  emailLowerUnique: uniqueIndex("student_user_data_email_lower_unique").on(sql`lower(${t.email})`),
}));

// ---------------- admin_user_data ----------------
export const adminUserData = pgTable("admin_user_data", {
  adminId: integer("admin_id").primaryKey().generatedAlwaysAsIdentity(),
  email:   text("email"),
  fName:   text("f_name"),
  lName:   text("l_name"),
}, (t) => ({
  emailLowerUnique: uniqueIndex("admin_user_data_email_lower_unique").on(sql`lower(${t.email})`),
}));

// ---------------- staff_user_data ----------------
export const staffUserData = pgTable("staff_user_data", {
  staffId: integer("staff_id").primaryKey().generatedAlwaysAsIdentity(),
  email:   text("email"),
  fName:   text("f_name"),
  lName:   text("l_name"),
}, (t) => ({
  emailLowerUnique: uniqueIndex("staff_user_data_email_lower_unique").on(sql`lower(${t.email})`),
}));

// ============================================================
//  CLUBS
// ============================================================

// ---------------- club_data ----------------
export const clubData = pgTable("club_data", {
  clubId:         integer("club_id").primaryKey().generatedAlwaysAsIdentity(),
  clubName:       text("club_name"),
  execNeedsHours: boolean("exec_needs_hours"),
  clubLogoFileId: text("club_logo_file_id"),
  doubleDipping:  boolean("double_dipping"),
});

// ---------------- category_data ----------------
export const categoryData = pgTable("category_data", {
  categoryId:             integer("category_id").primaryKey().generatedAlwaysAsIdentity(),
  clubId:                 integer("club_id").references(() => clubData.clubId),
  categoryName:           text("category_name"),
  needsEmailVerification: boolean("needs_email_verification"),
  goal:                   integer("goal"),
  needsClubConfirmation:  boolean("needs_club_confirmation"),
});

// ---------------- student_club_membership ----------------
export const studentClubMembership = pgTable("student_club_membership", {
  num:       integer("num").primaryKey().generatedAlwaysAsIdentity(),
  clubId:    integer("club_id").references(() => clubData.clubId),
  studentId: integer("student_id").references(() => studentUserData.studentId),
  status:    boolean("status"),
});

// ---------------- club_staff_assignment ----------------
export const clubStaffAssignment = pgTable("club_staff_assignment", {
  num:     integer("num").primaryKey().generatedAlwaysAsIdentity(),
  clubId:  integer("club_id").references(() => clubData.clubId),
  staffId: integer("staff_id").references(() => staffUserData.staffId),
});

// ============================================================
//  MEMBER GROUPS
// ============================================================

// ---------------- club_member_groups ----------------
export const clubMemberGroups = pgTable("club_member_groups", {
  groupId:   integer("group_id").primaryKey().generatedAlwaysAsIdentity(),
  clubId:    integer("club_id").references(() => clubData.clubId),
  groupName: text("group_name"),
});

// ---------------- category_club_group_assignment ----------------
export const categoryClubGroupAssignment = pgTable("category_club_group_assignment", {
  num:        integer("num").primaryKey().generatedAlwaysAsIdentity(),
  groupId:    integer("group_id").references(() => clubMemberGroups.groupId),
  categoryId: integer("category_id").references(() => categoryData.categoryId),
});

// ---------------- student_club_group_assignment ----------------
export const studentClubGroupAssignment = pgTable("student_club_group_assignment", {
  num:       integer("num").primaryKey().generatedAlwaysAsIdentity(),
  studentId: integer("student_id").references(() => studentUserData.studentId),
  groupId:   integer("group_id").references(() => clubMemberGroups.groupId),
});

// ============================================================
//  ROLES & PERMISSIONS
// ============================================================

// ---------------- permissions_list ----------------
export const permissionsList = pgTable("permissions_list", {
  permissionId:       integer("permission_id").primaryKey().generatedAlwaysAsIdentity(),
  permissionKey:      text("permission_key"),
  description:        text("description"),
  permissionCategory: text("permission_category"),
});

// ---------------- role_data ----------------
export const roleData = pgTable("role_data", {
  roleId:   integer("role_id").primaryKey().generatedAlwaysAsIdentity(),
  clubId:   integer("club_id").references(() => clubData.clubId),
  roleName: text("role_name"),
});

// ---------------- role_permissions ----------------
export const rolePermissions = pgTable("role_permissions", {
  num:          integer("num").primaryKey().generatedAlwaysAsIdentity(),
  roleId:       integer("role_id").references(() => roleData.roleId),
  permissionId: integer("permission_id").references(() => permissionsList.permissionId),
});

// ---------------- student_role_assignment ----------------
export const studentRoleAssignment = pgTable("student_role_assignment", {
  num:       integer("num").primaryKey().generatedAlwaysAsIdentity(),
  studentId: integer("student_id").references(() => studentUserData.studentId),
  clubId:    integer("club_id").references(() => clubData.clubId),
  roleId:    integer("role_id").references(() => roleData.roleId),
});

// ============================================================
//  HOURS
// ============================================================

// ---------------- logged_hours ----------------
export const loggedHours = pgTable("logged_hours", {
  num:              integer("num").primaryKey().generatedAlwaysAsIdentity(),
  studentId:        integer("student_id").references(() => studentUserData.studentId),
  clubId:           integer("club_id").references(() => clubData.clubId),
  opportunityName:  text("opportunity_name"),
  date:             date("date"),
  hours:            integer("hours"),
  categoryId:       integer("category_id").references(() => categoryData.categoryId),
  orgName:          text("org_name"),
  coordinatorName:  text("coordinator_name"),
  coordinatorEmail: text("coordinator_email"),
  optionalMessage:  text("optional_message"),
  denyMessage:      text("deny_message"),
  status:           text("status"),
  imageId:          text("image_id"),
});

// ---------------- additional_hours ----------------
export const additionalHours = pgTable("additional_hours", {
  num:        integer("num").primaryKey().generatedAlwaysAsIdentity(),
  studentId:  integer("student_id").references(() => studentUserData.studentId),
  clubId:     integer("club_id").references(() => clubData.clubId),
  hours:      integer("hours"),
  categoryId: integer("category_id").references(() => categoryData.categoryId),
});

// ============================================================
//  SIGN UPS
// ============================================================

// ---------------- sign_ups ----------------
export const signUps = pgTable("sign_ups", {
  signUpId:        integer("sign_up_id").primaryKey().generatedAlwaysAsIdentity(),
  categoryId:      integer("category_id").references(() => categoryData.categoryId),
  name:            text("name"),
  description:     text("description"),
  date:            text("date"),
  startTime:       text("start_time"),
  endTime:         text("end_time"),
  slots:           integer("slots"),
  hours:           integer("hours"),
  slotsPerStudent: integer("slots_per_student"),
});

// ---------------- registrations ----------------
export const registrations = pgTable("registrations", {
  num:            integer("num").primaryKey().generatedAlwaysAsIdentity(),
  signUpId:       integer("sign_up_id").references(() => signUps.signUpId),
  studentId:      integer("student_id").references(() => studentUserData.studentId),
  timeRegistered: text("time_registered"),
  status:         text("status"),
});

// ============================================================
//  RELATIONS
// ============================================================

export const studentRelations = relations(studentUserData, ({ many }) => ({
  memberships:     many(studentClubMembership),
  groups:          many(studentClubGroupAssignment),
  roles:           many(studentRoleAssignment),
  loggedHours:     many(loggedHours),
  additionalHours: many(additionalHours),
  registrations:   many(registrations),
}));

export const staffRelations = relations(staffUserData, ({ many }) => ({
  clubs: many(clubStaffAssignment),
}));

export const clubRelations = relations(clubData, ({ many }) => ({
  categories:      many(categoryData),
  memberships:     many(studentClubMembership),
  staff:           many(clubStaffAssignment),
  groups:          many(clubMemberGroups),
  roles:           many(roleData),
  loggedHours:     many(loggedHours),
  additionalHours: many(additionalHours),
}));

export const categoryRelations = relations(categoryData, ({ one, many }) => ({
  club:            one(clubData, {
    fields:     [categoryData.clubId],
    references: [clubData.clubId],
  }),
  groups:          many(categoryClubGroupAssignment),
  signUps:         many(signUps),
  loggedHours:     many(loggedHours),
  additionalHours: many(additionalHours),
}));

export const studentClubMembershipRelations = relations(studentClubMembership, ({ one }) => ({
  club:    one(clubData, {
    fields:     [studentClubMembership.clubId],
    references: [clubData.clubId],
  }),
  student: one(studentUserData, {
    fields:     [studentClubMembership.studentId],
    references: [studentUserData.studentId],
  }),
}));

export const clubStaffAssignmentRelations = relations(clubStaffAssignment, ({ one }) => ({
  club:  one(clubData, {
    fields:     [clubStaffAssignment.clubId],
    references: [clubData.clubId],
  }),
  staff: one(staffUserData, {
    fields:     [clubStaffAssignment.staffId],
    references: [staffUserData.staffId],
  }),
}));

export const clubMemberGroupRelations = relations(clubMemberGroups, ({ one, many }) => ({
  club:       one(clubData, {
    fields:     [clubMemberGroups.clubId],
    references: [clubData.clubId],
  }),
  categories: many(categoryClubGroupAssignment),
  students:   many(studentClubGroupAssignment),
}));

export const categoryClubGroupAssignmentRelations = relations(categoryClubGroupAssignment, ({ one }) => ({
  group:    one(clubMemberGroups, {
    fields:     [categoryClubGroupAssignment.groupId],
    references: [clubMemberGroups.groupId],
  }),
  category: one(categoryData, {
    fields:     [categoryClubGroupAssignment.categoryId],
    references: [categoryData.categoryId],
  }),
}));

export const studentClubGroupAssignmentRelations = relations(studentClubGroupAssignment, ({ one }) => ({
  student: one(studentUserData, {
    fields:     [studentClubGroupAssignment.studentId],
    references: [studentUserData.studentId],
  }),
  group:   one(clubMemberGroups, {
    fields:     [studentClubGroupAssignment.groupId],
    references: [clubMemberGroups.groupId],
  }),
}));

export const permissionRelations = relations(permissionsList, ({ many }) => ({
  roles: many(rolePermissions),
}));

export const roleRelations = relations(roleData, ({ one, many }) => ({
  club:        one(clubData, {
    fields:     [roleData.clubId],
    references: [clubData.clubId],
  }),
  permissions: many(rolePermissions),
  students:    many(studentRoleAssignment),
}));

export const rolePermissionRelations = relations(rolePermissions, ({ one }) => ({
  role:       one(roleData, {
    fields:     [rolePermissions.roleId],
    references: [roleData.roleId],
  }),
  permission: one(permissionsList, {
    fields:     [rolePermissions.permissionId],
    references: [permissionsList.permissionId],
  }),
}));

export const studentRoleAssignmentRelations = relations(studentRoleAssignment, ({ one }) => ({
  student: one(studentUserData, {
    fields:     [studentRoleAssignment.studentId],
    references: [studentUserData.studentId],
  }),
  club:    one(clubData, {
    fields:     [studentRoleAssignment.clubId],
    references: [clubData.clubId],
  }),
  role:    one(roleData, {
    fields:     [studentRoleAssignment.roleId],
    references: [roleData.roleId],
  }),
}));

export const loggedHoursRelations = relations(loggedHours, ({ one }) => ({
  student:  one(studentUserData, {
    fields:     [loggedHours.studentId],
    references: [studentUserData.studentId],
  }),
  club:     one(clubData, {
    fields:     [loggedHours.clubId],
    references: [clubData.clubId],
  }),
  category: one(categoryData, {
    fields:     [loggedHours.categoryId],
    references: [categoryData.categoryId],
  }),
}));

export const additionalHoursRelations = relations(additionalHours, ({ one }) => ({
  student:  one(studentUserData, {
    fields:     [additionalHours.studentId],
    references: [studentUserData.studentId],
  }),
  club:     one(clubData, {
    fields:     [additionalHours.clubId],
    references: [clubData.clubId],
  }),
  category: one(categoryData, {
    fields:     [additionalHours.categoryId],
    references: [categoryData.categoryId],
  }),
}));

export const signUpRelations = relations(signUps, ({ one, many }) => ({
  category:      one(categoryData, {
    fields:     [signUps.categoryId],
    references: [categoryData.categoryId],
  }),
  registrations: many(registrations),
}));

export const registrationRelations = relations(registrations, ({ one }) => ({
  signUp:  one(signUps, {
    fields:     [registrations.signUpId],
    references: [signUps.signUpId],
  }),
  student: one(studentUserData, {
    fields:     [registrations.studentId],
    references: [studentUserData.studentId],
  }),
}));
