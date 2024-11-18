'use client';

import { Sidebar } from '@/elements/sideBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import PlayerComponent from '@/elements/playerComponent';
import { useState } from 'react';
import UploadComponent from '@/elements/uploadComponent';
import AiEditorComponent from '@/elements/aiEditorComponent';
import { FileText, Video } from 'lucide-react';
import { Card, CardDescription, CardTitle, CardHeader, CardContent } from '@/components/ui/card';

export default function Home() {
    const [playerInput, setPlayerInput] = useState('');
    const [fileInput, setFileInput] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState('video');

    return (
        <>
            <div className="border rounded-2xl w-[96%] mx-auto mt-4 min-h-[calc(100vh-100px)]">
                <div className="grid lg:grid-cols-5">
                    <Sidebar
                        options={['LinkedIn', 'Reddit', 'Google Bloggers', 'Tumblr', 'Google']}
                        className="hidden lg:block min-h-[calc(100vh-100px)]"
                    />
                    <div className="col-span-3 lg:col-span-4 lg:border-l">
                        <div className="h-full px-4 py-6 lg:px-8">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <div className="flex items-center justify-between mb-4">
                                    <TabsList>
                                        <TabsTrigger value="video" className="flex items-center">
                                            <Video className="mr-2 h-4 w-4" />
                                            Video
                                        </TabsTrigger>
                                        <TabsTrigger value="documents" className="flex items-center">
                                            <FileText className="mr-2 h-4 w-4" />
                                            Documents
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="video">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Video Processing</CardTitle>
                                            <CardDescription>
                                                Convert video content into engaging posts for your social platforms.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <Input
                                                placeholder="Paste YouTube URL or Video ID"
                                                value={playerInput}
                                                onChange={(e) => setPlayerInput(e.target.value)}
                                            />
                                            <PlayerComponent playerInput={playerInput} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="documents">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Document Processing</CardTitle>
                                            <CardDescription>
                                                Transform your documents into social media ready content.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex flex-col space-y-4">
                                                <Input
                                                    type="file"
                                                    onChange={(e) => setFileInput(e.target.files?.[0] ?? null)}
                                                />
                                                <UploadComponent file={fileInput} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="ai">
                                    <AiEditorComponent />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
            <div className="border rounded-2xl w-[96%] mx-auto mt-4 min-h-[calc(100vh-100px)]">
                <AiEditorComponent />
            </div>
        </>
    );
}
