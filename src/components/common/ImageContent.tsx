import { useCallback, useRef } from 'react';
import { css, Theme, useTheme } from '@emotion/react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import QuickPinchZoom, { make3dTransformValue } from 'react-quick-pinch-zoom';

import { defaultEasing, defaultFadeInVariants } from '~/constants/motions';
import { AppMessageListener } from '~/hooks/bridge/useAppMessage';
import useToggle from '~/hooks/common/useToggle';
import { useToast } from '~/store/Toast';
import { fullViewHeight } from '~/styles/utils';
import { imageDownload } from '~/utils/common/imageDownload';

import { IconButton } from './Button';
import { CancelIcon } from './icons';
import { dimBackdropCss } from './styles';

interface ImageContentProps {
  alt: string;
  src: string | null;
  width?: string;
  height?: string;
  htmlFor?: string;
  onClickXBtn?: VoidFunction;
}

export default function ImageContent({
  src,
  alt = 'blank',
  width = '100%',
  height,
  htmlFor,
  onClickXBtn,
}: ImageContentProps) {
  const theme = useTheme();

  const [isOpen, toggleIsOpen] = useToggle(false);

  return (
    <>
      <div css={imgBoxCss({ width, height })}>
        {src ? (
          <>
            {(onClickXBtn || htmlFor) && (
              <label htmlFor={htmlFor} onClick={onClickXBtn} css={closeIconCss}>
                <CancelIcon isUsingFill color={theme.color.gray05} />
              </label>
            )}

            <motion.img src={src} css={imgCss} alt={alt} onClick={toggleIsOpen} />

            <OpenedImageContent isOpen={isOpen} toggleIsOpen={toggleIsOpen} src={src} alt={alt} />
          </>
        ) : (
          <div onClick={onClickXBtn} css={emptyImageCss({ theme })}></div>
        )}
      </div>
    </>
  );
}

interface ImgBoxProps {
  width: string;
  height?: string;
}

const imgBoxCss = ({ width, height }: ImgBoxProps) => css`
  position: relative;
  width: ${width};
  height: ${height};
  min-height: 100px;
  overflow: hidden;
  object-fit: cover;
`;

const imgCss = css`
  width: 100%;
  height: 100%;
  border-radius: 4px;
  cursor: zoom-in;
`;

const closeIconCss = css`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 24px;
  height: 24px;
  padding: 0;
  z-index: 1;
  cursor: pointer;
`;

const emptyImageCss = ({ theme }: { theme: Theme }) => css`
  height: 340px;
  cursor: pointer;
  background-color: ${theme.color.gray01};
  border-radius: 4px;
`;

interface OpenedImageContentProps {
  isOpen: boolean;
  toggleIsOpen: VoidFunction;
  src: NonNullable<ImageContentProps['src']>;
  alt: ImageContentProps['alt'];
}

function OpenedImageContent({ isOpen, toggleIsOpen, src, alt }: OpenedImageContentProps) {
  const { fireToast } = useToast();

  const imgRef = useRef<HTMLImageElement>(null);

  const onUpdate = useCallback(({ x, y, scale }: { x: number; y: number; scale: number }) => {
    const { current: img } = imgRef;

    if (img) {
      const value = make3dTransformValue({ x, y, scale });

      // NOTE: QuickPinchZoom 오브젝트에 css 덮어쓸 수 있는 방향으로 개선 가능
      img.parentElement?.style.setProperty('overflow', 'visible');

      img.style.setProperty('transform', value);
      // NOTE: framer-motion override 방지
      img.style.setProperty('transform-origin', 'left');
    }
  }, []);

  const onClickDownloadButton = () => {
    imageDownload({ href: src });
  };

  return (
    <AppMessageListener
      targetType="SendToastMessage"
      handler={({ data }) => {
        // NOTE: 이미지 저장 완료 혹은 실패 시 토스트
        fireToast({ content: data as string });
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            onClick={toggleIsOpen}
            css={dimBackdropLayoutCss}
            variants={defaultFadeInVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.div
              onClick={e => e.stopPropagation()}
              css={opendNavCss}
              variants={imageOpendNavVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <IconButton
                iconName="CloseIcon"
                onClick={toggleIsOpen}
                light
                colorType="light"
                size={28}
              />
              <IconButton
                iconName="DownloadIcon"
                onClick={onClickDownloadButton}
                light
                colorType="light"
                size={28}
              />
            </motion.div>

            <QuickPinchZoom onUpdate={onUpdate}>
              <img ref={imgRef} src={src} css={opendImgCss} alt={alt} onClick={toggleIsOpen} />
            </QuickPinchZoom>
          </motion.div>
        )}
      </AnimatePresence>
    </AppMessageListener>
  );
}

const dimBackdropLayoutCss = (theme: Theme) => css`
  ${dimBackdropCss(theme)}
  width: 100%;
  background-color: ${theme.color.gray06};

  display: flex;
  justify-content: center;
  align-items: center;
  cursor: zoom-out;
`;

const opendNavCss = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 44px;
  padding: 0 16px;
  cursor: default;

  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1100;
`;

const opendImgCss = css`
  width: auto;
  height: auto;
  cursor: default;
  max-width: 100%;
  max-height: ${fullViewHeight()};
  z-index: 1200;
`;

const imageOpendNavVariants: Variants = {
  initial: {
    y: -44,
    transition: { duration: 0.3, ease: defaultEasing },
  },
  animate: {
    y: 0,
    transition: { duration: 0.3, ease: defaultEasing },
  },
  exit: {
    y: -44,
    transition: { duration: 0.3, ease: defaultEasing },
  },
};
