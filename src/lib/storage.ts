export function writeToLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function readFromLocalStorage(key: string) {
  return localStorage.getItem(key);
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
  if (value === null) {
    return 0;
  }
  return parseInt(value);
}
