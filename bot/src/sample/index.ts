import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { WebClient } from "@slack/web-api";

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;
const slackClient = new WebClient(SLACK_TOKEN);

/**
 * Entry Point
 */
export const slackHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: "Invalid Request Body.",
    }
  }
  
  const body = JSON.parse(event.body);
  if (body.type === "url_verification") {
    console.log(body.challenge);
    // URL検証の場合は、challengeパラメーターの値をそのまま返す
    return {
      statusCode: 200,
      body: JSON.stringify({ challenge: body.challenge }),
    };
  }

  // リトライは何もしない
  if (event.headers["X-Slack-Retry-Num"]) {
    return {
      statusCode: 200,
      body: "Retry Handling.",
    };
  }

  // TODO: パーサーの実装
  const channel = body.event.channel;
  const thread_ts = body.event.thread_ts || body.event.ts;
  try {
    if (body.event.type === "message") {
      if (body.event.text.includes(`<@${body.event.bot_profile.id}>`)) {
        const userInfo = await slackClient.users.info({
          user: body.event.user
        });
        if (userInfo.user) {
          const userName = userInfo.user.real_name;
          await slackClient.chat.postMessage({
            channel,
            thread_ts,
            text: `@${userName} ${body.event.text}`
          });
        }
      }
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: "ERROR",
    }
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "OK",
    })
  };
}
