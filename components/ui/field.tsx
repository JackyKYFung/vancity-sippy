import React from "react";

interface FieldProps {
    label: string
    children: React.ReactNode
}


export function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
        {children}
    </div>
    )
}