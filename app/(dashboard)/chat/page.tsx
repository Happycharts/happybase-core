"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth, useUser } from "@clerk/nextjs";
import { Message, AIChat } from "@/app/api/chat/route";

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export default function Chat() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const { orgId } = useAuth();
  const user = useUser().user?.firstName + " " + useUser().user?.lastName;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
  
    const newMessage: Message = { role: 'user', content: input };
    setConversation([...conversation, newMessage]);
  
    const filteredConversation = conversation.filter(message => message.content.trim() !== '');
    const prompt = input; // Add your prompt here if needed
  
    AIChat(
      filteredConversation.map(({ role, content }) => ({ role, content })),
      { id: orgId! },
      input,
      prompt
    )
    .then(({ text, charts }) => {
      setConversation([
        ...conversation,
        newMessage,
        {
          role: 'assistant',
          content: text,
          charts: charts ? charts.filter((chart): chart is string => chart !== null) : undefined
        }
      ]);
    })
    .catch((error) => {
      console.error('Error in conversation:', error);
    });
  };
  

  return (
    <div className="p-4 h-screen">
      <Card className="w-full h-full flex flex-col">
        <CardTitle>Generative BI</CardTitle>
        <CardDescription>
          Use natural language to create beautiful dashboards with Happycharts generative BI builder.
        </CardDescription>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full w-full pr-4">
            {conversation.map((message, idx) => (
              <div key={idx} className="flex flex-col gap-3 text-slate-600 text-sm mb-4">
                <div className="flex gap-3">
                  {message.role === "user" ? (
                    <Avatar>
                      <AvatarFallback>U</AvatarFallback>
                      <AvatarImage src="https://github.com/tamirespatrocinio.png" />
                    </Avatar>
                  ) : (
                    <Avatar>
                      <AvatarFallback>AI</AvatarFallback>
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
                {message.charts && message.charts.map((chart, chartIdx) => (
                chart && (
                  <div 
                    key={chartIdx} 
                    dangerouslySetInnerHTML={{ __html: chart }} 
                    className="mt-2" 
                  />
                )
              ))}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form className="w-full flex gap-2" onSubmit={handleSubmit}>
            <Input
              name="prompt"
              placeholder="How can I help you?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit">Send</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}