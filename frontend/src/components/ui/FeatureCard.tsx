import React from "react";

type FeatureCardProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
};

export default function FeatureCard({
    icon,
    title,
    description,
}: FeatureCardProps) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                {icon}
            </div>

            <h3 className="text-xl font-semibold">
                {title}
            </h3>

            <p className="mt-3 leading-7 text-zinc-400">
                {description}
            </p>
        </div>
    );
}