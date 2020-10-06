import * as nodeFetch from 'node-fetch';
import {URLSearchParams} from 'url';

export const sendModalSlackMessage = async (slackHttpHeaders: { Authorization: string; 'Content-type': string },
                                            message: string) => {
  await nodeFetch('https://slack.com/api/views.open', {
    method: 'POST',
    headers: slackHttpHeaders,
    body: message
  });
};

export const updateModalSlackMessage = async (slackHttpHeaders: { Authorization: string; 'Content-type': string },
                                              message: string) => {
  await nodeFetch('https://slack.com/api/views.update', {
    method: 'POST',
    headers: slackHttpHeaders,
    body: message
  });
};

export const pushModalSlackMessage = async (slackHttpHeaders: { Authorization: string; 'Content-type': string },
                                            message: string) => {
  await nodeFetch('https://slack.com/api/views.push', {
    method: 'POST',
    headers: slackHttpHeaders,
    body: message
  });
};

export const uploadFileSlackMessage = async (slackHttpHeaders: { Authorization: string; 'Content-type': string },
                                             channel: string,
                                             content: string) => {
  const params = new URLSearchParams();
  params.append('channels', `@${channel}`);
  params.append('content', content);
  params.append('filename', 'reserveDeskReport.csv');
  params.append('filetype', 'csv');

  await nodeFetch('https://slack.com/api/files.upload', {
    method: 'POST',
    headers: slackHttpHeaders,
    body: params
  });
};
