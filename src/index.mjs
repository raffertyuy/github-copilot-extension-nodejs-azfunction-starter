import { app } from "@azure/functions";

import { Octokit } from "@octokit/core";
import {
  createTextEvent,
  createDoneEvent,
} from "@copilot-extensions/preview-sdk";

app.http("ghcp-message", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      context.log(`Http function processed request for url "${request.url}"`);

      let username = "user";
      const tokenForUser = request.headers.get("X-GitHub-Token");
      if (tokenForUser) {
          const octokit = new Octokit({ auth: tokenForUser });
          
          try {
              user = await octokit.request("GET /user");
              username = user.data.login;
          } catch (error) {
              console.error("Error fetching user:", error);
          }
      }

      // Parse the request payload and log it.
      const payload = await request.json();
      console.log("Payload:", payload);

      const messages = payload.messages;
      const lastMessage = messages[messages.length - 1].content;

      // Process message and response
      const newMessage = `Hello, ${username}! You said: "${lastMessage}"`;
      console.log("Response Message: " + newMessage);

      const response = {
        body: createTextEvent(newMessage) + createDoneEvent(),
      };
      console.log("Response Payload: ", response);

      return response;
    } catch (error) {
      console.error(error);
      return {
        status: 500,
        body: "Internal server error",
      };
    }
  },
});
