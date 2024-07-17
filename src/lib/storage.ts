export function writeToLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function readFromLocalStorage(key: string) {
  const value = localStorage.getItem(key);
  if (value === null) {
    return null;
  }
  return value;
}

export function removeFromLocalStorage(key: string) {
  localStorage.removeItem(key);
}

export function clearLocalStorage() {
  localStorage.clear();
}

export function writeProgressToLocalStorage(episodeId: string, value: number) {
  writeToLocalStorage(episodeId, value.toString());
}

export function readProgressFromLocalStorage(episodeId: string) {
  const value = readFromLocalStorage(episodeId);
  console.log("Value", value);
  if (value === null) {
    return 0;
  }
  return parseInt(value);
}
