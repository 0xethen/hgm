import { revalidateLogic, useForm } from "@tanstack/react-form";
import { z } from "zod/mini";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Textarea } from "#/components/ui/textarea";
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import { copy, getGWEmailUrl, popup } from "#/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/ui/tooltip";
import { useBreakpoint } from "#/hooks/browser.ts";
import { useState } from "react";
import { brand } from "#/lib/meta/brand";

const CONTACT_EMAIL = "hackgwinnett@gmail.com"; // @hackgwinnett.org soon??? 👀

const emailProviders: { id: string; label: string; description?: React.ReactNode }[] = [
  { id: "default", label: "My email app", description: "your device's default mail client" },
  { id: "gmail", label: "Gmail", description: "the Gmail web client" },
  { id: "yahoo", label: "Yahoo!", description: "the Yahoo! Mail web client" },
  { id: "outlook", label: "Microsoft Outlook", description: "the Outlook.com web client" },
  { id: "protonmail", label: "ProtonMail", description: "the ProtonMail web client" },
  { id: "gcps", label: "GCPS Mail", description: "your Google Workspace email" },
];

const formSchema = z.object({
  subject: z.string().check(z.minLength(2, "Subject line is required")),
  message: z
    .string()
    .check(
      z.minLength(1, "Body is required"),
      z.maxLength(500, "Body must be less than 500 characters"),
    ),
  provider: z.enum(emailProviders.map((option) => option.id)),
});

export function ContactForm() {
  const form = useForm({
    defaultValues: {
      subject: "",
      message: "",
      provider: "default",
    },
    validators: {
      onDynamic: formSchema,
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    onSubmit({ value }) {
      const subject = encodeURIComponent(value.subject || "");
      const body = encodeURIComponent(value.message + "\n\n\nSent from hackgwinnett.org" || "");
      const to = encodeURIComponent(CONTACT_EMAIL);

      let url: string;

      switch (value.provider) {
        case "gmail":
          url = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
          break;
        case "yahoo":
          url = `https://compose.mail.yahoo.com/?to=${to}&subject=${subject}&body=${body}`;
          break;
        case "outlook":
          url = `https://outlook.cloud.microsoft/owa/?path=/mail/action/compose&to=${to}&subject=${subject}&body=${body}`;
          break;
        case "protonmail":
          url = `https://mail.proton.me/compose?to=${to}&subject=${subject}&body=${body}`;
          break;
        case "gcps":
          url = getGWEmailUrl({
            to: CONTACT_EMAIL,
            subject,
            body,
          });
          break;
        default:
          url = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      }

      popup(
        url,
        "_blank",
        600,
        700,
        value.provider !== "default" ? "location=yes, scrollbars=yes" : "noopener,noreferrer",
      );
    },
  });

  const { md, isMobileDevice } = useBreakpoint();

  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = () => {
    if (isMobileDevice && !confirm("Copy email address to clipboard?")) return;
    copy(CONTACT_EMAIL);
    setEmailCopied(true);

    setTimeout(() => {
      setEmailCopied(false);
    }, 2000);
  };

  const getMailProvider = (providerId: string) => {
    return emailProviders.find((p) => p.id === providerId);
  };

  return (
    <form
      id="contact"
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await form.handleSubmit();
      }}
    >
      <Card size={!md ? "sm" : "default"} className="max-w-full lg:max-w-md">
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
          <CardDescription>Get in touch with the {brand.name} team via email.</CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup className="gap-4">
            <form.Field
              name="subject"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Subject*</FieldLabel>
                    <Input
                      id={field.name}
                      type="text"
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      placeholder="Include your name and/or organization"
                      aria-invalid={isInvalid}
                      minLength={2}
                      required
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="message"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Body*</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Message"
                      className="min-h-30"
                      aria-invalid={isInvalid}
                      minLength={1}
                      maxLength={500}
                      required
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="provider"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Send with</FieldLabel>
                    <Select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value || "default")}
                      aria-invalid={isInvalid}
                    >
                      <SelectTrigger id={field.name}>
                        {/* TODO: selectvalue shows key/id instead of name. idk why this works so fix with shadcn documentation l8r */}
                        <SelectValue>
                          {(value: string | null) =>
                            (value && getMailProvider(value)?.label) || "Select..."
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {emailProviders.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getMailProvider(field.state.value)?.description && (
                      <FieldDescription>
                        This email will be sent via{" "}
                        {getMailProvider(field.state.value)?.description}
                      </FieldDescription>
                    )}
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="submit">Send...</Button>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button type="button" variant="outline" size="icon" onClick={copyEmail}>
                  {emailCopied ? <RiCheckLine /> : <RiFileCopyLine />}
                </Button>
              }
            />
            <TooltipContent>Copy email address to clipboard</TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
    </form>
  );
}
