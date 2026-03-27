const normalizeDateString = (value) => String(value ?? "").trim();

const buildDate = (year, month, day) => {
  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

export const parseFlexibleDate = (value) => {
  const input = normalizeDateString(value);
  if (!input) {
    return null;
  }

  if (/^\d{5}$/.test(input)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    excelEpoch.setUTCDate(excelEpoch.getUTCDate() + Number(input));
    return new Date(
      excelEpoch.getUTCFullYear(),
      excelEpoch.getUTCMonth(),
      excelEpoch.getUTCDate()
    );
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split("-").map(Number);
    return buildDate(year, month, day);
  }

  if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(input)) {
    const [day, month, year] = input.split(/[/-]/).map(Number);
    return buildDate(year, month, day);
  }

  if (/^\d{2}[/-]\d{2}[/-]\d{2}$/.test(input)) {
    const [day, month, shortYear] = input.split(/[/-]/).map(Number);
    const year = shortYear >= 70 ? 1900 + shortYear : 2000 + shortYear;
    return buildDate(year, month, day);
  }

  const parsed = new Date(input);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
};

export const formatDateLabel = (value) => {
  const parsed = parseFlexibleDate(value);
  if (!parsed) {
    return value || null;
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}-${month}-${year}`;
};

const diffInDays = (startDate, endDate) => {
  const start = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );
  const end = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((end - start) / millisecondsPerDay);
};

export const calculateDurationLabel = (startValue, endValue) => {
  const startDate = parseFlexibleDate(startValue);
  const endDate = parseFlexibleDate(endValue);

  if (!startDate || !endDate) {
    return null;
  }

  const days = diffInDays(startDate, endDate);
  if (days < 0) {
    return null;
  }

  if (days === 0) {
    return "1 day";
  }

  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  const parts = [];

  if (months > 0) {
    parts.push(`${months} month${months > 1 ? "s" : ""}`);
  }

  if (remainingDays > 0) {
    parts.push(`${remainingDays} day${remainingDays > 1 ? "s" : ""}`);
  }

  if (!parts.length) {
    return `${days} days`;
  }

  return parts.join(" ");
};
