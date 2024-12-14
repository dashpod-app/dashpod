"use client";
import { FeedItem } from "./feed";
import getFeed, { getPodsDb } from "@/actions/getFeed";
import { use, useEffect, useState } from "react";
import { Player } from "./player";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { Cog } from "lucide-react";
import AppDialog from "./appdialog";
import ActionButton from "@/components/ActionButton";

export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const [pods, setPods] = useState<any>();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentPodcast, setCurrentPodcast] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const { id } = use(params);

  useEffect(() => {
    getPodsDb(id).then((pods) => {
      setPods(pods);
    });
  }, [id]);
  const onRefresh = () => {
    return new Promise<null>((resolve) => {
      getPodsDb(id).then((pods) => {
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
    <main className="h-screen w-screen flex flex-col gap-6 overflow-x-scroll p-4 dark:text-slate-300 dark:bg-slate-800 bg-slate-200">
      <div className="fixed top-2 right-2">
        <AppDialog
          listId={id}
          refresh={onRefresh}
          isOpen={isSettingsOpen}
          setOpen={setIsSettingsOpen}
        />
      </div>
      {pods && pods.length === 0 && (
        <NoFeedsComponent setIsSettingsOpen={setIsSettingsOpen} />
      )}
      {pods?.length != 0 && (
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel>
            <div className="grid grid-cols-auto grid-flow-col max-w-screen overflow-x-scroll justify-start">
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
      )}
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
function NoFeedsComponent({
  setIsSettingsOpen,
}: {
  setIsSettingsOpen: (val: boolean) => void;
}) {
  return (
    <div className=" h-screen bg-white dark:bg-slate-950 w-[500px] rounded-lg p-3 mr-2">
      <div className="text-2xl font-semibold tracking-tight flex flex-col gap-4">
        <p>No Podcasts added.</p>
        <p className="text-xl font-medium">Add a podcast to get started.</p>
        <div className="text-lg font-normal tracking-tight">
          Click the button below to open settings and search and add Podcasts.
        </div>
        <ActionButton onClick={() => setIsSettingsOpen(true)}>
          Open settings <Cog size={24} className="ml-2" />
        </ActionButton>
        <p className="text-sm font-normal">
          To add more podcasts or change settings in the future, open settings
          by clicking the settings <Cog className="inline" /> icon in the top
          right corner.
        </p>
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
