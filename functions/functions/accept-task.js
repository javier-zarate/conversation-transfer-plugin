/* eslint-disable camelcase, func-names, no-console*/

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
    console.log('accept-task fired (workflowSid)', context.TWILIO_WORKSPACE_SID);
    const { taskSid, reservationSid, conversationSid, agentId } = event;

    try {
      // Add agent as participant
      await client.conversations
        .conversations(conversationSid)
        .participants.create({
          identity: agentId,
        })
        .then((participant) => console.log(`Added ${participant.identity} to conversation '${conversationSid}'`));
    } catch (err) {
      if (err.code !== 50433) throw new Error(err);
    }

    // accept reservation to continue conversation
    await client.taskrouter
      .workspaces(context.TWILIO_WORKSPACE_SID)
      .tasks(taskSid)
      .reservations(reservationSid)
      .update({ reservationStatus: 'accepted' })
      .then((reservation) => {
        console.log('Reservation Accepted By', reservation.workerName);
      });

    response.setBody({
      success: true,
    });
  } catch (err) {
    response.setBody({
      success: false,
    });
    console.error('Error accepting task', err);
  }

  callback(null, response);
};
