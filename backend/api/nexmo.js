const { NEXMO_API_KEY, NEXMO_SECRET, APPLICATION_ID } = process.env;
const fs = require("fs");
const util = require("util");

//   TODO: also add private key to some places ...
const PRIVATE_KEY_PATH = "./private.key";

const NEXMO_ERROS = {
  MEMBER_ALREADY_JOINED: "conversation:error:member-already-joined",
  USER_DUPLICATED: "user:error:duplicate-name",
};
class NexmoAPI {
  constructor() {
    const Nexmo = require("nexmo");
    this.nexmo = new Nexmo({
      apiKey: NEXMO_API_KEY,
      apiSecret: NEXMO_SECRET,
      applicationId: APPLICATION_ID,
      privateKey: PRIVATE_KEY_PATH,
    });
  }

  _wrappInPromise = (_func, args) => {
    console.log("_func: ", _func);
    console.log("args: ", args);
    return new Promise((resolve, reject) => {
      _func(args, (error, result) => {
        if (error) {
          console.log("errror: ", error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };

  createConversation = async (name, display_name) => {
    // let results = await this._wrappInPromise(this.nexmo.conversations.create, {
    //   name,
    //   display_name,
    // });
    // console.log("*** results: ", results);
    return new Promise((resolve, reject) => {
      this.nexmo.conversations.create(
        {
          name,
          display_name,
          // properties: {
          //   ttl: 60,
          // },
        },
        (error, result) => {
          console.log("RESULT: ", result);
          if (error) {
            console.log("error: ", error);

            reject(error);
          } else {
            // TODO: remove as this is for testing purposes only
            this.nexmo.conversations.get(result.id, (error, result2) => {
              if (error) {
                console.error(error);
              } else {
                console.log("The result is: ", result2);
                console.log(result2);
                resolve(result);
              }
            });
          }
        }
      );
    });
  };

  getConversation = async (conversationId) => {
    // const get = util.promisify(this.nexmo.conversations.get);

    // try {
    //   let result = await get(conversationId);
    //   return result;
    // } catch (error) {
    //   return error;
    // }
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
        const conversations = await this.listAllConversations();
        let id = "";
        // TODO: refactor
        Object.values(conversations).map((conversation) => {
          if (conversation.name === conversationName) {
            console.log("Conversation object is: ", conversation);
            id = conversation.id;
          }
        });
        resolve(id);
      } catch (error) {
        reject(error);
      }
    });
  };

  listConversations = async () => {
    return new Promise((resolve, reject) => {
      this.nexmo.conversations.get({ page_size: 10 }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          // resolve(result._embedded.data.conversations);
          resolve(result);
        }
      });
    });
  };

  getNextConversations = async (result) => {
    return new Promise((resolve, reject) => {
      this.nexmo.conversations.next(result, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };

  listAllConversations = async () => {
    let conversations = [];
    return new Promise(async (resolve, reject) => {
      try {
        let conversationsResults = await this.listConversations();
        conversations = conversations.concat(
          conversationsResults._embedded.data.conversations
        );
        while (conversationsResults && conversationsResults._links.next) {
          let result = await this.getNextConversations(conversationsResults);
          conversationsResults = result;
          conversations = conversations.concat(
            conversationsResults._embedded.data.conversations
          );
        }
      } catch (error) {
        conversationsResults = null;
        reject(error);
      }
      resolve(conversations);
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
        const conversations = await this.listAllConversations();
        Object.values(conversations).map(async (conversation) => {
          await this.deleteConversation(conversation.id);
        });
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };

  listUsers = async () => {
    return new Promise((resolve, reject) => {
      this.nexmo.users.get({ page_size: 100 }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };

  listAllUsers = async () => {
    let conversations = [];
    return new Promise(async (resolve, reject) => {
      let conversationsResults = await this.listConversations();
      conversations = conversations.concat(
        conversationsResults._embedded.data.conversations
      );
      while (conversationsResults && conversationsResults._links.next) {
        try {
          let result = await this.getNextConversations(conversationsResults);
          conversationsResults = result;
          conversations = conversations.concat(
            conversationsResults._embedded.data.conversations
          );
        } catch (error) {
          conversationsResults = null;
          reject(error);
        }
      }
      resolve(conversations);
    });
  };
  getNextUsers = async (result) => {
    return new Promise((resolve, reject) => {
      this.nexmo.users.next(result, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };

  getUser = (id) => {
    return new Promise((resolve, reject) => {
      this.nexmo.users.get(id, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };

  //FIX: Broken
  getUserId = async (userName) => {
    return new Promise(async (resolve, reject) => {
      try {
        const users = await this.listUsers();
        let id = "";
        // TODO: refactor
        Object.values(users).map((user) => {
          if (user.name === userName) {
            id = user.id;
          }
        });
        resolve(id);
      } catch (error) {
        reject(error);
      }
    });
  };

  // TODO: rename this to a more convenient name
  // createUser = async (name, display_name, image_url) => {
  //   return new Promise((resolve, reject) => {
  //     this.nexmo.users.create(
  //       { name, display_name, image_url },
  //       async (error, result) => {
  //         if (error) {
  //           if (error.body && error.body.code === NEXMO_ERROS.USER_DUPLICATED) {
  //             let resultUsers = await this.listUsers();
  //             let users = resultUsers._embedded.data.users;
  //             let matchingUsers = users.filter((user) => user.name === name);
  //             let matchingUser = null;
  //             if (matchingUsers && !matchingUsers.length) {
  //               var promises = [];
  //               matchingUser = matchingUsers[0];
  //               while (!matchingUser) {
  //                 console.log("--> matchingUser: ", matchingUser);
  //                 promises.push(
  //                   new Promise(async (resolve, reject) => {
  //                     try {
  //                       let result = await this.getNextUsers(resultUsers);
  //                       console.log("result: ", result);
  //                       resultUsers = result;
  //                       if (
  //                         !resultUsers ||
  //                         !resultUsers._embedded.data.users.length
  //                       ) {
  //                         console.log("?????");
  //                         resolve(null);
  //                       }
  //                       users = result._embedded.data.users;
  //                       matchingUsers = users.filter(
  //                         (user) => user.name === name
  //                       );
  //                       if (matchingUsers && matchingUsers.length) {
  //                         matchingUser = matchingUsers[0];
  //                         console.log("****: ", matchingUser);
  //                         resolve(matchingUser);
  //                       }
  //                     } catch (error) {
  //                       console.log("---> error: ", error);
  //                       reject(null);
  //                     }
  //                   })
  //                 );
  //               }
  //               Promise.all(promises).then(() => {
  //                 //All operations done
  //                 console.log("todo hecho ?");
  //               });
  //             } else {
  //               matchingUser = matchingUsers[0];
  //               resolve(matchingUser);
  //             }
  //           } else {
  //             resolve(result);
  //           }
  //         }
  //       }
  //     );
  //   });
  // };

  createUser = async (name, display_name, image_url) => {
    return new Promise((resolve, reject) => {
      this.nexmo.users.create(
        { name, display_name, image_url },
        async (error, result) => {
          if (error) {
            if (error.body && error.body.code === NEXMO_ERROS.USER_DUPLICATED) {
              try {
                let resultUsers = await this.listUsers();
                let users = resultUsers._embedded.data.users;
                let matchingUsers = users.filter((user) => user.name === name);
                let matchingUser = null;
                if (matchingUsers && !matchingUsers.length) {
                  var promises = [];
                  matchingUser = matchingUsers[0];

                  while (!matchingUser) {
                    let result = await this.getNextUsers(resultUsers);
                    resultUsers = result;
                    if (
                      !resultUsers ||
                      !resultUsers._embedded.data.users.length
                    ) {
                      console.log("?????");
                      resolve(null);
                    }
                    users = result._embedded.data.users;
                    matchingUsers = users.filter((user) => user.name === name);
                    if (matchingUsers && matchingUsers.length) {
                      matchingUser = matchingUsers[0];
                      console.log("****: ", matchingUser);
                      resolve(matchingUser);
                    }
                  }
                } else {
                  matchingUser = matchingUsers[0];
                  console.log("---- ", matchingUser);
                  resolve(matchingUser);
                }
              } catch (error) {
                console.log("---> error: ", error);
                reject(error);
              }
            } else {
              resolve(result);
            }
          }
        }
      );
    });
  };

  createMember = async (conversationId, userId) => {
    return new Promise((resolve, reject) => {
      this.nexmo.conversations.members.create(
        conversationId,
        { action: "join", user_id: userId, channel: { type: "app" } },
        async (error, result) => {
          if (error) {
            if (
              error.body &&
              error.body.code === NEXMO_ERROS.MEMBER_ALREADY_JOINED
            ) {
              let resultMembers = await this.listMembers(conversationId);
              let members = resultMembers._embedded.data.members;
              let matchingMembers = members.filter(
                (member) => member.user_id === userId
              );
              let matchingMember = matchingMembers[0];
              if (matchingMember) {
                resolve(matchingMember);
              } else {
                while (!matchingMember) {
                  try {
                    let result = await this.getNextMembers(resultMembers);
                    resultMembers = result;
                    if (
                      !resultMembers ||
                      !resultMembers._embedded.data.members.length
                    ) {
                      console.log("--> ?????");
                      resolve(null);
                    }
                    members = result._embedded.data.members;
                    matchingMembers = members.filter(
                      (member) => member.user_id === userId
                    );
                    if (matchingMembers && matchingMembers.length) {
                      matchingMember = matchingMembers[0];
                      resolve(matchingMember);
                    }
                  } catch (error) {
                    reject(error);
                  }
                }
              }
            } else {
              resolve(error);
            }
          } else {
            // console.log("No error: ", result);
            resolve(result);
          }
        }
      );
    });
  };

  listMembers = async (conversationId) => {
    return new Promise((resolve, reject) => {
      this.nexmo.conversations.members.get(
        conversationId,
        {},
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

  listAllMembers = async (conversationId) => {
    let members = [];
    return new Promise(async (resolve, reject) => {
      let membersResults = await this.listMembers(conversationId);
      members = members.concat(membersResults._embedded.data.members);
      while (membersResults && membersResults._links.next) {
        try {
          let result = await this.getNextMembers(membersResults);
          membersResults = result;
          members = members.concat(membersResults._embedded.data.members);
        } catch (error) {
          membersResults = null;
          reject(error);
        }
      }
      resolve(members);
    });
  };
  getNextMembers = async (result) => {
    return new Promise((resolve, reject) => {
      this.nexmo.conversations.members.next(result, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };

  createUserToken = (userName) => {
    const aclPaths = {
      paths: {
        "/*/users/**": {},
        "/*/conversations/**": {},
        "/*/sessions/**": {},
        "/*/devices/**": {},
        "/*/image/**": {},
        "/*/media/**": {},
        "/*/applications/**": {},
        "/*/push/**": {},
        "/*/knocking/**": {},
      },
    };
    const privateKEY = fs.readFileSync(PRIVATE_KEY_PATH);
    return this.createMyOwnJwt(userName);
    return this.nexmo.generateJwt(privateKEY, {
      application_id: APPLICATION_ID,
      sub: userName,
      //expire in 24 hours
      exp: Math.round(new Date().getTime() / 1000) + 86400,
      acl: aclPaths,
    });
  };

  createMyOwnJwt = (userName) => {
    const { uuid } = require("uuidv4");

    const now = Math.floor(new Date().getTime() / 1000); // seconds since epoch
    const exp = now + 86400;

    const claims = {
      application_id: APPLICATION_ID,
      iat: now,
      sub: userName,
      exp: exp,
      jti: uuid(),
      acl: {
        paths: {
          "/*/users/**": {},
          "/*/conversations/**": {},
          "/*/sessions/**": {},
          "/*/devices/**": {},
          "/*/image/**": {},
          "/*/media/**": {},
          "/*/applications/**": {},
          "/*/push/**": {},
          "/*/knocking/**": {},
        },
      },
    };

    const jwt = require("jsonwebtoken");
    const privateKEY = fs.readFileSync(PRIVATE_KEY_PATH);
    var token = jwt.sign(claims, privateKEY, { algorithm: "RS256" });
    return token;
  };
}

module.exports = NexmoAPI;
