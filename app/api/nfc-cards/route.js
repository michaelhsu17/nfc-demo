import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET all nfc cards
export async function GET() {
    try {
        const result = await pool.query(
            'SELECT id, nfc_id, video_url, created_at FROM nfc_cards ORDER BY created_at DESC'
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

// POST create new nfc card
export async function POST(request) {
    try {
        const { nfc_id, video_url } = await request.json();

        if (!nfc_id || !video_url) {
            return NextResponse.json(
                { success: false, error: 'nfc_id and video_url are required' },
                { status: 400 }
            );
        }

        const result = await pool.query(
            'INSERT INTO nfc_cards (nfc_id, video_url) VALUES ($1, $2) RETURNING id, nfc_id, video_url, created_at',
            [nfc_id, video_url]
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
