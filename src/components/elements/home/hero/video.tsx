import { createDialogHandle, Dialog, DialogContent } from "#/components/ui/dialog";
import { useState } from "react";

const YT_HERO_VIDEO_URL = "https://www.youtube.com/watch?v=aQhZfWQlVXU"; // https://www.youtube.com/watch?v=dQw4w9WgXcQ

const getVideoId = (videoUrl: string) => {
  const url = new URL(videoUrl);
  return url.searchParams.get("v") || url.pathname.split("/").pop();
};

export const videoDialog = createDialogHandle();
export const videoId = getVideoId(YT_HERO_VIDEO_URL);

export function HomepageHeroVideoDialog() {
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  return (
    <Dialog
      handle={videoDialog}
      onOpenChange={(open) => {
        if (!open) setIsVideoLoading(true);
      }}
    >
      <DialogContent className="p-2 w-[calc(100%-2rem)] sm:max-w-6xl">
        <div className="relative w-full aspect-video">
          {isVideoLoading && (
            <div className="absolute inset-0 flex bg-accent/50 items-center justify-center">
              <img src="/assets/images/brand/hgtransparent.svg" className="size-24 animate-pulse" />
            </div>
          )}

          <iframe
            className="w-full aspect-video"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&fs=0&modestbranding=1&rel=0&iv_load_policy=3`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-platform-access"
            allowFullScreen
            onLoad={() => setIsVideoLoading(false)}
            onError={() => setIsVideoLoading(false)}
          />
        </div>
        {/*<DialogClose
          // onClick={() => {
          //   videoDialog.close();
          // }}
          render={
            <Button
              variant="ghost"
              className="absolute top-5 right-5 bg-secondary z-2"
              size="icon-xs"
              disabled={isVideoLoading}
            />
          }
        >
          {isVideoLoading ? <Spinner /> : <RiCloseLine />}
          <span className="sr-only">Close</span>
        </DialogClose>*/}
      </DialogContent>
    </Dialog>
  );
}
