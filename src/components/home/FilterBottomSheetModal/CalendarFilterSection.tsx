import { css, Theme } from '@emotion/react';
import { Calendar, CalendarTileProperties } from 'react-calendar';

import BottomSheetModal from '~/components/common/BottomSheetModal';
import { GhostButton } from '~/components/common/Button';
import { ChevronIcon } from '~/components/common/icons';
import NavigationBar from '~/components/common/NavigationBar';
import useToggle from '~/hooks/common/useToggle';
import { useCalendarFilter } from '~/store/CalendarFilter';
import { CalendarElementType } from '~/store/CalendarFilter/calendarFilter';

interface CalendarFilterSectionProps {
  filteredInspirations: InspirationInterface[];
}

export default function CalendarFilterSection({
  filteredInspirations,
}: CalendarFilterSectionProps) {
  const [isOpen, toggleIsOpen] = useToggle(false);

  const { calendarFilter, onChangeCalendarFilter } = useCalendarFilter();

  const checkDisabledTile = ({ date }: CalendarTileProperties) => {
    const dateString = date.toISOString().slice(0, 10);

    for (const eachInspiration of filteredInspirations) {
      const eachDateString = eachInspiration.createdDatetime.slice(0, 10);

      if (eachDateString === dateString) {
        return false;
      }

      // Note: 항상 최신순의 영감이 조회되기 때문에 날짜가 지날시 비교를 멈추도록 함
      // Todo: 오래된 순 정렬이 추가될 시 조건이 변경되어야 함
      const eachInspirationDate = new Date(eachDateString);
      if (date > eachInspirationDate) {
        return true;
      }
    }

    return true;
  };

  return (
    <section css={sectionCss}>
      <button onClick={toggleIsOpen} css={filterButtonCss}>
        기간
        <ChevronIcon direction="right" />
      </button>

      {calendarFilter[0] && calendarFilter[1] && (
        <div css={filterInfoWrapperCss}>
          <CalendarInfo date={calendarFilter[0]} /> ~
          <CalendarInfo date={calendarFilter[1]} />
        </div>
      )}

      <BottomSheetModal isShowing={isOpen} onClose={toggleIsOpen}>
        <div css={contentWrapperCss}>
          <NavigationBar
            title="기간 설정"
            onClickBackButton={toggleIsOpen}
            rightElement={<GhostButton onClick={toggleIsOpen}>완료</GhostButton>}
          />

          <div css={calendarWrapperCss}>
            <div css={calendarInfoWrapperCss}>
              <CalendarInfo date={calendarFilter[0]} /> ~
              <CalendarInfo date={calendarFilter[1]} />
            </div>

            <Calendar
              css={calendarCss}
              value={calendarFilter}
              onChange={onChangeCalendarFilter}
              allowPartialRange
              locale="ko"
              calendarType="US"
              view="month"
              selectRange
              formatDay={(_, date) => {
                return date.getDate().toString();
              }}
              tileDisabled={checkDisabledTile}
              prevLabel={<ChevronIcon direction="left" />}
              nextLabel={<ChevronIcon direction="right" />}
              next2Label={null}
              prev2Label={null}
            />
          </div>
        </div>
      </BottomSheetModal>
    </section>
  );
}

const sectionCss = css`
  margin-top: 24px;
`;

const filterButtonCss = (theme: Theme) => css`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  height: 24px;
  color: ${theme.color.gray05};
  font-size: 16px;
  padding: 0;
`;

const filterInfoWrapperCss = css`
  width: 100%;
  margin-top: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
`;

const contentWrapperCss = (theme: Theme) => css`
  position: relative;
  width: 100%;
  height: 474px;

  padding: ${theme.size.layoutPadding};
`;

const calendarWrapperCss = css`
  width: 100%;
  position: relative;
  margin-top: 14px;
`;

const calendarInfoWrapperCss = css`
  position: absolute;
  /* 월 navigation + gap */
  margin-top: calc(30px + 16px);
  width: 100%;
  height: 36px;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
`;

const calendarCss = (theme: Theme) => css`
  position: relative;
  height: 100%;

  // 년도, 월 선택 부분
  & .react-calendar__navigation {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;

    white-space: pre;
    gap: 8px;

    & button {
      display: flex;
      justify-content: center;
      align-items: center;
      color: ${theme.color.gray05};

      font-size: 16px;
      font-weight: bold;
    }
  }

  // 캘린더 날짜 선택 wrapper
  & .react-calendar__viewContainer {
    /* 월 navigation + gap + 현재 선택창 + gap*/
    padding-top: calc(30px + 16px + 36px + 16px);
  }

  & .react-calendar__month-view {
    &__weekdays div {
      width: 44px;
      height: 44px;
      display: flex;
      justify-content: center;
      align-items: center;

      color: ${theme.color.gray04};
      font-size: 18px;

      & > abbr {
        text-decoration: none;
      }
    }

    &__days button {
      width: 44px;
      height: 44px;
      padding: 0;

      &:disabled {
        color: ${theme.color.gray03};
      }
    }
  }

  & .react-calendar__tile {
    position: relative;
    color: ${theme.color.gray05};
    font-size: 18px;

    // 현재 날짜
    &--now {
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background-color: ${theme.color.gray01};
        z-index: -1;
      }
    }

    // 선택 시작과 끝
    &--rangeStart,
    &--rangeEnd {
      color: ${theme.color.gray01};

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background-color: ${theme.color.gray05};
        z-index: -1;
      }
    }

    // 시작과 끝이 동일하지 않은, 시작과 끝 부분
    &--range:not(.react-calendar__tile--rangeBothEnds) {
      &.react-calendar__tile--rangeStart::before {
        content: '';
        position: absolute;

        top: 0;
        left: 50%;
        width: 50%;
        height: 100%;
        background-color: ${theme.color.gray01};
        z-index: -2;
      }

      &.react-calendar__tile--rangeEnd::before {
        content: '';
        position: absolute;

        top: 0;
        left: 0;
        width: 50%;
        height: 100%;
        background-color: ${theme.color.gray01};
        z-index: -2;
      }
    }

    // 선택 중간 요소들 (시작과 끝 미포함)
    &--range:not(.react-calendar__tile--rangeStart, .react-calendar__tile--rangeEnd) {
      &::before {
        content: '';
        position: absolute;

        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: ${theme.color.gray01};
        z-index: -2;
      }
    }
  }
`;

interface CalendarInfoProps {
  /**
   * Date | null
   */
  date: CalendarElementType;
}

function CalendarInfo({ date }: CalendarInfoProps) {
  return (
    <div css={calendarInfoCss}>
      {date ? (
        <span css={activeDateCss}>{date.toLocaleDateString()}</span>
      ) : (
        <span css={deactiveDateCss}>yyyy. mm. dd.</span>
      )}
    </div>
  );
}

const calendarInfoCss = (theme: Theme) => css`
  width: 160px;
  height: 36px;
  border-radius: ${theme.borderRadius.default};
  background-color: ${theme.color.gray01};
  padding-left: 14px;

  display: flex;
  align-items: center;
`;

const activeDateCss = (theme: Theme) => css`
  font-size: 12px;
  color: ${theme.color.gray05};
`;

const deactiveDateCss = (theme: Theme) => css`
  font-size: 12px;
  color: ${theme.color.gray03};
`;
