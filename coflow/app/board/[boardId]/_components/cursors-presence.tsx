"use client";

import { memo } from "react";

import { useOthersConnectionIds } from "@/liveblocks.config";

import { Cursor } from "./cursor";

const Cursors = () => {
    const ids = useOthersConnectionIds();

    return (
        <>
            {ids.map((connectionId) => (
                <Cursor key={connectionId} connectionId={connectionId} />
            ))}
        </>
    );
};

export const CursorsPresence = memo(() => {
    return (
        <>
            {/* Draft pencils */}
            <Cursors />
        </>
    );
});

CursorsPresence.displayName = "CursorsPresence";

// 6:47:44
