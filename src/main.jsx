import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import Demo2 from './Demo2.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/demo1" element={<App />} />
                    <Route path="/demo2" element={<Demo2 />} />
                    <Route path="*" element={<Navigate to="/demo1" replace />} />
                </Routes>
            </BrowserRouter>
        </HelmetProvider>
    </StrictMode>,
)
