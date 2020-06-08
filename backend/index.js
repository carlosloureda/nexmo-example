// Require the framework and instantiate it
const fastify = require("fastify")({
  logger: {
    prettyPrint: true,
    level: "info",
  },
});
const fetch = require("node-fetch");
require("dotenv").config();

const { NEXMO_API_KEY, NEXMO_SECRET } = process.env;
const authToken = new Buffer(`${NEXMO_API_KEY}:${NEXMO_SECRET}`).toString(
  "base64"
);
const fs = require("fs");

let supportConversationID = "";

const SUPPORT_CONVERATION_NAME = "SupportConversation3";

fastify.register(require("fastify-cors"), {
  origin: true,
});
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
fastify.post("/support/conversation", { schema: null }, async (req, reply) => {
  //  create user on nexmo
  // TODO: username needs to be the email (unique)
  const { id: userId } = await nexmoAPI.createUser(
    req.body.email,
    req.body.username
  );

  // // add user as member of conversation
  let res = await nexmoAPI.createMember(supportConversationID, userId);

  let token = nexmoAPI.createUserToken(req.body.email);
  reply.send({
    userId,
    conversationId: supportConversationID,
    token,
  });
});

const NexmoAPI = require("./api/nexmo");
nexmoAPI = new NexmoAPI();
// createApplication()
const init = async () => {
  // await getApplication(applicationId)

  if (!supportConversationID) {
    try {
      console.log(
        "-> Trying to get conversation ID from name: ",
        SUPPORT_CONVERATION_NAME
      );
      supportConversationID = await nexmoAPI.getConversationId(
        SUPPORT_CONVERATION_NAME
      );
      console.log("*** supportConversationID: ", supportConversationID);

      if (!supportConversationID) {
        console.log("Creating nexmo app");
        let result = await nexmoAPI.createConversation(
          SUPPORT_CONVERATION_NAME,
          "support conversation"
        );
        supportConversationID = result.id;
      }
      console.log("---> supportConversationID: ", supportConversationID);
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  // let result = await nexmoAPI.removeAllConversations();
  // console.log("result: ", result);
  result = await nexmoAPI.listAllConversations();
  // console.log("conversations: ", result);
  console.log("conversations length: ", result.length);
};

init();

// Run the server!
const start = async () => {
  try {
    await fastify.listen(8000);
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
