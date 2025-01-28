import React, { useState } from 'react';
import { CloudArrowUpIcon, PencilIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface PostRecordingScreenProps {
    videoUrl: string;
    onEdit: () => void;
    onRestart: () => void;
    isLight: boolean;
}

export const PostRecordingScreen: React.FC<PostRecordingScreenProps> = ({
    videoUrl,
    onEdit,
    onRestart,
    isLight,
}) => {
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadedUrl, setUploadedUrl] = useState<string>('');

    const handleUpload = async () => {
        setIsUploading(true);
        // Simulated upload progress
        for (let i = 0; i <= 100; i += 10) {
            setUploadProgress(i);
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        setUploadedUrl('https://demodojo.cloud/video/123'); // Replace with actual upload logic
        setIsUploading(false);
    };

    return (
        <div className={`space-y-6 rounded-lg p-4 ${isLight ? 'bg-gray-50' : 'bg-gray-800'}`}>
            {/* Video Preview */}
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <video
                    src={videoUrl}
                    controls
                    className="h-full w-full"
                    aria-label="Recording Preview"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
                <button
                    onClick={onEdit}
                    onKeyDown={(e) => e.key === 'Enter' && onEdit()}
                    className={`
                        flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium
                        transition-colors duration-200
                        ${isLight
                            ? 'bg-white text-gray-700 hover:bg-gray-100'
                            : 'bg-gray-700 text-white hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    `}
                    tabIndex={0}
                    aria-label="Edit Recording"
                >
                    <PencilIcon className="h-5 w-5" />
                    <span>Edit</span>
                </button>

                <button
                    onClick={onRestart}
                    onKeyDown={(e) => e.key === 'Enter' && onRestart()}
                    className={`
                        flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium
                        transition-colors duration-200
                        ${isLight
                            ? 'bg-white text-gray-700 hover:bg-gray-100'
                            : 'bg-gray-700 text-white hover:bg-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    `}
                    tabIndex={0}
                    aria-label="Discard and Restart"
                >
                    <ArrowPathIcon className="h-5 w-5" />
                    <span>Restart</span>
                </button>

                <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    onKeyDown={(e) => e.key === 'Enter' && !isUploading && handleUpload()}
                    className={`
                        flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium text-white
                        transition-colors duration-200
                        ${isUploading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    `}
                    tabIndex={0}
                    aria-label="Upload to Cloud"
                >
                    <CloudArrowUpIcon className="h-5 w-5" />
                    <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                </button>
            </div>

            {/* Upload Progress */}
            {isUploading && (
                <div className="space-y-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                            className="h-full bg-blue-600 transition-all duration-150"
                            style={{ width: `${uploadProgress}%` }}
                            role="progressbar"
                            aria-valuenow={uploadProgress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        />
                    </div>
                    <p className={`text-center text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                        Uploading... {uploadProgress}%
                    </p>
                </div>
            )}

            {/* Upload Success */}
            {uploadedUrl && (
                <div className={`rounded-md bg-green-50 p-4 ${isLight ? 'bg-opacity-50' : 'bg-opacity-10'}`}>
                    <p className={`text-center text-sm ${isLight ? 'text-green-800' : 'text-green-400'}`}>
                        Upload complete! Your video is available at:
                        <a
                            href={uploadedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 font-medium underline"
                            tabIndex={0}
                        >
                            {uploadedUrl}
                        </a>
                    </p>
                </div>
            )}
        </div>
    );
}; 