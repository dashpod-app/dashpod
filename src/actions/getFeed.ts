"use server";
import { parser } from "@/lib/parser";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";
import { generate, count } from "random-words";

export default async function getFeed(url: string) {
  const feed = await parser.parseURL(url);
  return JSON.stringify(feed);
}

export async function getFeeds() {
  const feedUrls = [
    "https://feeds.npr.org/510289/podcast.xml",
    "https://www.thisamericanlife.org/podcast/rss.xml",
    "https://anchor.fm/s/f0b903e8/podcast/rss",
    "https://feeds.simplecast.com/xl36XBC2",
    "https://feeds.megaphone.fm/ADL8288293115",
  ];
  const feeds = await Promise.all(
    feedUrls.map(async (url) => {
      const feed = await parser.parseURL(url);
      return feed;
    })
  );
  return JSON.stringify(feeds);
}

async function getFeedTitle(url: string) {
  const feed = await parser.parseURL(url);
  return feed.title;
}

async function getFeedIdByName(name: string) {
  const { rows } = await sql`SELECT * from LISTS where name=${name}`;
  return rows[0].id;
}

export async function getFeedsDb(name: string) {
  const { rows: lists } = await sql`SELECT * from LISTS where name=${name}`;
  if (!lists || lists.length === 0) {
    return JSON.stringify([]);
  }
  const listId = lists[0].id;
  const { rows } =
    await sql`SELECT * from PODS where list=${listId} ORDER BY sort`;
  if (!rows || rows.length === 0) {
    return JSON.stringify([]);
  }
  const feeds = await Promise.all(
    rows.map(async (row) => {
      try {
        const feed = await parser.parseURL(row.url);
        return feed;
      } catch (error) {
        return null;
      }
    })
  );
  return JSON.stringify(feeds);
}

export async function getPodsDb(listName: string) {
  const { rows: lists } = await sql`SELECT * from LISTS where name=${listName}`;
  if (!lists || lists.length === 0) {
    return [];
  }
  const listId = lists[0].id;
  const { rows } =
    await sql`SELECT * from PODS where list=${listId} ORDER BY sort`;
  return rows as Pod[];
}

export async function createNewList() {
  const uid = randomUUID();
  // @ts-ignore
  const name = generate({ exactly: 3, maxLength: 5 }).join("-");
  await sql`INSERT INTO LISTS (id, name) VALUES (${uid}, ${name})`;
  return { name: name };
}

export async function addPodcastToList(list: string, url: string) {
  const { rows: lists } = await sql`SELECT * from LISTS where name=${list}`;
  if (!lists || lists.length === 0) {
    return JSON.stringify([]);
  }
  let title = null;
  const uid = randomUUID();
  const listId = lists[0].id;
  const { rows } = await sql`SELECT * from PODS where list=${listId}`;
  const sort = rows.length;
  try {
    title = await getFeedTitle(url);
  } catch (error) {
    console.log("Error getting feed title", error);
  } finally {
    await sql`INSERT INTO PODS (id, name, list, url, sort) VALUES (${uid}, ${title}, ${listId}, ${url}, ${sort})`;
  }
  return JSON.stringify({ list, url });
}

export async function reSortPods(list: string, pods: Pod[]) {
  const { rows: lists } = await sql`SELECT * from LISTS where name=${list}`;
  if (!lists || lists.length === 0) {
    return JSON.stringify([]);
  }
  const listId = lists[0].id;
  await Promise.all(
    pods.map(async (pod, idx) => {
      await sql`UPDATE PODS SET sort=${idx} WHERE id=${pod.id} AND list=${listId}`;
    })
  );
  return JSON.stringify(pods);
}

export async function removePodFromList(podId: string, listName: string) {
  const listId = await getFeedIdByName(listName);
  await sql`DELETE FROM PODS WHERE id=${podId} AND list=${listId}`;
  return podId;
}
