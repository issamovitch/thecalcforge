"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <p className="text-7xl font-bold text-red-500">500</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <Button
        onClick={reset}
        className="mt-8 bg-ember hover:bg-ember-hover text-white"
      >
        Try Again
      </Button>
    </div>
  );
}