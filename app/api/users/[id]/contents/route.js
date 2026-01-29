import { NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const VALID_EMOTIONS = ['happy', 'angry', 'sad', 'joy'];

// GET contents for a specific user
export async function GET(request, { params }) {
    const { id: userId } = await params;

    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: '請先登入' },
                { status: 401 }
            );
        }

        if (!user.isAdmin) {
            return NextResponse.json(
                { success: false, error: '需要管理員權限' },
                { status: 403 }
            );
        }

        const result = await pool.query(
            'SELECT id, content_url, content_type, emotion, created_at FROM user_contents WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        return NextResponse.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST upload new content (image or video) for a specific emotion
export async function POST(request, { params }) {
    const { id: userId } = await params;

    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: '請先登入' },
                { status: 401 }
            );
        }

        if (!user.isAdmin) {
            return NextResponse.json(
                { success: false, error: '需要管理員權限' },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const contentType = formData.get('content_type'); // 'image' or 'video'
        const emotion = formData.get('emotion'); // 'happy', 'angry', 'sad', 'joy'

        if (!file) {
            return NextResponse.json(
                { success: false, error: '請選擇檔案' },
                { status: 400 }
            );
        }

        if (!contentType || !['image', 'video'].includes(contentType)) {
            return NextResponse.json(
                { success: false, error: '請選擇內容類型（圖片或影片）' },
                { status: 400 }
            );
        }

        if (!emotion || !VALID_EMOTIONS.includes(emotion)) {
            return NextResponse.json(
                { success: false, error: '請選擇有效的情緒（happy, angry, sad, joy）' },
                { status: 400 }
            );
        }

        // Check if emotion already exists for this user
        const existingResult = await pool.query(
            'SELECT id, content_url FROM user_contents WHERE user_id = $1 AND emotion = $2',
            [userId, emotion]
        );

        // If exists, delete old blob
        if (existingResult.rows.length > 0) {
            try {
                await del(existingResult.rows[0].content_url);
            } catch (blobError) {
                console.error('Blob delete error:', blobError);
            }
            // Delete old record
            await pool.query('DELETE FROM user_contents WHERE id = $1', [existingResult.rows[0].id]);
        }

        // Upload to Vercel Blob
        const blob = await put(`user-contents/${userId}/${emotion}-${Date.now()}-${file.name}`, file, {
            access: 'public',
        });

        // Save to database
        const result = await pool.query(
            'INSERT INTO user_contents (user_id, content_url, content_type, emotion) VALUES ($1, $2, $3, $4) RETURNING id, content_url, content_type, emotion, created_at',
            [userId, blob.url, contentType, emotion]
        );

        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: '上傳失敗' },
            { status: 500 }
        );
    }
}

// DELETE a content
export async function DELETE(request, { params }) {
    const { id: userId } = await params;

    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: '請先登入' },
                { status: 401 }
            );
        }

        if (!user.isAdmin) {
            return NextResponse.json(
                { success: false, error: '需要管理員權限' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const contentId = searchParams.get('contentId');

        if (!contentId) {
            return NextResponse.json(
                { success: false, error: '請提供內容 ID' },
                { status: 400 }
            );
        }

        // Get content URL first
        const contentResult = await pool.query(
            'SELECT content_url FROM user_contents WHERE id = $1 AND user_id = $2',
            [contentId, userId]
        );

        if (contentResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: '找不到此內容' },
                { status: 404 }
            );
        }

        // Delete from Vercel Blob
        try {
            await del(contentResult.rows[0].content_url);
        } catch (blobError) {
            console.error('Blob delete error:', blobError);
        }

        // Delete from database
        await pool.query(
            'DELETE FROM user_contents WHERE id = $1 AND user_id = $2',
            [contentId, userId]
        );

        return NextResponse.json({ success: true, message: '內容已刪除' });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
