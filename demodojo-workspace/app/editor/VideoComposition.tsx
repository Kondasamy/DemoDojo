import { AbsoluteFill, Video, useVideoConfig } from 'remotion';

interface VideoCompositionProps {
    videoSource: string | null;
    background: {
        type: 'color' | 'image';
        value: string;
    };
    textOverlays: Array<{
        id: string;
        text: string;
        position: { x: number; y: number };
        time: { start: number; end: number };
    }>;
    zoomLevel: number;
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
    videoSource,
    background,
    textOverlays,
    zoomLevel,
}) => {
    const { width, height } = useVideoConfig();

    return (
        <AbsoluteFill>
            {/* Background */}
            {background.type === 'color' && (
                <AbsoluteFill style={{ backgroundColor: background.value }} />
            )}
            {background.type === 'image' && (
                <AbsoluteFill>
                    <img
                        src={background.value}
                        alt="Background"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                </AbsoluteFill>
            )}

            {/* Video */}
            {videoSource && (
                <AbsoluteFill style={{ transform: `scale(${zoomLevel})` }}>
                    <Video src={videoSource} />
                </AbsoluteFill>
            )}

            {/* Text Overlays */}
            {textOverlays.map((overlay) => (
                <div
                    key={overlay.id}
                    style={{
                        position: 'absolute',
                        left: `${overlay.position.x}%`,
                        top: `${overlay.position.y}%`,
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        fontSize: '24px',
                        fontWeight: 'bold',
                    }}
                >
                    {overlay.text}
                </div>
            ))}
        </AbsoluteFill>
    );
}; 