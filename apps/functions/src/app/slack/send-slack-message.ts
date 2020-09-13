import * as nodeFetch from 'node-fetch';

export const sendSlackMessage = async (slackHttpHeaders: { Authorization: string; 'Content-type': string },
                                       responseUrl: string,
                                       message: string) => {
  console.log('responseUrl:', responseUrl);
  await nodeFetch(responseUrl, {
    method: 'POST',
    headers: slackHttpHeaders,
    body: JSON.stringify({
      text: message
    })
  });
};

export const sendModalSlackMessage = async (slackHttpHeaders: { Authorization: string; 'Content-type': string },
                                message: string) => {
  console.log('sendModalSlackMessage message:', message);
  const test = await nodeFetch('https://slack.com/api/views.open', {
    method: 'POST',
    headers: slackHttpHeaders,
    body: message
  });
  console.log('test:', test);
};

export const updateModalSlackMessage = async (slackHttpHeaders: { Authorization: string; 'Content-type': string },
                                            message: string) => {
  console.log('updateModalSlackMessage message:', message);
  await nodeFetch('https://slack.com/api/views.update', {
    method: 'POST',
    headers: slackHttpHeaders,
    body: message
  });
};
