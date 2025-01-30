import React from 'react';
import { Share2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import Header from '../common/Header';

const GRADIENTS = [
    { name: 'Purple Haze', value: 'linear-gradient(to right, #7928CA, #FF0080)' },
    { name: 'Ocean Blue', value: 'linear-gradient(to right, #2E3192, #1BFFFF)' },
    { name: 'Sunset', value: 'linear-gradient(to right, #FF416C, #FF4B2B)' },
    { name: 'Forest', value: 'linear-gradient(to right, #134E5E, #71B280)' },
    { name: 'Northern Lights', value: 'linear-gradient(to right, #4CA1AF, #2C3E50)' },
    { name: 'Golden Hour', value: 'linear-gradient(to right, #FFB75E, #ED8F03)' },
];

const SOLID_COLORS = [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' },
    { name: 'Purple', value: '#7928CA' },
    { name: 'Blue', value: '#2E3192' },
    { name: 'Red', value: '#FF416C' },
    { name: 'Green', value: '#71B280' },
];

interface EditorLayoutProps {
    children: React.ReactNode;
}

const EditorLayout = ({ children }: EditorLayoutProps) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Side - Video Editing */}
                    <div className="lg:col-span-2 space-y-6">
                        {children}
                    </div>

                    {/* Right Side - Settings Panel */}
                    <div className="bg-white rounded-xl p-6 space-y-6">
                        {/* Export Button */}
                        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                            <Share2 className="w-4 h-4" />
                            <span>Export video</span>
                        </button>

                        {/* Video Aspect Ratio */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-600">Video aspect ratio</label>
                            <Select defaultValue="16:9">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select aspect ratio" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="16:9">16:9</SelectItem>
                                    <SelectItem value="4:3">4:3</SelectItem>
                                    <SelectItem value="1:1">1:1</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Background Section */}
                        <div className="space-y-4">
                            <span className="text-sm text-gray-600">Background</span>

                            {/* Gradients */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Gradients</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {GRADIENTS.map((gradient, index) => (
                                        <button
                                            key={index}
                                            className="aspect-video rounded-lg cursor-pointer hover:ring-2 hover:ring-purple-500 overflow-hidden"
                                            style={{ background: gradient.value }}
                                            title={gradient.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Solid Colors */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Solid Colors</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {SOLID_COLORS.map((color, index) => (
                                        <button
                                            key={index}
                                            className="w-8 h-8 rounded-lg cursor-pointer hover:ring-2 hover:ring-purple-500"
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorLayout; 
