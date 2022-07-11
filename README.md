# conversation-transfer-plugin
--- 
## Conversation Transfer plugin used for FlexUI 2.0 and Conversations SDK for Twilio

*This repo assumes you are aquainted with how Twilio works, for installation and set up reference [Twiolio React Plugins Guide](https://www.twilio.com/docs/flex/quickstart/getting-started-plugin)* and *[Chat and SMS Transfers for Flex](https://github.com/twilio-professional-services/plugin-chat-sms-transfer)*

Twilio Flex Plugin that helps agents transfer conversations between agents. 

Modified a similar plugin made by Twilio [Chat and SMS Transfers for Flex](https://github.com/twilio-professional-services/plugin-chat-sms-transfer)
which was made for [Twilio Programmable Chat](https://www.twilio.com/docs/chat) *Which is no longer supported as of July 25, 2022* and [Twilio Flex UI 1.0](https://www.twilio.com/docs/flex). 

Followed the [migration guide](https://www.twilio.com/docs/flex/developer/plugins/migration-guide) provided by Twilio to migrate to Flex UI 2.0 since I will be using the [Conversations API](https://www.twilio.com/docs/conversations) *replacing Programmable Chat* and Flex 1.0 is incompatible with the new Convesations API. (**NOTE:** Flex UI 2.0 is is beta as of the making on this plugin)

Plugin takes creates a transfer button that is present in an Agents Active Chat window. This will bring up the [Worker Directory](https://www.twilio.com/docs/flex/ui/components#workerdirectory) flex component with a list of active Agents and available Queues. There an agent can select another agent to transfer the chat too or send the current chat to a queue. 

![Screen Shot 2022-07-10 at 11 21 23 PM](https://user-images.githubusercontent.com/16944722/178203591-1eef97be-0239-4a38-a27f-27bac139cd65.png)

![Screen Shot 2022-07-10 at 11 24 18 PM](https://user-images.githubusercontent.com/16944722/178203607-b35a0931-0388-43d8-965b-7fd808bc22b9.png)

---
At the time of the making of this plugin (June 28, 2022) there appeared to be a few bugs with Flex UI 2.0 (*Which to be fair is in Beta*). 

1. Accept Button after transferring a chat would auto cancel the reservation. 
	- Created a Twilio Serveless Function *accept-task.js* that replaces the standard actions for the accept button. 

2. Completing the Agent task for current conversation would not close the task. 
	- Created a Twilio Serverless Function *complete-task.js* that replaces the standard action of the complete button in a current chat window. 
