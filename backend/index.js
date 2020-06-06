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

const privateKEY = fs.readFileSync("./private.key");
const publicKEY = fs.readFileSync("./public.key", "utf8");

let supportConversationID = "";

const SUPPORT_CONVERATION_NAME = "SupportConversation";

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
  // const { id: userId } = await nexmoAPI.createUser(req.body.username);

  // // add user as member of conversation

  // let res = await nexmoAPI.createMember(supportConversationID, userId);
  // console.log("res: ", res);

  let token = nexmoAPI.createUserToken(req.body.username);
  console.log("token: ", token);
  reply.send({
    // userId,
    // conversationId: supportConversationID,
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
      console.log("---> supportConversationID: ", supportConversationID);
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
