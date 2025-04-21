declare module 'mp4box' {
  interface MP4File {
    onReady: (info: any) => void;
    appendBuffer: (buffer: ArrayBuffer) => void;
    start: () => void;
  }

  interface MP4Box {
    createFile: () => MP4File;
  }

  const MP4Box: MP4Box;
  export default MP4Box;
} 