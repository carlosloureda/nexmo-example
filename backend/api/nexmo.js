const { NEXMO_API_KEY, NEXMO_SECRET } = process.env;

// TODO: add this to .env
const APPLICATION_ID = "accf1462-2c94-432f-9565-0258fddc1368";

class NexmoAPI {
  constructor() {
    const Nexmo = require("nexmo");
    this.nexmo = new Nexmo({
      apiKey: NEXMO_API_KEY,
      apiSecret: NEXMO_SECRET,
      applicationId: APPLICATION_ID,
      //   TODO: also add private key to some places ...
      privateKey: "./private.key",
    });
  }

  createConversation = async (name, display_name) => {
    return new Promise((resolve, reject) => {
      this.nexmo.conversations.create(
        {
          name,
          display_name,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  getConversation = async (conversationId) => {
    return new Promise((resolve, reject) => {
      this.nexmo.conversations.get(conversationId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };

  getConversationId = async (conversationName) => {
    return new Promise(async (resolve, reject) => {
      try {
        const conversations = await this.listConversations();
        let id = "";
        // TODO: refactor
        Object.values(conversations).map((conversation) => {
          if (conversation.name === conversationName) {
            id = conversation.id;
          }
        });
        resolve(id);
      } catch (error) {
        reject(error);
      }
    });
  };

  listConversations = async (name, display_name) => {
    return new Promise((resolve, reject) => {
      this.nexmo.conversations.get({}, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result._embedded.data.conversations);
        }
      });
    });
  };

  deleteConversation = async (conversationId) => {
    return new Promise((resolve, reject) => {
      this.nexmo.conversations.delete(conversationId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };

  removeAllConversations = async (name, display_name) => {
    return new Promise(async (resolve, reject) => {
      try {
        const conversations = await this.listConversations();
        Object.values(conversations).map(async (conversation) => {
          await this.deleteConversation(conversation.id);
        });
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };
}

module.exports = NexmoAPI;

// const token = Nexmo.generateJwt(privateKEY, {
//   application_id: applicationId,
//   // sub: "jamie",
//   //expire in 24 hours
//   exp: Math.round(new Date().getTime() / 1000) + 86400,
//   // acl: aclPaths,
// });

// const token = nexmo.generateJwt();

// try {
//   console.log("Token: ", token);
//   let response = await fetch("https://api.nexmo.com/beta/conversations", {
//     method: "post",
//     headers: {
//       // "Content-Type": "application/json",
//       Authorization: "Bearer " + token,
//     },
//     body: JSON.stringify({
//       name: "supportConversation",
//       display_name: "Support Conversation",
//       capabilities: {
//         messages: {
//           webhooks: {
//             inbound_url: {
//               address: "http://localhost:3000/webhooks/inbound",
//               http_method: "POST",
//             },
//             status_url: {
//               address: "http://localhost:3000/webhooks/status",
//               http_method: "POST",
//             },
//           },
//         },
//         rtc: {
//           webhooks: {
//             event_url: {
//               address: "http://localhost:3000/webhooks/event",
//               http_method: "POST",
//             },
//           },
//         },
//       },
//     }),
//   });
//   let data = await response.json();
//   console.log("data: ", data);
//   console.log(`Conversation id: ${data.id} and link: ${data.href}`);
// } catch (error) {
//   console.log("Request failed", error);
// }
// };

// Obsolete
// const createMyOwnJwt = () => {
//   const secureRandom = require("secure-random");
//   const signingKey = secureRandom(256, { type: "Buffer" });

//   const njwt = require("njwt");

//   const now = Math.floor(new Date().getTime() / 1000); // seconds since epoch
//   const plus5Minutes = new Date((now + 5 * 60) * 1000); // Date object

//   const claims = {
//     application_id: applicationId,
//     iat: now(),
//     jti: signingKey.toString("base64"),
//   };

//   let token = njwt
//     .create(claims, privateKEY)
//     // .setIssuedAt(now)
//     // .setExpiration(plus5Minutes)
//     // .setIssuer(clientId)
//     // .setSubject(clientId)
//     .compact();

//   nJwt.verify(token, privateKEY, function (err, verifiedJwt) {
//     if (err) {
//       console.log("ERROR: ", err); // Token has expired, has been tampered with, etc
//     } else {
//       console.log("verified: ", verifiedJwt); // Will contain the header and body
//     }
//   });
//   return token;
// };
