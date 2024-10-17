import { useRef, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { ChevronDownIcon } from "src/icons/generic";
import { TSelectedPeriod } from "src/utils/chainActivityUtils";
import { useOutsideClick } from "src/utils/hooks";

interface ICalendarProps {
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
  lastBtnSelected: TSelectedPeriod;
  setLastBtnSelected: (btn: TSelectedPeriod) => void;
  startDateDisplayed: Date;
  endDateDisplayed: Date;
  isDesktop: boolean;
}

export const Calendar = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  lastBtnSelected,
  setLastBtnSelected,
  startDateDisplayed,
  endDateDisplayed,
  isDesktop,
}: ICalendarProps) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const dateContainerRef = useRef<HTMLDivElement>(null);

  const setTimePeriod = (
    value: number,
    unit: "days" | "months" | "years",
    resetHours: boolean = true,
    btnSelected: TSelectedPeriod = "custom",
    startDate?: Date,
    endDate?: Date,
  ) => {
    const start = startDate || new Date();
    const end = endDate || new Date();
    setLastBtnSelected(btnSelected);

    if (resetHours) {
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
    }

    if (!startDate) {
      const timeSetters = {
        days: (date: Date, value: number) => date.setDate(date.getDate() - value),
        months: (date: Date, value: number) => date.setMonth(date.getMonth() - value),
        years: (date: Date, value: number) => date.setFullYear(date.getFullYear() - value),
      };

      timeSetters[unit](start, value);
    }

    setStartDate(start);
    setEndDate(end);
    setShowCalendar(false);
  };

  const handleLast24Hours = () => setTimePeriod(1, "days", false, "24h");
  const handleLastWeekBtn = () => setTimePeriod(7, "days", true, "week");
  const handleLastMonthBtn = () => setTimePeriod(1, "months", true, "month");
  const handleLast6MonthsBtn = () => setTimePeriod(6, "months", true, "custom");
  const handleLastYearBtn = () => setTimePeriod(1, "years", true, "year");
  const handleAllTime = () => {
    const start = new Date(2021, 7, 1);
    const end = new Date();
    setTimePeriod(0, "days", true, "all", start, end);
  };

  const handleOutsideClickDate = () => {
    setStartDate(startDateDisplayed);
    setEndDate(endDateDisplayed);
    setShowCalendar(false);
  };

  useOutsideClick({ ref: dateContainerRef, callback: handleOutsideClickDate });

  return (
    <div
      className="chain-activity-chart-top-filters-section calendar-section"
      ref={dateContainerRef}
    >
      <button
        className="chain-activity-chart-top-filters-section-btn"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <span className="date-range-text">
          Date <span className="range-text">Range</span>
        </span>

        <ChevronDownIcon style={{ transform: showCalendar ? "rotate(-180deg)" : "" }} width={24} />
      </button>

      <div
        className={`chain-activity-chart-top-filters-section-box ${
          showCalendar ? "show-date" : ""
        }`}
      >
        <div
          className={`chain-activity-chart-top-filters-section-box-date-calendar ${
            startDate === endDate
              ? "chain-activity-chart-top-filters-section-box-date-calendar-one-day-selected"
              : ""
          }`}
        >
          <ReactDatePicker
            {...({ swapRange: true } as any)}
            selected={startDate}
            onChange={(dates: [Date | null, Date | null]) => {
              const [start, end] = dates;
              start?.setHours(0, 0, 0, 0);
              end?.setHours(0, 0, 0, 0);

              if (start?.getTime() !== end?.getTime()) {
                setStartDate(start);
                setEndDate(end);
                setLastBtnSelected("custom");
              }
            }}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            maxDate={new Date()}
            monthsShown={isDesktop ? 2 : 1}
            showMonthDropdown
          />

          <div className="chain-activity-chart-top-filters-section-box-date-calendar-btns">
            <button
              className="clear-btn"
              onClick={() => {
                handleAllTime();
                setShowCalendar(false);
              }}
            >
              Clear
            </button>

            <button
              className="done-btn"
              onClick={() => setShowCalendar(false)}
              disabled={!startDate || !endDate}
            >
              Done
            </button>
          </div>
        </div>

        <div className="chain-activity-chart-top-filters-section-box-date-selector">
          <div>
            <button
              className={`btn ${lastBtnSelected === "24h" ? "active" : ""}`}
              onClick={handleLast24Hours}
            >
              Last 24 hours
            </button>
            <button
              className={`btn ${lastBtnSelected === "week" ? "active" : ""}`}
              onClick={handleLastWeekBtn}
            >
              Last week
            </button>
            <button
              className={`btn ${lastBtnSelected === "month" ? "active" : ""}`}
              onClick={handleLastMonthBtn}
            >
              Last month
            </button>
            <button
              className={`btn ${lastBtnSelected === "year" ? "active" : ""}`}
              onClick={handleLastYearBtn}
            >
              Last year
            </button>
            <button
              className={`btn ${lastBtnSelected === "all" ? "active" : ""}`}
              onClick={handleAllTime}
            >
              All time
            </button>
            <button
              className={`btn ${lastBtnSelected === "custom" ? "active" : ""}`}
              onClick={handleLast6MonthsBtn}
            >
              Custom
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
