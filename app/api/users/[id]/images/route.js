import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET images for a specific user
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
            'SELECT id, image_url, created_at FROM user_images WHERE user_id = $1 ORDER BY created_at DESC',
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

// POST add new image for a user
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

        const { image_url } = await request.json();

        if (!image_url) {
            return NextResponse.json(
                { success: false, error: '請提供圖片網址' },
                { status: 400 }
            );
        }

        const result = await pool.query(
            'INSERT INTO user_images (user_id, image_url) VALUES ($1, $2) RETURNING id, image_url, created_at',
            [userId, image_url]
        );

        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE an image
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
        const imageId = searchParams.get('imageId');

        if (!imageId) {
            return NextResponse.json(
                { success: false, error: '請提供圖片 ID' },
                { status: 400 }
            );
        }

        const result = await pool.query(
            'DELETE FROM user_images WHERE id = $1 AND user_id = $2 RETURNING id',
            [imageId, userId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: '找不到此圖片' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: '圖片已刪除' });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
