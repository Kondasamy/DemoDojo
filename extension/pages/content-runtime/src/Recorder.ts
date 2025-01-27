interface RecordingOptions {
    streamId: string;
    width?: number;
    height?: number;
    audio: boolean;
    recordingMode?: 'tab' | 'desktop' | 'area';
    area?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

const recorderMimeType = 'video/webm;codecs=vp9';
const frameRate = 30;
const bitRate = 8 * 1024 * 1024;
const devicePixelRatio = window.devicePixelRatio || 1;

class Recorder {
    private recorder: MediaRecorder | null;
    private data: Blob[];
    private startTime: number;
    private media: MediaStream | null;
    private drawTimerId: ReturnType<typeof setTimeout> | null;
    private isInitialized: boolean;

    constructor() {
        this.recorder = null;
        this.data = [];
        this.startTime = 0;
        this.media = null;
        this.drawTimerId = null;
        this.isInitialized = false;
        console.log('Recorder initialized');
    }

    private cleanup() {
        if (this.recorder) {
            if (this.recorder.state === 'recording') {
                this.recorder.stop();
            }
            this.recorder = null;
        }

        if (this.media) {
            this.media.getTracks().forEach(track => {
                track.stop();
                this.media?.removeTrack(track);
            });
            this.media = null;
        }

        if (this.drawTimerId) {
            clearTimeout(this.drawTimerId);
            this.drawTimerId = null;
        }

        this.data = [];
        this.startTime = 0;
        this.isInitialized = false;
    }

    private createAreaRecorderMediaStream(area: RecordingOptions['area'], media: MediaStream) {
        if (!area) throw new Error('Area is required for area recording');
        console.log('Creating area recorder with:', { area, devicePixelRatio });

        const canvas = document.createElement('canvas');
        canvas.width = area.width;
        canvas.height = area.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const video = document.createElement('video');
        video.srcObject = media;
        video.autoplay = true;

        const drawFrame = () => {
            ctx.drawImage(
                video,
                area.x * devicePixelRatio,
                area.y * devicePixelRatio,
                area.width * devicePixelRatio,
                area.height * devicePixelRatio,
                0,
                0,
                area.width,
                area.height
            );
            this.drawTimerId = setTimeout(drawFrame, 1000 / frameRate);
        };

        video.addEventListener('play', () => {
            console.log('Video playback started, beginning frame capture');
            drawFrame();
        });

        return canvas.captureStream(frameRate);
    }

    public async start(options: RecordingOptions, onComplete?: (url: string) => void) {
        console.log('Starting recording with options:', options);

        if (this.isInitialized || this.recorder?.state === 'recording') {
            console.warn('Recording already in progress, cleaning up first');
            this.cleanup();
        }

        try {
            // Set up video constraints
            const videoConstraints: MediaTrackConstraints = {
                mandatory: {
                    chromeMediaSource: options.recordingMode === 'tab' ? 'tab' : 'desktop',
                    chromeMediaSourceId: options.streamId,
                    minFrameRate: frameRate,
                    ...(options.width && {
                        minWidth: options.width * devicePixelRatio,
                        maxWidth: options.width * devicePixelRatio,
                    }),
                    ...(options.height && {
                        minHeight: options.height * devicePixelRatio,
                        maxHeight: options.height * devicePixelRatio,
                    }),
                },
            } as any;

            // Set up media stream constraints
            const mediaStreamConstraints: MediaStreamConstraints = {
                video: videoConstraints,
                audio: options.audio ? {
                    mandatory: {
                        chromeMediaSource: options.recordingMode === 'tab' ? 'tab' : 'desktop',
                        chromeMediaSourceId: options.streamId,
                    }
                } as any : false
            };

            console.log('Requesting media with constraints:', mediaStreamConstraints);

            // Get the screen media stream
            const screenStream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
            console.log('Screen media stream obtained:', screenStream.getTracks());

            // If audio is enabled, get system audio
            let finalStream = screenStream;
            if (options.audio) {
                try {
                    const audioStream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            sampleRate: 44100
                        },
                        video: false
                    });
                    console.log('Audio stream obtained:', audioStream.getTracks());

                    // Combine screen and audio streams
                    finalStream = new MediaStream([
                        ...screenStream.getVideoTracks(),
                        ...audioStream.getAudioTracks()
                    ]);
                    console.log('Combined stream tracks:', finalStream.getTracks());
                } catch (audioError) {
                    console.warn('Failed to get audio stream:', audioError);
                    // Continue with just screen recording if audio fails
                }
            }

            this.media = options.area
                ? this.createAreaRecorderMediaStream(options.area, finalStream)
                : finalStream;

            this.recorder = new MediaRecorder(this.media, {
                mimeType: recorderMimeType,
                videoBitsPerSecond: bitRate
            });

            this.recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.data.push(event.data);
                }
            };

            this.recorder.onstop = () => {
                const blob = new Blob(this.data, { type: recorderMimeType });
                const url = URL.createObjectURL(blob);
                if (onComplete) onComplete(url);
                this.cleanup();
            };

            this.startTime = Date.now();
            this.recorder.start();
            this.isInitialized = true;
            console.log('Recording started successfully');
        } catch (error) {
            this.cleanup();
            console.error('Failed to start recording:', error);
            throw error;
        }
    }

    public stop() {
        console.log('Stopping recording...');
        if (this.recorder?.state === 'recording') {
            this.recorder.stop();
        } else {
            this.cleanup();
        }
    }
}

export default Recorder; 