'use client';

import React from 'react';

interface LoadingProps {
    fadeOut: boolean;
}

const Loading: React.FC<LoadingProps> = ({ fadeOut }) => {
    return (
        <div className={`loading ${fadeOut ? 'fade-out' : ''}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff', backgroundColor: 'black' }}>
            <div className="loader"></div>
            <p className="ml-4 text-zinc-400">Loading...</p>
        </div>
    );
};

export default Loading;

