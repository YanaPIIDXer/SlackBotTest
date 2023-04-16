import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

/**
 * Entry Point
 */
export const slackHandler = async (): Promise<APIGatewayProxyResult> => {
  console.log("Test");
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "OK",
    })
  };
}
