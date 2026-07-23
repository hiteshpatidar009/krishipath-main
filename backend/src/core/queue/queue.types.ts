import { QueueMessage } from "./queue.port";

export enum QueueNames {
  VIDEO_TRANSCODE = "video_transcode",
  PUSH_NOTIFICATION = "push_notification",
  ANALYTICS_EVENT = "analytics_event",
  EMAIL_DISPATCH = "email_dispatch",
  WEATHER_ALERT = "weather_alert",
  REPORT_GENERATION = "report_generation",
}

export type VideoTranscodePayload = {
  videoId: string;
  creatorId: string;
};

export type PushNotificationPayload = {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};
