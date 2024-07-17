"use client";
import { FeedItem } from "./feed";
import getFeed, { getFeedsDb, getPodsDb } from "@/actions/getFeed";
import { Suspense, useEffect, useState } from "react";
import { Player } from "./player";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import AppDialog from "./appdialog";

export default function Home({ params }: { params: { id: string } }) {
  const [pods, setPods] = useState<any>();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentPodcast, setCurrentPodcast] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    getPodsDb(params.id).then((pods) => {
      setPods(pods);
    });
  }, [params.id]);
  const onRefresh = () => {
    return new Promise<null>((resolve) => {
      getPodsDb(params.id).then((pods) => {
        setPods(pods);
        resolve(null);
      });
    });
  };
  const playAudio = (url: string) => {
    if (audio) audio.pause();
    const newAudio = new Audio(url);
    setAudio(newAudio);
    newAudio.play();
    newAudio.addEventListener("playing", () => {
      setPlaying(true);
      console.log("Playing");
    });
    newAudio.addEventListener("pause", () => {
      setPlaying(false);
      console.log("Paused");
    });
  };
  return (
    <main className="h-screen w-screen flex flex-col gap-6 overflow-x-scroll dark:text-slate-300 dark:bg-slate-800 bg-slate-200">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel>
          <div className="grid grid-cols-auto grid-flow-col	p-4 max-w-screen overflow-x-scroll justify-start">
            {pods && pods.length === 0 && <NoFeedsComponent />}
            {!pods && <PlaceHolderFeedItem />}
            {pods &&
              pods.map((pod: Pod, idx: number) => (
                <FeedComponent
                  title={pod.name || "Unknown"}
                  pod={pod}
                  key={`feed${idx}`}
                  onClick={(item) => {
                    playAudio(item.enclosure.url);
                    setCurrentPodcast(item);
                  }}
                />
              ))}
            <div className="fixed top-2 right-2">
              <AppDialog
                listId={params.id}
                refresh={onRefresh}
                isOpen={isSettingsOpen}
                setOpen={setIsSettingsOpen}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />
        {currentPodcast && (
          <ResizablePanel defaultSize={20}>
            <Player
              key={currentPodcast?.guid}
              audio={audio}
              playing={playing}
              setPlaying={setPlaying}
              currentPodcast={currentPodcast}
              clearCurrent={() => setCurrentPodcast(null)}
            />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </main>
  );
}
function FeedComponent({
  title,
  pod,
  onClick,
}: {
  title: string;
  pod: Pod;
  onClick: (item: any) => void;
}) {
  const [data, setData] = useState<any>();

  useEffect(() => {
    getFeed(pod.url).then((data) => {
      setData(JSON.parse(data));
    });
  }, [pod.id]);

  return (
    <div className="w-[500px] bg-white dark:bg-slate-950  rounded-lg p-3 mr-2 shadow-xl">
      <div className="text-2xl font-semibold tracking-tight">{title}</div>
      <div className="border-b w-1/2 my-2" />
      <div className="h-[80vh] overflow-y-scroll flex-col items-start gap-2 flex">
        {!data && <SkeletonFeedItem />}
        {data?.items.map((item: any) => (
          <FeedItem
            key={item.guid}
            item={item}
            onClick={() => onClick(item)}
            imageSrc={item.itunes.image || data.itunes.image}
          />
        ))}
      </div>
    </div>
  );
}
function NoFeedsComponent() {
  return (
    <div className="w-full bg-white dark:bg-slate-950  rounded-lg p-3 mr-2 shadow-xl">
      <div className="text-2xl font-semibold tracking-tight">
        No feeds found. Add a feed to get started{" "}
        <ArrowRight className="inline" />
      </div>
    </div>
  );
}

function SkeletonFeedItem() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <Skeleton className="w-20 h-20" />
        <div className="flex flex-col gap-2 justify-between">
          <Skeleton className="w-40 h-4" />
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-20 h-4" />
        </div>
      </div>
    </div>
  );
}

function PlaceHolderFeedItem() {
  return (
    <div className="w-[500px] bg-white dark:bg-slate-950  rounded-lg p-3 mr-2 shadow-xl">
      <Skeleton className="w-36 h-8" />
      <div className="border-b w-1/2 my-2" />
      <div className="h-[80vh] overflow-y-scroll flex-col items-start gap-2 flex">
        <SkeletonFeedItem />
        <SkeletonFeedItem />
        <SkeletonFeedItem />
        <SkeletonFeedItem />
        <SkeletonFeedItem />
        <SkeletonFeedItem />
        <SkeletonFeedItem />
      </div>
    </div>
  );
}
