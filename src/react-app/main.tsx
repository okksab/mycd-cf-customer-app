import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// PWA Service Worker Registration - commented out for build
// import { registerSW } from 'virtual:pwa-register'

// const updateSW = registerSW({
//   onNeedRefresh() {
//     console.log('New content available, please refresh.')
//   },
//   onOfflineReady() {
//     console.log('App ready to work offline')
//   },
// })

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// PWA Install Prompt Handler
let deferredPrompt: any
window.addEventListener('beforeinstallprompt', (e: any) => {
  console.log('PWA install prompt available')
  e.preventDefault()
  deferredPrompt = e
  
  // Show custom install button
  showInstallPromotion()
})

function showInstallPromotion() {
  // Create install button if it doesn't exist
  if (!document.getElementById('pwa-install-btn')) {
    const installBtn = document.createElement('button')
    installBtn.id = 'pwa-install-btn'
    installBtn.innerHTML = '📱 Install App'
    installBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #003B71;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,59,113,0.3);
      z-index: 1000;
      transition: all 0.3s ease;
    `
    
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log(`User response to install prompt: ${outcome}`)
        deferredPrompt = null
        installBtn.remove()
      }
    })
    
    document.body.appendChild(installBtn)
  }
}
