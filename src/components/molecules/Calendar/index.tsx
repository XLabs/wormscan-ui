import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ReactDatePicker from "react-datepicker";
import { ArrowRightIcon, ChevronDownIcon } from "src/icons/generic";
import { TSelectedPeriod } from "src/utils/chainActivityUtils";
import { useOutsideClick } from "src/utils/hooks";
import "./styles.scss";

interface ICalendarProps {
  className?: string;
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
  lastBtnSelected: TSelectedPeriod;
  setLastBtnSelected?: (btn: TSelectedPeriod) => void;
  startDateDisplayed: Date;
  endDateDisplayed: Date;
  isDesktop: boolean;
  showDateRange?: boolean;
  showAgoButtons?: boolean;
  minDate?: Date;
  shouldUpdateURL?: boolean;
}

const Calendar = ({
  className = "",
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  lastBtnSelected,
  setLastBtnSelected = () => {},
  startDateDisplayed,
  endDateDisplayed,
  isDesktop,
  showDateRange = false,
  showAgoButtons = false,
  minDate = new Date(2021, 7, 1),
  shouldUpdateURL = false,
}: ICalendarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCalendar, setShowCalendar] = useState(false);
  const dateContainerRef = useRef<HTMLDivElement>(null);

  const setTimePeriod = (
    from: number,
    to: number | undefined,
    unit: "days" | "months" | "years" | undefined,
    resetHours: boolean = true,
    btnSelected: TSelectedPeriod = "custom",
  ) => {
    const start = from === Infinity ? minDate : new Date();
    const end = new Date();

    setLastBtnSelected(btnSelected);

    if (resetHours) {
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
    }

    const timeSetters = {
      days: (date: Date, v: number) => date.setDate(date.getDate() - v),
      months: (date: Date, v: number) => date.setMonth(date.getMonth() - v),
      years: (date: Date, v: number) => date.setFullYear(date.getFullYear() - v),
    };

    if (from !== Infinity && unit) {
      timeSetters[unit](start, from);
    }

    if (to && unit) {
      timeSetters[unit](end, to);
    }

    setStartDate(start);
    setEndDate(end);
    setShowCalendar(false);
  };

  const handleLast24Hours = () => setTimePeriod(1, undefined, "days", false, "24h");
  const handleLastWeekBtn = () => setTimePeriod(7, undefined, "days", true, "week");
  const handleLastMonthBtn = () => setTimePeriod(1, undefined, "months", true, "month");
  const handleLastYearBtn = () => setTimePeriod(1, undefined, "years", true, "year");
  const handleAllTime = () => setTimePeriod(Infinity, undefined, undefined, true, "all");

  const handleAgoAllTime = () => {
    setLastBtnSelected("all");
    setStartDate(null);
    setEndDate(null);
    setShowCalendar(false);

    if (shouldUpdateURL) {
      searchParams.delete("page");
      searchParams.delete("from");
      searchParams.delete("to");
      setSearchParams(searchParams);
    }
  };

  const handleOutsideClickDate = () => {
    setStartDate(startDateDisplayed);
    setEndDate(endDateDisplayed);
    setShowCalendar(false);
  };

  useOutsideClick({ ref: dateContainerRef, callback: handleOutsideClickDate });

  return (
    <div className={`calendar-custom ${className}`} ref={dateContainerRef}>
      <button className="calendar-custom-btn" onClick={() => setShowCalendar(!showCalendar)}>
        <span className="calendar-custom-btn-text">
          {showDateRange && startDateDisplayed && endDateDisplayed ? (
            <>
              {startDateDisplayed.toLocaleDateString()} <ArrowRightIcon />{" "}
              {endDateDisplayed.toLocaleDateString()}
            </>
          ) : (
            <>
              Date <span className="range-text">range</span>
            </>
          )}
        </span>

        <ChevronDownIcon style={{ transform: showCalendar ? "rotate(-180deg)" : "" }} width={24} />
      </button>

      <div className={`calendar-custom-box ${showCalendar ? "show-date" : ""}`}>
        <div
          className={`calendar-custom-box-date-calendar ${
            startDate === endDate ? "calendar-custom-box-date-calendar-one-day-selected" : ""
          }`}
        >
          <ReactDatePicker
            swapRange
            selected={startDate}
            onChange={(dates: [Date | null, Date | null]) => {
              const [start, end] = dates;
              start?.setHours(0, 0, 0, 0);
              end?.setHours(0, 0, 0, 0);

              if (start?.getTime() !== end?.getTime()) {
                setStartDate(start);
                setEndDate(end);

                if (shouldUpdateURL && start && end) {
                  searchParams.delete("page");
                  searchParams.set("from", start.toISOString());
                  searchParams.set("to", end.toISOString());
                  setSearchParams(searchParams);
                }

                if (end?.getTime()) {
                  setLastBtnSelected("custom");
                  setShowCalendar(false);
                }
              }
            }}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            maxDate={new Date()}
            minDate={minDate}
            monthsShown={isDesktop ? 2 : 1}
            showMonthDropdown
            showYearDropdown
            focusSelectedMonth
          />

          <div className="calendar-custom-box-date-calendar-btns">
            <button
              className="clear-btn"
              disabled={showAgoButtons ? lastBtnSelected === "all" : lastBtnSelected === "year"}
              onClick={() => {
                if (showAgoButtons) {
                  handleAgoAllTime();
                } else {
                  handleLastYearBtn();
                }
              }}
            >
              Clear
            </button>

            <button className="done-btn" onClick={() => setShowCalendar(false)}>
              Done
            </button>
          </div>
        </div>

        <div className="calendar-custom-box-date-selector">
          {showAgoButtons ? (
            <div>
              <button
                className={`btn ${lastBtnSelected === "all" ? "active" : ""}`}
                onClick={handleAgoAllTime}
              >
                All time
              </button>
              <button className={`btn ${lastBtnSelected === "custom" ? "active" : ""}`} disabled>
                Custom
              </button>
            </div>
          ) : (
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
              <button className={`btn ${lastBtnSelected === "custom" ? "active" : ""}`} disabled>
                Custom
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
