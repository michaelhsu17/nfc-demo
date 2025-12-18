import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
    subsets: ['latin'],
    weight: ['600', '800'],
})

export const metadata = {
    title: '17 NFC',
    description: '17 NFC',
}

export default function RootLayout({ children }) {
    return (
        <html lang="zh-TW">
            <body className={nunito.className}>{children}</body>
        </html>
    )
}
