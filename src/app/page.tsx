"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createNewList, getFeedIdByName } from "@/actions/getFeed";
import Link from "next/link";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast";
import ActionButton from "@/components/ActionButton";

export default function Home() {
  const router = useRouter();
  const [listName, setListName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const onListInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const listName = e.target.value.toLowerCase().trim();
    setListName(listName);
  };
  const findList = () => {
    setIsLoading(true);
    getFeedIdByName(listName)
      .then((listId) => {
        if (!listId) {
          toast({
            title: "List not found",
            description: "The list you are looking for does not exist",
            variant: "destructive",
          });
          return;
        }
        router.push(`/${listName}`);
      })
      .catch((e) => {
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <main className="h-screen w-screen flex flex-col gap-6 dark:bg-slate-800 bg-slate-200 items-center justify-center">
      <div className="flex flex-col gap-2 min-w-[400px]">
        <div className="py-4">
          <Image
            className="dark:block hidden"
            alt="Dashpod logo"
            src="/white.png"
            width={400}
            height={400}
            priority
          />
          <Image
            className="dark:hidden"
            alt="Dashpod logo"
            src="/dark.png"
            width={400}
            height={400}
            priority
          />
          <p className="text-lg dark:text-white text-center">
            A simple podcast player for your car
          </p>
        </div>
        <NewListButton />
        <div className="text-center font-light text-sm dark:text-white">or</div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            findList();
          }}
        >
          <div className="flex flex-row gap-2">
            <Input
              placeholder="Enter code for existing list"
              value={listName}
              onChange={onListInput}
            />
            <ActionButton
              isLoading={isLoading}
              loaderVariant="secondary"
              // @ts-ignore
              variant="outline"
              onClick={findList}
            >
              Find list
            </ActionButton>
          </div>
        </form>
      </div>
      <Link href="https://github.com/dashpod-app/dashpod#readme">
        <Button
          className="fixed bottom-4 right-4"
          asChild
          variant={"secondary"}
        >
          <div className="flex flex-row items-center gap-2">
            About
            <svg
              role="img"
              viewBox="0 0 24 24"
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>GitHub</title>
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </div>
        </Button>
      </Link>
    </main>
  );
}

function NewListButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const onNewList = () => {
    setIsLoading(true);
    createNewList()
      .then((list) => {
        router.push(`/${list.name}`);
        toast({
          title: "List created",
          description: "A new list has been created",
        });
      })
      .catch((e) => {
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <ActionButton
      isLoading={isLoading}
      onClick={onNewList}
      loaderVariant="secondary"
    >
      Create a new list
    </ActionButton>
  );
}
