import React from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/tailwind.css';
import Popup from './Popup';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
    <React.StrictMode>
        <div className="w-96 h-[600px] bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <Popup />
            <ToastContainer position="bottom-center" theme="colored" />
        </div>
    </React.StrictMode>
); 