'use client';

import React from "react";

interface NoteProps {
    className?: string;
    appName?: string;
    value: string;
}

export const Note: React.FC<NoteProps> = ({
    className = "",
    appName = "",
    value
}) => {
    return (
        <div
            className={className}
        >
            <div>{value}</div>
        </div>
    );
};