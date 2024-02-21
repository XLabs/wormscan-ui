export const minutesBetweenDates = (startDate: Date, endDate: Date) => {
  let differenceValue = (startDate.getTime() - endDate.getTime()) / 1000;
  differenceValue /= 60;
  return Math.abs(Math.round(differenceValue));
};

export const timeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

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
    return interval + " hour ago";
  }
  if (interval > 1) {
    return interval + " hours ago";
  }

  interval = Math.floor(seconds / 60);
  if (interval === 1) {
    return interval + " minute ago";
  }
  if (interval > 1) {
    return interval + " minutes ago";
  }

  if (seconds < 10) return "just now";

  return Math.floor(seconds) + " seconds ago";
};

export const daysAgoDate = (daysAgo: number) => {
  const today = new Date();
  return new Date(today.getTime() - Number(daysAgo) * 24 * 60 * 60 * 1000);
};

export const formatDate = (date: string | number | Date): string => {
  if (!date) return;

  const dateObject = new Date(date);
  if (isNaN(dateObject.getTime())) return;

  const formattedDate = dateObject
    .toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace("24:", "0:");

  return formattedDate.replace(/(.+),\s(.+),\s/g, "$1, $2 at ");
};
