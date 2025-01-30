import { create } from 'zustand';

interface EditorState {
    videoSource: string | null;
    currentTime: number;
    duration: number;
    segments: {
        id: string;
        startTime: number;
        endTime: number;
    }[];
    textOverlays: {
        id: string;
        text: string;
        position: { x: number; y: number };
        time: { start: number; end: number };
    }[];
    logoOverlay: {
        url: string | null;
        position: { x: number; y: number };
    };
    background: {
        type: 'color' | 'image';
        value: string;
    };
    musicTrack: {
        url: string | null;
        volume: number;
    };
    zoomLevel: number;
    setVideoSource: (source: string) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    addSegment: (segment: { startTime: number; endTime: number }) => void;
    removeSegment: (id: string) => void;
    addTextOverlay: (overlay: Omit<EditorState['textOverlays'][0], 'id'>) => void;
    removeTextOverlay: (id: string) => void;
    setLogoOverlay: (overlay: EditorState['logoOverlay']) => void;
    setBackground: (background: EditorState['background']) => void;
    setMusicTrack: (track: EditorState['musicTrack']) => void;
    setZoomLevel: (level: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    videoSource: null,
    currentTime: 0,
    duration: 0,
    segments: [],
    textOverlays: [],
    logoOverlay: {
        url: null,
        position: { x: 0, y: 0 },
    },
    background: {
        type: 'color',
        value: '#000000',
    },
    musicTrack: {
        url: null,
        volume: 1,
    },
    zoomLevel: 1,

    setVideoSource: (source) => set({ videoSource: source }),
    setCurrentTime: (time) => set({ currentTime: time }),
    setDuration: (duration) => set({ duration }),
    addSegment: (segment) =>
        set((state) => ({
            segments: [...state.segments, { id: crypto.randomUUID(), ...segment }],
        })),
    removeSegment: (id) =>
        set((state) => ({
            segments: state.segments.filter((segment) => segment.id !== id),
        })),
    addTextOverlay: (overlay) =>
        set((state) => ({
            textOverlays: [...state.textOverlays, { id: crypto.randomUUID(), ...overlay }],
        })),
    removeTextOverlay: (id) =>
        set((state) => ({
            textOverlays: state.textOverlays.filter((overlay) => overlay.id !== id),
        })),
    setLogoOverlay: (overlay) => set({ logoOverlay: overlay }),
    setBackground: (background) => set({ background }),
    setMusicTrack: (track) => set({ musicTrack: track }),
    setZoomLevel: (level) => set({ zoomLevel: level }),
})); 