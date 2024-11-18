import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { fireStorage } from '@/config/firebase';

export const uploadDocument = async (file: File, onProgress: (progress: number) => void, onComplete: (url: string) => void) => {
    try {
        const r = ref(fireStorage, `documents/${file.size}_${new Date().getTime()}`);
        const uploadTask = uploadBytesResumable(r, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                console.log(error);
            },
            async () => {
                console.log('Upload completed');
                const downloadURL = await getDownloadURL(r);
                console.log(downloadURL, 'downloadURL');
                onComplete(downloadURL);
            },
        );
    } catch (error) {
        console.log(`Failed to upload document: ${error}`);
        throw error;
    }
};
