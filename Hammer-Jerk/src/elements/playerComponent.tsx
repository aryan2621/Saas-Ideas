'use client';

import { Button } from '@/components/ui/button';
import { googleYoutubeOAuthConfig } from '@/config/oauth';
import { OAuthButton } from './oauthButton';
import { Video } from 'lucide-react';
import { useAuthStore } from '@/context/store';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import ky from 'ky';

const YOUTUBE_BASE_URL = 'https://www.youtube.com/embed/';
interface PlayerComponentProps {
    playerInput: string;
}
interface Caption {
    id: string;
    snippet: {
        language: string;
        lastUpdated: string;
        trackKind: string;
        name: string;
        audioTrackType: string;
        isAutoSynced: boolean;
        status: string;
    };
}

const PlayerComponent = ({ playerInput }: PlayerComponentProps) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([\w-]+)|^[\w-]{11}$/;
    const match = playerInput.match(regex);
    const videoId = match ? match[1] || match[0] : playerInput ? playerInput : 'dQw4w9WgXcQ';
    const { toast } = useToast();

    const getVideoAnalysis = async () => {
        const response = await ky.get(`/api/get-video-analysis?videoId=${videoId}`).json();
        console.log(response);
    };
    const getAudio = async () => {
        const response = await ky
            .post(`/api/get-audio`, {
                json: { videoId },
            })
            .blob();
        console.log(response);
    };
    return (
        <>
            <div className="mx-auto rounded-lg overflow-hidden mt-2 mb-2">
                <iframe
                    height={500}
                    id="player"
                    className="w-full aspect-video"
                    src={`${YOUTUBE_BASE_URL}${videoId}?enablejsapi=1&version=3`}
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
            <div className="flex justify-center items-center mt-2">
                <Button onClick={getVideoAnalysis}>Get Video Analysis</Button>
                <Button onClick={getAudio}>Get Audio</Button>
            </div>
        </>
    );
};

export default PlayerComponent;
