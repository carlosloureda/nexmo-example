import React from "react";
import NexmoClient from "nexmo-client";
import { SERVER_URL } from "../../utils/constants";

const User = () => {
  const [conversation, setConversation] = React.useState(null);

  React.useEffect(() => {
    let client = new NexmoClient({ debug: true });

    async function getToken() {
      try {
        let response = await fetch(`${SERVER_URL}/wall/conversation`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "mystudent1-@gmail.com",
            username: "student1-",
          }),
        });
        let data = await response.json();

        const { conversationId, token, userId } = data;
        let app = await client.login(token);
        let conversation = await app.getConversation(conversationId);
        console.log("--> conversation: ", conversation);
        setConversation(conversation);
      } catch (error) {
        console.log("Request failed", error);
        return error;
      }
    }
    getToken();
  }, []);
  if (conversation) {
    conversation.on("text", (sender, event) => {
      if (event.from !== conversation.me.id) {
        console.log(
          "New message received from: ",
          sender.user.name,
          " and text: ",
          event.body.text
        );
      }
    });
  }

  const sendNewChatEvent = () => {
    console.log("eaaaa");
    conversation
      .sendCustomEvent({ type: "my_custom_event", body: { your: "data" } })
      .then((custom_event) => {
        console.log("send new event: ", custom_event);
      });
  };
  return (
    <div>
      Hi from User
      {conversation && (
        <button onClick={sendNewChatEvent}>
          Send Event for new student chat
        </button>
      )}
    </div>
  );
};

export default User;
