import { APIGatewayProxyHandler } from "aws-lambda";
import { config } from "dotenv";
import GithubMetrics from "./types/GithubMetrics";
import Storage from "./utils/Storage";
import { getGHUserMetrics } from "./utils/GithubCommands";

config();

const GH_API_KEY_1: string = process.env.GH_API_KEY_1 as string;
const GH_USERNAME_1: string = process.env.GH_USERNAME_1 as string;
const GH_API_KEY_2: string = process.env.GH_API_KEY_2 as string;
const GH_USERNAME_2: string = process.env.GH_USERNAME_2 as string;

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const job1Results: GithubMetrics = await getGHUserMetrics(
      GH_USERNAME_1,
      GH_API_KEY_1
    );
    const job2Results: GithubMetrics = await getGHUserMetrics(
      GH_USERNAME_2,
      GH_API_KEY_2
    );

    const aggregateMetrics: GithubMetrics = {
      commits: job1Results.commits + job2Results.commits,
      mergedPRs: job1Results.mergedPRs + job2Results.mergedPRs,
      linesOfCodeWritten:
        job1Results.linesOfCodeWritten + job2Results.linesOfCodeWritten,
      repositoriesContributed:
        job1Results.repositoriesContributed +
        job2Results.repositoriesContributed,
    };

    Storage.store("metrics", aggregateMetrics);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Lambda function executed successfully",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
