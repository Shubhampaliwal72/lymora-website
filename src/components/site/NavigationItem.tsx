import { ActiveLink } from "./ActiveLink";
import { Icon } from "./Icons";
import type { ComponentProps } from "react";

type Props = {
  href: string;
  title: string;
  description?: string;
  icon?: ComponentProps<typeof Icon>["name"];
  className?: string;
};

/** Shared desktop/touch destination. CSS accents the first letter without splitting its accessible name. */
export function NavigationItem({href, title, description, icon, className = ""}: Props) {
  return <ActiveLink href={href} className={"menu-destination " + className}>
    {icon && <span className="menu-destination-icon"><Icon name={icon}/></span>}
    <span className="menu-destination-copy"><span className="menu-title">{title}</span>{description && <small>{description}</small>}</span>
    <Icon name="arrow" className="menu-destination-arrow"/>
  </ActiveLink>;
}
