import Parser from "rss-parser";

type CustomFeed = { title: string; link: string };
export type CustomItem = {
  title: string;
  itunes: {
    image: string;
    duration: string;
  };
};

export const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    feed: ["title", "link"],
    item: ["title", "itunes"],
  },
});
