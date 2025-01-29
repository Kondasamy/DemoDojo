
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
        console.log('[DemoDojo] Starting recorder with options:', { streamId, width, height, audio, recordingMode });
        if (this.recorder?.state === 'recording') {
            console.error('[DemoDojo] Cannot start - recording already in progress');
            throw new Error('Called startRecording while recording is in progress.');
        }

        const chromeMediaSource = this.getChromeMediaSource(recordingMode);
        console.log('[DemoDojo] Using chrome media source:', chromeMediaSource);

        const videoConstraints: MediaTrackConstraints = {
            // @ts-ignore
            chromeMediaSource,
            chromeMediaSourceId: streamId,
            frameRate: frameRate,
            ...(width && {
                width: width,
            }),
            ...(height && {
                height: height,
            }),
        };

        console.log('[DemoDojo] Configured video constraints:', videoConstraints);

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

        console.log('[DemoDojo] Requesting media stream with constraints:', mediaStreamConstraints);
        try {
            this.media = await navigator.mediaDevices.getUserMedia(
                mediaStreamConstraints
            );
            console.log('[DemoDojo] Media stream obtained successfully');

            if (audio) {
                console.log('[DemoDojo] Setting up audio context');
                const audioContext = new AudioContext()
                const audioSource = audioContext.createMediaStreamSource(this.media)
                audioSource.connect(audioContext.destination)
                console.log('[DemoDojo] Audio context setup completed');
            }

            this.recorder = new MediaRecorder(this.media, {
                mimeType: recorderMimeType,
                videoBitsPerSecond: bitRate,
            });
            console.log('[DemoDojo] MediaRecorder initialized with settings:', { mimeType: recorderMimeType, bitRate });

            this.recorder.ondataavailable = (event) => {
                console.log('[DemoDojo] Received data chunk of size:', event.data.size);
                this.data.push(event.data);
            };
            this.recorder.onstop = async () => {
                console.log('[DemoDojo] Recording stopped, processing final video');
                const duration = Date.now() - this.startTime;
                const blob = new Blob(this.data, { type: recorderMimeType });
                console.log('[DemoDojo] Created initial blob, size:', blob.size);
                // @ts-ignore
                const fixedBlob = await fixWebmDuration(blob, duration, { logger: false })
                console.log('[DemoDojo] Fixed WebM duration, final size:', fixedBlob.size);

                const url = URL.createObjectURL(fixedBlob);
                console.log('[DemoDojo] Created object URL for video');
                chrome.runtime.sendMessage({
                    type: 'recording-completed',
                    videoUrl: url
                });
                callback?.(url)
                this.recorder = undefined;
                this.data = [];
            };
            this.recorder.onerror = (event) => {
                console.error('[DemoDojo] MediaRecorder error:', event);
            };
            this.recorder.start();
            this.startTime = Date.now();
            console.log('[DemoDojo] Recording started at:', new Date(this.startTime).toISOString());
        } catch (error) {
            console.error('[DemoDojo] Failed to initialize recording:', error);
            throw error;
        }
    }

    public async stop() {
        console.log('[DemoDojo] Stopping recording');
        this.recorder?.stop();
        console.log('[DemoDojo] Stopping media tracks');
        this.recorder?.stream.getTracks().forEach((t) => {
            t.stop();
            console.log('[DemoDojo] Stopped track:', t.kind, t.label);
        });
        this.media?.getTracks().forEach((t) => {
            t.stop();
            console.log('[DemoDojo] Stopped media track:', t.kind, t.label);
        })
    }
}

export default Recorder;