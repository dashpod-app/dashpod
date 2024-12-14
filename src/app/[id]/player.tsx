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

export function Player({ wantToPlay }: { wantToPlay: any }) {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [seek, setSeek] = useState<number[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playState, setPlayState] = useState<"playing" | "paused" | "error">(
    "paused"
  );

  useEffect(() => {
    // Tracks what user wants to play
    if (!wantToPlay) return;
    console.log("Want to play", wantToPlay);
    pause();
    setPlayState("paused");
    play(wantToPlay.enclosure.url);
  }, [wantToPlay?.guid, audio]);

  const pause = () => {
    if (!audio) return;
    audio.pause();
  };

  const play = (url: string) => {
    console.log("Playing", url, audio);
    if (!audio) return;
    audio.src = url;
    audio
      .play()
      .then(() => {
        setPlayState("playing");
      })
      .catch((e) => {
        console.error(e);
        setPlayState("error");
      });
  };

  useEffect(() => {
    const audio = new Audio();
    setAudio(audio);
    return () => {
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (!audio) return;
    audio.addEventListener("playing", () => {
      setIsLoading(false);
      console.log("Playing");
      setPlayState("playing");
    });
    audio.addEventListener("pause", () => {
      console.log("Paused");
      setPlayState("paused");
    });
    audio.addEventListener("loadstart", () => {
      setIsLoading(true);
      console.log("Load start");
    });
    audio.addEventListener("canplaythrough", () => {
      setIsLoading(false);
      console.log("Can play through, playing", audio, wantToPlay);
      if (wantToPlay && audio) {
        audio
          .play()
          .then(() => setPlayState("playing"))
          .catch((e) => {
            console.error(e);
            setPlayState("error");
          });
      }
      console.log("Can play through");
    });
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });
    return () => {
      audio.removeEventListener("playing", () => {
        setPlayState("playing");
      });
      audio.removeEventListener("pause", () => {
        setPlayState("paused");
      });
    };
  }, [audio, playState]);
  useEffect(() => {
    const progress = readProgressFromLocalStorage(wantToPlay?.guid);
    if (audio && progress > 0) {
      audio.currentTime = progress;
    }
  }, [wantToPlay?.guid, audio]);

  const getProgress = () => {
    if (!audio || !wantToPlay) return 0;
    // write every 5 seconds (debounce)
    if (Math.floor(currentTime) % 5 === 0 && currentTime > 0) {
      writeProgressToLocalStorage(wantToPlay.guid, currentTime);
    }
    return (audio.currentTime / audio.duration) * 100;
  };
  const onTogglePlay = async () => {
    if (!audio) return;
    if (playState === "playing") {
      console.log("Pausing");
      audio.pause();
      //setWantToPlay(false);
    } else {
      console.log("Playing");
      //setWantToPlay(true);
      await audio.play();
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
  if (!wantToPlay) return null;
  return (
    <div className="w-full flex h-full gap-4 flex-row items-center p-2 bg-white dark:bg-slate-900 opacity-[98%]">
      <div className="flex flex-col items-center justify-between gap-2 h-full 2xl:w-1/4">
        <Button onClick={onTogglePlay} className="w-full h-full">
          {!isLoading ? (
            playState === "playing" ? (
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
      <div className="w-full flex flex-col 2xl:gap-3 gap-1">
        <div className="2xl:text-3xl text-lg tracking-tight">
          {wantToPlay.title}
        </div>
        <div className="text-sm 2xl:text-lg tracking-tight">
          {formatDate(wantToPlay.pubDate)}
        </div>
        <Slider
          className="py-2"
          value={seek || [getProgress()]}
          onValueChange={setSeek}
          max={100}
          step={0.1}
        />
        <div className="flex flex-row justify-between text-sm 2xl:text-lg">
          <p>{formatElapsed(audio?.currentTime)}</p>
          <p>{formatElapsed(audio?.duration) || ""}</p>
        </div>
      </div>
    </div>
  );
}
