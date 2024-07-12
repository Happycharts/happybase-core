"use client"

import { FC } from "react"
import { PlusIcon } from "lucide-react"
import { cn } from "@/app/utils/utils"

interface InviteButtonProps {
  onOpen: () => void
}

export const InviteButton: FC<InviteButtonProps> = ({ onOpen }) => {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-black/10 shadow-sm dark:border-yellow-400/20",
        "bg-gradient-to-b from-neutral-900 to-black dark:from-neutral-900 dark:to-stone-950"
      )}
    >
      <div className="rounded-[23px] border border-black/10">
        <div className="rounded-[22px] border dark:border-stone-800 border-white/50">
          <div className="rounded-[21px] border border-neutral-950/20 flex items-center justify-center">
            <button
              onClick={onOpen}
              className="w-16 h-16 flex items-center justify-center bg-neutral-200 dark:bg-brand-400 text-black border border-cyan-100/10 shadow-2xl transition-colors duration-200 rounded-full"
            >
              <PlusIcon className="h-7 w-7 text-black dark:text-neutral-900" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}