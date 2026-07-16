import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <p className="text-7xl font-bold text-ember">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>
      <Button asChild className="mt-8 bg-ember hover:bg-ember-hover text-white">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}