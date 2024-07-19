import { formatDate, formatElapsed } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Loader,
  PauseIcon,
  PlayIcon,
  StepBack,
  StepForward,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  readProgressFromLocalStorage,
  writeProgressToLocalStorage,
} from "@/lib/storage";

export function Player({
  audio,
  playing,
  setPlaying,
  currentPodcast,
  clearCurrent,
}: {
  audio: HTMLAudioElement | null;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  currentPodcast: any;
  clearCurrent: () => void;
}) {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [seek, setSeek] = useState<number[]>();
  const [isLoading, setIsLoading] = useState(false);
  // wantToPlay tracks what the user has commanded. This is necessary because
  // the audio element may not be ready to play immediately after the user
  // clicks play.
  const [wantToPlay, setWantToPlay] = useState(false);
  useEffect(() => {
    if (!audio) return;
    audio.addEventListener("playing", () => {
      setIsLoading(false);
      console.log("Playing");
      setPlaying(true);
    });
    audio.addEventListener("pause", () => {
      console.log("Paused");
      setPlaying(false);
    });
    audio.addEventListener("loadstart", () => {
      setIsLoading(true);
      console.log("Load start");
    });
    audio.addEventListener("canplaythrough", () => {
      setIsLoading(false);
      if (wantToPlay) {
        audio.play();
      }
      console.log("Can play through");
    });
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });
    return () => {
      audio.removeEventListener("playing", () => {
        setPlaying(true);
      });
      audio.removeEventListener("pause", () => {
        setPlaying(false);
      });
    };
  }, [audio, setPlaying]);
  useEffect(() => {
    const progress = readProgressFromLocalStorage(currentPodcast?.guid);
    if (audio && progress > 0) {
      audio.currentTime = progress;
    }
  }, [currentPodcast]);

  const getProgress = () => {
    if (!audio || !currentPodcast) return 0;
    // write every 5 seconds (debounce)
    if (Math.floor(currentTime) % 5 === 0 && currentTime > 0) {
      writeProgressToLocalStorage(currentPodcast.guid, currentTime);
    }
    return (audio.currentTime / audio.duration) * 100;
  };
  const clearAudio = () => {
    if (audio) {
      audio.pause();
      setPlaying(false);
    }
    clearCurrent();
  };
  const onTogglePlay = () => {
    if (!audio) return;
    if (playing) {
      audio.pause();
      setWantToPlay(false);
    } else {
      setWantToPlay(true);
      audio.play();
    }
  };
  useEffect(() => {
    if (seek && audio) {
      audio.currentTime = (seek[0] / 100) * audio.duration;
      setSeek(undefined);
    }
  }, [seek, audio]);
  const seekForward = () => {
    if (!audio) return;
    audio.currentTime += 30;
  };
  const seekBackward = () => {
    if (!audio) return;
    audio.currentTime -= 10;
  };
  if (!audio || !currentPodcast) return null;
  return (
    <div className="w-full flex h-full gap-4 flex-row items-center p-2 bg-white dark:bg-slate-900 opacity-[98%]">
      <div className="flex flex-col items-center justify-between gap-2 h-full xl:w-1/4">
        <Button onClick={onTogglePlay} className="w-full h-full">
          {!isLoading ? (
            playing ? (
              <PauseIcon size={36} />
            ) : (
              <PlayIcon size={36} />
            )
          ) : (
            <Loader size={36} className="animate animate-spin" />
          )}
        </Button>
        <div className="flex flex-row gap-1 w-full h-full">
          <Button onClick={seekBackward} className="h-full w-full">
            <StepBack size={30} />
          </Button>
          <Button onClick={seekForward} size="lg" className="w-full h-full">
            <StepForward size={30} />
          </Button>
        </div>
      </div>
      <div className="w-full flex flex-col gap-3">
        <div className="xl:text-3xl text-lg tracking-tight">
          {currentPodcast.title}
        </div>
        <div className="text-sm xl:text-lg tracking-tight">
          {formatDate(currentPodcast.pubDate)}
        </div>
        <Slider
          className="py-2"
          value={seek || [getProgress()]}
          onValueChange={setSeek}
          max={100}
          step={0.1}
        />
        <div className="flex flex-row justify-between text-sm xl:text-lg">
          <p>{formatElapsed(audio.currentTime)}</p>
          <p>{formatElapsed(audio.duration) || ""}</p>
        </div>
      </div>
    </div>
  );
}
