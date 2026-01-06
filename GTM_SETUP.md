# Google Tag Manager Setup Guide

This guide explains how to set up Google Tag Manager (GTM) for the PeerShare application.

## Prerequisites

1. A Google Tag Manager account
2. A GTM Container ID (format: `GTM-XXXXXXX`)

## Setup Instructions

### 1. Get Your GTM Container ID

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Create a new container or select an existing one
3. Copy your Container ID (e.g., `GTM-XXXXXXX`)

### 2. Configure Environment Variable

Create a `.env` file in the root of the project (or add to your existing `.env` file):

```bash
VITE_GTM_ID=GTM-XXXXXXX
```

Replace `GTM-XXXXXXX` with your actual GTM Container ID.

### 3. Build and Deploy

The GTM code is automatically injected into `index.html` during the build process. After setting the environment variable:

```bash
npm run build
```

The GTM script will be included in the production build.

## Tracked Events

The application automatically tracks the following events:

### File Transfer Events
- `file_send` - When a file transfer is initiated
- `file_receive` - When a file is received
- `file_transfer_complete` - When a file transfer completes (success or failure)

### Connection Events
- `connection_established` - When WebRTC connection is established
- `connection_failed` - When connection fails

### Encryption Events
- `encryption_enabled` - When encryption is enabled for a file
- `decryption_success` - When decryption succeeds
- `decryption_failed` - When decryption fails (incorrect password)

### User Interaction Events
- `button_click` - When important buttons are clicked
- `file_upload` - When files are uploaded
- `code_generated` - When connection codes are generated

### Error Events
- `error` - General error tracking
- `404_not_found` - 404 page visits

### Page Views
- `page_view` - Automatic page view tracking on route changes

## GTM Tag Configuration

In your GTM container, you can create tags to track these events. Example configurations:

### Universal Analytics / GA4 Event Tag

**Tag Type:** Google Analytics: GA4 Event

**Event Name:** Use the event names listed above (e.g., `file_send`, `file_receive`)

**Event Parameters:** The following parameters are automatically sent:
- `file_name` - Name of the file
- `file_size` - File size in bytes
- `file_size_mb` - File size in MB
- `file_type` - MIME type of the file
- `is_encrypted` - Boolean indicating if encryption is enabled
- `transfer_time_seconds` - Time taken for transfer (for completed transfers)
- `transfer_speed_mbps` - Transfer speed in MB/s (for completed transfers)
- `success` - Boolean indicating success/failure
- `connection_type` - 'sender' or 'receiver'
- `error_type` - Type of error
- `error_message` - Error message
- `error_location` - Location where error occurred
- `timestamp` - ISO timestamp

### Trigger Configuration

Create triggers for each event type:
- **Trigger Type:** Custom Event
- **Event Name:** Match the event names (e.g., `file_send`, `file_receive`)

## Testing

1. Open your browser's developer console
2. Check the Network tab for GTM requests
3. Use GTM Preview mode to verify events are firing
4. Check the GTM Debug Console for event data

## Privacy Considerations

- GTM respects user privacy settings
- No personally identifiable information (PII) is tracked
- File names are tracked but can be filtered in GTM if needed
- Consider implementing cookie consent if required by your jurisdiction

## Troubleshooting

### GTM Not Loading

1. Check that `VITE_GTM_ID` is set correctly in your `.env` file
2. Verify the GTM Container ID is correct
3. Check browser console for errors
4. Ensure the GTM container is published

### Events Not Firing

1. Check browser console for JavaScript errors
2. Verify GTM container is loaded (check Network tab)
3. Use GTM Preview mode to debug
4. Check that `window.dataLayer` exists in console

### Environment Variable Not Working

1. Restart your development server after changing `.env`
2. Ensure the variable name is `VITE_GTM_ID` (Vite requires `VITE_` prefix)
3. Rebuild the application for production

## Additional Resources

- [Google Tag Manager Documentation](https://support.google.com/tagmanager)
- [GTM Data Layer Guide](https://developers.google.com/tag-manager/devguide)
- [GA4 Event Tracking](https://developers.google.com/analytics/devguides/collection/ga4/events)

