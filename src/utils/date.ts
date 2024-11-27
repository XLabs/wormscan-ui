export const minutesBetweenDates = (startDate: Date, endDate: Date) => {
  let differenceValue = (startDate.getTime() - endDate.getTime()) / 1000;
  differenceValue /= 60;
  return Math.abs(Math.round(differenceValue));
};

export const timeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  // if the date is more than 23:59 hours ago, return the formatted date
  if (seconds > 86400) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  }
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return interval + " years ago";
  }

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months ago";
  }

  interval = Math.floor(seconds / 86400);
  if (interval === 1) {
    return interval + " day ago";
  }
  if (interval > 1) {
    return interval + " days ago";
  }

  interval = Math.floor(seconds / 3600);
  if (interval === 1) {
    return interval + " hr ago";
  }
  if (interval > 1) {
    return interval + " hrs ago";
  }

  interval = Math.floor(seconds / 60);
  if (interval === 1) {
    return interval + " min ago";
  }
  if (interval > 1) {
    return interval + " mins ago";
  }

  if (seconds < 10) return "just now";

  return Math.floor(seconds) + " secs ago";
};

export const daysAgoDate = (daysAgo: number) => {
  const today = new Date();
  return new Date(today.getTime() - Number(daysAgo) * 24 * 60 * 60 * 1000);
};

export const formatDate = (date: string | number | Date, showMinutes: boolean = true): string => {
  if (!date) return;

  const dateObject = new Date(date);
  if (isNaN(dateObject.getTime())) return;

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(showMinutes && {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };

  const formattedDate = dateObject.toLocaleString("en-US", options).replace("24:", "0:");

  return showMinutes ? formattedDate.replace(/(.+),\s(.+),\s/g, "$1, $2 at ") : formattedDate;
};

export const startOfDayUTC = (date: Date) => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

export const startOfMonthUTC = (date: Date) => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
};

export const calculateDateDifferenceInDays = (start: Date, end: Date) => {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return end && start ? Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) : 0;
};

export const getISODateZeroed = (daysAgo: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCMinutes(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);
  return date.toISOString();
};

export const firstDataAvailableDate = "2021-08-01T00:00:00.000Z";
export const twoDaysAgoISOString = getISODateZeroed(2);
export const oneDayAgoISOString = getISODateZeroed(1);
export const todayISOString = getISODateZeroed(0);

const addOneMonth = (date: Date): Date => {
  const originalDate = date.getDate();
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + 1);

  if (newDate.getDate() < originalDate) {
    newDate.setDate(0);
  }

  return newDate;
};

export const getNextDate = (date: string, timespan: "1h" | "1d" | "1mo"): string => {
  const baseDate = new Date(date);
  return timespan === "1h"
    ? new Date(baseDate.setHours(baseDate.getHours() + 1)).toISOString()
    : timespan === "1d"
    ? new Date(baseDate.setDate(baseDate.getDate() + 1)).toISOString()
    : timespan === "1mo"
    ? addOneMonth(baseDate).toISOString()
    : new Date(baseDate.setFullYear(baseDate.getFullYear() + 1)).toISOString();
};

export const toLocaleDate = (date: Date | string) =>
  date ? new Date(date).toLocaleDateString() : null;
