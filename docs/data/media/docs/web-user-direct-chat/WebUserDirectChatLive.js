import * as React from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { WebUserDirectChat } from '@stoked-ui/media';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

export default function WebUserDirectChatLive() {
  const [statusMessage, setStatusMessage] = React.useState(
    'Send a message here, then reply to the forwarded Telegram message to continue the conversation in this widget.',
  );

  return (
    <Stack spacing={2} sx={{ maxWidth: 640, width: '100%' }}>
      <Alert severity="warning" variant="outlined">
        This demo uses the live <code>/api/chat/send</code> endpoint. Reply directly to the
        forwarded Telegram message to send a response back into the widget.
      </Alert>
      <WebUserDirectChat
        provider="telegram"
        apiEndpoint={getApiUrl('/api/chat/send')}
        title="Telegram direct chat"
        subtitle="Messages sent here are relayed to Telegram, and Telegram replies are synced back into this conversation."
        onSuccess={() => {
          setStatusMessage(
            'Message sent. Reply to the Telegram message thread to continue the chat here.',
          );
        }}
        onError={(error) => {
          setStatusMessage(`Delivery failed: ${error}`);
        }}
      />
      <Alert severity="info" variant="outlined">
        {statusMessage}
      </Alert>
    </Stack>
  );
}
