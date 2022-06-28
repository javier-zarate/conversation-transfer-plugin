/* eslint-disable no-console,no-negated-condition,consistent-return */

import * as Flex from '@twilio/flex-ui';

export const setUpActions = () => {
  Flex.Actions.replaceAction('TransferTask', (payload, original) => {
    if (payload.task.taskChannelUniqueName !== 'conversation') {
      original(payload);
    } else {
      console.log('replaceAction: TransferTask');

      const body = {
        taskSid: payload.task.taskSid,
        targetSid: payload.targetSid,
        workerName: Flex.Manager.getInstance().user.identity,
      };

      // initiate the transfer
      return fetch(`${process.env.REactions.ACT_APP_SERVERLESS_FUNCTION_DOMAIN}/conversation-transfer`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(body),
      }).catch(async (e) => {
        /*
         * function in src/helpers/notifications.js custom notification
         * if transfer request fails, show it to the agent
         */
        Notifications.showNotification('chatTransferFetchError', { message: e.message });

        /*
         * If we encounter an error with the transfer-chat function we do not want to leave
         * the customer with no one in the chat channel.
         */
        if (channel) {
          await channel.source.join();
        }
      });
    }
  });

  Flex.Actions.replaceAction('AcceptTask', (payload, original) => {
    if (payload.task.taskChannelUniqueName === 'conversation' && payload.task.workflowName === 'Chat Transfers') {
      console.log('replaceAction: AcceptTask');

      const body = {
        taskSid: payload.task.taskSid,
        reservationSid: payload.sid,
        conversationSid: payload.task.attributes.conversationSid,
        agentId: Flex.Manager.getInstance().user.identity,
      };

      // initiate accept tranfer
      return fetch(`${process.env.REACT_APP_SERVERLESS_FUNCTION_DOMAIN}/accept-task`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(body),
      }).catch((err) => {
        console.log(err);
        throw err;
      });
    }

    original(payload);
  });

  Flex.Actions.replaceAction('CompleteTask', (payload, original) => {
    if (payload.task.taskChannelUniqueName === 'conversation' && payload.task.workflowName === 'Chat Transfers') {
      console.log('replaceAction: CompleteTask');

      const body = {
        taskSid: payload.task.taskSid,
        reservationSid: payload.sid,
        conversationSid: payload.task.attributes.conversationSid,
      };

      // initiate complete tranfer
      return fetch(`${process.env.REACT_APP_SERVERLESS_FUNCTION_DOMAIN}/complete-task`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(body),
      }).catch((err) => {
        console.log(err);
        throw err;
      });
    }

    original(payload);
  });
};
