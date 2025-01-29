
const recorderMimeType = 'video/webm';
const frameRate = 30;
const bitRate = 8 * 1024 * 1024;

interface RecordingOptions {
    streamId: string
    width: number
    height: number
    audio: boolean
    recordingMode: 'tab' | 'desktop' | 'area'
    area?: {
        x: number
        y: number
        width: number
        height: number
    }
}

class Recorder {
    private recorder: MediaRecorder | undefined;
    private data: Blob[] = [];
    private startTime: number;
    private media: MediaStream | undefined;

    constructor() {
        this.recorder = undefined;
        this.data = [];
        this.startTime = 0;
        this.media = undefined;
    }
    private getChromeMediaSource(
        recordingMode: RecordingOptions['recordingMode']
    ) {
        return ['tab', 'area'].includes(recordingMode) ? 'tab' : 'desktop';
    }


    public async start(
        {
            streamId,
            width,
            height,
            audio,
            recordingMode = 'tab',
        }: RecordingOptions,
        callback?: (url: string) => void
    ) {
        if (this.recorder?.state === 'recording') {
            throw new Error('Called startRecording while recording is in progress.');
        }


        const chromeMediaSource = this.getChromeMediaSource(recordingMode);
        const videoConstraints: MediaTrackConstraints = {
            // @ts-ignore
            chromeMediaSource,
            chromeMediaSourceId: streamId,
            frameRate: frameRate,
            ...(width && {
                width: width,
                // maxWidth: width,
            }),
            ...(height && {
                height: height,
                // maxHeight: height,
            }),
        };

        const mediaStreamConstraints: MediaStreamConstraints = {
            audio: audio
                ? {
                    // @ts-ignore
                    chromeMediaSource,
                    chromeMediaSourceId: streamId,
                }
                : false,
            video: videoConstraints,
        };

        this.media = await navigator.mediaDevices.getUserMedia(
            mediaStreamConstraints
        );

        if (audio) {
            const audioContext = new AudioContext()
            const audioSource = audioContext.createMediaStreamSource(this.media)
            audioSource.connect(audioContext.destination)
        }

        this.recorder = new MediaRecorder(this.media, {
            mimeType: recorderMimeType,
            videoBitsPerSecond: bitRate,
        });

        this.recorder.ondataavailable = (event) => {
            this.data.push(event.data);
        };
        this.recorder.onstop = async () => {
            const duration = Date.now() - this.startTime;
            const blob = new Blob(this.data, { type: recorderMimeType });
            // @ts-ignore
            const fixedBlob = await fixWebmDuration(blob, duration, { logger: false })

            const url = URL.createObjectURL(fixedBlob);
            chrome.runtime.sendMessage({
                type: 'recording-completed',
                videoUrl: url
            });
            callback?.(url)
            this.recorder = undefined;
            this.data = [];
        };
        this.recorder.onerror = (event) => {
            console.error('MediaRecorder error:', event);
        };
        this.recorder.start();
        this.startTime = Date.now();
    }

    public async stop() {
        this.recorder?.stop();
        this.recorder?.stream.getTracks().forEach((t) => t.stop());
        this.media?.getTracks().forEach((t) => t.stop())
    }
}

export default Recorder;