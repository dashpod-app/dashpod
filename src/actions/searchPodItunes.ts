"use server";

export async function searchPodItunes(term: string) {
  const feed = await fetch(
    `https://itunes.apple.com/search?term=${term}&entity=podcast&limit=5`
  );
  const parsed = await feed.json();
  return parsed as ItunesSearchReturn;
}
