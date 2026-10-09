import { Icon } from "@iconify/react";

/** Pictogram cell shared by every forecast view. WMO returns no icon id for some
 *  conditions (or for a missing city day); then a neutral "no image" glyph stands
 *  in at half the box's size so it never competes with a real pictogram. */
export function WxIcon({
  icon,
  alt,
  className,
}: {
  icon: string | null;
  alt: string;
  className: string;
}) {
  if (icon === null) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={`flex shrink-0 items-center justify-center text-faint ${className}`}
      >
        <Icon
          icon="material-symbols:indeterminate-question-box-rounded"
          className="size-1/2"
        />
      </span>
    );
  }

  return <img src={icon} className={className} alt={alt} />;
}
