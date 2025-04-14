declare module 'timecut' {
  interface TimecutOptions {
    url: string;
    selector?: string;
    viewport?: {
      width: number;
      height: number;
    };
    fps?: number;
    duration?: number;
    output?: string;
    frameFormat?: {
      type: 'png' | 'jpeg';
      quality: number;
    };
    launchArguments?: string[];
    prepareDelay?: number;
    frameCache?: boolean;
    onProgress?: (progress: number) => void;
  }

  interface TimecutRecording {
    stop: () => void;
  }

  function timecut(options: TimecutOptions): Promise<TimecutRecording>;
  export default timecut;
} 