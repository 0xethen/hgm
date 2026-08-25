import { type ErrorComponentProps, redirect, useRouter } from "@tanstack/react-router";
import { cn } from "#/lib/utils";

const APP_NAME = `0xethen/hgm@${import.meta.env.DEV ? "development" : "prod"}`; // replaces "infinite"
const DEFAULT_STOPCODE = "ILLEGAL_OPERATION_EXCEPTION"; // usually when an update to the server breaks the client, triggering reload

const VERBOSE_IN_PRODUCTION = false;
const VERBOSE_MODE = VERBOSE_IN_PRODUCTION || import.meta.env.DEV;

export function ErrorBoundary(props: ErrorComponentProps) {
  const router = useRouter();

  const error = {
    message:
      props.error instanceof Error ? props.error.message : String(props.error ?? "Unknown error"),
    stack: props.error instanceof Error ? props.error.stack : undefined,
  };
  const stopCode =
    error.message.replace(/[\s-]/g, "_").split(":")[0]?.toUpperCase() || "UNKNOWN_ERROR";
  const reportLink = `https://ethen.app/bsod?emsg=${encodeURIComponent(stopCode)}`;

  const showDetails = () => {
    const message = `${APP_NAME} encountered a(n) ${error.message}\n\n${error.stack ?? ""}`;
    const doCopy = confirm(
      `Click OK to copy the following to your clipboard: \n${"-".repeat(50)}\n` + message,
    );

    if (!doCopy) return;
    navigator.clipboard
      .writeText(message)
      .then(() => {
        const doRedirect = confirm(
          "Error details copied to clipboard! Would you like to report this error?",
        );

        if (doRedirect) {
          throw redirect({ href: reportLink });
        } else
          alert(
            "Alrighty then. If you change your mind, visit ethen.app/bsod at any time for help.\nAnd, again, sorry for the inconvenience! ;(",
          );
      })
      .catch(() => {
        alert("Unable to copy error details! Your device doesn't support Clipboard.");
      });
  };

  return (
    <section
      className={cn(
        // "overflow-y-hidden",
        "box-border min-h-safe-dvh w-full select-none bg-[#0078d7] text-left text-white",
        "flex flex-col items-start justify-center px-[10%]",
        "text-[32px] font-light leading-[1.4]",
        "max-lg:px-[10%] max-lg:text-[24px] max-lg:leading-[1.4]",
        "max-[512px]:px-[10%] max-[512px]:text-[16px] max-[512px]:leading-[1.3]",
      )}
      style={{ fontFamily: '"Segoe UI", "Segoe UI Light", Tahoma, Geneva, Verdana, sans-serif' }}
      aria-label={`${APP_NAME} crashed whilst trying to render this page`}
      role="alert"
    >
      <p className="m-0 text-[4em]">{":("}</p>

      <p className="m-0">
        {APP_NAME} ran into a problem and can't render this page.
        <br />
        Sorry about that.
        <br />
        <br />
        {router.history.canGoBack() ? (
          <button
            onClick={() => router.history.back()}
            className="hover:underline active:text-white/50"
          >
            Back
          </button>
        ) : (
          <button
            onClick={() => router.navigate({ to: "/" })}
            className="hover:underline active:text-white/50"
          >
            Home
          </button>
        )}
        <span>{" • "}</span>
        <button
          onClick={() => {
            const doReset = true; // confirm("We can try to re-render the page for you, but chances are you'll get sent right back here. Continue?");
            if (doReset) props.reset();
          }}
          onContextMenu={() => {
            const doHardReset = confirm("Reload the page? Changes you made might not be saved :O");
            if (doHardReset) window.location.reload();
          }}
          className="hover:underline active:text-white/50"
        >
          Retry
        </button>
        {VERBOSE_MODE && (
          <>
            <span>{" • "}</span>
            <button onClick={showDetails} className="hover:underline active:text-white/50">
              Details...
            </button>
          </>
        )}
        <br />
        <br />
      </p>

      <div className="flex items-start">
        <img
          className="h-auto w-[max(min(11%,105px),50px)] object-contain"
          src={"/assets/images/misc/bsodqr.png".toAsset()} // to /thecakeisalie
          alt="QR code"
        />

        <p className="m-0 pl-3.75 text-[0.4em]">
          For more information about this issue and possible fixes, visit{" "}
          <a href={reportLink} target="_blank" className="hover:underline">
            https://ethen.app/bsod
          </a>
          <br />
          <br />
          <br />
          if you call a support person, give them this info:
          <br />
          Stop code: {VERBOSE_MODE ? stopCode : DEFAULT_STOPCODE}
          <br></br>
        </p>
      </div>
    </section>
  );
}
