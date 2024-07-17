import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// date to mm.dd.yyyy
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fi-FI");
}

export function pubDateLastWeek(date: string) {
  const now = new Date();
  const pubDate = new Date(date);
  const diff = now.getTime() - pubDate.getTime();
  const diffDays = diff / (1000 * 3600 * 24);
  return diffDays < 7;
}

// sec to hr:min
export function formatDuration(durationSec: string) {
  // if durationSec contains ":", return it outright
  if (durationSec.includes(":")) return durationSec;
  const duration = parseInt(durationSec);
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration - hours * 3600) / 60);
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

export function formatElapsed(elapsedSec: any) {
  if (isNaN(elapsedSec)) return "";
  if (isNaN(parseInt(elapsedSec))) return "";
  const hours = Math.floor(elapsedSec / 3600);
  const minutes = Math.floor((elapsedSec - hours * 3600) / 60);
  const seconds = Math.floor(elapsedSec - hours * 3600 - minutes * 60);
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}
