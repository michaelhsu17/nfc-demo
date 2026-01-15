import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// PUT update user (admin only)
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

        if (!user.isAdmin) {
            return NextResponse.json(
                { success: false, error: '需要管理員權限' },
                { status: 403 }
            );
        }

        const { username, password, is_admin, open_id, is_deactivated } = await request.json();

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (username !== undefined) {
            updates.push(`username = $${paramIndex++}`);
            values.push(username);
        }
        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            updates.push(`password_hash = $${paramIndex++}`);
            values.push(passwordHash);
        }
        if (is_admin !== undefined) {
            updates.push(`is_admin = $${paramIndex++}`);
            values.push(is_admin);
        }
        if (open_id !== undefined) {
            updates.push(`open_id = $${paramIndex++}`);
            values.push(open_id);
        }
        if (is_deactivated !== undefined) {
            updates.push(`is_deactivated = $${paramIndex++}`);
            values.push(is_deactivated);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { success: false, error: '沒有要更新的欄位' },
                { status: 400 }
            );
        }

        values.push(id);
        const result = await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} 
             RETURNING id, username, is_admin, open_id, is_deactivated, created_at, updated_at`,
            values
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: '找不到此使用者' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: result.rows[0] });
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

// DELETE (deactivate) user (admin only)
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

        if (!user.isAdmin) {
            return NextResponse.json(
                { success: false, error: '需要管理員權限' },
                { status: 403 }
            );
        }

        // Prevent self-deactivation
        if (parseInt(id) === user.userId) {
            return NextResponse.json(
                { success: false, error: '無法停用自己的帳號' },
                { status: 400 }
            );
        }

        const result = await pool.query(
            `UPDATE users SET is_deactivated = true WHERE id = $1 
             RETURNING id, username, is_admin, is_deactivated`,
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: '找不到此使用者' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
