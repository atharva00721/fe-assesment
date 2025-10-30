"use client";

import { useEffect, useState } from "react";
import type { SortValue } from "./sort-controls";

export function usePersistedSort(messageId: string): [SortValue, (v: SortValue) => void] {
    const [sort, setSort] = useState<SortValue>(() => {
        if (typeof window === "undefined") return "new";
        return (localStorage.getItem(`sort:${messageId}`) as SortValue) || "new";
    });
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(`sort:${messageId}`, sort);
        }
    }, [messageId, sort]);
    return [sort, setSort];
}


