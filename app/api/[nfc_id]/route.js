import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
    const { nfc_id } = await params;

    try {
        const result = await pool.query(
            'SELECT video_url FROM nfc_cards WHERE nfc_id = $1',
            [nfc_id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'NFC ID not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            video_url: result.rows[0].video_url,
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
