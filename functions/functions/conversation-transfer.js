/* eslint-disable camelcase, func-names, no-console */

exports.handler = async function (context, event, callback) {
  // set up twilio client
  const client = context.getTwilioClient();

  // setup a response object
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With, User-Agent',
  );
  response.appendHeader('Vary', 'Origin');
  try {
    // parse data form the incoming http request
    const originalTaskSid = event.taskSid;
    const { targetSid, workerName } = event;

    // retrieve attributes of the original task
    const originalTask = await client.taskrouter
      .workspaces(context.TWILIO_WORKSPACE_SID)
      .tasks(originalTaskSid)
      .fetch();
    let newAttributes = JSON.parse(originalTask.attributes);

    /*
     * set up attributes of the new task to link them to
     * the original task in Flex Insights
     */
    if (!newAttributes.hasOwnProperty('conversations')) {
      newAttributes = Object.assign(newAttributes, {
        conversations: {
          conversation_id: originalTaskSid,
        },
      });
    }

    /*
     * update task attributes to ignore the agent who transferred the task
     * this handles the case where the agent transfers task to a queue
     * that he is a part of. He won't get the task reassigned to him
     */
    newAttributes.ignoreAgent = workerName;

    /*
     * update task attributes to include the required targetSid on the task
     * this could either be a workerSid or a queueSid
     */
    newAttributes.targetSid = targetSid;

    // add an attribute that will tell our Workflow if we're transferring to a worker or a queue
    if (targetSid.startsWith('WK')) {
      newAttributes.transferTargetType = 'worker';
    } else {
      newAttributes.transferTargetType = 'queue';
    }
    const { ignoreAgent, transferTargetType } = newAttributes;
    console.log({ ignoreAgent, transferTargetType });

    // create New task
    const newTask = await client.taskrouter.workspaces(context.TWILIO_WORKSPACE_SID).tasks.create({
      workflowSid: context.TWILIO_CHAT_TRANSFER_WORKFLOW_SID,
      taskChannel: originalTask.taskChannelUniqueName,
      attributes: JSON.stringify(newAttributes),
    });

    console.log('New Task Created: ', newTask.sid);

    /*
     * Remove the original transferred task's reference to the chat channelSid
     * this prevents Twilio's Janitor service from cleaning up the channel when
     * the original task gets completed.
     */
    const originalTaskAttributes = JSON.parse(originalTask.attributes);
    delete originalTaskAttributes.channelSid;

    // update task and remove channelSid
    await client.taskrouter
      .workspaces(context.TWILIO_WORKSPACE_SID)
      .tasks(originalTaskSid)
      .update({
        attributes: JSON.stringify(originalTaskAttributes),
      })
      .then((task) => console.log('removed channelSid: ', !task.attributes.channelSid));

    // Close the original Task
    await client.taskrouter
      .workspaces(context.TWILIO_WORKSPACE_SID)
      .tasks(originalTaskSid)
      .update({ assignmentStatus: 'completed', reason: 'task transferred' })
      .then((task) => console.log('task closed: ', task.assignmentStatus, task.reason));

    response.setBody({
      taskSid: newTask.sid,
    });
  } catch (err) {
    console.error('AN ERROR HAS OCCURED');
    console.log(JSON.stringify(err, null, 2));
  }

  callback(null, response);
};
