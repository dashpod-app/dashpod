"use client";
import {
  addPodcastToList,
  getPodsDb,
  removePodFromList,
  reSortPods,
} from "@/actions/getFeed";
import { searchPodItunes } from "@/actions/searchPodItunes";
import ActionButton from "@/components/ActionButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, ArrowUp, Cog, Loader, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

const Subtitle = ({ children }: { children: React.ReactNode }) => (
  <Label className="text-sm text-slate-600">{children}</Label>
);

export default function AppDialog({
  listId,
  refresh,
  isOpen,
  setOpen,
}: {
  listId: string;
  refresh: () => Promise<null>;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}) {
  const onClose = () => {
    setOpen(false);
    return refresh();
  };
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => isOpen !== open && setOpen(open)}
    >
      <DialogTrigger asChild>
        <Button>
          <Cog />
        </Button>
      </DialogTrigger>
      <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-screen">
        <DialogHeader>
          <DialogTitle>Edit settings</DialogTitle>
          <DialogDescription>
            Make changes to your podcasts here. Click save when you are done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <SearchFeedItems refresh={onClose} listId={listId} />
          <Collapsible>
            <CollapsibleTrigger>
              <div className="w-full">
                <Subtitle>Add manually</Subtitle>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <AddFeedItem listId={listId} refresh={onClose} />
            </CollapsibleContent>
          </Collapsible>
          <Separator />
          <SortFeedItems listId={listId} refresh={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SortFeedItems({
  listId,
  refresh,
}: {
  listId: string;
  refresh: () => Promise<null>;
}) {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    getPodsDb(listId).then((feedsList) => {
      setFeeds(feedsList);
    });
  }, [listId]);
  // List of feeds and ability to sort them (up or down arrow)
  const onSave = () => {
    setIsLoading(true);
    reSortPods(listId, feeds).then(() => {
      setIsLoading(false);
      refresh();
    });
  };
  const onDelete = (pod: Pod) => {
    removePodFromList(pod.id, listId).then(() => {
      refresh();
    });
  };
  const onPodUp = (pod: Pod) => {
    const podIndex = feeds.findIndex((feed) => feed.id === pod.id);
    if (podIndex === 0) return;
    const newFeeds = [...feeds];
    newFeeds[podIndex].sort -= 1;
    newFeeds[podIndex - 1].sort += 1;
    setFeeds(newFeeds);
  };
  const onPodDown = (pod: Pod) => {
    const podIndex = feeds.findIndex((feed) => feed.id === pod.id);
    if (podIndex === feeds.length - 1) return;
    const newFeeds = [...feeds];
    newFeeds[podIndex].sort += 1;
    newFeeds[podIndex + 1].sort -= 1;
    setFeeds(newFeeds);
  };

  return (
    <div className="flex flex-col gap-2">
      <Subtitle>Sort feeds</Subtitle>
      {feeds
        .sort((a, b) => a.sort - b.sort)
        .map((pod) => (
          <div
            key={pod.id}
            className="flex flex-row gap-2 items-center justify-between w-full"
          >
            <div className="flex flex-row gap-2 items-center">
              <div className="flex flex-row gap-0.5">
                <Button
                  size="sm"
                  className={
                    pod.sort === feeds.length - 1 ? "opacity-10" : "visible"
                  }
                  onClick={() => onPodDown(pod)}
                >
                  <ArrowDown />
                </Button>
                <Button
                  size="sm"
                  className={pod.sort === 0 ? "opacity-10" : "visible"}
                  onClick={() => onPodUp(pod)}
                >
                  <ArrowUp />
                </Button>
              </div>
              <div>{pod.name}</div>
            </div>
            <Button onClick={() => onDelete(pod)} size="sm" variant="outline">
              <X size={12} />
            </Button>
          </div>
        ))}
      <ActionButton onClick={onSave} isLoading={isLoading}>
        Save
      </ActionButton>
    </div>
  );
}

function SearchFeedItems({
  refresh,
  listId,
}: {
  refresh: () => Promise<null>;
  listId: string;
}) {
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const [results, setResults] = useState<undefined | ItunesSearchReturn>(
    undefined
  );
  const onSearchClick = () => {
    setResults(undefined);
    setIsLoading(true);
    searchPodItunes(search)
      .then((res) => {
        setResults(res);
        setIsLoading(false);
      })
      .catch((e) => {
        toast({
          title: "Error searching",
          description:
            "We were unable to search for the feed. You can try again. If the problem persists, please open an issue on Github.",
        });
      });
  };
  const onAddFeed = (feed: ItunesSearchResultPodcast) => {
    addPodcastToList(listId, feed.feedUrl)
      .then(() => {
        refresh();
      })
      .catch((e) => {
        toast({
          title: "Error adding feed",
          description: "There was an error adding the feed",
          variant: "destructive",
        });
      });
  };
  return (
    <div className="flex flex-col gap-2">
      <Subtitle>Search feeds</Subtitle>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearchClick();
        }}
      >
        <div className="flex flex-col gap-2">
          <Input
            type="text"
            placeholder="Search for a podcast"
            onChange={onSearch}
            value={search}
          />
          {/* @ts-ignore */}
          <ActionButton isLoading={isLoading} type="submit" className="w-full">
            Search
          </ActionButton>
        </div>
      </form>
      {results && (
        <div className="flex flex-col">
          <div className="text-sm font-semibold tracking-tight w-full text-center">
            Results
          </div>
          <div className="border-2 p-2 bg-slate-50 border-slate-100 rounded">
            {results.results.length === 0 && (
              <div className="text-center text-slate-900 tracking-tight">
                0 results found
              </div>
            )}
            {results.results.map((result, idx) => (
              <div
                key={idx}
                className="flex flex-row gap-1 justify-between p-0.5 hover:bg-slate-200 items-center text-sm text-slate-900"
              >
                <div className="flex flex-row items-center gap-1">
                  <Image
                    src={result.artworkUrl60}
                    width={40}
                    height={40}
                    alt={`Artwork for ${result.collectionName}`}
                  />
                  <div
                    key={result.collectionId}
                  >{`${result.collectionName} (${result.artistName})`}</div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onAddFeed(result)}
                  variant={"outline"}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AddFeedItem({
  listId,
  refresh,
}: {
  listId: string;
  refresh: () => Promise<null>;
}) {
  const [url, setUrl] = useState<string>("");
  const onUrlInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };
  const [isLoading, setIsLoading] = useState(false);
  const onAddFeed = () => {
    setIsLoading(true);
    addPodcastToList(listId, url).then(() => {
      setUrl("");
      refresh().then(() => {
        setIsLoading(false);
      });
    });
  };
  return (
    <div className="flex-col items-start gap-2 flex">
      <div className="flex flex-col gap-2 w-full text-slate-900">
        <Input
          type="text"
          placeholder="Enter feed url"
          onChange={onUrlInput}
          value={url}
        />
        <ActionButton onClick={onAddFeed} isLoading={isLoading}>
          {isLoading ? "Adding" : "Add Feed"}
        </ActionButton>
      </div>
    </div>
  );
}
