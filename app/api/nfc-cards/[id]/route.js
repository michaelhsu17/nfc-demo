import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// PUT update nfc card
export async function PUT(request, { params }) {
    const { id } = await params;

    try {
        const { nfc_id, video_url } = await request.json();

        if (!nfc_id || !video_url) {
            return NextResponse.json(
                { success: false, error: 'nfc_id and video_url are required' },
                { status: 400 }
            );
        }

        const result = await pool.query(
            'UPDATE nfc_cards SET nfc_id = $1, video_url = $2 WHERE id = $3 RETURNING id, nfc_id, video_url, created_at',
            [nfc_id, video_url, id]
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
        const result = await pool.query(
            'DELETE FROM nfc_cards WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Record not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
