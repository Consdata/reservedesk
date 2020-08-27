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
