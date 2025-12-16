import { Helmet } from 'react-helmet-async'
import './Demo2.css'

function Demo2() {
    return (
        <>
            <Helmet>
                <title>💊小毒藥JJ🎙️</title>
                <meta name="description" content="來幫我加油，讓我們有機會一起參加聖誕節線下活動～" />
                <meta property="og:title" content="💊小毒藥JJ🎙️" />
                <meta property="og:description" content="來幫我加油，讓我們有機會一起參加聖誕節線下活動～" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="/THUMBNAIL_692569BD-4FC9-4371-A529-D43F808DA6D1.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="💊小毒藥JJ🎙️" />
                <meta name="twitter:description" content="來幫我加油，讓我們有機會一起參加聖誕節線下活動～" />
            </Helmet>
            <div className="container-2">
                <h1 className="name-2">💊小毒藥JJ🎙️</h1>

                <div className="video-wrapper-2">
                    <video
                        className="video-2"
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                    >
                        <source src="/demo2.mp4" type="video/mp4" />
                    </video>
                </div>

                <p className="quote-2">「來幫我加油，讓我們有機會一起參加聖誕節線下活動～」</p>

                <a href="https://17.live/s/u/ee20b4d2-de99-456e-912a-c221f92e9dd1" target="_blank" rel="noopener noreferrer" className="social-btn-2">
                    加入我的直播
                </a>
            </div>
        </>
    )
}

export default Demo2
