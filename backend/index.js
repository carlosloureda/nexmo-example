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
let ghostSupportAgentCredentials = {
  userId: null,
  memberId: null,
};

const SUPPORT_CONVERATION_NAME = "SupportConversation";
const WALL_CONVERSATION_PREFIX = "WallConversation";
let wallsConversations = []; // {name && id}
const GHOST_SUPPORT_AGENT = "ghostSupportAgent";
const MAX_MEMBERS_IN_CONVERSATION = 1;

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
  console.log("the request.body is: ", req);
  reply.send("events hook get");
});
fastify.post("/webhooks/event", { schema: null }, (req, reply) => {
  console.log("--> the request.body is: ", req.body);
  // --> the request.body is:  {
  //   conversation_id: 'CON-09ab313d-204f-4455-bdb6-3aff8ed5c88f',
  //   from: 'MEM-e6b4da15-0c9b-41d1-acc5-fd4db2c094c6',
  //   body: { your: 'data' },
  //   id: 13,
  //   application_id: '306ee0db-9244-4de2-a149-efc50e5fcecd',
  //   timestamp: '2020-06-08T11:58:48.110Z',
  //   type: 'custom:my_custom_event'
  // }

  const { body } = req;
  // TODO add regex for 'custom:'
  // if the event if from support do not resend it as it will create a loop :D
  if (
    body.type === "custom:my_custom_event" &&
    body.from !== ghostSupportAgentCredentials.memberId
  ) {
    nexmoAPI.nexmo.conversations.events.create(
      supportConversationID,
      {
        type: body.type,
        from: ghostSupportAgentCredentials.memberId,
        body: {
          ...body,
          body: {
            from: body.from,
            isGhostSignal: true,
            ...body.body,
          },
          // cosa: "Buena",
        },
      },
      (error, result) => {
        if (error) {
          console.error(error);
        } else {
          console.log(result);
        }
      }
    );
  }

  reply.send("events hook post");
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

// TODO: add authentication
fastify.post("/wall/conversation", { schema: null }, async (req, reply) => {
  // TODO: need to retrieve an empty converstion (get members size of a conversation ) and add him/her to that conversation
  // TODO: if conversation is full create next index conversation for walls and add this agent there.
  //  create user on nexmo
  // TODO: username needs to be the email (unique)

  const { id: userId } = await nexmoAPI.createUser(
    req.body.email,
    req.body.username
  );

  let conversation = null;

  if (!wallsConversations || !wallsConversations.length) {
    //We have restarted the server so we need to fetch the conversations and add filter for the prefix:
    wallsConversations = await nexmoAPI.listAllConversations();

    wallsConversations = wallsConversations.filter((conv) =>
      conv.name.startsWith(WALL_CONVERSATION_PREFIX)
    );
  }
  // TODO: check if user exists in conversations ??
  for (wallConv of wallsConversations) {
    console.log("Searching over previous wall conversations");
    let conv = await nexmoAPI.getConversation(wallConv.id);
    console.log("The conv is : ", conv);
    // conv.members .user_id ===
    for (const member of conv.members) {
      if (member.user_id === userId) {
        console.log("User already in a conversation");
        conversation = conv;
        break;
      }
    }
    if (conversation) break;
    if (conv.members.length < MAX_MEMBERS_IN_CONVERSATION) {
      conversation = conv;
      break;
    }
  }
  console.log("************** conversation: ", conversation);
  console.log("userId: ", userId);
  if (!conversation) {
    console.log("Not previous conversation created");
    //TODO: create wall conversation ...
    let conversationName = `${WALL_CONVERSATION_PREFIX}-${
      wallsConversations.length + 1
    }`;
    conversation = await nexmoAPI.createConversation(
      conversationName,
      conversationName
    );
    console.log("conversation created: ", conversation);
  }

  // // add user as member of conversation
  let res = await nexmoAPI.createMember(conversation.id, userId);

  let token = nexmoAPI.createUserToken(req.body.email);
  reply.send({
    userId,
    conversationId: conversation.uuid,
    token,
  });
});

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

const create10000UsersAndMembers = async () => {
  const usersArray = Array.from({ length: 500 }, (_, idx) => `user-${++idx}`);
  const userCreatedArrys = [];
  let numberOfErrors = 0;
  await Promise.all(
    usersArray.map(async (user, index) => {
      try {
        const { id: userId } = await nexmoAPI.createUser(
          `${user}@email.com`,
          user
        );
        // if (index > 0 && index % 10 === 0) {
        //   console.log("sleeping 10 seconds");
        //   sleep(10000);
        // }
        let newUser = {
          username: `${user}@email.com`,
          userDisplayName: user,
          userId,
          userId,
        };
        userCreatedArrys.push(newUser);
        console.log("User created: ", newUser);
        let res = await nexmoAPI.createMember(supportConversationID, userId);
        if (res && res.id) {
          console.log(
            "member added to conversation: ",
            res.id,
            res.user_id,
            res.name
          );
        } else {
          console.log("*** res: ", res);
        }
      } catch (error) {
        if (error) {
          console.log("number of users created: ", userCreatedArrys.length);
          numberOfErrors++;
        }
        console.log("An error creating users:", error);
      }
    })
  );
  console.log("everything wih succcess: ", userCreatedArrys.length);
  console.log("Errors: ", numberOfErrors);

  // // add user as member of conversation
};

const NexmoAPI = require("./api/nexmo");
nexmoAPI = new NexmoAPI();
// createApplication()

/**
 * Creates the SupportConversation and initializes a ghostAgent added to that support conversation.
 *
 * That supportAgent will be the one used to send events to that conversation
 * from the backend
 *
 * TODO: check old events ...
 */
const initSupportConversation = async () => {
  // TODO: create a ghostAgent for SupportConversation
  if (!supportConversationID) {
    try {
      supportConversationID = await nexmoAPI.getConversationId(
        SUPPORT_CONVERATION_NAME
      );

      if (!supportConversationID) {
        console.log("Creating nexmo app");
        let result = await nexmoAPI.createConversation(
          SUPPORT_CONVERATION_NAME,
          "support conversation"
        );
        console.log("conversation is: ", result);
        supportConversationID = result.id;
      }

      //  create user on nexmo
      // TODO: username needs to be the email (unique)
      const { id: userId } = await nexmoAPI.createUser(
        GHOST_SUPPORT_AGENT,
        GHOST_SUPPORT_AGENT
      );
      // ghostSupportAgentCredentials.userId = userId;

      console.log("***** vamos a crear miembro");
      // // add user as member of conversation
      let member = await nexmoAPI.createMember(supportConversationID, userId);
      ghostSupportAgentCredentials.memberId = member.id;
      ghostSupportAgentCredentials.userId = member.user_id;
      console.log(
        "ghost support agent created: ",
        ghostSupportAgentCredentials
      );
    } catch (error) {
      console.log("Error: ", error);
    }
  }
};

const init = async () => {
  // await getApplication(applicationId)

  // TODO: When a new support agent access the support conversation add him to the SupportConvesation
  // TODO: when a new wall connects

  // On server start create a SupportConversation
  initSupportConversation();
  // let result = await nexmoAPI.removeAllConversations();
  // console.log("result: ", result);
  result = await nexmoAPI.listAllConversations();
  // console.log("conversations: ", result);
  console.log("conversations length: ", result.length);
  // create10000UsersAndMembers();

  // conversation:error:maximum-number-of-members

  result = await nexmoAPI.listAllMembers(supportConversationID);
  console.log("number of members on conversation: ", result.length);
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
