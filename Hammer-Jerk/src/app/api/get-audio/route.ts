// import { NextResponse } from 'next/server';
// import ytdl from '@distube/ytdl-core';
// import ffmpeg from 'fluent-ffmpeg';
// import ffmpegStatic from 'ffmpeg-static';
// import { PassThrough } from 'stream';
// import { AssemblyAI } from 'assemblyai';

// export const runtime = 'nodejs';
// const client = new AssemblyAI({
//     apiKey: process.env.ASSEMBLYAI_API_KEY!,
// });
// const ffmpegPath = ffmpegStatic;
// if (!ffmpegPath) {
//     throw new Error('ffmpeg-static path not found');
// }
// ffmpeg.setFfmpegPath(ffmpegPath);

// export async function POST(request: Request) {
//     try {
//         const { videoId } = await request.json();
//         if (!videoId) {
//             return new NextResponse('Video ID is required', { status: 400 });
//         }
//         if (!ytdl.validateID(videoId)) {
//             return new NextResponse('Invalid YouTube video ID', { status: 400 });
//         }
//         const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
//         try {
//             await ytdl.getInfo(videoUrl);
//         } catch (error) {
//             return new NextResponse('Video not found or not accessible', { status: 404 });
//         }
//         const videoStream = ytdl(videoUrl, {
//             quality: 'highestaudio',
//             filter: 'audioonly',
//         });
//         const passThroughStream = new PassThrough();
//         const command = ffmpeg(videoStream)
//             .toFormat('mp3')
//             .audioBitrate(128)
//             .on('error', (err) => {
//                 console.error('FFmpeg error:', err);
//                 passThroughStream.emit('error', err);
//             })
//             .on('end', () => {
//                 console.log('FFmpeg processing finished');
//             });
//         command.pipe(passThroughStream);

//         const readableStream = new ReadableStream({
//             start(controller) {
//                 passThroughStream.on('data', (chunk) => {
//                     controller.enqueue(chunk);
//                 });

//                 passThroughStream.on('end', () => {
//                     controller.close();
//                 });

//                 passThroughStream.on('error', (err) => {
//                     console.error('Stream error:', err);
//                     controller.error(err);
//                 });
//             },
//             cancel() {
//                 passThroughStream.destroy();
//             },
//         });

//         const headers = new Headers({
//             'Content-Type': 'audio/mpeg',
//             'Content-Disposition': `attachment; filename="youtube-audio-${videoId}.mp3"`,
//             'Cache-Control': 'no-cache',
//         });

//         return new NextResponse(readableStream, { headers });
//     } catch (error) {
//         console.error('Error converting video to audio:', error);
//         return new NextResponse('Error converting video to audio', { status: 500 });
//     }
// }

// /**
//  * // Start by making sure the `assemblyai` package is installed.
// // If not, you can install it by running the following command:
// // npm install assemblyai

// import { AssemblyAI } from 'assemblyai';

// const client = new AssemblyAI({
//   apiKey: '1cd36d33142740d782bc6a8f1e6432cd',
// });

// const FILE_URL =
//   'https://assembly.ai/sports_injuries.mp3';

// // You can also transcribe a local file by passing in a file path
// // const FILE_URL = './path/to/file.mp3';

// // Request parameters
// const data = {
//   audio: FILE_URL
// }

// const run = async () => {
//   const transcript = await client.transcripts.transcribe(data);
//   console.log(transcript.text);
// };

// run();

//  */
import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { PassThrough } from 'stream';
import { AssemblyAI } from 'assemblyai';

export const runtime = 'nodejs';

// Initialize AssemblyAI client
const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

// Set up FFmpeg
const ffmpegPath = ffmpegStatic;
if (!ffmpegPath) {
    throw new Error('ffmpeg-static path not found');
}
ffmpeg.setFfmpegPath(ffmpegPath);

export async function POST(request: Request) {
    try {
        // Validate input
        const { videoId } = await request.json();
        if (!videoId) {
            return new NextResponse('Video ID is required', { status: 400 });
        }
        if (!ytdl.validateID(videoId)) {
            return new NextResponse('Invalid YouTube video ID', { status: 400 });
        }

        // Verify video accessibility
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        try {
            await ytdl.getInfo(videoUrl);
        } catch (error) {
            return new NextResponse('Video not found or not accessible', { status: 404 });
        }

        // Process video to audio
        const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            const videoStream = ytdl(videoUrl, {
                quality: 'highestaudio',
                filter: 'audioonly',
            });

            const passThroughStream = new PassThrough();

            // Set up FFmpeg processing
            ffmpeg(videoStream)
                .toFormat('mp3')
                .audioBitrate(128)
                .on('error', (error) => {
                    console.error('FFmpeg processing error:', error);
                    reject(error);
                })
                .on('end', () => {
                    console.log('FFmpeg processing completed successfully');
                    // Combine all chunks into a single buffer only after FFmpeg is done
                    const finalBuffer = Buffer.concat(chunks);
                    resolve(finalBuffer);
                })
                .pipe(passThroughStream);

            // Collect audio chunks
            passThroughStream.on('data', (chunk) => {
                chunks.push(Buffer.from(chunk));
            });

            passThroughStream.on('error', (error) => {
                console.error('Stream error:', error);
                reject(error);
            });

            // Handle video stream errors
            videoStream.on('error', (error) => {
                console.error('Video stream error:', error);
                reject(error);
            });
        });

        // Only proceed to AssemblyAI after successful FFmpeg processing
        console.log('Starting AssemblyAI processing...');

        // Create audio blob from the complete buffer
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

        // Upload to AssemblyAI
        const uploadResponse = await client.files.upload(audioBlob);
        if (!uploadResponse) {
            throw new Error('Failed to upload audio file to AssemblyAI');
        }

        // Start transcription
        console.log('Starting transcription...');
        const transcript = await client.transcripts.transcribe({
            audio: uploadResponse,
            language_detection: true,
            speaker_labels: true,
            entity_detection: true,
            auto_chapters: true,
        });

        // Wait for and get transcription results
        console.log('Waiting for transcription to complete...');
        const result = await client.transcripts.get(transcript.id);

        // Return successful response
        return NextResponse.json({
            status: 'success',
            transcription: {
                text: result.text,
                confidence: result.confidence,
                language: result.language_code,
                words: result.words,
                speakers: result.speaker_labels,
                entities: result.entities,
                chapters: result.chapters,
                duration: result.audio_duration,
                utterances: result.utterances,
            },
        });
    } catch (error) {
        console.error('Error processing request:', error);
        return new NextResponse(error instanceof Error ? error.message : 'Error processing request', { status: 500 });
    }
}
