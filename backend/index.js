// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });
const fetch = require("node-fetch");
require("dotenv").config();

const { NEXMO_API_KEY, NEXMO_SECRET } = process.env;
const authToken = new Buffer(`${NEXMO_API_KEY}:${NEXMO_SECRET}`).toString(
  "base64"
);
const fs = require("fs");

const privateKEY = fs.readFileSync("./private.key");
const publicKEY = fs.readFileSync("./public.key", "utf8");

let supportConversationID = "";

const SUPPORT_CONVERATION_NAME = "Support Conversation";

// Declare a route
fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

fastify.post("/webhooks/inbound", { schema: null }, (req, reply) => {
  reply.send("inbound hook");
});

fastify.get("/webhooks/event", { schema: null }, (req, reply) => {
  reply.send("events hook");
});
fastify.post("/webhooks/event", { schema: null }, (req, reply) => {
  reply.send("events hook");
});

fastify.post("/webhooks/status", { schema: null }, (req, reply) => {
  reply.send("status hook");
});

// TODO: add authentication
fastify.get("/support/conversation", { schema: null }, (req, reply) => {
  reply.send({ conversationId: supportConversationID });
});

const NexmoAPI = require("./api/nexmo");
// createApplication()
const init = async () => {
  // await getApplication(applicationId)

  const nexmoAPI = new NexmoAPI();

  if (!supportConversationID) {
    try {
      supportConversationID = await nexmoAPI.getConversationId(
        SUPPORT_CONVERATION_NAME
      );

      if (!supportConversationID) {
        let result = await nexmoAPI.createConversation(
          SUPPORT_CONVERATION_NAME,
          "support conversation"
        );
        supportConversationID = result.id;
      }
      console.log("supportConversationID: ", supportConversationID);
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  // let result = await nexmoAPI.removeAllConversations();
  // console.log("result: ", result);
  // result = await nexmoAPI.listConversations();
  // console.log("result: ", result);
};

init();

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000);
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
