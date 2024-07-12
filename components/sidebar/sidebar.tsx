"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChat } from "ai/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/app/hooks/use-store";
import { useSidebarToggle } from "@/app/hooks/use-sidebar-toggle";

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
  });

  const sidebar = useStore(useSidebarToggle, (state) => state);

  return (
    <div className="flex-1 p-4 transition-all duration-300 ease-in-out">
      <Card className="w-full h-[calc(100vh-2rem)]">
        <CardHeader>
          <CardTitle> Chat AI </CardTitle>
          <CardDescription>
            Using Vercel SDK to create a chat bot.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-[calc(100vh-16rem)] w-full pr-4">
            {messages.map((message) => {
              return (
                <div
                  key={message.id}
                  className="flex gap-3 text-slate-600 text-sm mb-4"
                >
                  {message.role === "user" && (
                    <Avatar>
                      <AvatarFallback>TP</AvatarFallback>
                      <AvatarImage src="https://github.com/tamirespatrocinio.png" />
                    </Avatar>
                  )}
                  {message.role === "assistant" && (
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                    </Avatar>
                  )}

                  <p className="leading-relaxed">
                    <span className="block font-bold text-slate-700">
                      {message.role === "user" ? "User" : "AI"}
                    </span>
                    {message.content}
                  </p>
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form className="w-full flex gap-2" onSubmit={handleSubmit}>
            <Input
              placeholder="How can I help you?"
              value={input}
              onChange={handleInputChange}
            />
            <Button type="submit">Send</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Chat;