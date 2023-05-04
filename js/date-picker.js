/*
 *  Project: DatePicker
 *  Author: http://github.com/poetrasapoetra
 *  License: MIT
 */

(function ($, window, document, undefined) {
  const pluginName = "pDatePicker",
    dataKey = "plugin_" + pluginName;

  const dayText = {
    en: "Su,Mo,Tu,We,Th,Fr,Sa".split(","),
    id: "Mi,Se,Sl,Ra,Ka,Ju,Sa".split(","),
  };
  const monthText = {
    en: "January,February,March,April,May,June,July,Augustus,September,October,November,December".split(
      ","
    ),
    id: "Januari,Februari,Maret,April,Mei,Juni,Juli,Agustus,September,Oktober,November,Desember".split(
      ","
    ),
  };

  const todayText = {
    en: "Today",
    id: "Hari ini",
  };

  var PDatePicker = function (element, options) {
    this.element = element;

    this.options = {
      range: { startDate: null, endDate: null },
      showDate: new Date(),
      selected: null,
      lang: "en",
      mondayFirst: false,
      type: this.element.attr("type") ?? "date",
      showTodayButton: true,
      themeClass: null,
    };
    this.init(options);
  };
  const generatePicker = (picker, container, startDate, type = null) => {
    switch (type ?? picker.currentType ?? "date") {
      case "year":
        generatePickerYear(picker, container, startDate);
        break;
      case "month":
        startDate = new Date(startDate.getFullYear(), 0, 1);
        generatePickerMonth(picker, container, startDate);
        break;
      case "date":
      default:
        generatePickerDate(picker, container, startDate);
    }
  };

  const todayDate = new Date();

  const generatePickerYear = (picker, container, startDate) => {
    const yearLength = 10;
    today = todayDate;
    const current_year = startDate.getFullYear();
    picker.currentType = "year";
    picker.tableHeader.addClass("hidden");
    const pos = current_year % yearLength;
    const arr = [];
    for (var i = pos, j = 0; j < yearLength; j++) {
      arr.push(current_year - i--);
    }
    picker.currentPreview = new Date(arr[0], 0, 1);
    picker.header.text(`${arr[0]} - ${arr[arr.length - 1]}`).off("click");
    var minYear = arr[0];
    var maxYear = arr[arr.length - 1];
    arr.unshift(arr[0] - 1);
    arr.push(arr[arr.length - 1] + 1);
    if (
      picker.options.range.startDate instanceof Date &&
      picker.options.range.startDate.getFullYear() >= minYear
    ) {
      minYear = picker.options.range.startDate.getFullYear();
      picker.prevBtn.addClass("hidden");
    } else {
      picker.prevBtn.removeClass("hidden");
    }

    if (
      picker.options.range.endDate instanceof Date &&
      picker.options.range.endDate.getFullYear() <= maxYear
    ) {
      maxYear = picker.options.range.endDate.getFullYear();
      picker.nextBtn.addClass("hidden");
    } else {
      picker.nextBtn.removeClass("hidden");
    }
    container
      .html("")
      .css({ "grid-template-columns": "repeat(3, 1fr)" })
      .append(
        arr.map((d, i) => {
          var additionalClass = "";
          let disabled;
          if (today.getFullYear() == d) {
            additionalClass += " date-today";
          }
          if (d == picker.selectedYear) {
            additionalClass += " selected";
          }
          if (d < minYear || d > maxYear) {
            additionalClass += " disabled";
            disabled = true;
          }
          const itm = $("<div>")
            .addClass(`year-item ${additionalClass}`)
            .text(d);
          if (!disabled) {
            itm.on("click", function () {
              if (picker.options.type == "year") {
                picker.setSelectedDate(new Date(d, 0, 1));
                picker.hide();
                container.find(".year-item.selected").removeClass("selected");
                $(this).addClass("selected");
              } else {
                // prevent race condition with $(window).on("click")
                setTimeout(() => {
                  const date = new Date(d, 0, 1);
                  generatePickerMonth(picker, container, date);
                });
              }
            });
          }
          return itm;
        })
      );
  };
  const generatePickerMonth = (picker, container, startDate) => {
    const today = todayDate;
    const current_year = startDate.getFullYear();
    const month_index = startDate.getMonth();
    picker.header
      .text(current_year)
      .off("click")
      .on("click", () => {
        const month = new Date(current_year, 0, 1);
        generatePickerYear(picker, container, month);
      });
    picker.tableHeader.addClass("hidden");
    const lastOfYear = new Date(startDate.getFullYear() + 1, 0, 0);
    picker.currentPreview = startDate;
    picker.currentType = "month";

    var minMonth = month_index;
    var maxMonth = 11;
    if (
      picker.options.range.startDate instanceof Date &&
      picker.options.range.startDate >= startDate
    ) {
      minMonth = picker.options.range.startDate.getMonth();
      picker.prevBtn.addClass("hidden");
    } else {
      picker.prevBtn.removeClass("hidden");
    }

    if (
      picker.options.range.endDate instanceof Date &&
      picker.options.range.endDate <= lastOfYear
    ) {
      maxMonth = picker.options.range.endDate.getMonth();
      picker.nextBtn.addClass("hidden");
    } else {
      picker.nextBtn.removeClass("hidden");
    }

    const mText = monthText[picker.options.lang] ?? monthText["en"];
    container
      .html("")
      .css({ "grid-template-columns": "repeat(3, 1fr)" })
      .append(
        mText.map((d, i) => {
          var additionalClass = "";
          let disabled;
          if (today.getFullYear() == current_year) {
            if (today.getMonth() == i) {
              additionalClass += " date-today";
            }
          }
          if (
            i == picker.selectedMonthIndex &&
            current_year == picker.selectedYear
          ) {
            additionalClass += " selected";
          }
          if (i < minMonth || i > maxMonth) {
            additionalClass += " disabled";
            disabled = true;
          }
          const itm = $("<div>")
            .addClass(`month-item ${additionalClass}`)
            .text(d);
          if (!disabled) {
            itm.on("click", function (evt) {
              if (picker.options.type == "month") {
                picker.setSelectedDate(new Date(current_year, i, 1));
                picker.hide();
                container.find(".month-item.selected").removeClass("selected");
                $(this).addClass("selected");
              } else {
                // prevent race condition with $(window).on("click")
                setTimeout(() => {
                  const date = new Date(current_year, i, 1);
                  generatePickerDate(picker, container, date);
                });
              }
            });
          }
          return itm;
        })
      );
  };
  const generatePickerDate = (picker, container, startDate) => {
    const today = new Date();
    const skip = [];
    const dateArr = [];
    const lastSkip = [];
    const current_year = startDate.getFullYear();
    const month_index = startDate.getMonth();
    const current_month = month_index + 1;
    const firstDateOfMonth = new Date(current_year, month_index, 1);
    const lastDateOfMonth = new Date(current_year, current_month, 0);
    picker.currentPreview = firstDateOfMonth;
    picker.currentType = "date";
    const monthTextLang = monthText[picker.options.lang] ?? monthText["en"];
    picker.header
      .text(`${monthTextLang[month_index]} ${current_year}`)
      .off("click");
    picker.tableHeader.removeClass("hidden");

    picker.header.on("click", () => {
      const month = new Date(current_year, 0, 1);
      generatePickerMonth(picker, container, month);
    });
    // add date (prev month)
    if (firstDateOfMonth.getDay() > 0) {
      const prev = new Date(
        current_year,
        current_month - 1,
        firstDateOfMonth.getDay() * -1 + 1
      );
      for (var i = prev.getDate(), j = 0; j < firstDateOfMonth.getDay(); j++) {
        skip.push(i++);
      }
    }
    var minDateAvailable = firstDateOfMonth;
    if (
      picker.options.range.startDate instanceof Date &&
      picker.options.range.startDate > firstDateOfMonth
    ) {
      minDateAvailable = picker.options.range.startDate;
      picker.prevBtn.addClass("hidden");
    } else {
      picker.prevBtn.removeClass("hidden");
    }
    // add unavailable date after available date
    var maxDateAvailable = lastDateOfMonth;
    if (
      picker.options.range.endDate instanceof Date &&
      lastDateOfMonth > picker.options.range.endDate
    ) {
      maxDateAvailable = picker.options.range.endDate;
      picker.nextBtn.addClass("hidden");
    } else {
      picker.nextBtn.removeClass("hidden");
    }
    // add date this month
    for (
      var i = firstDateOfMonth.getDate();
      i <= lastDateOfMonth.getDate();
      i++
    ) {
      if (i < minDateAvailable.getDate()) {
        skip.push(i);
      } else if (i > maxDateAvailable.getDate()) {
        lastSkip.push(i);
      } else {
        dateArr.push(i);
      }
    }

    // add date (next month)
    for (
      var i = 1, j = (skip.length + dateArr.length + lastSkip.length) % 7;
      j < 7 && j > 0;
      j++
    ) {
      lastSkip.push(i++);
    }

    if (picker.options.mondayFirst === true) {
      // if skip has item then shift
      if (skip.length > 0) {
        skip.shift();
      } else {
        // if skip has no item than add 6 from prevoius
        const prev = new Date(current_year, current_month, -6);
        // console.log(prev);
        for (var i = prev.getDate(), j = 0; j < 6; j++) {
          skip.push(i++);
        }
      }
      if (lastSkip.length > 0) {
        if (lastSkip.length == 6) {
          lastSkip.length = 0;
        } else {
          lastSkip.push(lastSkip[lastSkip.length - 1] + 1);
        }
      } else {
        lastSkip.push(1);
      }
    }

    container
      .html("")
      .css({ "grid-template-columns": "repeat(7, 1fr)" })
      .append(
        skip.map((d) => {
          return $("<div>").addClass("date-item disabled").text(d);
        })
      )
      .append(
        dateArr.map((d) => {
          var todayClass = "";
          if (
            d == today.getDate() &&
            month_index == today.getMonth() &&
            current_year == today.getFullYear()
          ) {
            todayClass = "date-today";
          }
          if (
            d == picker.selectedDate &&
            month_index == picker.selectedMonthIndex &&
            current_year == picker.selectedYear
          ) {
            todayClass += " selected";
          }
          const div = $("<div>").addClass(`date-item ${todayClass}`).text(d);
          div.on("click", function (evt) {
            const sel = new Date(current_year, month_index, d);
            picker.setSelectedDate(sel);
            picker.hide();
            container.find(".date-item.selected").removeClass("selected");
            $(this).addClass("selected");
          });
          return div;
        })
      )
      .append(
        lastSkip.map((d) => {
          return $("<div>").addClass("date-item disabled").text(d);
        })
      );
  };
  PDatePicker.prototype = {
    init: function (options) {
      const _this = this;

      $.extend(this.options, options);
      //   generate elements
      const wrapper = $("<div>")
        .addClass("date-picker-wrapper")
        .insertAfter(this.element)
        .append(this.element);
      _this.wrapper = wrapper;

      const container = $("<div>")
        .addClass("date-picker-date-container")
        .appendTo(wrapper);

      if (_this.options.mondayFirst === true) {
        container.addClass("date-picker-monday-first");
      } else {
        container.addClass("date-picker-sunday-first");
      }
      if (_this.options.themeClass) {
        wrapper.addClass(_this.options.themeClass);
      }
      const input = $("<input>")
        .attr("type", "text")
        .addClass("date-picker-input")
        .appendTo(wrapper)
        .on("focus", function (evt) {
          _this.show.bind(_this)();
          $(this).blur();
        });
      $(window).on("click", function (evt) {
        if (!$.contains(wrapper[0], evt.target)) {
          _this.hide();
        }
      });
      _this.input = input;

      this.element
        .on("click", function (evt) {
          evt.preventDefault();
          evt.stopPropagation();
          _this.show.bind(_this)();
        })
        .on("input", function (evt) {
          if ($(this).val()) {
            const d = new Date($(this).val());
            if (
              _this.options.range.startDate instanceof Date &&
              d >= _this.options.range.startDate &&
              _this.options.range.endDate instanceof Date &&
              d <= _this.options.range.endDate
            ) {
              _this.setSelectedDate(d, true);
            }
          }
        });
      const headerContainer = $("<div>")
        .addClass("date-picker-header")
        .appendTo(container);
      const prevBtn = $("<div>")
        .addClass("date-picker-header-info-prev")
        .text("‹")
        .appendTo(headerContainer)
        .on("click", _this.prev.bind(_this));
      const header = $("<div>")
        .addClass("date-picker-header-info")
        .appendTo(headerContainer);
      const nextBtn = $("<div>")
        .addClass("date-picker-header-info-next")
        .text("›")
        .appendTo(headerContainer)
        .on("click", _this.next.bind(_this));
      _this.header = header;
      _this.prevBtn = prevBtn;
      _this.nextBtn = nextBtn;
      var dtext = (dayText[_this.options.lang] ?? dayText["en"]).map((t) => t);
      if (_this.options.mondayFirst) {
        dtext.push(dtext.shift());
      }
      const tableHeader = $("<div>")
        .addClass("date-picker-table-header")
        .append(
          dtext.map((day) => {
            return $("<div>").addClass("date-header").text(day);
          })
        )
        .appendTo(container);
      const dateContainer = $("<div>")
        .addClass("date-picker-selector")
        .appendTo(container);
      const footer = $("<div>").addClass("date-picker-footer");

      if (_this.options.showTodayButton) {
        container.append(
          footer.append(
            $("<button>")
              .attr({ type: "button" })
              .addClass("date-picker-button-primary")
              .text(todayText[_this.options.lang] ?? todayText["en"])
              .on("click", function () {
                _this.setSelectedDate(new Date(), true);
              })
          )
        );
      }

      _this.baseContainer = container;
      _this.dateContainer = dateContainer;
      _this.tableHeader = tableHeader;
      if (_this.options.selected instanceof Date) {
        _this.setSelectedDate(_this.options.selected);
      }
      const showFirst = _this.options.selected ?? _this.options.showDate;
      generatePicker(_this, dateContainer, showFirst, this.options.type);
      _this.hide();
    },
    prev: function () {
      let prev;
      switch (this.currentType) {
        case "year":
        case "month":
          prev = new Date(this.currentPreview.getFullYear() - 1, 0, 1);
          break;
        case "date":
          prev = new Date(
            this.currentPreview.getFullYear(),
            this.currentPreview.getMonth() - 1,
            1
          );
          break;
      }
      generatePicker(this, this.dateContainer, prev);
    },
    next: function () {
      let next;
      switch (this.currentType) {
        case "year":
          next = new Date(this.currentPreview.getFullYear() + 10, 0, 1);
          break;
        case "month":
          next = new Date(this.currentPreview.getFullYear() + 1, 0, 1);
          break;
        case "date":
          next = new Date(
            this.currentPreview.getFullYear(),
            this.currentPreview.getMonth() + 1,
            1
          );
          break;
      }
      generatePicker(this, this.dateContainer, next);
    },
    setSelectedDate: function (
      date,
      show = false,
      showtype = this.options.type ?? "date"
    ) {
      if (!(date instanceof Date)) {
        throw TypeError(`Cannot set date type of Date to ${typeof date}`);
      }
      const _this = this;
      _this.options.selected = date;
      _this.selectedDate = date.getDate();
      _this.selectedMonth = date.getMonth() + 1;
      _this.selectedMonthIndex = date.getMonth();
      _this.selectedYear = date.getFullYear();

      var value = ``;
      var textvalue = ``;
      switch (this.options.type ?? "date") {
        case "date":
          textvalue = `${
            _this.selectedDate < 10
              ? `0${_this.selectedDate}`
              : _this.selectedDate
          } `;
          value = `-${textvalue}`.trim();
        case "month":
          const monthTextLang = monthText[this.options.lang] ?? monthText["en"];
          textvalue += `${monthTextLang[_this.selectedMonthIndex]} `;
          value =
            `-${
              _this.selectedMonth < 10
                ? `0${_this.selectedMonth}`
                : _this.selectedMonth
            }` + value;
        case "year":
          textvalue += `${_this.selectedYear}`;
          value = `${_this.selectedYear}` + value;
      }
      this.element.val(value);
      this.input.val(textvalue);

      if (show) {
        generatePicker(_this, _this.dateContainer, date, showtype);
      }
    },
    getSelectedDate: function () {
      return new Date(
        this.selectedYear,
        this.selectedMonthIndex,
        this.selectedDate
      );
    },
    show: function () {
      this.baseContainer.addClass("show");
      //   this.element
      //     .css({
      //       display: "",
      //     })
      //     .focus();
      //   this.input.css({
      //     display: "none",
      //   });
    },
    hide: function () {
      this.baseContainer.removeClass("show");
      this.element
        .css({
          display: "none",
        })
        .blur();
      this.input.css({
        display: "",
      });
    },
    changeTheme: function (themeClass) {
      const defaultClass = "date-picker-wrapper " + themeClass;
      this.wrapper.attr("class", "").addClass(defaultClass);
    },
  };

  $.fn[pluginName] = function (options) {
    var plugin = this.data(dataKey);
    if (plugin instanceof PDatePicker) {
      if (typeof options !== "undefined") {
        plugin.init(options);
      }
    } else {
      plugin = new PDatePicker(this, options);
      this.data(dataKey, plugin);
    }
    return plugin;
  };
})(jQuery, window, document);
