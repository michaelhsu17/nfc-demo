import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// 外部 app 使用
export async function GET(request, { params }) {
    const { nfc_id } = await params;

    try {
        // Get NFC card data
        const cardResult = await pool.query(
            'SELECT audio_url, user_id, emotion FROM nfc_cards WHERE nfc_id = $1',
            [nfc_id]
        );

        if (cardResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'NFC ID not found' },
                { status: 404 }
            );
        }

        const card = cardResult.rows[0];

        // Get user contents for this user
        const contentsResult = await pool.query(
            'SELECT content_url, content_type, emotion FROM user_contents WHERE user_id = $1 AND emotion = $2 ORDER BY created_at DESC',
            [card.user_id, card.emotion]
        );

        return NextResponse.json({
            success: true,
            audio_url: card.audio_url,
            user_contents: contentsResult.rows,
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
