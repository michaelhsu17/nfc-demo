import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');

        if (!sessionCookie) {
            return NextResponse.json(
                { success: false, error: '未登入' },
                { status: 401 }
            );
        }

        try {
            const sessionData = JSON.parse(
                Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
            );

            // Check if session is expired (7 days)
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - sessionData.createdAt > sevenDaysMs) {
                return NextResponse.json(
                    { success: false, error: 'Session 已過期' },
                    { status: 401 }
                );
            }

            return NextResponse.json({
                success: true,
                data: {
                    userId: sessionData.userId,
                    username: sessionData.username,
                    isAdmin: sessionData.isAdmin
                }
            });
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid session' },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json(
            { success: false, error: '驗證失敗' },
            { status: 500 }
        );
    }
}
