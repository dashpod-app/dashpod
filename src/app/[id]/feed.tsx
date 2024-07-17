import Image from "next/image";
import { cn, formatDate, formatDuration, pubDateLastWeek } from "@/lib/utils";
import { useEffect, useState } from "react";
import { readFromLocalStorage } from "@/lib/storage";
import {
  ArrowRightFromLine,
  Diamond,
  Ellipsis,
  PlayCircle,
  Sparkles,
} from "lucide-react";
export function FeedItem({
  item,
  onClick,
  imageSrc,
}: {
  item: any;
  onClick: () => void;
  imageSrc: string;
}) {
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const found = readFromLocalStorage(item.guid);
    if (found) {
      setIsStarted(true);
    }
  }, [item?.guid]);
  return (
    <div className="flex flex-row justify-between w-full">
      <div className="flex flex-row justify-between w-full" onClick={onClick}>
        <div key={item.title} className="flex items-center gap-2 justify-start">
          <div className="relative">
            <Image
              src={imageSrc}
              alt={item.title}
              width={80}
              height={80}
              className={cn(isStarted && "opacity-80")}
            />
          </div>
          <div>
            {item.title}
            <p>{formatDuration(item.itunes.duration)}</p>
            <p>{formatDate(item.pubDate || "")}</p>
          </div>
        </div>
        <div className="">
          {isStarted && <ArrowRightFromLine size={12} className="inline" />}
          {!isStarted && pubDateLastWeek(item.pubDate) && (
            <Sparkles size={12} className="inline" />
          )}
        </div>
      </div>
    </div>
  );
}
