import {ReportMessage} from './report-message';

export const createReportMessage = (dateFrom: string, dateTo: string, channel: string): ReportMessage => {
  return {
    dateFrom: dateFrom,
    dateTo: dateTo,
    channel: channel
  }
};
