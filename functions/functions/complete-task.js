/* eslint-disable func-names, no-console*/

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
    console.log('complete task fired');
    // parse data form the incoming http request
    const { taskSid, reservationSid, conversationSid, agentId } = event;

    // extract current agent participantSid
    const agentSid = await client.conversations
      .conversations(conversationSid)
      .participants.list({ limit: 1000 })
      .then((participants) => {
        return participants.find((participant) => participant.identity === agentId).sid;
      });

    // remove current agent from conversation
    await client.conversations
      .conversations(conversationSid)
      .participants(agentSid)
      .remove()
      .then(() => console.log(`Agent left conversation`));

    // close the reservation
    await client.taskrouter
      .workspaces(context.TWILIO_WORKSPACE_SID)
      .tasks(taskSid)
      .reservations(reservationSid)
      .update({ reservationStatus: 'completed' })
      .then((reservation) => console.log(`${reservation.workerName} closed reservation and task`));

    response.setBody({
      success: true,
    });
  } catch (err) {
    response.setBody({
      success: false,
    });
    console.error('AN ERROR HAS OCCURED');
    console.log(JSON.stringify(err, null, 2));
  }

  callback(null, response);
};
