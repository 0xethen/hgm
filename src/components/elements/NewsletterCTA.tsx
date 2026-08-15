import { useForm } from "@tanstack/react-form";
import { z } from "zod/mini";
import { toast } from "sonner";
import { Field, FieldDescription, FieldError } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { useBreakpoint } from "#/hooks/browser.ts";
import { useNavigate } from "@tanstack/react-router";

const formSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export function NewsletterCTA({
  className,
  title = "Join our mailing list",
  description = "Stay in the know about upcoming events, volunteer/learning opportunities, and the latest news from the HackGwinnett team by subscribing to our newsletter.",
  button = "Sign up",
}: {
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  button?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { md } = useBreakpoint();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const request = (async () => {
        if (import.meta.env.DEV && value.email.includes("@example.com")) {
          return { code: "OK_PENDING", email: value.email };
        }

        const url = import.meta.env.PUBLIC_APPS_SCRIPT_NEWSLETTER_URL;
        if (!url) {
          throw new Error("Signup endpoint is not configured.");
        }

        // let response: Response;
        let data: any;
        try {
          const response = await fetch(url, {
            method: "POST",
            body: new URLSearchParams({ email: value.email }),
          });

          data = await response.json();
        } catch {
          throw new Error("Unexpected response from signup service.");
        }

        if (!data.success) {
          const err = new Error(data.message || "Failed to subscribe :(") as Error & {
            cause?: any;
          };
          err.cause = data;
          throw err;
        }

        return {
          code: data.code || "OK_PENDING",
          email: value.email,
          message: data.message,
        };
      })();

      toast.promise(request, {
        loading: "Sending verification email...",
        success: (data) => {
          form.reset();

          return {
            message: "Thanks! Check your inbox",
            description:
              "We sent a verification link to " + data.email + " to confirm your subscription.",
          };
        },
        error: (err: any) => {
          switch (err.cause?.code) {
            case "ERR_MISSING_EMAIL":
              return {
                type: "error",
                message: "Missing email",
                description: "Please enter a valid email address.",
              };

            case "ERR_INVALID_EMAIL":
              return {
                type: "error",
                message: "Invalid email",
                description: "That email address does not look valid.",
              };

            case "ERR_DUPLICATE_ENTRY":
              return {
                type: "warning",
                message: "Pending verification",
                description:
                  "That email is already in our system. Check your inbox for the verification email, or wait a moment and try again.",
                duration: 12000,
              };
          }

          return {
            message: err.message,
            description: "Please try again (or file an issue!)",
            action: {
              label: "Report",
              onClick: () => navigate({ to: "/report" }),
            },
            actionButtonStyle: { backgroundColor: "var(--destructive)" },
          };
        },
      });
    },
  });

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-2xl font-bold mt-0 mb-2">{title}</h2>
        <p className="text-gray-600 text-sm md:text-base">{description}</p>
      </div>

      <form
        id="newsletter-cta-form"
        className="flex flex-col md:flex-row gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await form.handleSubmit();
        }}
      >
        <form.Field
          name="email"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Email address"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                <FieldDescription className="text-xs md:text-sm">
                  By signing up for HackGwinnett mail, you agree to receive our updates and
                  communications. we won't pester you with constant emails (we hate spam too!)
                </FieldDescription>
              </Field>
            );
          }}
        />
        <form.Subscribe
          selector={(state) => state.isSubmitting}
          children={(isSubmitting) => (
            <Button type="submit" size={!md ? "sm" : "default"} disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : button}
            </Button>
          )}
        />
      </form>
    </div>
  );
}
