import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET all nfc cards (filtered by user if not admin)
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: '請先登入' },
                { status: 401 }
            );
        }

        let result;
        if (user.isAdmin) {
            // Admin sees all cards with owner info
            result = await pool.query(
                `SELECT nc.id, nc.nfc_id, nc.audio_url, nc.user_id, nc.viewer_open_id, nc.viewer_user_id, nc.created_at, 
                        u.username as owner_username,
                        u.open_id as owner_open_id
                 FROM nfc_cards nc
                 LEFT JOIN users u ON nc.user_id = u.id
                 ORDER BY nc.created_at DESC`
            );
        } else {
            // Regular user only sees their own cards
            result = await pool.query(
                `SELECT id, nfc_id, audio_url, user_id, viewer_open_id, viewer_user_id, created_at 
                 FROM nfc_cards 
                 WHERE user_id = $1 
                 ORDER BY created_at DESC`,
                [user.userId]
            );
        }

        return NextResponse.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST create new nfc card
export async function POST(request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: '請先登入' },
                { status: 401 }
            );
        }

        const { nfc_id, audio_url, target_user_id, viewer_open_id, viewer_user_id } = await request.json();

        if (!nfc_id || !viewer_open_id || !viewer_user_id) {
            return NextResponse.json(
                { success: false, error: 'nfc_id, viewer_open_id 和 viewer_user_id 都是必填欄位' },
                { status: 400 }
            );
        }

        // Admin can specify target user, others can only create for themselves
        let ownerId = user.userId;
        if (target_user_id && user.isAdmin) {
            ownerId = parseInt(target_user_id);
        }

        const result = await pool.query(
            'INSERT INTO nfc_cards (nfc_id, audio_url, user_id, viewer_open_id, viewer_user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, nfc_id, audio_url, user_id, viewer_open_id, viewer_user_id, created_at',
            [nfc_id, audio_url || null, ownerId, viewer_open_id, viewer_user_id]
        );

        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
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
