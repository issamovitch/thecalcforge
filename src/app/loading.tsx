export default function Loading() {
  return (
    <div className="flex items-center justify-center py-32 min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="size-14 animate-spin rounded-full border-2 border-muted border-t-ember" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}