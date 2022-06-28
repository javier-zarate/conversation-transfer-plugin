import * as Flex from '@twilio/flex-ui';
import React from 'react';

import TransferButton from '../components/TransferButton';

export const setUpComponents = () => {
  Flex.TaskCanvasHeader.Content.add(<TransferButton key="chat-transfer-button" />, {
    sortOrder: 1,
    if: (props) => props.task.source.taskChannelUniqueName === 'conversation',
  });
};
