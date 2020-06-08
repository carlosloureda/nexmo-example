import React from "react";
import NexmoClient from "nexmo-client";
import { SERVER_URL } from "../../utils/constants";

const Support = () => {
  // Generate Token and get conversation ID
  // connect that user as member of support agent
  const [conversation, setConversation] = React.useState(null);
  React.useEffect(() => {
    let client = new NexmoClient({ debug: true });

    async function getToken() {
      try {
        let response = await fetch(`${SERVER_URL}/support/conversation`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "supportAgent1@gmail.com",
            username: "supportAgent1",
          }),
        });
        let data = await response.json();

        const { conversationId, token, userId } = data;
        let app = await client.login(token);
        console.log("data: ", data);
        let conversation = await app.getConversation(conversationId);
        console.log("--> conversation: ", conversation);
        // return conversation;
        setConversation(conversation);
      } catch (error) {
        console.log("Request failed", error);
        return error;
      }
    }
    getToken();
  }, []);
  if (conversation) {
    // conversation.sendText("Holas");
    // conversation
    //   .sendCustomEvent({ type: "my_custom_event", body: { your: "data" } })
    //   .then((custom_event) => {
    //     console.log(custom_event);
    //   });
    conversation.on("my_custom_event", (from, event) => {
      console.log(
        "--> New event received: from",
        from,
        " event.body: ",
        event.body
      );
    });
  }
  return <div>Hi from Support</div>;
};

export default Support;
