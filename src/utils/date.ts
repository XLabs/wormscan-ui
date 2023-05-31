export const minutesBetweenDates = (startDate: Date, endDate: Date) => {
  var differenceValue = (startDate.getTime() - endDate.getTime()) / 1000;
  differenceValue /= 60;
  return Math.abs(Math.round(differenceValue));
};
