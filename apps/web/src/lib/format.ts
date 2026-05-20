type CalendarDateParts = {
  year: number;
  month: number;
  day: number;
};

const calendarDatePattern = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/;

function getCalendarDateParts(value?: string | null): CalendarDateParts | null {
  if (!value) {
    return null;
  }

  const match = calendarDatePattern.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { year, month, day };
}

function toCalendarDateKey(parts: CalendarDateParts) {
  return parts.year * 10_000 + parts.month * 100 + parts.day;
}

function toUtcCalendarDate(parts: CalendarDateParts) {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function formatWithFallback(
  value: string,
  options: Intl.DateTimeFormatOptions,
) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("de-DE", options).format(parsedDate);
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return formatWithFallback(value, {
    dateStyle: "medium",
  });
}

export function formatCalendarDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  const parts = getCalendarDateParts(value);

  if (!parts) {
    return formatDate(value);
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(toUtcCalendarDate(parts));
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return formatWithFallback(value, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const parts = getCalendarDateParts(value);

  if (!parts) {
    return "";
  }

  return `${parts.year.toString().padStart(4, "0")}-${parts.month
    .toString()
    .padStart(2, "0")}-${parts.day.toString().padStart(2, "0")}`;
}

export function toDateTimeLocalInputValue(value?: string | null) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function toIsoDateTimeValue(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const [datePart, timePart] = value.split("T");

  if (!datePart || !timePart) {
    return undefined;
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  if ([year, month, day, hour, minute].some(part => Number.isNaN(part))) {
    return undefined;
  }

  return new Date(year, month - 1, day, hour, minute).toISOString();
}

export function toOptionalString(value?: string | null) {
  return value ?? "";
}

export function compareCalendarDates(
  left?: string | null,
  right?: string | null,
  direction: "asc" | "desc" = "asc",
) {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  const leftParts = getCalendarDateParts(left);
  const rightParts = getCalendarDateParts(right);

  if (!leftParts || !rightParts) {
    const leftTime = new Date(left).getTime();
    const rightTime = new Date(right).getTime();
    const result = leftTime - rightTime;
    return direction === "asc" ? result : -result;
  }

  const result =
    toCalendarDateKey(leftParts) - toCalendarDateKey(rightParts);

  return direction === "asc" ? result : -result;
}

export function isPastCalendarDate(
  value?: string | null,
  referenceDate: Date = new Date(),
) {
  const parts = getCalendarDateParts(value);

  if (!parts) {
    return false;
  }

  const referenceKey =
    referenceDate.getFullYear() * 10_000 +
    (referenceDate.getMonth() + 1) * 100 +
    referenceDate.getDate();

  return toCalendarDateKey(parts) < referenceKey;
}

export function isCalendarDateInCurrentMonth(
  value?: string | null,
  referenceDate: Date = new Date(),
) {
  const parts = getCalendarDateParts(value);

  if (!parts) {
    return false;
  }

  return (
    parts.year === referenceDate.getFullYear() &&
    parts.month === referenceDate.getMonth() + 1
  );
}

export function getCalendarDayDifference(
  startValue: string,
  endValue: string | Date,
) {
  const startParts = getCalendarDateParts(startValue);

  if (!startParts) {
    return null;
  }

  const endDate = typeof endValue === "string" ? new Date(endValue) : endValue;

  if (Number.isNaN(endDate.getTime())) {
    return null;
  }

  const startTimestamp = Date.UTC(
    startParts.year,
    startParts.month - 1,
    startParts.day,
  );
  const endTimestamp = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );

  return (endTimestamp - startTimestamp) / (1000 * 60 * 60 * 24);
}

export function getCalendarDateTimestamp(
  value: string,
  hour = 0,
  minute = 0,
) {
  const parts = getCalendarDateParts(value);

  if (!parts) {
    return null;
  }

  return Date.UTC(parts.year, parts.month - 1, parts.day, hour, minute);
}
