import { ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteVideoTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';

export interface BaseUser {
  uid: number;
  userName: string;
  role: string;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
}

export interface LocalUser extends BaseUser {
  videoTrack?: ICameraVideoTrack;
  audioTrack?: IMicrophoneAudioTrack;
}

export interface RemoteUser extends BaseUser {
  videoTrack?: IRemoteVideoTrack;
  audioTrack?: IRemoteAudioTrack;
}

export type RoomUser = LocalUser | RemoteUser;
