import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
    subsets: ['latin'],
    weight: ['600', '800'],
})

export const metadata = {
    title: 'NFC Demo',
    description: 'NFC Demo 個人宣傳頁面',
}

export default function RootLayout({ children }) {
    return (
        <html lang="zh-TW">
            <body className={nunito.className}>{children}</body>
        </html>
    )
}
