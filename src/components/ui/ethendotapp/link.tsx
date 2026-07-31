import * as React from "react";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import { cn } from "#/lib/utils";

type BasicAnchorProps = React.ComponentPropsWithoutRef<"a">;
export interface AnchorProps extends BasicAnchorProps {
  unstyled?: boolean;
  buttonStyle?: boolean;
}

// TODO: what even is button style

const LinkBase = React.forwardRef<HTMLAnchorElement, AnchorProps>(
  ({ unstyled, buttonStyle, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        {...props}
        className={cn(!unstyled && "link", buttonStyle && "button-link", className)}
      />
    );
  },
);
LinkBase.displayName = "LinkBase";

const CreatedLink = createLink(LinkBase);

/**
 * Link is for internal navigation within the app using TanStack Router.
 * It strictly types `to`, `params`, and `search` while supporting all anchor props.
 */
export const Link: LinkComponent<typeof LinkBase> = (props) => {
  return <CreatedLink {...props} aria-disabled={props.disabled} />;
};

export type LinkProps = React.ComponentProps<typeof Link>;

/**
 * @deprecated Use Link with `href` prop instead
 *
 * ExtLink is for links that navigate to external sites or trigger actions like `mailto:` or `tel:`.
 * By default, it opens URLs in a new tab and includes security attributes `noopener noreferrer`.
 */
export const ExtLink = React.forwardRef<HTMLAnchorElement, AnchorProps>(
  ({ unstyled, buttonStyle, className, ...props }, ref) => (
    <LinkBase
      ref={ref}
      unstyled={unstyled}
      buttonStyle={buttonStyle}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
);
ExtLink.displayName = "ExtLink";

/**
 * @deprecated Use LinkProps instead
 */
export type ExtLinkProps = React.ComponentProps<typeof ExtLink>;

export type GoLinkProps = Omit<LinkProps, "to" | "params"> & {
  slug: string;
};
