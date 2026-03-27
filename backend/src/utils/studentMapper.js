import { formatDateLabel } from "./dateDuration.js";

const normalizeValue = (value) => String(value ?? "").trim();

export const mapStudentRow = (row) => {
  const normalized = Object.entries(row || {}).reduce((acc, [key, value]) => {
    acc[String(key).trim().toLowerCase()] = normalizeValue(value);
    return acc;
  }, {});

  return {
    name:
      normalized.name ||
      normalized.studentname ||
      normalized["student name"] ||
      normalized.fullname ||
      "",
    course:
      normalized.course ||
      normalized.coursename ||
      normalized["course name"] ||
      normalized.program ||
      "",
    email:
      normalized.email ||
      normalized["email address"] ||
      normalized.mail ||
      "",
    startDate:
      formatDateLabel(
        row?.["Start Date"] ?? row?.startDate ?? row?.StartDate ?? row?.start
      ) ||
      normalized["start date"] ||
      normalized.startdate ||
      normalized["start"] ||
      "",
    endDate:
      formatDateLabel(
        row?.["End Date"] ??
          row?.endDate ??
          row?.EndDate ??
          row?.["Completion Date"] ??
          row?.completionDate ??
          row?.CompletionDate
      ) ||
      normalized["end date"] ||
      normalized.enddate ||
      normalized["completion date"] ||
      normalized.completiondate ||
      "",
  };
};
