'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { uploadDocument } from '@/utils/firebase';
import { Card, CardHeader, CardFooter, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertCircle, CheckCircle2, X, FileIcon, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface UploadComponentProps {
    file: File | null;
    maxSizeMB?: number;
    allowedFileTypes?: string[];
    onUploadComplete?: (url: string) => void;
    onError?: (error: string) => void;
}

export default function UploadComponent({
    file,
    maxSizeMB = 10,
    allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png'],
    onUploadComplete,
    onError,
}: UploadComponentProps) {
    const [url, setUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);

    const validateFile = useCallback(
        (file: File): string | null => {
            if (!allowedFileTypes.includes(file.type)) {
                return `Invalid file type. Allowed types: ${allowedFileTypes
                    .map((type) => type.split('/')[1])
                    .join(', ')}`;
            }
            if (file.size > maxSizeMB * 1024 * 1024) {
                return `File size must be less than ${maxSizeMB}MB`;
            }
            return null;
        },
        [allowedFileTypes, maxSizeMB],
    );

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleRetry = async () => {
        setError(null);
        setUrl(null);
        await uploadFiles();
    };

    const uploadFiles = async () => {
        if (!file) return;

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            onError?.(validationError);
            return;
        }

        setIsLoading(true);
        setProgress(0);
        try {
            await uploadDocument(
                file,
                (progress) => {
                    setProgress(progress);
                },
                (url) => {
                    setUrl(url);
                    onUploadComplete?.(url);
                },
            );
            setError(null);
        } catch (err) {
            const errorMessage = 'Failed to upload file. Please try again.';
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!file) return;
        uploadFiles();
    }, [file]);

    if (!file) return null;

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Upload Document</CardTitle>
                        <CardDescription>Upload and preview your document here</CardDescription>
                    </div>
                    {url && (
                        <Badge variant="outline" className="px-2 py-1">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Uploaded
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Uploading {file.name}</span>
                            <span>{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                        <p className="text-sm text-muted-foreground text-center">
                            {formatFileSize(file.size)} | {file.type.split('/')[1].toUpperCase()}
                        </p>
                    </div>
                ) : error ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : url ? (
                    <div className="space-y-4">
                        <div className="relative overflow-hidden rounded-md border">
                            {file.type.includes('pdf') ? (
                                <embed src={url} className="w-full h-[300px] rounded-md" />
                            ) : (
                                <img src={url} alt="Preview" className="w-full h-[300px] object-cover rounded-md" />
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                <Button variant="secondary" size="sm" asChild>
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                        View Full Document
                                    </a>
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <FileIcon className="w-4 h-4" />
                                <span className="truncate max-w-[200px]">{file.name}</span>
                            </div>
                            <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                        </div>
                    </div>
                ) : (
                    <div
                        className={`flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-md transition-colors ${
                            isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                        }`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragOver(true);
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                    >
                        <Upload className="w-8 h-8 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            Drag and drop your file here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Supported formats:{' '}
                            {allowedFileTypes.map((type) => type.split('/')[1].toUpperCase()).join(', ')}
                        </p>
                        <p className="text-xs text-muted-foreground">Maximum size: {maxSizeMB}MB</p>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex gap-2">
                {error ? (
                    <Button onClick={handleRetry} className="w-full" size="lg">
                        Try Again
                    </Button>
                ) : (
                    <Button
                        onClick={uploadFiles}
                        className="w-full transition-all duration-300 ease-in-out transform hover:scale-105"
                        size="lg"
                        disabled={isLoading || !file || !!url}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : url ? (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Document Uploaded
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Document
                            </>
                        )}
                    </Button>
                )}
                {(url || error) && (
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                            setUrl(null);
                            setError(null);
                            setProgress(0);
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
