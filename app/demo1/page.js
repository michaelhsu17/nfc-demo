import './demo1.css'

export const metadata = {
    title: '小歐拉💛',
    description: '來幫我加油，讓我們有機會一起參加聖誕節線下活動～',
    openGraph: {
        title: '小歐拉💛',
        description: '來幫我加油，讓我們有機會一起參加聖誕節線下活動～',
        type: 'website',
        images: ['/THUMBNAIL_902D0F4F-A028-4CBE-9678-85765D7A0119.jpg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: '小歐拉💛',
        description: '來幫我加油，讓我們有機會一起參加聖誕節線下活動～',
    },
}

export default function Demo1() {
    return (
        <div className="container">
            <h1 className="name">小歐拉💛</h1>

            <div className="video-wrapper">
                <video
                    className="video"
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                >
                    <source src="/demo1.mp4" type="video/mp4" />
                </video>
            </div>

            <p className="quote">「來幫我加油，讓我們有機會一起參加聖誕節線下活動～」</p>

            <a href="https://17.live/s/u/4f4d5462-4a9f-483e-b620-9df9c13ec840" target="_blank" rel="noopener noreferrer" className="social-btn">
                加入我的直播
            </a>
        </div>
    )
}
