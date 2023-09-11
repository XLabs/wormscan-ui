export function _get<T>(obj: any, path: string | string[], defaultValue: T) {
  const pathArray = Array.isArray(path) ? path : path.split(".");
  let currentValue = obj;
  for (const key of pathArray) {
    if (currentValue === undefined || currentValue === null) {
      return defaultValue;
    } else {
      currentValue = currentValue[key];
    }
  }
  return currentValue === undefined ? defaultValue : currentValue;
}
