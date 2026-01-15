import { cookies } from 'next/headers';
import pool from './db';

/**
 * Get current user from session cookie
 * @returns {Promise<{userId: number, username: string, isAdmin: boolean} | null>}
 */
export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');

        if (!sessionCookie) {
            return null;
        }

        const sessionData = JSON.parse(
            Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
        );

        // Check if session is expired (7 days)
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - sessionData.createdAt > sevenDaysMs) {
            return null;
        }

        return {
            userId: sessionData.userId,
            username: sessionData.username,
            isAdmin: sessionData.isAdmin
        };
    } catch {
        return null;
    }
}

/**
 * Require authentication - returns user or throws response
 * @returns {Promise<{userId: number, username: string, isAdmin: boolean}>}
 */
export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        throw { status: 401, message: '請先登入' };
    }
    return user;
}

/**
 * Require admin role - returns user or throws response
 * @returns {Promise<{userId: number, username: string, isAdmin: boolean}>}
 */
export async function requireAdmin() {
    const user = await requireAuth();
    if (!user.isAdmin) {
        throw { status: 403, message: '需要管理員權限' };
    }
    return user;
}

/**
 * Get full user data from database
 * @param {number} userId
 * @returns {Promise<object | null>}
 */
export async function getUserById(userId) {
    try {
        const result = await pool.query(
            'SELECT id, username, is_admin, open_id, is_deactivated, created_at, updated_at FROM users WHERE id = $1',
            [userId]
        );
        return result.rows[0] || null;
    } catch {
        return null;
    }
}
