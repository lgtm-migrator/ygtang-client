import Svg, { SvgProps } from '~/components/common/Svg';

export function ImageIcon({ ...props }: SvgProps) {
  return (
    <Svg viewBox={24} {...props}>
      <path d="M6 17H18L14.25 12L11.25 16L9 13ZM5 21Q4.175 21 3.587 20.413Q3 19.825 3 19V5Q3 4.175 3.587 3.587Q4.175 3 5 3H19Q19.825 3 20.413 3.587Q21 4.175 21 5V19Q21 19.825 20.413 20.413Q19.825 21 19 21Z" />
    </Svg>
  );
}
