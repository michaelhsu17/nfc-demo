import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Check if user can access this card (owner or admin)
async function canAccessCard(user, cardId) {
    if (user.isAdmin) return true;

    const result = await pool.query(
        'SELECT user_id FROM nfc_cards WHERE id = $1',
        [cardId]
    );

    if (result.rows.length === 0) return false;
    return result.rows[0].user_id === user.userId;
}

// PUT update nfc card
export async function PUT(request, { params }) {
    const { id } = await params;

    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: '請先登入' },
                { status: 401 }
            );
        }

        // Check permission
        const hasAccess = await canAccessCard(user, id);
        if (!hasAccess) {
            return NextResponse.json(
                { success: false, error: '無權限編輯此卡片' },
                { status: 403 }
            );
        }

        const { audio_url, viewer_open_id, viewer_user_id } = await request.json();

        if (!viewer_open_id || !viewer_user_id) {
            return NextResponse.json(
                { success: false, error: 'viewer_open_id 和 viewer_user_id 都是必填欄位' },
                { status: 400 }
            );
        }

        const result = await pool.query(
            'UPDATE nfc_cards SET audio_url = $1, viewer_open_id = $2, viewer_user_id = $3 WHERE id = $4 RETURNING id, nfc_id, audio_url, user_id, viewer_open_id, viewer_user_id, created_at',
            [audio_url || null, viewer_open_id, viewer_user_id, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Record not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Database error:', error);
        if (error.code === '23505') {
            return NextResponse.json(
                { success: false, error: 'NFC ID already exists' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE nfc card
export async function DELETE(request, { params }) {
    const { id } = await params;

    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: '請先登入' },
                { status: 401 }
            );
        }

        // Check permission
        const hasAccess = await canAccessCard(user, id);
        if (!hasAccess) {
            return NextResponse.json(
                { success: false, error: '無權限刪除此卡片' },
                { status: 403 }
            );
        }

        // First get the audio_url to delete from blob storage
        const cardResult = await pool.query(
            'SELECT audio_url FROM nfc_cards WHERE id = $1',
            [id]
        );

        if (cardResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Record not found' },
                { status: 404 }
            );
        }

        const audioUrl = cardResult.rows[0].audio_url;

        // Delete from database
        await pool.query('DELETE FROM nfc_cards WHERE id = $1', [id]);

        // Delete audio file from Vercel Blob if exists
        if (audioUrl) {
            try {
                await del(audioUrl);
            } catch (blobError) {
                console.error('Failed to delete blob:', blobError);
                // Continue even if blob deletion fails
            }
        }

        return NextResponse.json({ success: true, message: '刪除成功' });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
