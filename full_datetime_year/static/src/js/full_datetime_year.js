/** @odoo-module **/

import { formatDate, formatDateTime } from "@web/core/l10n/dates";
import {
    formatDate as standardFieldDateFormatter,
    formatDateTime as standardFieldDateTimeFormatter,
} from "@web/views/fields/formatters";
import { registry } from "@web/core/registry";
import { patch } from "@web/core/utils/patch";
import { DateTimeField } from "@web/views/fields/datetime/datetime_field";

const { DateTime } = luxon;

/**
 * Format a date with the same readable style Odoo 19 uses by default, but keep
 * the year even when the date belongs to the current year.
 *
 * @param {luxon.DateTime} value
 * @returns {string}
 */
function toFullLocaleDateString(value) {
    if (!value) {
        return "";
    }
    return value.toLocaleString(DateTime.DATE_MED);
}

/**
 * Format a datetime with the same readable style Odoo 19 uses by default, but
 * keep the year even when the datetime belongs to the current year.
 *
 * @param {luxon.DateTime} value
 * @param {Object} [options]
 * @param {boolean} [options.showDate=true]
 * @param {boolean} [options.showTime=true]
 * @param {boolean} [options.showSeconds=false]
 * @param {string} [options.tz]
 * @returns {string}
 */
function toFullLocaleDateTimeString(
    value,
    options = { showDate: true, showTime: true, showSeconds: false }
) {
    if (!value) {
        return "";
    }
    const format = { ...DateTime.DATETIME_MED_WITH_SECONDS };
    if (!options.showSeconds) {
        delete format.second;
    }
    if (options.showDate === false) {
        delete format.day;
        delete format.month;
        delete format.year;
    }
    if (options.showTime === false) {
        delete format.hour;
        delete format.minute;
    }
    return value.setZone(options.tz || "default").toLocaleString(format);
}

/**
 * Replacement for the standard field date formatter.
 *
 * Numeric dates already use the user's language date format, which contains the
 * year. The readable locale formatter is the one that Odoo 19 shortens, so only
 * that branch needs a custom implementation.
 *
 * @param {luxon.DateTime} value
 * @param {Object} [options]
 * @param {boolean} [options.numeric]
 * @returns {string}
 */
export function formatFullDate(value, options = {}) {
    return options.numeric ? formatDate(value, options) : toFullLocaleDateString(value);
}

/**
 * Replacement for the standard field datetime formatter.
 *
 * @param {luxon.DateTime} value
 * @param {Object} [options]
 * @param {boolean} [options.numeric]
 * @param {boolean} [options.showTime]
 * @returns {string}
 */
export function formatFullDateTime(value, options = {}) {
    if (options.numeric) {
        if (options.showTime === false) {
            return formatDate(value, options);
        }
        return formatDateTime(value, options);
    }
    return toFullLocaleDateTimeString(value, options);
}

patch(DateTimeField.prototype, {
    /**
     * Keep the year visible for readonly date/datetime fields, including date
     * ranges, while preserving Odoo's show_time/show_date/show_seconds options.
     *
     * @param {number} valueIndex
     * @param {boolean} [numeric]
     * @returns {string}
     */
    getFormattedValue(valueIndex, numeric = this.props.numeric) {
        const values = this.values;
        const value = values[valueIndex];
        if (!value) {
            return "";
        }

        const { showSeconds, showTime } = this.props;
        if (this.field.type === "date") {
            return formatFullDate(value, { numeric });
        }

        const showDate = !showTime || valueIndex !== 1 || !values[0] || !values[0].hasSame(value, "day");
        return formatFullDateTime(value, {
            numeric,
            showSeconds,
            showTime,
            showDate,
        });
    },
});

formatFullDate.extractOptions = standardFieldDateFormatter.extractOptions;
formatFullDateTime.extractOptions = standardFieldDateTimeFormatter.extractOptions;

registry.category("formatters").add("date", formatFullDate, { force: true });
registry.category("formatters").add("datetime", formatFullDateTime, { force: true });
