import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Settings, HelpCircle, Star } from 'lucide-react';

const Header = () => {
    return (
        <header className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src="/logo.svg"
                            alt="DemoDojo Logo"
                            width={32}
                            height={32}
                            className="w-8 h-8"
                        />
                        <span className="text-xl font-bold text-purple-600">DemoDojo</span>
                    </Link>

                    {/* Right side buttons */}
                    <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="Settings">
                            <Settings className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="Help">
                            <HelpCircle className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="Save">
                            <Star className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 