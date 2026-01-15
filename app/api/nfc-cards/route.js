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
                `SELECT nc.id, nc.nfc_id, nc.video_url, nc.user_id, nc.created_at, 
                        u.username as owner_username
                 FROM nfc_cards nc
                 LEFT JOIN users u ON nc.user_id = u.id
                 ORDER BY nc.created_at DESC`
            );
        } else {
            // Regular user only sees their own cards
            result = await pool.query(
                `SELECT id, nfc_id, video_url, user_id, created_at 
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

        const { nfc_id, video_url } = await request.json();

        if (!nfc_id || !video_url) {
            return NextResponse.json(
                { success: false, error: 'nfc_id and video_url are required' },
                { status: 400 }
            );
        }

        const result = await pool.query(
            'INSERT INTO nfc_cards (nfc_id, video_url, user_id) VALUES ($1, $2, $3) RETURNING id, nfc_id, video_url, user_id, created_at',
            [nfc_id, video_url, user.userId]
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
