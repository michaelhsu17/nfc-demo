import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET all users (admin only)
export async function GET() {
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
            `SELECT id, username, is_admin, open_id, is_deactivated, created_at, updated_at 
             FROM users 
             ORDER BY created_at DESC`
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

// POST create new user (admin only)
export async function POST(request) {
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

        const { username, password, is_admin, open_id } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { success: false, error: '帳號和密碼為必填' },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (username, password_hash, is_admin, open_id) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, username, is_admin, open_id, is_deactivated, created_at, updated_at`,
            [username, passwordHash, is_admin || false, open_id || null]
        );

        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Database error:', error);
        if (error.code === '23505') {
            return NextResponse.json(
                { success: false, error: '此帳號已存在' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
