import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { SECRET_THRESHOLD } from "#/components/NotFound";
import { useEffect } from "react";

export const Route = createFileRoute("/thecakeisalie")({
  beforeLoad: () => {
    console.log("[secret] you're not supposed to be here... " + "↓".repeat(SECRET_THRESHOLD));
    throw notFound();
  },
  staticData: { header: { hidden: true } },
});

// shhhhh... (easter eggs)
export function ConsoleSecrets({ patch }: { patch?: () => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (patch) patch();

    const confettiParticles = new Set<HTMLElement>();
    let confettiInterval: number | null = null;

    const hg = {
      confetti: {
        start: (maxConfetti = 300) => {
          hg.confetti.end();
          const cmd = document.getElementById("console-func");
          if (cmd) {
            cmd.textContent = "hg.confetti.end()";
            cmd.classList.replace("text-primary", "bg-destructive/80");
            cmd.classList.add("text-destructive-foreground");
          }

          const colors = [
            "#ff4d4d",
            "#ff9f43",
            "#feca57",
            "#1dd1a1",
            "#54a0ff",
            "#5f27cd",
            "#ff6bcb",
          ];

          const createParticle = () => {
            if (confettiParticles.size >= maxConfetti) return;

            const particle = document.createElement("div");

            const size = 6 + Math.random() * 10;
            const duration = 2500 + Math.random() * 2500;
            const drift = (Math.random() - 0.5) * 300;
            const rotation = 360 + Math.random() * 1080;

            particle.className = "confetti-particle";

            Object.assign(particle.style, {
              position: "fixed",
              top: "-20px",
              left: `${Math.random() * window.innerWidth}px`,
              width: `${size}px`,
              height: `${size * 0.6}px`,
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              borderRadius: `${Math.random() > 0.5 ? 50 : 0}%`,
              pointerEvents: "none",
              zIndex: "999999",
              willChange: "transform",
            });

            particle.animate(
              [
                {
                  transform: `translate(0,0) rotate(0deg)`,
                  opacity: 1,
                },
                {
                  transform: `translate(${drift}px,${
                    window.innerHeight + 100
                  }px) rotate(${rotation}deg)`,
                  opacity: 0.9,
                },
              ],
              {
                duration,
                easing: "cubic-bezier(.1,.8,.3,1)",
                fill: "forwards",
              },
            );

            confettiParticles.add(particle);
            document.body.appendChild(particle);

            setTimeout(() => {
              particle.remove();
              confettiParticles.delete(particle);
            }, duration);
          };

          // initial burst
          for (let i = 0; i < 50; i++) {
            createParticle();
          }

          // stream
          confettiInterval = window.setInterval(() => {
            for (let i = 0; i < 8; i++) {
              createParticle();
            }
          }, 100);

          // timeout after 30 seconds
          setTimeout(() => {
            hg.confetti.end();
          }, 30000);
        },

        end: () => {
          const cmd = document.getElementById("console-func");
          if (cmd) {
            cmd.textContent = "hg.confetti.start()";
            cmd.classList.replace("bg-destructive/80", "text-primary");
            cmd.classList.remove("text-destructive-foreground");
          }

          if (confettiInterval !== null) {
            clearInterval(confettiInterval);
            confettiInterval = null;
          }
        },

        clear: () => {
          hg.confetti.end();

          confettiParticles.forEach((particle) => {
            particle.remove();
          });

          confettiParticles.clear();
        },
      },

      secret: () => {
        if (import.meta.env.PROD) console.clear();
        void navigate({ to: "/thecakeisalie" });
      },
    };

    // @ts-ignore
    window.hg = hg;

    return () => {
      // @ts-ignore
      delete window.hg; // cleanup on unmount
    };
  }, [navigate]);

  return null;
}
