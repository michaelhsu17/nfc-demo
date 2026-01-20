import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getCurrentUser } from '@/lib/auth';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export async function POST(request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: '請先登入' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { success: false, error: '請選擇音檔' },
                { status: 400 }
            );
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: '檔案大小不能超過 4MB' },
                { status: 400 }
            );
        }

        // Check file type
        if (!file.type.startsWith('audio/')) {
            return NextResponse.json(
                { success: false, error: '只允許上傳音檔' },
                { status: 400 }
            );
        }

        // Upload to Vercel Blob
        const blob = await put(`audio/${user.userId}/${Date.now()}-${file.name}`, file, {
            access: 'public',
        });

        return NextResponse.json({ success: true, url: blob.url });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: '上傳失敗' },
            { status: 500 }
        );
    }
}
