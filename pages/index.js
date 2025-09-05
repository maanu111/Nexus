"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function Home() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Simple lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Add animated color cycling
    let colorTime = 0;
    const updateAmbientColor = () => {
      colorTime += 0.02;
      const r = Math.sin(colorTime) * 0.5 + 0.5;
      const g = Math.sin(colorTime + 2) * 0.5 + 0.5;
      const b = Math.sin(colorTime + 4) * 0.5 + 0.5;
      ambientLight.color.setRGB(r, g, b);
    };

    // Create pulsing point lights
    const pointLight1 = new THREE.PointLight(0x00ffff, 2, 10);
    pointLight1.position.set(1, 1, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 10);
    pointLight2.position.set(-1, 1, 2);
    scene.add(pointLight2);

    // Animate the lights
    let lightTime = 0;
    const updatePointLights = () => {
      lightTime += 0.05;
      pointLight1.intensity = Math.sin(lightTime) * 0.5 + 1;
      pointLight2.intensity = Math.sin(lightTime + Math.PI) * 0.5 + 1;
    };
    const spotLight = new THREE.SpotLight(0xffffff, 2, 20, Math.PI / 6, 0.1);
    spotLight.position.set(0, 5, 3);
    scene.add(spotLight);
    scene.add(spotLight.target);
    const directional = new THREE.DirectionalLight(0xffffff, 1.5);
    directional.position.set(5, 10, 5);
    scene.add(directional);

    // Controls (no default cursor)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    // Store original positions when models load
    const storeOriginalPositions = () => {
      originalCameraPosition.copy(camera.position);
      originalCameraTarget.copy(controls.target);
    };

    // Reset function with smooth animation
    const resetToOriginal = () => {
      if (isResetting) return;
      isResetting = true;

      const startPosition = camera.position.clone();
      const startTarget = controls.target.clone();
      const duration = 2500; // 2.5 seconds
      const startTime = Date.now();

      const animateReset = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth easing
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Interpolate camera position
        camera.position.lerpVectors(
          startPosition,
          originalCameraPosition,
          eased
        );
        controls.target.lerpVectors(startTarget, originalCameraTarget, eased);
        controls.update();

        if (progress < 1) {
          requestAnimationFrame(animateReset);
        } else {
          isResetting = false;
        }
      };

      animateReset();
    };

    // Detect user interaction
    const onControlsChange = () => {
      if (isResetting) return;

      clearTimeout(resetTimeout);
      resetTimeout = setTimeout(resetToOriginal, 2500);
    };

    controls.addEventListener("change", onControlsChange);

    // Declare all variables at the top
    let mixer;
    let model;
    let customCursor;
    let loadingScreen;
    let navbar;
    let backToTopBtn;
    let modelPreview;
    let demonPreview;
    let scrollIndicator;
    let hudOverlay;
    let leftInfos;
    let heroTitle;
    let rightInfos;
    let isLoading = true;
    let currentModel = "demon";
    let onResize;
    let detectManualScroll;
    let keydownHandler;
    let scrollIndicatorTimeout;
    let noScrollTimeout;
    let firstBox;
    let secondBox;
    const clock = new THREE.Clock();
    // Auto-reset functionality variables
    let resetTimeout;
    let originalCameraPosition = new THREE.Vector3();
    let originalCameraTarget = new THREE.Vector3();
    let isResetting = false;
    let footerToggle;
    let footerOverlay;
    let isFooterOpen = false;

    // Create simple loading screen
    loadingScreen = document.createElement("div");
    loadingScreen.className = "loading-screen";
    loadingScreen.innerHTML = `
      <div class="loading-content">
        <span class="loading-text">◆ ENTER THE NEXUS</span>
      </div>
    `;
    document.body.appendChild(loadingScreen);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      /* Custom Nevera font */
      @font-face {
        font-family: 'Nevera';
        src: url('/fonts/Nevera-Regular.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      /* Hero Title Styles */
.hero-title {
  position: fixed;
  left: 3%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  font-family: 'Nevera', 'Orbitron', monospace;
  font-size: clamp(40px, 8vw, 150px);
  font-weight: 100;
  color: #00ff41;
  letter-spacing: clamp(2px, 0.5vw, 8px);
  text-shadow: 
    0 0 10px #00ff41,
    0 0 20px #00ff41,
    0 0 40px #00ff41,
    0 0 80px #00ff41;
  opacity: 1;
  transition: opacity 1.5s ease-out;
  pointer-events: none;
  white-space: nowrap;
  animation: hero-glow-pulse 3s ease-in-out infinite alternate, hero-glitch 4s infinite;
}

.hero-title.fade-out {
  opacity: 0;
}

@keyframes hero-glow-pulse {
  0% { 
    text-shadow: 
      0 0 10px #00ff41,
      0 0 20px #00ff41,
      0 0 40px #00ff41,
      0 0 80px #00ff41;
  }
  100% { 
    text-shadow: 
      0 0 15px #00ff41,
      0 0 30px #00ff41,
      0 0 60px #00ff41,
      0 0 120px #00ff41,
      0 0 200px rgba(0, 255, 65, 0.3);
  }
}

@keyframes hero-glitch {
  0%, 95%, 100% { 
    transform: translateY(-50%) translate(0, 0);
    filter: hue-rotate(0deg);
  }
  96% { 
    transform: translateY(-50%) translate(-2px, 1px);
    filter: hue-rotate(90deg);
  }
  97% { 
    transform: translateY(-50%) translate(2px, -2px);
    filter: hue-rotate(-90deg);
  }
  98% { 
    transform: translateY(-50%) translate(-1px, 2px);
    filter: hue-rotate(180deg);
  }
}
      /* Simple Loading Screen */
      .loading-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999999999;
        transition: opacity 1s ease-out, visibility 1s ease-out;
      }

      .loading-screen.hide {
        opacity: 0;
        visibility: hidden;
      }

      .loading-content { text-align: center; }

      .loading-text {
        font-family: 'Nevera', 'Orbitron', 'Audiowide', monospace;
       font-size: clamp(20px, 4vw, 32px);
        font-weight: 100;
        letter-spacing: 4px;
        color: white;
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        animation: glow-pulse 2s ease-in-out infinite alternate;
      }

      @keyframes glow-pulse {
        0% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.5); opacity: 0.8; }
        100% { text-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.3); opacity: 1; }
      }

      /* ═══════════════ FUTURISTIC WHITE HUD OVERLAY ═══════════════ */
      .hud-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 1000;
        overflow: hidden;
      }
        .first-box {
  opacity: 0;
  transform: translateX(-100px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.first-box.show {
  opacity: 1;
  transform: translateX(0);
}

.second-box {
  opacity: 0;
  transform: translateX(-100px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.second-box.show {
  opacity: 1;
  transform: translateX(0);
}
.left-infographics {
  position: fixed;
  left: clamp(10px, 3vw, 30px);
  top: 50%;
  transform: translateY(-50%);
  width: clamp(200px, 25vw, 280px);
  z-index: 1001;
}
.info-text-container {
  padding: 20px;
  margin-bottom: 20px;
   position: relative;
}
/* Glitch effect for info containers */
.info-text-container::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  animation: glitch 4s infinite;
  pointer-events: none;
}
.info-header {
  font-family: 'Nevera', 'Orbitron', monospace;
  font-size: clamp(10px, 1.5vw, 14px);
  font-weight: 100;
  color: #FFFFFF;
  letter-spacing: 3px;
  margin-bottom: 15px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  padding-bottom: 8px;
  position: relative;
}
  .info-header::before {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  color: #ff0080;
  animation: text-glitch 3s infinite;
}
  .info-line {
  font-family: 'Orbitron', monospace;
font-size: clamp(9px, 1.2vw, 11px);
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.info-value {
  color: #FFFFFF;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  animation: white-value-flicker 2s ease-in-out infinite alternate;
}
/* C++ Coding Animation + Text Scrambling */
.text-line {
  margin-bottom: 8px;
  position: relative;
  animation: text-glitch-effect 3s infinite;
  overflow: hidden;
  min-height: 20px;
}

.text-line.coding {
  animation: none;
}

.text-line.coding::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  color: #00ff41;
  text-shadow: 
    0 0 3px #00ff41,
    0 0 6px #00ff41,
    0 0 9px #00ff41;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  white-space: nowrap;
  animation: cpp-compile 4s ease-out forwards;
}

.text-line:nth-child(1).coding::before {
  animation: cpp-compile-1 4s ease-out forwards;
}

.text-line:nth-child(2).coding::before {
  animation: cpp-compile-2 4.5s ease-out forwards;
  animation-delay: 0.3s;
}

.text-line:nth-child(3).coding::before {
  animation: cpp-compile-3 5s ease-out forwards;
  animation-delay: 0.6s;
}

.text-line:nth-child(4).coding::before {
  animation: cpp-compile-4 5.5s ease-out forwards;
  animation-delay: 0.9s;
}

@keyframes cpp-compile-1 {
  0% { content: "> loading combat_profile.exe..."; }
  10% { content: "class Assassin { int eliminations;"; }
  15% { content: "string specialization = 'SILENT';"; }
  20% { content: "Assassin kuro(847, 'KURO-01');"; }
  30% { content: "Loading... [████████] 100%"; }
  40% { content: "Profile loaded: KURO-01"; }
  55% { content: "◆ D3S1GN4T10N: K#R0-@1"; }
  70% { content: "◆ DESIGNATION: KURO-01"; }
  100% { content: "◆ DESIGNATION: KURO-01"; }
}
@keyframes cpp-compile-2 {
  0% { content: "> compiling classification.cpp..."; }
  10% { content: "enum AgentType { STEALTH,"; }
  15% { content: "ASSAULT, OPERATIVE };"; }
  20% { content: "AgentType type = STEALTH;"; }
  25% { content: "string role = \"OPERATIVE\";"; }
  30% { content: "Linking... [██░░░░░░] 25%"; }
  35% { content: "Linking... [████████] 100%"; }
  40% { content: "Execution complete!"; }
  45% { content: "Result: STEALTH OPERATIVE"; }
  55% { content: "◆ CL455: ST34LTH 0P3R4T1V3"; }
  70% { content: "◆ CLASS: STEALTH OPERATIVE"; }
  100% { content: "◆ CLASS: STEALTH OPERATIVE"; }
}

@keyframes cpp-compile-3 {
  0% { content: "> running status_check.exe..."; }
  10% { content: "bool isActive() {"; }
  15% { content: "  return system_online &&"; }
  20% { content: "  mission_ready; }"; }
  25% { content: "Status check: RUNNING..."; }
  30% { content: "All systems: ONLINE"; }
  35% { content: "Mission ready: TRUE"; }
  40% { content: "Return: ACTIVE"; }
  55% { content: "◆ ST4TU5: 4CT1V3"; }
  70% { content: "◆ STATUS: ACTIVE"; }
  100% { content: "◆ STATUS: ACTIVE"; }
}

@keyframes cpp-compile-4 {
  0% { content: "> calculating threat_level.cpp..."; }
  10% { content: "int calculateThreat() {"; }
  15% { content: "  int combat = 95;"; }
  20% { content: "  int stealth = 98;"; }
  25% { content: "  int lethality = 100;"; }
  30% { content: "  return MAX_LEVEL; }"; }
  35% { content: "Threat assessment: CRITICAL"; }
  40% { content: "Classification: EXTREME"; }
  45% { content: "WARNING: MAX CAUTION"; }
  55% { content: "◆ THR34T L3V3L: 3XTR3M3"; }
  70% { content: "◆ THREAT LEVEL: EXTREME"; }
  100% { content: "◆ THREAT LEVEL: EXTREME"; }
}

/* Terminal cursor blink effect */
.text-line.coding::after {
  content: "█";
  animation: cursor-blink 1s infinite;
  color: #00ff41;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}


      /* White Theme Info Panel Styles */
      .info-panel {
        background: linear-gradient(135deg, 
          rgba(255, 255, 255, 0.12) 0%, 
          rgba(255, 255, 255, 0.08) 50%, 
          rgba(255, 255, 255, 0.15) 100%
        );
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 20px;
        backdrop-filter: blur(15px);
        box-shadow: 
          0 0 30px rgba(255, 255, 255, 0.2),
          inset 0 0 20px rgba(255, 255, 255, 0.05);
        position: relative;
        overflow: hidden;
        animation: white-panel-glow 3s ease-in-out infinite alternate;
      }

      @keyframes white-panel-glow {
        0% { 
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.05);
        }
        100% { 
          border-color: rgba(255, 255, 255, 0.7);
          box-shadow: 0 0 50px rgba(255, 255, 255, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.1);
        }
      }

      


      /* White Progress bars */
      .progress-bar {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        margin-top: 8px;
        overflow: hidden;
        position: relative;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, 
          rgba(255, 255, 255, 0.8) 0%, 
          rgba(255, 255, 255, 1) 50%, 
          rgba(255, 255, 255, 0.9) 100%
        );
        border-radius: 2px;
        position: relative;
        animation: white-progress-pulse 2s ease-in-out infinite alternate;
      }

      @keyframes white-progress-pulse {
        0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.4); }
        100% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.8); }
      }

      .progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, 
          transparent 0%, 
          rgba(255, 255, 255, 0.6) 50%, 
          transparent 100%
        );
        animation: white-progress-shine 3s linear infinite;
      }

      @keyframes white-progress-shine {
        0% { left: -100%; }
        100% { left: 100%; }
      }

      /* Special white alert panels */
      .alert-panel {
      
       animation: white-alert-pulse 1.5s ease-in-out infinite alternate;
      }

      @keyframes white-alert-pulse {
        0% { 
          border-color: rgba(255, 255, 255, 0.6);
          }
        100% { 
          border-color: rgba(255, 255, 255, 0.9);
         }
      }

      .success-panel {
        background: linear-gradient(135deg, 
          rgba(255, 255, 255, 0.18) 0%, 
          rgba(255, 255, 255, 0.12) 100%
        );
        border: 2px solid rgba(255, 255, 255, 0.5);
        animation: white-success-glow 2s ease-in-out infinite alternate;
      }

      @keyframes white-success-glow {
        0% { 
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }
        100% { 
          border-color: rgba(255, 255, 255, 0.8);
          box-shadow: 0 0 40px rgba(255, 255, 255, 0.4);
        }
      }

      /* White Mission objective styles */
      .objective-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.8);
      }

      .objective-check {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.9);
        margin-right: 10px;
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
        animation: white-check-pulse 2s ease-in-out infinite alternate;
      }

      .objective-check.pending {
        background: rgba(255, 255, 255, 0.3);
        box-shadow: 0 0 4px rgba(255, 255, 255, 0.2);
        animation: none;
      }

      @keyframes white-check-pulse {
        0% { transform: scale(1); opacity: 0.8; }
        100% { transform: scale(1.1); opacity: 1; }
      }

      /* Hide default cursor globally */
      *, *::before, *::after { cursor: none !important; }

      /* Custom cursor styles */
      .custom-cursor {
        position: fixed !important;
       width: clamp(15px, 2vw, 20px) !important;
  height: clamp(15px, 2vw, 20px) !important;
        border: 2px solid white !important;
        border-radius: 50% !important;
        background: transparent !important;
        pointer-events: none !important;
        z-index: 999999999 !important;
        transform: translate(-50%, -50%) !important;
        transition: all 0.1s ease-out !important;
        opacity: 0.8 !important;
        mix-blend-mode: difference !important;
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.3) !important;
        backdrop-filter: blur(2px) !important;
      }

      .custom-cursor.hover {
        transform: translate(-50%, -50%) scale(2) !important;
        opacity: 1 !important;
        border-width: 2px !important;
        box-shadow: 0 0 25px rgba(255, 255, 255, 0.6) !important;
      }

      .custom-cursor.click {
        transform: translate(-50%, -50%) scale(0.8) !important;
        border-width: 4px !important;
      }

      /* Back to top button animations */
      @keyframes pulse-glow {
        0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
        50% { box-shadow: 0 0 0 15px rgba(255, 255, 255, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
      }
      
      .back-to-top-show {
        opacity: 1 !important;
        transform: translateY(0) scale(1) !important;
        animation: pulse-glow 2s infinite !important;
      }
      
      .back-to-top-hover {
        transform: translateY(-5px) scale(1.1) !important;
        box-shadow: 0 10px 30px rgba(255, 255, 255, 0.3) !important;
        background: rgba(255, 255, 255, 0.1) !important;
      }

      /* Model Preview Styles with Background Images */
     .model-preview {
  position: fixed;
  bottom: clamp(120px, 18vh, 180px);
  right: clamp(15px, 3vw, 30px);
  width: clamp(150px, 20vw, 200px);
  height: clamp(112px, 15vw, 150px);
        background: linear-gradient(
          135deg, 
          rgba(0, 0, 0, 0.3) 0%, 
          rgba(0, 20, 0, 0.4) 50%, 
          rgba(0, 0, 0, 0.6) 100%
        ), url('/Kuro-1.png') center/cover;
        border: 2px solid white;
        border-radius: 10px;
        backdrop-filter: blur(10px);
        opacity: 0;
        transform: translateY(50px) scale(0.8);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 999999;
        cursor: pointer;
        overflow: hidden;
        box-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
        pointer-events: auto;
      }

      .demon-preview {
        background: linear-gradient(
          135deg, 
          rgba(0, 0, 0, 0.3) 0%, 
          rgba(20, 0, 0, 0.4) 50%, 
          rgba(0, 0, 0, 0.6) 100%
        ), url('/Demon-Head.png') center/cover !important;
      }

      .model-preview.preview-show { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }

      .model-preview:hover {
        transform: translateY(-5px) scale(1.05);
        box-shadow: 0 0 40px rgba(255, 255, 255, 0.4);
        border-color: rgba(255, 255, 255, 0.8);
      }

      .preview-content { 
        padding: 2px; 
        text-align: center; 
        height: 100%; 
        display: flex; 
        flex-direction: column; 
        justify-content: flex-end;
        position: relative;
        z-index: 2;
        background: linear-gradient(
          to top,
          rgba(0, 0, 0, 0.8) 0%,
          rgba(0, 0, 0, 0.4) 50%,
          transparent 100%
        );
      }

      .preview-title {
        font-family: 'Nevera', 'Orbitron', monospace;
        font-size: 14px;
        font-weight: 100;
        color: white;
        letter-spacing: 2px;
        margin-bottom: 8px;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
      }

      /* Floating Text Navbar Styles */
      .nav-container { display: flex; align-items: center; justify-content: space-between; height: 100%; padding: 0 50px; max-width: 1600px; margin: 0 auto; }
      .nav-brand { display: flex; flex-direction: column; align-items: flex-start; }

      .brand-text {
        font-family: 'Nevera', 'Orbitron', monospace;
       font-size: clamp(16px, 2.5vw, 22px);
        font-weight: 100;
        color: white;
        letter-spacing: 4px;
        text-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
        animation: luxury-glow 4s ease-in-out infinite alternate;
      }
      .brand-subtitle { font-size: 9px; color: rgba(255, 255, 255, 0.5); letter-spacing: 4px; margin-top: -1px; font-weight: 100; }

      @keyframes luxury-glow {
        0% { text-shadow: 0 0 15px rgba(255, 255, 255, 0.4); opacity: 0.9; }
        100% { text-shadow: 0 0 25px rgba(255, 255, 255, 0.7), 0 0 35px rgba(255, 255, 255, 0.2); opacity: 1; }
      }

      .nav-menu { display: flex; gap: 40px; align-items: center; }

      .nav-item {
        display: flex; align-items: center; text-decoration: none; color: white; padding: 12px 20px; border-radius: 4px;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); position: relative; overflow: hidden; border: none; background: transparent;
      }
      .nav-item:hover { border: none; background: transparent; transform: translateY(-2px); box-shadow: none; backdrop-filter: none; }

      .nav-text {
        font-family: 'Orbitron', 'Audiowide', monospace;
        font-size: clamp(10px, 1.3vw, 12px);
        font-weight: 100; 
        letter-spacing: 2px;
         opacity: 0.85;
          transition: all 0.3s ease;
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
      }
      .nav-item:hover .nav-text { opacity: 1; text-shadow: 0 0 12px rgba(255, 255, 255, 0.6); transform: scale(1.05); }

      .nav-profile { display: flex; align-items: center; gap: 15px; padding: 10px 20px; background: transparent; border-radius: 30px; border: none; transition: all 0.4s ease; }
      .nav-profile:hover { background: transparent; transform: scale(1.02); box-shadow: none; }
      .profile-avatar { width: 28px; height: 28px; background: transparent; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: rgba(255, 255, 255, 0.7); border: none; text-shadow: 0 0 8px rgba(255, 255, 255, 0.4); }
      .profile-name { font-family: 'Orbitron', 'Audiowide', monospace; font-size: 11px; font-weight: 100; color: white; letter-spacing: 2px; opacity: 0.8; text-shadow: 0 0 8px rgba(255, 255, 255, 0.3); }

      .navbar-show { opacity: 1 !important; visibility: visible !important; }

      @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .navbar-show .nav-item { animation: fade-in-up 0.6s ease forwards; opacity: 0; }
      .navbar-show .nav-item:nth-child(1) { animation-delay: 0.1s; }
      .navbar-show .nav-item:nth-child(2) { animation-delay: 0.15s; }
      .navbar-show .nav-item:nth-child(3) { animation-delay: 0.2s; }
      .navbar-show .nav-item:nth-child(4) { animation-delay: 0.25s; }
      .navbar-show .nav-item:nth-child(5) { animation-delay: 0.3s; }
      .navbar-show .nav-brand    { animation: fade-in-up 0.8s ease forwards; animation-delay: 0.05s; }
      .navbar-show .nav-profile  { animation: fade-in-up 0.6s ease forwards; animation-delay: 0.35s; }

      /* ───────── Scroll Indicator: ONLY a circle that moves UP (no line) ───────── */
      .scroll-indicator {
        position: fixed;
         right: clamp(15px, 3vw, 30px);
  bottom: clamp(240px, 35vh, 300px);
  width: clamp(20px, 3vw, 28px);
  height: clamp(120px, 20vh, 160px);
        z-index: 999999;
        pointer-events: none;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        filter: drop-shadow(0 0 10px rgba(255,255,255,0.35));
      }
      .scroll-indicator-show { opacity: 1 !important; transform: translateY(0) scale(1) !important; }

      .scroll-indicator .scroll-wheel {
        position: absolute;
        left: 50%;
        top: 75%;
        width: 14px;
        height: 14px;
        border: 2px solid #fff;
        border-radius: 50%;
        background: black;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 18px rgba(255, 255, 255, 0.6);
        animation-name: wheel-up-fade;
        animation-duration: 1.6s;
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        animation-iteration-count: infinite;
        animation-direction: normal;
      }

      @keyframes wheel-up-fade {
        0% { 
          top: 75%; 
          opacity: 1;
        }
        50% {
          opacity: 0.1;
        }
        100% { 
          top: 25%; 
          opacity: 0;
        }
      }
/* Model Text Styles - Neon Green */
.model-text {
  position: fixed;
  z-index: 10000;
  pointer-events: none;
  font-family: 'Nevera', 'Orbitron', monospace;
font-size: clamp(12px, 1.8vw, 17px);
  color: #00ff41;
  text-shadow: 
    0 0 2px #00ff41,
    0 0 2px #00ff41,
  letter-spacing: 2px;
  line-height: 1.6;
  opacity: 0;
  transition: opacity 0.5s ease;
  animation: neon-pulse 2s ease-in-out infinite alternate;
}

.model-text.show {
  opacity: 1;
}

.text-line {
  margin-bottom: 8px;
  position: relative;
  animation: text-glitch-effect 3s infinite;
}

.text-line::before {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  color: #39ff14;
  text-shadow: 
    0 0 2px #39ff14,
    0 0 2px #39ff14,
  animation: glitch-flicker 2s infinite;
}

@keyframes neon-pulse {
 0% { 
    text-shadow: 
      0 0 2px #00ff41,
      0 0 4px #00ff41,
      0 0 6px #00ff41;
  }
 100% { 
    text-shadow: 
      0 0 3px #00ff41,
      0 0 6px #00ff41,
      0 0 9px #00ff41;
  }
}

@keyframes text-glitch-effect {
  0%, 95%, 100% { transform: translate(0, 0); }
  96% { transform: translate(-1px, 0); }
  97% { transform: translate(1px, -1px); }
  98% { transform: translate(-1px, 1px); }
}

@keyframes glitch-flicker {
  0%, 90%, 100% { opacity: 0; }
  91% { opacity: 0.8; }
  93% { opacity: 0.5; }
  95% { opacity: 0; }
}

/* FOOTER TOGGLE BUTTON */
.footer-toggle {
  position: fixed;
  bottom: clamp(20px, 3vh, 30px);
  left: clamp(20px, 3vw, 30px);
  z-index: 9999999;
  cursor: none;
}

.toggle-circle {
  width: clamp(40px, 5vw, 60px);
  height: clamp(40px, 5vw, 60px);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: footer-toggle-pulse 3s ease-in-out infinite;
  box-shadow: 
    0 0 20px rgba(255, 255, 255, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
}

.toggle-circle:hover {
  transform: scale(1.2);
  border-color: rgba(255, 255, 255, 1);
  box-shadow: 
    0 0 30px rgba(255, 255, 255, 0.6),
    inset 0 0 30px rgba(255, 255, 255, 0.2);
}

.toggle-arrow {
  font-size: clamp(16px, 2.5vw, 24px);
  color: white;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  animation: arrow-bounce 2s ease-in-out infinite;
}

@keyframes footer-toggle-pulse {
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(255, 255, 255, 0.3),
      inset 0 0 20px rgba(255, 255, 255, 0.1);
  }
  50% {
    box-shadow: 
      0 0 40px rgba(255, 255, 255, 0.5),
      inset 0 0 30px rgba(255, 255, 255, 0.2);
  }
}

@keyframes arrow-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
}

/* FOOTER OVERLAY */
.footer-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 70vh;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border-top: 2px solid rgba(255, 255, 255, 0.3);
  z-index: 99999999;
  transform: translateY(100%);
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 0;
  visibility: hidden;
}

.footer-overlay.show {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.footer-content {
  padding: clamp(30px, 5vh, 50px) clamp(20px, 4vw, 50px);
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 1400px;
  margin: 0 auto;
}

.footer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(30px, 4vh, 40px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 20px;
}

.footer-title {
  font-family: 'Nevera', 'Orbitron', monospace;
  font-size: clamp(20px, 3vw, 32px);
  color: white;
  letter-spacing: clamp(2px, 0.4vw, 4px);
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
  animation: footer-title-glow 2s ease-in-out infinite alternate;
}

.footer-close {
  width: clamp(35px, 4vw, 50px);
  height: clamp(35px, 4vw, 50px);
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: none;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
}

.footer-close:hover {
  border-color: rgba(255, 255, 255, 1);
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.close-arrow {
  font-size: clamp(14px, 2vw, 20px);
  color: white;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: clamp(30px, 4vw, 50px);
  flex: 1;
}

.footer-section h3 {
  font-family: 'Nevera', 'Orbitron', monospace;
  font-size: clamp(14px, 1.8vw, 18px);
  color: white;
  margin-bottom: clamp(15px, 2vh, 20px);
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 8px;
}

.footer-section a {
  display: block;
  font-family: 'Orbitron', monospace;
  font-size: clamp(11px, 1.3vw, 14px);
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  margin-bottom: clamp(8px, 1vh, 12px);
  letter-spacing: 1px;
  transition: all 0.3s ease;
  cursor: none;
  padding: 4px 0;
}

.footer-section a:hover {
  color: white;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
  transform: translateX(8px);
}

.footer-bottom-info {
  margin-top: auto;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-bottom-info span {
  font-family: 'Orbitron', monospace;
  font-size: clamp(10px, 1.1vw, 12px);
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1px;
}

@keyframes footer-title-glow {
  0% { text-shadow: 0 0 15px rgba(255, 255, 255, 0.6); }
  100% { text-shadow: 0 0 25px rgba(255, 255, 255, 0.8), 0 0 35px rgba(255, 255, 255, 0.4); }
}

.creator-name {
  font-family: 'Nevera', 'Orbitron', monospace;
  font-size: clamp(18px, 3vw, 32px);
  color: rgba(255, 255, 255, 0.15);
  text-shadow: 
    0 0 20px rgba(255, 255, 255, 0.3),
    0 0 40px rgba(255, 255, 255, 0.2),
    0 0 60px rgba(255, 255, 255, 0.1);
  letter-spacing: clamp(2px, 0.5vw, 6px);
  margin-bottom: 15px;
  animation: shadow-pulse 4s ease-in-out infinite alternate;
  text-align: center;
  font-weight: 100;
}

@keyframes shadow-pulse {
  0% { 
    opacity: 0.3;
    text-shadow: 
      0 0 20px rgba(255, 255, 255, 0.2),
      0 0 40px rgba(255, 255, 255, 0.1);
  }
  100% { 
    opacity: 0.6;
    text-shadow: 
      0 0 30px rgba(255, 255, 255, 0.4),
      0 0 60px rgba(255, 255, 255, 0.3),
      0 0 80px rgba(255, 255, 255, 0.2);
  }
}

   /* Responsive breakpoints */
@media (max-width: 480px) {
  .hero-title {
    left: 2%;
    font-size: clamp(24px, 8vw, 40px);
    letter-spacing: clamp(1px, 0.3vw, 3px);
  }
  
  .left-infographics {
    left: 5px;
    width: clamp(160px, 35vw, 200px);
  }
  
  .info-text-container {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .nav-container {
    padding: 0 10px;
    flex-direction: column;
    height: auto;
    min-height: 60px;
  }
  
  .nav-menu {
    gap: 15px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .model-preview {
    bottom: clamp(30px, 6vh, 50px);
    right: 5px;
    width: clamp(100px, 22vw, 140px);
    height: clamp(75px, 16vw, 105px);
  }
    .footer-toggle {
  bottom: 15px;
  left: 15px;
}
}

@media (min-width: 481px) and (max-width: 768px) {
  .hero-title {
    left: 2.5%;
    font-size: clamp(35px, 7vw, 80px);
  }
  
  .left-infographics {
    left: 8px;
    width: clamp(180px, 28vw, 240px);
  }
  
  .nav-container {
    padding: 0 15px;
  }
  
  .nav-menu {
    gap: 25px;
    flex-wrap: wrap;
  }
  
  .model-preview {
    bottom: clamp(50px, 8vh, 70px);
    right: 8px;
    width: clamp(130px, 20vw, 170px);
    height: clamp(97px, 15vw, 127px);
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .hero-title {
    font-size: clamp(60px, 8vw, 120px);
  }
  
  .left-infographics {
    width: clamp(220px, 25vw, 260px);
  }
}

@media (min-width: 1400px) {
  .hero-title {
    font-size: clamp(120px, 10vw, 180px);
    letter-spacing: clamp(6px, 0.8vw, 12px);
  }
  
  .left-infographics {
    width: clamp(280px, 20vw, 320px);
  }
  
  .model-preview {
    width: clamp(200px, 15vw, 250px);
    height: clamp(150px, 11vw, 187px);
  }
}     
    `;
    document.head.appendChild(style);

    // Create custom cursor element (but don't show during loading)
    customCursor = document.createElement("div");
    customCursor.className = "custom-cursor";
    customCursor.style.display = "none"; // Hide during loading
    document.body.appendChild(customCursor);

    // Track mouse movement
    const updateCursor = (e) => {
      if (customCursor && !isLoading) {
        customCursor.style.left = e.clientX + "px";
        customCursor.style.top = e.clientY + "px";
      }
    };
    document.addEventListener("mousemove", updateCursor);
    const disableRightClick = (e) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener("contextmenu", disableRightClick);

    // Create HUD Overlay with White Futuristic Infographics
    hudOverlay = document.createElement("div");
    hudOverlay.className = "hud-overlay";
    hudOverlay.innerHTML = `
  <div class="left-infographics">
    <!-- First Box -->
    <div class="first-box info-text-container">
      <div class="info-header" data-text="◆ SPECIMEN">◆ SPECIMEN</div>
      <div class="info-line">TYPE: <span class="info-value">HYBRID</span></div>
      <div class="info-line">HEIGHT: <span class="info-value">8.2M</span></div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 90%;"></div>
      </div>
    </div>

    <!-- Second Box -->
    <div class="second-box info-text-container alert-panel">
      <div class="info-header" data-text="☠ DANGER">☠ DANGER</div>
      <div class="info-line">JAW REACH: <span class="info-value">TORSO</span></div>
      <div class="threat-level">EXTREME</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 100%;"></div>
      </div>
    </div>
  </div>
`;

    firstBox = hudOverlay.querySelector(".first-box");
    secondBox = hudOverlay.querySelector(".second-box");
    document.body.appendChild(hudOverlay);

    // Get references to infographic containers
    leftInfos = hudOverlay.querySelector(".left-infographics");

    // Create hero title
    heroTitle = document.createElement("div");
    heroTitle.className = "hero-title";
    heroTitle.textContent = "KURO-01";
    heroTitle.style.display = "none"; // Initially hidden during loading
    document.body.appendChild(heroTitle);

    // Create beautiful back to top button
    backToTopBtn = document.createElement("button");
    backToTopBtn.innerHTML = "↑";
    backToTopBtn.style.position = "fixed";
    backToTopBtn.style.bottom = "clamp(40px, 6vh, 60px)";
    backToTopBtn.style.right = "clamp(20px, 3vw, 30px)";
    backToTopBtn.style.width = "clamp(45px, 6vw, 60px)";
    backToTopBtn.style.height = "clamp(45px, 6vw, 60px)";
    backToTopBtn.style.backgroundColor = "transparent";
    backToTopBtn.style.color = "white";
    backToTopBtn.style.border = "2px solid white";
    backToTopBtn.style.borderRadius = "50%";
    backToTopBtn.style.fontSize = "20px";
    backToTopBtn.style.fontWeight = "bold";
    backToTopBtn.style.zIndex = "999999";
    backToTopBtn.style.opacity = "0";
    backToTopBtn.style.transform = "translateY(20px) scale(0.8)";
    backToTopBtn.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
    backToTopBtn.style.backdropFilter = "blur(10px)";
    backToTopBtn.style.display = "flex";
    backToTopBtn.style.alignItems = "center";
    backToTopBtn.style.justifyContent = "center";

    // Create scroll indicator (ONLY the circle)
    scrollIndicator = document.createElement("div");
    scrollIndicator.className = "scroll-indicator";
    scrollIndicator.innerHTML = `
      <div class="scroll-wheel"></div>
    `;

    // Create floating text navbar
    navbar = document.createElement("nav");
    navbar.innerHTML = `
      <div class="nav-container">
        <div class="nav-brand">
          <span class="brand-text">NEXUS</span>
          <span class="brand-subtitle">LUXURY GAMING</span>
        </div>
        <div class="nav-menu">
          <a href="#" class="nav-item"><span class="nav-text">BATTLE ARENA</span></a>
          <a href="#" class="nav-item"><span class="nav-text">LEADERBOARDS</span></a>
          <a href="#" class="nav-item"><span class="nav-text">TOURNAMENTS</span></a>
          <a href="#" class="nav-item"><span class="nav-text">ELITE MISSIONS</span></a>
          <a href="#" class="nav-item"><span class="nav-text">VIP LOUNGE</span></a>
        </div>
        <div class="nav-profile">
          <div class="profile-avatar"><span>◆</span></div>
          <span class="profile-name">ELITE PLAYER</span>
        </div>
      </div>
    `;
    navbar.style.position = "fixed";
    navbar.style.top = "0";
    navbar.style.left = "0";
    navbar.style.width = "100%";
    navbar.style.height = "70px";
    navbar.style.background = "transparent";
    navbar.style.zIndex = "9999999";
    navbar.style.opacity = "0";
    navbar.style.visibility = "hidden";
    navbar.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    navbar.style.pointerEvents = "auto";

    // Kuro model preview (shows when demon model is active)
    modelPreview = document.createElement("div");
    modelPreview.id = "kuro-preview";
    modelPreview.className = "model-preview";
    modelPreview.innerHTML = `
      <div class="preview-content">
        <div class="preview-title">KURO-01</div>
      </div>
    `;

    // Demon model preview (shows when fantasy island model is active)
    demonPreview = document.createElement("div");
    demonPreview.id = "demon-preview";
    demonPreview.className = "model-preview demon-preview";
    demonPreview.innerHTML = `
      <div class="preview-content">
        <div class="preview-title">Zyvorath</div>
      </div>
    `;

    // Append all DOM elements
    document.body.appendChild(navbar);
    document.body.appendChild(backToTopBtn);
    document.body.appendChild(modelPreview);
    document.body.appendChild(demonPreview);
    document.body.appendChild(scrollIndicator);
    // Create footer toggle button
    footerToggle = document.createElement("div");
    footerToggle.className = "footer-toggle";
    footerToggle.style.opacity = "0";
    footerToggle.style.transform = "translateY(20px) scale(0.8)";
    footerToggle.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
    footerToggle.innerHTML = `
  <div class="toggle-circle">
    <span class="toggle-arrow">↑</span>
  </div>
`;
    document.body.appendChild(footerToggle);
    // Create footer overlay
    footerOverlay = document.createElement("div");
    footerOverlay.className = "footer-overlay";
    footerOverlay.innerHTML = `
  <div class="footer-content">
    <div class="footer-header">
      <span class="footer-title">◆ NEXUS COMMAND CENTER</span>
      <div class="footer-close">
        <span class="close-arrow">↓</span>
      </div>
    </div>
    
    <div class="footer-grid">
      <div class="footer-section">
        <h3>BATTLE ARENA</h3>
        <a href="#">Combat Modes</a>
        <a href="#">Elite Tournaments</a>
        <a href="#">Global Rankings</a>
        <a href="#">Tactical Analysis</a>
      </div>
      
      <div class="footer-section">
        <h3>OPERATIONS</h3>
        <a href="#">Mission Briefings</a>
        <a href="#">Intel Reports</a>
        <a href="#">Equipment Cache</a>
        <a href="#">Training Protocols</a>
      </div>
      
      <div class="footer-section">
        <h3>NEXUS NETWORK</h3>
        <a href="#">Secure Comms</a>
        <a href="#">Agent Directory</a>
        <a href="#">Command Updates</a>
        <a href="#">Emergency Contact</a>
      </div>
    </div>
    
    <div class="footer-bottom-info">
     <div class="creator-name">HIMANSHU THAKUR</div>
      <span>© 2023 NEXUS GAMING - CLASSIFIED OPERATIONS</span>
    </div>
  </div>
`;
    document.body.appendChild(footerOverlay);

    // Footer toggle functionality
    const toggleFooter = () => {
      isFooterOpen = !isFooterOpen;

      if (isFooterOpen) {
        // Fast opening (coming up)
        footerOverlay.style.transition =
          "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        footerOverlay.classList.add("show");
        footerToggle.style.opacity = "0";
        footerToggle.style.pointerEvents = "none";
      } else {
        // Slow closing (going down)
        footerOverlay.style.transition = "transform 1.5s ease-out";
        footerOverlay.classList.remove("show");
        footerToggle.style.opacity = "1";
        footerToggle.style.pointerEvents = "auto";
      }
    };

    // Add cursor hover effects function
    const addCursorHoverEffect = (element) => {
      if (!element || !customCursor) return;
      element.addEventListener("mouseenter", () => {
        if (customCursor && !isLoading) customCursor.classList.add("hover");
      });
      element.addEventListener("mouseleave", () => {
        if (customCursor && !isLoading) customCursor.classList.remove("hover");
      });
      element.addEventListener("mousedown", () => {
        if (customCursor && !isLoading) customCursor.classList.add("click");
      });
      element.addEventListener("mouseup", () => {
        if (customCursor && !isLoading) customCursor.classList.remove("click");
      });
    };

    // Model loading functions
    const loadDemonHeadModel = () => {
      const loader = new GLTFLoader();
      loader.load(
        "/models/demon_head_fusion_animated.glb",
        (gltf) => {
          model = gltf.scene;
          model.scale.set(1.0, 1.0, 1.0);
          model.position.y = -1.8;
          scene.add(model);

          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]);
            action.setLoop(THREE.LoopRepeat);
            action.play();
          }
          setTimeout(storeOriginalPositions, 100);
        },
        undefined,
        (error) => {
          console.error("Error loading demon model:", error);
        }
      );
    };

    const loadFantasyIslandModel = () => {
      const loader = new GLTFLoader();
      loader.load(
        "/models/free_mixamo_retextured_model.glb",
        (gltf) => {
          model = gltf.scene;
          model.scale.set(1.0, 1.0, 1.0);
          model.position.set(1.2, -2, 0);
          scene.add(model);
          // Create and position text
          const modelText = createModelText();
          let updateTextPosition;

          // Function to update text position
          updateTextPosition = () => {
            if (!model || !modelText) return;

            const textPosition = new THREE.Vector3(0, 2.2, 2);
            textPosition.applyMatrix4(model.matrixWorld);

            const screenPosition = textPosition.clone();
            screenPosition.project(camera);

            const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
            const y = (screenPosition.y * -0.5 + 0.5) * window.innerHeight;

            modelText.style.left = x + "px";
            modelText.style.top = y + "px";
            modelText.style.transform = "translate(-50%, -50%)";
          };

          // Store reference for cleanup
          window.currentModelText = modelText;
          window.updateTextPosition = updateTextPosition;
          // Full 360° rotation + end facing left (90° more)
          const targetRotationY = 2 * Math.PI - Math.PI / 2; // 360° + 90° left
          const rotationDuration = 3000;

          const startTime = Date.now();
          const initialRotationY = model.rotation.y;

          const initialScale = 1.0;
          const targetScale = 1.5;
          const initialY = -2;
          const targetY = -3; // Move down to compensate for zoom
          // Smooth initial positioning over 2 seconds
          const positionDuration = 2000; // 2 seconds
          const positionStartTime = Date.now();

          const smoothInitialPosition = () => {
            const elapsed = Date.now() - positionStartTime;
            const progress = Math.min(elapsed / positionDuration, 1);

            // Smooth easing for initial position
            const eased =
              progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            // Smoothly move to initial position
            const currentX = 0 + 1.2 * eased; // Move from 0 to 1.2
            const currentY = 0 + -2 * eased; // Move from 0 to -2

            model.position.set(currentX, currentY, 0);

            if (progress < 1) {
              requestAnimationFrame(smoothInitialPosition);
            } else {
              // Store data after smooth positioning is complete
              window.scrollAnimationData = {
                model: model,
                initialRotationY: initialRotationY,
                initialScale: initialScale,
                initialY: initialY,
              };
            }
          };

          smoothInitialPosition();
          const rotateToTarget = () => {
            return; // This disables the automatic rotation

            // Keep all the original code commented out if you want it later:
            /*
  const elapsed = Date.now() - startTime;
  const progress = Math.min(elapsed / rotationDuration, 1);
  const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  model.rotation.y = initialRotationY + targetRotationY * eased;
  const currentScale = initialScale + (targetScale - initialScale) * eased;
  model.scale.set(currentScale, currentScale, currentScale);
  const currentY = initialY + (targetY - initialY) * eased;
  model.position.y = currentY;
  if (progress < 1) {
    requestAnimationFrame(rotateToTarget);
  }
  */
          };
          rotateToTarget();

          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
              const action = mixer.clipAction(clip);
              action.setLoop(THREE.LoopRepeat);
              action.play();
            });
          }
          setTimeout(storeOriginalPositions, 100);
        },
        undefined,
        (error) => {
          console.error("Error loading model:", error);
          createPlaceholderIsland();
        }
      );
    };

    // Simple placeholder (no hotspots)
    const createPlaceholderIsland = () => {
      const islandGeometry = new THREE.CylinderGeometry(3, 2, 1, 16);
      const islandMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b4513,
        wireframe: true,
      });
      const island = new THREE.Mesh(islandGeometry, islandMaterial);
      island.position.set(0, 0, 0);
      scene.add(island);
    };

    const createModelText = () => {
      const textDiv = document.createElement("div");
      textDiv.className = "model-text";
      textDiv.innerHTML = `
    <div class="text-line" data-text="◆ DESIGNATION: KURO-01">◆ DESIGNATION: KURO-01</div>
    <div class="text-line" data-text="◆ CLASS: TACTICAL ELIMINATOR">◆ CLASS: TACTICAL ELIMINATOR</div>
    <div class="text-line" data-text="◆ MISSION EFFICIENCY: 99.7%">◆ MISSION EFFICIENCY: 99.7%</div>
    <div class="text-line" data-text="◆ COMBAT RATING: MAXIMUM">◆ COMBAT RATING: MAXIMUM</div>
    <div class="text-line" data-text="◆ THREAT ASSESSMENT: CRITICAL">◆ THREAT ASSESSMENT: CRITICAL</div>
    <div class="text-line" data-text="◆ TARGETS NEUTRALIZED: 847">◆ TARGETS NEUTRALIZED: 847</div>
  `;
      document.body.appendChild(textDiv);

      // Add coding animation when text becomes visible
      textDiv.addEventListener("transitionend", (e) => {
        if (
          e.propertyName === "opacity" &&
          textDiv.classList.contains("show")
        ) {
          const lines = textDiv.querySelectorAll(".text-line");
          lines.forEach((line) => {
            line.classList.add("coding");
            line.style.color = "transparent"; // Hide original text during coding
          });

          // Remove coding animation and show final text
          setTimeout(() => {
            lines.forEach((line) => {
              line.classList.remove("coding");
              line.style.color = "#00ff41"; // Show original text
            });
          }, 6500); // Wait for all animations to complete
        }
      });

      return textDiv;
    };

    // Model switching functions
    const switchToFantasyIsland = () => {
      window.scrollAnimationData = null;
      // Clean up existing text
      if (heroTitle) heroTitle.style.display = "block";
      if (window.currentModelText) {
        window.currentModelText.remove();
        window.currentModelText = null;
        window.updateTextPosition = null;
      }
      currentModel = "fantasy_island";

      // Scroll to top immediately
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Clear current scene
      if (model) scene.remove(model);
      if (mixer) mixer.stopAllAction();

      // Hide Kuro preview, show Demon preview
      if (modelPreview) modelPreview.style.display = "none";
      if (demonPreview) demonPreview.style.display = "block";

      // Hide infographics when switching models
      if (leftInfos) leftInfos.classList.remove("show");
      if (rightInfos) rightInfos.classList.remove("show");

      // Load alternate model
      loadFantasyIslandModel();
    };

    const switchToDemonHead = () => {
      // Clean up scroll animation data
      window.scrollAnimationData = null;
      // Hide hero title
      if (heroTitle) heroTitle.style.display = "none";
      // Clean up existing text
      if (window.currentModelText) {
        window.currentModelText.remove();
        window.currentModelText = null;
        window.updateTextPosition = null;
      }
      currentModel = "demon";

      // Scroll to top immediately
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Clear current scene
      if (model) scene.remove(model);
      if (mixer) mixer.stopAllAction();

      // Hide Demon preview, show Kuro preview
      if (demonPreview) demonPreview.style.display = "none";
      if (modelPreview) modelPreview.style.display = "block";

      // Load demon model
      loadDemonHeadModel();
    };

    // Model preview click handlers
    if (modelPreview) {
      modelPreview.addEventListener("click", switchToFantasyIsland);
      addCursorHoverEffect(modelPreview);
    }

    if (demonPreview) {
      demonPreview.addEventListener("click", switchToDemonHead);
      addCursorHoverEffect(demonPreview);
      demonPreview.style.display = "none"; // Initially hidden
    }

    // Back to top button events
    if (backToTopBtn) {
      backToTopBtn.addEventListener("mouseenter", () => {
        backToTopBtn.classList.add("back-to-top-hover");
        if (customCursor && !isLoading) customCursor.classList.add("hover");
      });
      backToTopBtn.addEventListener("mouseleave", () => {
        backToTopBtn.classList.remove("back-to-top-hover");
        if (customCursor && !isLoading) customCursor.classList.remove("hover");
      });
      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // Apply cursor effects to navbar items after loading
    const applyNavbarEffects = setTimeout(() => {
      const navItems = document.querySelectorAll(
        ".nav-item, .nav-profile, .nav-brand"
      );
      navItems.forEach(addCursorHoverEffect);

      // Add footer functionality
      footerToggle.addEventListener("click", toggleFooter);
      footerOverlay
        .querySelector(".footer-close")
        .addEventListener("click", toggleFooter);
      addCursorHoverEffect(footerToggle);
      addCursorHoverEffect(footerOverlay.querySelector(".footer-close"));

      const footerLinks = footerOverlay.querySelectorAll(".footer-section a");
      footerLinks.forEach(addCursorHoverEffect);
    }, 5000);

    // Function to show scroll indicator for 4 seconds
    const showScrollIndicator = () => {
      if (!scrollIndicator || isLoading) return;

      // Clear any existing show timeout
      if (scrollIndicatorTimeout) {
        clearTimeout(scrollIndicatorTimeout);
      }

      // Show the indicator
      scrollIndicator.classList.add("scroll-indicator-show");

      // Hide after 4 seconds
      scrollIndicatorTimeout = setTimeout(() => {
        if (scrollIndicator) {
          scrollIndicator.classList.remove("scroll-indicator-show");
        }
      }, 4000);
    };

    // Function to start/reset the 8-second no-scroll timer
    const startNoScrollTimer = () => {
      // Clear existing timer
      if (noScrollTimeout) {
        clearTimeout(noScrollTimeout);
      }

      // Start new 8-second timer
      noScrollTimeout = setTimeout(() => {
        showScrollIndicator();
        // Restart the cycle
        startNoScrollTimer();
      }, 8000);
    };

    // Function to reset timer on scroll activity
    const resetScrollTimer = () => {
      startNoScrollTimer();
    };

    // Scroll handler with infographics control
    const handleScroll = () => {
      if (isLoading) return;

      const scrollTop = window.pageYOffset;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? scrollTop / docHeight : 0;

      // Handle hero title fade based on scroll
      if (heroTitle && currentModel === "fantasy_island") {
        if (scrollProgress > 0.05) {
          // ✅ Now scrollProgress is defined
          heroTitle.classList.add("fade-out");
        } else {
          heroTitle.classList.remove("fade-out");
        }
      }

      // Hide text until animation completes at 50%
      // Hide text until animation completes at 50%
      if (currentModel === "fantasy_island" && window.currentModelText) {
        if (scrollProgress >= 0.5) {
          // Show text only when animation is complete (50% or more)
          window.currentModelText.classList.add("show");
        } else {
          // Hide text completely until 50% (0% to 49%)
          window.currentModelText.classList.remove("show");
        }
      }
      // Handle individual box timing when demon model is active
      if (currentModel === "demon" && firstBox && secondBox) {
        // First box: appears at 20%, disappears at 25%
        if (scrollProgress >= 0.2 && scrollProgress < 0.25) {
          firstBox.classList.add("show");
        } else {
          firstBox.classList.remove("show");
        }

        // Second box: appears at 30%, disappears at 35%
        if (scrollProgress >= 0.3 && scrollProgress < 0.35) {
          secondBox.classList.add("show");
        } else {
          secondBox.classList.remove("show");
        }
      }
      // Handle model rotation/zoom based on scroll (only for fantasy_island)
      if (currentModel === "fantasy_island" && window.scrollAnimationData) {
        const { model, initialRotationY, initialScale, initialY } =
          window.scrollAnimationData;

        // Animation only works from 0% to 50% scroll
        const animationProgress = Math.min(scrollProgress / 0.5, 1); // 0.5 = 50%

        if (scrollProgress <= 0.5) {
          // Smooth easing
          const eased =
            animationProgress < 0.5
              ? 2 * animationProgress * animationProgress
              : 1 - Math.pow(-2 * animationProgress + 2, 2) / 2;

          // Apply rotation (full 360° + 90° left)
          const targetRotationY = 2 * Math.PI - Math.PI / 2;
          model.rotation.y = initialRotationY + targetRotationY * eased;

          // Apply zoom (1.0 to 1.5)
          const targetScale = 1.5;
          const currentScale =
            initialScale + (targetScale - initialScale) * eased;
          model.scale.set(currentScale, currentScale, currentScale);

          // Apply position adjustment
          const targetY = -3;
          const currentY = initialY + (targetY - initialY) * eased;
          model.position.y = currentY;
        }
      }

      if (navbar) {
        if (scrollProgress > 0.1) {
          navbar.classList.add("navbar-show");
        } else {
          navbar.classList.remove("navbar-show");
        }
      }

      if (backToTopBtn) {
        if (scrollProgress > 0.8) {
          backToTopBtn.classList.add("back-to-top-show");
        } else {
          backToTopBtn.classList.remove("back-to-top-show");
        }
      }
      // Footer toggle button - only show at bottom 5%
      if (footerToggle) {
        if (scrollProgress >= 0.95) {
          footerToggle.style.opacity = "1";
          footerToggle.style.transform = "translateY(0) scale(1)";
          footerToggle.style.pointerEvents = "auto";
        } else {
          footerToggle.style.opacity = "0";
          footerToggle.style.transform = "translateY(20px) scale(0.8)";
          footerToggle.style.pointerEvents = "none";
        }
      }
      // Model previews based on current model and scroll
      if (currentModel === "demon") {
        // Show Kuro preview at 60% scroll when demon model is active
        if (modelPreview) {
          if (scrollProgress > 0.6) {
            modelPreview.classList.add("preview-show");
          } else {
            modelPreview.classList.remove("preview-show");
          }
        }
        // Hide demon preview
        if (demonPreview) {
          demonPreview.classList.remove("preview-show");
        }
      } else if (currentModel === "fantasy_island") {
        // Show demon preview at 60% scroll when fantasy island model is active
        if (demonPreview) {
          if (scrollProgress > 0.6) {
            demonPreview.classList.add("preview-show");
          } else {
            demonPreview.classList.remove("preview-show");
          }
        }
        // Hide Kuro preview
        if (modelPreview) {
          modelPreview.classList.remove("preview-show");
        }
      }
    };

    window.addEventListener("scroll", () => {
      handleScroll();
      resetScrollTimer();
    });

    // Resize handler
    onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", onResize);

    // Hide loading screen after 4 seconds and show content
    const hideLoadingScreen = setTimeout(() => {
      if (loadingScreen) loadingScreen.classList.add("hide");
      isLoading = false;

      // Show custom cursor
      if (customCursor) customCursor.style.display = "block";

      // Start the no-scroll timer system
      startNoScrollTimer();

      // Initialize nav/back-to-top/model-preview states
      handleScroll();

      // Remove loading screen after transition
      setTimeout(() => {
        if (loadingScreen && document.body.contains(loadingScreen)) {
          document.body.removeChild(loadingScreen);
          loadingScreen = null;
        }
      }, 1000);

      // Start main content
      startMainContent();
    }, 4000);

    // Function to start main content after loading
    const startMainContent = () => {
      // Load initial demon model
      loadDemonHeadModel();

      // Set up auto-scroll after model loads
      setTimeout(() => {
        if (model && mixer && mixer._actions.length > 0) {
          const animationDuration = mixer._actions[0]._clip.duration;
          const scrollDuration = animationDuration * 2000;
          let autoScrollActive = true;

          // Start auto-scroll after a short delay
          setTimeout(() => {
            const startTime = Date.now();
            const startScroll = window.pageYOffset;
            const maxScroll =
              document.documentElement.scrollHeight - window.innerHeight;

            const autoScroll = () => {
              if (!autoScrollActive) return;

              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / scrollDuration, 1);

              const easeInOut =
                progress < 0.5
                  ? 2 * progress * progress
                  : 1 - Math.pow(-2 * progress + 2, 2) / 2;

              const scrollTop = startScroll + maxScroll * easeInOut;
              window.scrollTo(0, scrollTop);

              if (progress < 1) {
                requestAnimationFrame(autoScroll);
              } else {
                autoScrollActive = false;
              }
            };

            autoScroll();
          }, 1000);

          // Stop auto-scroll on user interaction
          detectManualScroll = () => {
            autoScrollActive = false;
          };
          keydownHandler = (e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === " ") {
              detectManualScroll();
            }
          };

          window.addEventListener("wheel", detectManualScroll, {
            passive: true,
          });
          window.addEventListener("touchstart", detectManualScroll, {
            passive: true,
          });
          window.addEventListener("keydown", keydownHandler);
        }
      }, 500);
    };

    // Reset scroll indicator timer on user interactions
    window.addEventListener("wheel", resetScrollTimer, { passive: true });
    window.addEventListener("touchstart", resetScrollTimer, { passive: true });
    window.addEventListener("touchmove", resetScrollTimer, { passive: true });

    // Animation loop
    let frameCount = 0;
    function animate() {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();

      if (mixer) {
        mixer.update(delta * 0.5);
        frameCount++;
      }

      // Add lighting animations
      updateAmbientColor();
      updatePointLights();

      // Update text position
      if (currentModel === "fantasy_island" && window.updateTextPosition) {
        window.updateTextPosition();
      }
      if (model) {
        pointLight1.position.x = model.position.x + 1;
        pointLight1.position.z = model.position.z + 1;
        pointLight2.position.x = model.position.x - 1;
        pointLight2.position.z = model.position.z + 1;
      }
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup function
    return () => {
      // Clear timeouts
      clearTimeout(hideLoadingScreen);
      clearTimeout(applyNavbarEffects);
      if (scrollIndicatorTimeout) clearTimeout(scrollIndicatorTimeout);
      if (noScrollTimeout) clearTimeout(noScrollTimeout);

      // Remove event listeners
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousemove", updateCursor);
      if (onResize) window.removeEventListener("resize", onResize);
      if (detectManualScroll) {
        window.removeEventListener("wheel", detectManualScroll);
        window.removeEventListener("touchstart", detectManualScroll);
      }
      if (keydownHandler) window.removeEventListener("keydown", keydownHandler);

      // Remove scroll indicator timer event listeners
      window.removeEventListener("wheel", resetScrollTimer);
      window.removeEventListener("touchstart", resetScrollTimer);
      window.removeEventListener("touchmove", resetScrollTimer);

      // Clean up DOM elements
      if (loadingScreen && document.body.contains(loadingScreen)) {
        document.body.removeChild(loadingScreen);
      }
      if (customCursor && document.body.contains(customCursor)) {
        document.body.removeChild(customCursor);
      }

      if (navbar && document.body.contains(navbar)) {
        document.body.removeChild(navbar);
      }
      if (backToTopBtn && document.body.contains(backToTopBtn)) {
        document.body.removeChild(backToTopBtn);
      }
      if (modelPreview && document.body.contains(modelPreview)) {
        document.body.removeChild(modelPreview);
      }
      if (demonPreview && document.body.contains(demonPreview)) {
        document.body.removeChild(demonPreview);
      }
      if (scrollIndicator && document.body.contains(scrollIndicator)) {
        document.body.removeChild(scrollIndicator);
      }
      if (hudOverlay && document.body.contains(hudOverlay)) {
        document.body.removeChild(hudOverlay);
      }
      if (footerToggle && document.body.contains(footerToggle)) {
        document.body.removeChild(footerToggle);
      }
      if (footerOverlay && document.body.contains(footerOverlay)) {
        document.body.removeChild(footerOverlay);
      }

      // Clean up Three.js
      if (
        mountRef.current &&
        renderer.domElement &&
        mountRef.current.contains(renderer.domElement)
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }

      if (mixer) mixer.stopAllAction();
      controls.removeEventListener("change", onControlsChange);
      if (resetTimeout) clearTimeout(resetTimeout);
      controls.dispose();
      renderer.dispose();

      if (heroTitle && document.body.contains(heroTitle)) {
        document.body.removeChild(heroTitle);
      }
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }

        body {
          margin: 0;
          padding: 0;
          background: #000;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
            sans-serif;
          overflow-x: hidden;
        }

        .scene-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1;
          pointer-events: none;
        }
        .scene-canvas {
          pointer-events: auto;
          position: relative;
          z-index: 1;
        }
        .page-content {
          position: relative;
          z-index: 0;
          background: transparent;
        }

        .section {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: "Orbitron", "Audiowide", monospace;
          font-size: clamp(18px, 3vw, 26px);
          opacity: 0.3;
          transition: opacity 0.3s ease;
          font-weight: 100;
          letter-spacing: 3px;
        }
        .section:hover {
          opacity: 0.6;
        }

        html {
          scroll-behavior: smooth;
        }
        /* Modern Futuristic Panel Design */
        .modern-panel {
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.03) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0.03) 100%
          ) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 8px !important;
          padding: 15px !important;
          margin-bottom: 15px !important;
          backdrop-filter: blur(20px) !important;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
        }

        .modern-panel::before {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 100%
          ) !important;
          animation: modern-scan 6s linear infinite !important;
        }

        @keyframes modern-scan {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .mini-progress {
          width: 100%;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1px;
          margin-top: 8px;
          overflow: hidden;
        }

        .mission-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.8);
        }

        .mission-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          margin-right: 8px;
        }

        .mission-dot.active {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
        }

        .threat-level {
          font-size: 16px;
          font-weight: bold;
          color: rgba(255, 255, 255, 0.9);
          text-align: center;
          margin: 8px 0;
          letter-spacing: 2px;
        }

        /* Glitch effect for info panels */
        .info-panel {
          position: relative;
        }

        .info-panel::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          opacity: 0;
          animation: glitch 4s infinite;
          pointer-events: none;
        }

        @keyframes glitch {
          0%,
          90%,
          100% {
            opacity: 0;
            transform: translate(0, 0);
          }
          91% {
            opacity: 0.8;
            transform: translate(-2px, 0);
            filter: hue-rotate(90deg);
          }
          92% {
            opacity: 0.6;
            transform: translate(2px, -1px);
            filter: hue-rotate(-90deg);
          }
          93% {
            opacity: 0.4;
            transform: translate(-1px, 1px);
            filter: hue-rotate(180deg);
          }
          94% {
            opacity: 0;
            transform: translate(0, 0);
          }
        }

        /* Additional glitch on text */
        .panel-header {
          position: relative;
        }

        .panel-header::before {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          color: #ff0080;
          animation: text-glitch 3s infinite;
        }

        @keyframes text-glitch {
          0%,
          95%,
          100% {
            opacity: 0;
            transform: translate(0, 0);
          }
          96% {
            opacity: 0.7;
            transform: translate(-1px, 0);
          }
          97% {
            opacity: 0.5;
            transform: translate(1px, -1px);
          }
          98% {
            opacity: 0.3;
            transform: translate(-1px, 1px);
          }
        }
        /* Hide scrollbar but keep scroll functionality */
        ::-webkit-scrollbar {
          display: none;
        }
        html {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="scene-container">
        <div ref={mountRef} className="scene-canvas" />
      </div>

      <div className="page-content">
        <div className="section">◇ LUXURY AWAITS</div>
        <div className="section">◆ ELITE EXPERIENCE</div>
        <div className="section">◇ PREMIUM GAMING</div>
        <div className="section">◆ BECOME LEGEND</div>
        <div className="section">◇ NEXUS COMPLETE</div>
      </div>
    </>
  );
}
