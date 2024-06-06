import PushNotification from 'react-native-push-notification';

const channelConfig = {
  channelId: 'channel-id-1',
  channelName: 'My Notification Channel',
  vibrate: true,
  soundName: 'default',
  lights: {color: '#FF0000', duration: 1000},
};
const showNotification = (title, message) => {
  PushNotification.localNotification({
    title,
    message,
    channelId: 'channel-id-1', // Use the same channel ID for consistency
    playSound: true, // Enable sound (optional)
    vibrate: true, // Enable vibration (optional)
    lights: {color: '#FF0000', duration: 1000}, // Set notification light (optional)
  });
};

PushNotification.createChannel(channelConfig, (created) => {
    console.log(`Notification channel creation: ${created}`);
  });
const handleScheduleNotification = (title, message) => {
  PushNotification.localNotificationSchedule({
    title: title,
    message: message,
    date: new Date(Date.now() + 5 * 1000),
  });
};
const handleCancel = () => {
  PushNotification.cancelAlllocalNotifications();
};

export {showNotification, handleScheduleNotification, handleCancel};
