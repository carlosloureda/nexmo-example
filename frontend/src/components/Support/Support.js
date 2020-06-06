import React from "react";

import NexmoClient from "nexmo-client";
const Support = () => {
  // Generate Token and get conversation ID
  // connect that user as member of support agent

  React.useEffect(() => {
    let client = new NexmoClient({ debug: true });

    async function getToken() {
      try {
        let response = await fetch(
          "http://localhost:3000/support/conversation",
          {
            method: "post",
            headers: {
              "Content-Type": "application/json",
              //   Authorization: "Bearer " + token,
            },
            body: JSON.stringify({
              username: "user1",
            }),
          }
        );
        let data = await response.json();

        console.log("data: ", data);
        // console.log(
        //   `Conversation id: ${data.conversationId} and token: ${data.token}`
        // );
        const { conversationId, token, userId } = data;
        // const token =
        //   "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1OTE0Njc5MTAsImp0aSI6IjBlM2VhNjUwLWE4MjMtMTFlYS04ODdkLTNkNTg0NjVkNjcyZSIsImV4cCI6MTU5MTU1NDMxMCwiYWNsIjp7InBhdGhzIjp7Ii8qL3VzZXJzLyoqIjp7fSwiLyovY29udmVyc2F0aW9ucy8qKiI6e30sIi8qL3Nlc3Npb25zLyoqIjp7fSwiLyovZGV2aWNlcy8qKiI6e30sIi8qL2ltYWdlLyoqIjp7fSwiLyovbWVkaWEvKioiOnt9LCIvKi9hcHBsaWNhdGlvbnMvKioiOnt9LCIvKi9wdXNoLyoqIjp7fSwiLyova25vY2tpbmcvKioiOnt9fX0sImFwcGxpY2F0aW9uX2lkIjoiMzA2ZWUwZGItOTI0NC00ZGUyLWExNDktZWZjNTBlNWZjZWNkIiwic3ViIjoidXNlcjEifQ.AIV9FvG8pdzTeRG7wr3qSrH4rXmj-QyJd0ZvNc-MRAFa5QbY6JwkeX6yyF0LbqvBiUpfMfLgIlSGTZ1l_4pQTbKfdOd5sacDaIsD51EO_71wQERhXRXzhTbknLZY9LtxpRx136S-Z710WTay93Bj-_cYH7KTUMrNqT6_kJ1N3VbEkvD6EqgoJirbn1hmyNEWOBWz-HnIi-dEGXk2mwb0dNV7aojcZ7GGEh6glvS1ej7_kcdWv0jliUB9B9vcuOD096Gi9A5f5XbzmzyJafY3pNOcfrq_A7tiDWiv2UHjT5AN9JVUtN7pqPtBYcH3ptZIr6OVwK935D_9dpCy8leJGQ";
        let app = await client.login(token);
        // console.log("********************************************************");
        // conversation = await app.getConversation(conversationId);
        // console.log("========================================================");
        // return conversation;
      } catch (error) {
        console.log("Request failed", error);
        return error;
      }
    }
    const conversation = getToken();
    console.log("--> conversation: ", conversation);
  }, []);
  return <div>Hi from Support</div>;
};

export default Support;
