import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { username, password, rememberMe } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { success: false, error: '請輸入帳號和密碼' },
                { status: 400 }
            );
        }

        // Find user by username
        const result = await pool.query(
            'SELECT id, username, password_hash, is_admin, is_deactivated FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: '帳號或密碼錯誤' },
                { status: 401 }
            );
        }

        const user = result.rows[0];

        // Check if user is deactivated
        if (user.is_deactivated) {
            return NextResponse.json(
                { success: false, error: '此帳號已被停用' },
                { status: 403 }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return NextResponse.json(
                { success: false, error: '帳號或密碼錯誤' },
                { status: 401 }
            );
        }

        // Create session token (simple implementation using user id + timestamp)
        const sessionData = {
            userId: user.id,
            username: user.username,
            isAdmin: user.is_admin,
            createdAt: Date.now()
        };

        const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');

        // Set cookie expiry (7 days if remember me, otherwise session only)
        const maxAge = rememberMe ? 60 * 60 * 24 * 7 : undefined;

        const response = NextResponse.json({
            success: true,
            data: {
                username: user.username,
                isAdmin: user.is_admin
            }
        });

        response.cookies.set('session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge,
            path: '/'
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: '登入失敗，請稍後再試' },
            { status: 500 }
        );
    }
}
