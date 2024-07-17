type Pod = {
  id: string;
  name?: string;
  url: string;
  sort: number;
  list: string;
};

type ItunesSearchResultPodcast = {
  collectionId: number;
  collectionName: string;
  artistName: string;
  feedUrl: string;
  artworkUrl60: string;
};

type ItunesSearchReturn = {
  resultsCount: number;
  results: ItunesSearchResultPodcast[];
};
