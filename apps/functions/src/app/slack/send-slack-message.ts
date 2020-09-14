import * as nodeFetch from 'node-fetch';

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
