import type { CSSProperties, SVGProps } from 'react';
import { classNames } from '../../lib/classNames';
import { tokens } from '../../design-system/tokens';

/** The original Bookshelf icon set. Geometry is shared by every component. */
export const iconPaths = {
  plus: <path d="M10 4v12M4 10h12" />,
  check: <path d="m4 10 4 4 8-10" />,
  search: (
    <>
      <circle cx="8.5" cy="8.5" r="5" />
      <path d="m12.5 12.5 4 4" />
    </>
  ),
  arrow: <path d="M3 10h13m-5-5 5 5-5 5" />,
  back: <path d="m12 5-5 5 5 5" />,
  down: <path d="m5 8 5 5 5-5" />,
  close: <path d="m5 5 10 10M15 5 5 15" />,
  bookmark: <path d="M5 3h10v15l-5-4-5 4V3Z" />,
  bell: (
    <>
      <path d="M15 6.7a5 5 0 0 0-10 0c0 5.8-2.5 7.5-2.5 7.5h15S15 12.5 15 6.7Z" />
      <path d="M11.4 17.5a1.7 1.7 0 0 1-2.8 0" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="5" height="5" rx="1" />
      <rect x="11" y="4" width="5" height="5" rx="1" />
      <rect x="4" y="11" width="5" height="5" rx="1" />
      <rect x="11" y="11" width="5" height="5" rx="1" />
    </>
  ),
};

export type IconName = keyof typeof iconPaths;
export interface IconProps extends Omit<
  SVGProps<SVGSVGElement>,
  'name' | 'children' | 'width' | 'height'
> {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
}

const iconSizes = {
  sm: tokens.size.iconSm,
  md: tokens.size.iconMd,
  lg: tokens.size.iconLg,
};

export function Icon({
  name,
  size = 'md',
  className,
  style,
  ...props
}: IconProps) {
  const iconStyle: CSSProperties & { '--icon-size': string } = {
    '--icon-size': iconSizes[size],
    ...style,
  };
  return (
    <svg
      aria-hidden="true"
      className={classNames('icon', className)}
      data-size={size}
      style={iconStyle}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {iconPaths[name]}
    </svg>
  );
}
