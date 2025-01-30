'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Record & Edit',
    description: 'Record your screen and edit with our powerful video editor',
    icon: '🎥'
  },
  {
    title: 'Add Text & Overlays',
    description: 'Customize your video with text overlays and annotations',
    icon: '✍️'
  },
  {
    title: 'Background Music',
    description: 'Choose from our collection of royalty-free music tracks',
    icon: '🎵'
  },
  {
    title: 'Custom Backgrounds',
    description: 'Add beautiful backgrounds and gradients to your videos',
    icon: '🎨'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="DemoDojo Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-purple-600">DemoDojo</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/editor')}
            className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
          >
            Open Editor
          </motion.button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Create Amazing Screen Recordings
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Record, edit, and enhance your screen recordings with our powerful yet simple video editor
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/editor')}
            className="px-8 py-3 bg-purple-600 text-white rounded-full text-lg hover:bg-purple-700 transition-colors"
          >
            Start Editing Now
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20 max-w-4xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 text-center text-gray-600">
        <p>© 2025 DemoDojo. All rights reserved.</p>
      </footer>
    </div>
  );
}
