"use client";

import {
    type FormEvent,
    type KeyboardEvent,
} from "react";

import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpIcon, PlusIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ConversationMode } from "./types";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type PromptSectionProps = {
    mode: ConversationMode;
    value: string;
    isResponding: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onChange: (value: string) => void;
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
    onModeSelect: (mode: ConversationMode) => void;
    placeholder?: string;
    placement?: "docked" | "floating";
};

const PromptSection = ({
    mode,
    value,
    isResponding,
    onSubmit,
    onChange,
    onKeyDown,
    onModeSelect,
    placeholder = "Ask, Search or Chat...",
    placement = "docked",
}: PromptSectionProps) => {
    const isDocked = placement === "docked";

    return (
        <motion.form
            layout
            initial={false}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onSubmit={onSubmit}
            className={cn(
                "w-full max-w-3xl transform z-30",
                isDocked
                    ? "absolute bottom-10 left-1/2 -translate-x-1/2"
                    : "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            )}
        >
            <InputGroup className="bg-background">
                <InputGroupTextarea
                    placeholder={placeholder}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={onKeyDown}
                    disabled={isResponding}
                    className="min-h-[92px] resize-none bg-transparent text-base leading-6 focus-visible:ring-0 dark:bg-transparent"
                />
                <InputGroupAddon align="block-end" className="gap-2">
                    <InputGroupButton
                        variant="outline"
                        className="rounded-full"
                        size="icon-xs"
                        type="button"
                        disabled={isResponding}
                    >
                        <PlusIcon className="size-3.5" />
                        <span className="sr-only">Attach</span>
                    </InputGroupButton>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <InputGroupButton variant="ghost" type="button">
                                {mode}
                            </InputGroupButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="top"
                            align="start"
                            className="[--radius:0.95rem]"
                        >
                            <DropdownMenuItem
                                onSelect={(event) => {
                                    event.preventDefault();
                                    onModeSelect("Auto");
                                }}
                            >
                                Auto
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={(event) => {
                                    event.preventDefault();
                                    onModeSelect("Agent");
                                }}
                            >
                                Agent
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={(event) => {
                                    event.preventDefault();
                                    onModeSelect("Manual");
                                }}
                            >
                                Manual
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <InputGroupText className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                        {isResponding ? "Responding..." : "Ready"}
                    </InputGroupText>
                    <Separator orientation="vertical" className="h-4" />
                    <InputGroupButton
                        variant="default"
                        className="rounded-full"
                        size="icon-xs"
                        type="submit"
                        disabled={!value.trim() || isResponding}
                    >
                        <ArrowUpIcon className="size-3.5" />
                        <span className="sr-only">Send</span>
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </motion.form>
    );
};

export default PromptSection;


