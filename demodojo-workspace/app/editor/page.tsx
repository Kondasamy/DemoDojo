'use client';

import { Player } from '@remotion/player';
import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useEditorStore } from '../store/editorStore';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Video,
    Upload,
    Scissors,
    ZoomIn,
    Trash2,
    Undo2,
    Redo2
} from 'lucide-react';
import EditorLayout from '../components/editor/EditorLayout';
import { VideoComposition } from './VideoComposition';

const VideoEditor = () => {
    const {
        videoSource,
        setVideoSource,
        currentTime,
        duration,
        setCurrentTime,
        setDuration,
        zoomLevel,
        setZoomLevel,
        textOverlays,
        background,
        musicTrack,
    } = useEditorStore();

    const [isPlaying, setIsPlaying] = useState(false);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [playerRef, setPlayerRef] = useState<any>(null);

    const handleTimeUpdate = useCallback((time: number) => {
        setCurrentTime(time);
        if (playerRef) {
            playerRef.seekTo(time * 30); // Convert seconds to frames
        }
    }, [setCurrentTime, playerRef]);

    const handleDurationChange = useCallback((duration: number) => {
        setDuration(duration);
    }, [setDuration]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const video = document.createElement('video');
            video.src = url;

            video.onloadedmetadata = () => {
                setDuration(video.duration);
                setVideoSource(url);
                setIsVideoReady(true);
                setCurrentTime(0);
            };

            video.onerror = () => {
                toast.error('Error loading video file');
                setIsVideoReady(false);
            };

            video.load();
        }
    };

    const loadLatestRecording = () => {
        const source = localStorage.getItem('recordedVideo');
        if (source) {
            const video = document.createElement('video');
            video.src = source;

            video.onloadedmetadata = () => {
                setDuration(video.duration);
                setVideoSource(source);
                setIsVideoReady(true);
                setCurrentTime(0);
            };

            video.onerror = () => {
                toast.error('Error loading recorded video');
                setIsVideoReady(false);
            };

            video.load();
        } else {
            toast.error('No recent recordings found');
        }
    };

    useEffect(() => {
        if (audioRef.current && musicTrack) {
            audioRef.current.volume = musicTrack.volume;
        }
    }, [musicTrack?.volume]);

    // Handle video metadata loading
    useEffect(() => {
        if (videoSource && videoRef.current) {
            const video = videoRef.current;

            const handleLoadedMetadata = () => {
                setDuration(video.duration);
                setIsVideoReady(true);
            };

            video.addEventListener('loadedmetadata', handleLoadedMetadata);

            // If video is already loaded
            if (video.readyState >= 2) {
                handleLoadedMetadata();
            }

            return () => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [videoSource, setDuration]);

    // Update time sync between player and timeline
    useEffect(() => {
        if (playerRef) {
            playerRef.seekTo(currentTime * 30); // Convert seconds to frames
        }
    }, [currentTime, playerRef]);

    // Handle player state changes
    const handlePlayerStateChange = useCallback((state: { isPlaying: boolean; frame: number }) => {
        setIsPlaying(state.isPlaying);
        const timeInSeconds = state.frame / 30;
        if (Math.abs(timeInSeconds - currentTime) > 0.1) {
            setCurrentTime(timeInSeconds);
        }
    }, [currentTime, setCurrentTime]);

    const inputProps = useMemo(() => ({
        videoSource,
        background,
        textOverlays,
        zoomLevel,
    }), [videoSource, background, textOverlays, zoomLevel]);

    // Add play/pause handler
    const handlePlayPause = useCallback(() => {
        if (playerRef) {
            if (isPlaying) {
                playerRef.pause();
            } else {
                playerRef.play();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying, playerRef]);

    // Update the VideoTimeline component
    const VideoTimeline = () => (
        <div className="bg-white border-t border-gray-200 p-4 rounded-b-lg">
            <div className="flex items-center space-x-4">
                {/* Video Controls */}
                <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100" title="Zoom">
                        <ZoomIn className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100" title="Trim">
                        <Scissors className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100" title="Crop">
                        <span className="w-5 h-5 flex items-center justify-center font-bold">[ ]</span>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100" title="Delete">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="border-l border-gray-200 h-6 mx-2" />
                    <button className="p-2 rounded-lg hover:bg-gray-100" title="Undo">
                        <Undo2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100" title="Redo">
                        <Redo2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100">
                        <SkipBack className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handlePlayPause}
                        className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5" />
                        ) : (
                            <Play className="w-5 h-5" />
                        )}
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100">
                        <SkipForward className="w-5 h-5" />
                    </button>
                </div>

                {/* Timeline */}
                <div className="flex-1">
                    <input
                        type="range"
                        min={0}
                        max={duration}
                        value={currentTime}
                        onChange={(e) => handleTimeUpdate(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>

                {/* Time Display */}
                <div className="text-sm text-gray-600 w-32 text-right">
                    {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} /
                    {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                </div>
            </div>
        </div>
    );

    const UploadOptions = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Latest Recording */}
            <button
                onClick={loadLatestRecording}
                className="flex items-center space-x-4 p-4 bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-colors group"
            >
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors shrink-0">
                    <Video className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Load latest recording</h3>
                    <p className="text-sm text-gray-500">Supports automatic and follow-cursor zooms</p>
                </div>
            </button>

            {/* Upload Video */}
            <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-4 p-4 bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-colors group"
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="video/*"
                    className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors shrink-0">
                    <Upload className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Load a video file</h3>
                    <p className="text-sm text-gray-500">Add manual zooms and trim your video with ease</p>
                </div>
            </button>
        </div>
    );

    if (!videoSource) {
        return (
            <EditorLayout>
                <div className="flex items-center justify-center aspect-video bg-gray-100 rounded-lg">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Get Started</h2>
                        <div className="max-w-2xl mx-auto">
                            <UploadOptions />
                        </div>
                    </div>
                </div>
            </EditorLayout>
        );
    }

    return (
        <EditorLayout>
            <div className="space-y-0">
                {!isVideoReady ? (
                    <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading video...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                            <Player
                                ref={setPlayerRef}
                                component={VideoComposition}
                                durationInFrames={Math.max(1, Math.floor(duration * 30))}
                                compositionWidth={1920}
                                compositionHeight={1080}
                                fps={30}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                                controls={false}
                                loop
                                inputProps={inputProps}
                                initialFrame={Math.floor(currentTime * 30)}
                                autoPlay={false}
                                showVolumeControls={false}
                                clickToPlay={false}
                                doubleClickToFullscreen={false}
                                spaceKeyToPlayOrPause={false}
                            />
                        </div>
                        <VideoTimeline />
                    </>
                )}
            </div>
        </EditorLayout>
    );
};

export default VideoEditor; 
