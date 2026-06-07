// ═══════════════════════════════════════════════════════
// FOREST REVERIE — Interactions
// ═══════════════════════════════════════════════════════

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// ─── AVATAR VINE EFFECT ───
class AvatarVines {
    constructor(circleId) {
        this.circle = document.getElementById(circleId);
        if (!this.circle) return;

        // Full-screen fixed canvas – completely outside the hero layout
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:50;display:block';
        document.body.appendChild(this.canvas);
        this._resize();
        window.addEventListener('resize', () => this._resize());

        this.ctx     = this.canvas.getContext('2d');
        this.vines   = [];
        this.running = false;

        this.circle.addEventListener('mouseenter', () => this.grow());
        this.circle.addEventListener('mouseleave', () => this.retract());
        this._loop();
    }

    _resize() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    _avatarRect() {
        const r = this.circle.getBoundingClientRect();
        return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, R: r.width / 2 };
    }

    grow() {
        const COUNT = 8;
        this.vines = Array.from({ length: COUNT }, (_, i) => {
            const angle = (i / COUNT) * Math.PI * 2 - Math.PI / 2;
            return {
                angle,
                length:    0,
                maxLen:    60 + Math.random() * 55,
                speed:     1.3 + Math.random() * 1.4,
                wobble:    (Math.random() - 0.5) * 0.5,
                alpha:     1,
                growing:   true,
                leaves:    [],
                nextLeaf:  12 + Math.random() * 16,
                stemColor: Math.random() > 0.45 ? '#4ade80' : '#2d5a27',
            };
        });
        this.running = true;
    }

    retract() { this.vines.forEach(v => { v.growing = false; }); }

    _vinePoint(vine, dist, cx, cy, R) {
        const { angle, wobble } = vine;
        const startX = cx + Math.cos(angle) * R;
        const startY = cy + Math.sin(angle) * R;
        const perp   = angle + Math.PI / 2;
        const t      = dist / vine.maxLen;
        const sway   = Math.sin(t * Math.PI * 3) * wobble * 22;
        return {
            x: startX + Math.cos(angle) * dist + Math.cos(perp) * sway,
            y: startY + Math.sin(angle) * dist + Math.sin(perp) * sway,
        };
    }

    _drawLeaf(ctx, x, y, angle, size, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.6, size * 0.4, size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -size * 1.1);
        ctx.stroke();
        ctx.restore();
    }

    _loop() {
        requestAnimationFrame(() => this._loop());
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.running) return;

        // Get updated avatar position every frame
        const { cx, cy, R } = this._avatarRect();

        let anyAlive = false;
        this.vines.forEach(vine => {
            if (vine.growing) {
                vine.alpha = Math.min(1, vine.alpha + 0.05);
                if (vine.length < vine.maxLen) vine.length += vine.speed;
                
                if (vine.length > vine.nextLeaf && vine.length < vine.maxLen - 10) {
                    vine.leaves.push({
                        at: vine.length,
                        side: Math.random() > 0.5 ? 1 : -1,
                        size: 4 + Math.random() * 5,
                        color: Math.random() > 0.5 ? '#fef08a' : '#4ade80'
                    });
                    vine.nextLeaf = vine.length + 12 + Math.random() * 14;
                }
            } else {
                vine.alpha = Math.max(0, vine.alpha - 0.025);
            }
            if (vine.alpha <= 0) return;
            anyAlive = true;

            ctx.save();
            ctx.globalAlpha = vine.alpha;
            ctx.strokeStyle = vine.stemColor;
            ctx.lineWidth   = 1.8;
            ctx.lineCap     = 'round';
            ctx.lineJoin    = 'round';
            ctx.beginPath();
            const start = this._vinePoint(vine, 0, cx, cy, R);
            ctx.moveTo(start.x, start.y);
            for (let s = 1; s <= 30; s++) {
                const p = this._vinePoint(vine, (s / 30) * vine.length, cx, cy, R);
                ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();

            vine.leaves.forEach(leaf => {
                if (leaf.at > vine.length) return;
                const p = this._vinePoint(vine, leaf.at, cx, cy, R);
                const leafAngle = vine.angle + leaf.side * (Math.PI / 3 + Math.random() * 0.3);
                this._drawLeaf(ctx, p.x, p.y, leafAngle, leaf.size, leaf.color);
            });
            ctx.restore();
        });

        if (!anyAlive && this.vines.length > 0) {
            this.vines = [];
            this.running = false;
        }
    }
}

// Initialise avatar vine effect
new AvatarVines('avatar-circle-hero');





// ─── CUSTOM CURSOR ───
const cursor = document.querySelector('#cursor');
const cursorRing = document.querySelector('#cursor-ring');

window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1
    });
    gsap.to(cursorRing, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3
    });
});

// Cursor hover effects
const links = document.querySelectorAll('a, .project-card');
links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        gsap.to(cursorRing, {
            scale: 1.5,
            borderColor: '#4ade80',
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            duration: 0.3
        });
    });
    link.addEventListener('mouseleave', () => {
        gsap.to(cursorRing, {
            scale: 1,
            borderColor: '#4ade80',
            backgroundColor: 'transparent',
            duration: 0.3
        });
    });
});

// ─── HERO REVEAL ───
const heroTl = gsap.timeline();

// Split full name into characters and add blooms
const fullName = document.querySelector('.full-name');
if (fullName) {
    const text = fullName.innerText;
    fullName.innerHTML = text.split('').map(char => {
        if (char === ' ') return ' ';
        
        let blooms = '';
        // Increase density: about 50% chance per character
        if (Math.random() > 0.5) {
            const bloomCount = Math.random() > 0.8 ? 2 : 1; // Sometimes 2 blooms
            for (let i = 0; i < bloomCount; i++) {
                const top = (Math.random() - 0.5) * 80; 
                const left = (Math.random() - 0.5) * 80;
                const scale = 0.6 + Math.random() * 0.4;
                const type = Math.random() > 0.8 ? 'bloom-flower' : 'bloom-leaf';
                blooms += `<div class="bloom ${type}" style="top: ${top}%; left: ${left}%; transform: scale(${scale})"></div>`;
            }
        }
        
        // Wrap characters in span for the stagger entrance animation
        return `<span>${char}${blooms}</span>`;
    }).join('');
    fullName.style.opacity = 1;
}

heroTl.from(".logo", {
    y: -50,
    opacity: 0,
    duration: 1,
    ease: "expo.out"
})
.from(".nav-links a", {
    y: -20,
    opacity: 0,
    stagger: 0.1,
    duration: 0.8,
    ease: "power2.out"
}, "-=0.5")
.to(".full-name span", {
    opacity: 1,
    y: 0,
    stagger: 0.05,
    duration: 0.8,
    ease: "back.out(1.7)"
}, "-=0.3")
.to(".bloom", {
    scale: 1,
    stagger: 0.02,
    duration: 1,
    ease: "elastic.out(1, 0.5)"
}, "-=0.5")
.from(".reveal-text", {
    y: 100,
    opacity: 0,
    stagger: 0.2,
    duration: 1.2,
    ease: "expo.out"
}, "-=0.8")
.fromTo("#avatar-circle-hero", {
    scale: 0,
    opacity: 0,
}, {
    scale: 1,
    opacity: 1,
    duration: 1,
    ease: "elastic.out(1, 0.6)"
}, "-=0.4");

// Persistent glow pulse on avatar after it appears
gsap.to("#avatar-circle-hero", {
    boxShadow: "0 0 44px rgba(74,222,128,0.55), inset 0 0 22px rgba(74,222,128,0.14)",
    duration: 1.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    delay: 2.5
});

// ─── VINE SWAY ───
gsap.to(".vines-left path, .vines-right path", {
    attr: { d: "M10 0C10 60 50 120 50 180C50 240 10 300 10 360C10 420 60 480 60 540C60 600 60 660 60 720" },
    duration: 5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

// ─── SCROLL REVEALS ───
// ─── REVEAL ANIMATIONS ───
gsap.utils.toArray(".reveal").forEach((elem) => {
    ScrollTrigger.create({
        trigger: elem,
        start: "top 85%",
        onEnter: () => elem.classList.add("active"),
        // onLeave: () => elem.classList.remove("active"), // Uncomment to re-trigger
    });
});

// ─── PROJECT REVEAL ANIMATIONS (Top to Bottom) ───
gsap.utils.toArray(".botanical-card").forEach((card) => {
    gsap.fromTo(card, {
        y: -40, // Fade in from slightly above
        opacity: 0,
        scale: 0.98
    }, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: card,
            start: "top 90%", 
            toggleActions: "play none none none"
        }
    });

    // Hover effects via GSAP (to avoid CSS transition conflicts)
    card.addEventListener('mouseenter', () => {
        gsap.to(card, {
            y: -15,
            scale: 1.03,
            duration: 0.6,
            ease: "power2.out",
            overwrite: 'auto'
        });
    });
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            overwrite: 'auto'
        });
    });
});

// ─── INTERACTIVE BLOOMS ───
let lastMouseX = 0;
let lastMouseY = 0;
let lastMoveTime = Date.now();
const bloomStates = new Map(); // Track each bloom's animation state

window.addEventListener('mousemove', (e) => {
    const blooms = document.querySelectorAll('.bloom');
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastMoveTime) / 1000;
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    
    blooms.forEach(bloom => {
        const rect = bloom.getBoundingClientRect();
        const bloomX = rect.left + rect.width / 2;
        const bloomY = rect.top + rect.height / 2;
        
        const distance = Math.hypot(e.clientX - bloomX, e.clientY - bloomY);
        
        if (distance < 150) {
            // Initialize state if not exists
            if (!bloomStates.has(bloom)) {
                bloomStates.set(bloom, {
                    velocity: 0,
                    targetVelocity: 0,
                    lastAngle: 0,
                    glowIntensity: 0
                });
            }
            
            const state = bloomStates.get(bloom);
            
            // Calculate direction and speed from mouse movement
            const direction = deltaX >= 0 ? 1 : -1;
            const speed = Math.hypot(deltaX, deltaY) / Math.max(deltaTime, 0.01);
            
            // Smoothly update target velocity
            state.targetVelocity = Math.max(-1500, Math.min(1500, speed * direction * 0.5));
            
            // Calculate proximity factor (0 to 1)
            const proximity = 1 - (distance / 150);
            
            // Apply glow effect based on proximity
            state.glowIntensity = proximity;
            gsap.to(bloom, {
                filter: `drop-shadow(0 0 ${5 + proximity * 15}px var(--leaf-bright))`,
                duration: 0.3,
                ease: 'power2.out',
                overwrite: 'auto'
            });
            
            // Cancel any ongoing momentum deceleration
            if (bloom._momentumTween) {
                bloom._momentumTween.kill();
            }
        } else {
            // Mouse is away - let it decelerate naturally
            const state = bloomStates.get(bloom);
            if (state && Math.abs(state.velocity) > 10) {
                // Start momentum deceleration if not already running
                if (!bloom._momentumTween) {
                    bloom._momentumTween = gsap.to(state, {
                        velocity: 0,
                        duration: 2,
                        ease: 'power2.out',
                        onComplete: () => {
                            bloom._momentumTween = null;
                            // Fade out glow
                            gsap.to(bloom, {
                                filter: 'drop-shadow(0 0 0px var(--leaf-bright))',
                                duration: 0.5,
                                ease: 'power2.out',
                                overwrite: 'auto'
                            });
                        }
                    });
                }
            } else if (state) {
                // Fade out glow if not moving
                gsap.to(bloom, {
                    filter: 'drop-shadow(0 0 0px var(--leaf-bright))',
                    duration: 0.5,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            }
        }
    });
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    lastMoveTime = currentTime;
});

// Animation loop for smooth continuous rotation
function animateBlooms() {
    const blooms = document.querySelectorAll('.bloom');
    
    blooms.forEach(bloom => {
        const state = bloomStates.get(bloom);
        if (state) {
            // Smoothly interpolate velocity towards target
            state.velocity += (state.targetVelocity - state.velocity) * 0.15;
            
            // Update rotation based on velocity
            const rotationDelta = state.velocity * 0.016; // ~60fps
            state.lastAngle += rotationDelta;
            
            // Apply rotation with GSAP for smooth rendering
            gsap.set(bloom, {
                rotation: state.lastAngle
            });
        }
    });
    
    requestAnimationFrame(animateBlooms);
}

// Start the animation loop
animateBlooms();

// ─── BOTANICAL PARALLAX ───
gsap.utils.toArray(".botanical-card").forEach((card) => {
    const img = card.querySelector("img");
    if (img) {
        gsap.to(img, {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    }
});

// ─── REVEAL ANIMATIONS ───
window.addEventListener('mousemove', (e) => {
    const xPos = (e.clientX / window.innerWidth) - 0.5;
    const yPos = (e.clientY / window.innerHeight) - 0.5;

    gsap.to(".hero-content", {
        x: xPos * 30,
        y: yPos * 30,
        duration: 1,
        ease: "power2.out"
    });
});

// ─── 3D DNA HELIX (ENCODED) ───
class DNAHelix {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.offsetWidth / this.container.offsetHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 15;

        this.spheres = [];
        this.createDNA();
        this.addLights();
        this.initMotion();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    createDNA() {
        const sphereGeom = new THREE.SphereGeometry(0.4, 16, 16);
        const count = 40;
        const curve = 1.5;
        const speed = 0.05;

        for (let i = 0; i < count; i++) {
            // Strand 1
            const mat1 = new THREE.MeshPhongMaterial({ 
                color: i % 2 === 0 ? 0x4ade80 : 0x2d5a27,
                emissive: 0x4ade80,
                emissiveIntensity: 0.2,
                shininess: 100
            });
            const s1 = new THREE.Mesh(sphereGeom, mat1);
            
            // Strand 2
            const mat2 = new THREE.MeshPhongMaterial({ 
                color: i % 2 === 0 ? 0xfef08a : 0x4ade80,
                emissive: 0xfef08a,
                emissiveIntensity: 0.2,
                shininess: 100
            });
            const s2 = new THREE.Mesh(sphereGeom, mat2);

            this.spheres.push({ mesh: s1, offset: i * 0.5, phase: 0 });
            this.spheres.push({ mesh: s2, offset: i * 0.5, phase: Math.PI });
            
            this.scene.add(s1);
            this.scene.add(s2);
        }
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x4ade80, 2);
        pointLight1.position.set(5, 5, 5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xfef08a, 1);
        pointLight2.position.set(-5, -5, 5);
        this.scene.add(pointLight2);
    }

    initMotion() {
        // Using GSAP for consistency and reliability
        this.rotationData = { y: 0 };
        
        gsap.to(this.rotationData, {
            y: Math.PI * 2,
            duration: 10,
            repeat: -1,
            ease: "none",
            onUpdate: () => {
                this.scene.rotation.y = this.rotationData.y;
            }
        });

        // Interactive hover effect
        const card = this.container.closest('.botanical-card');
        if (card) {
            card.addEventListener('mouseenter', () => {
                gsap.to(this.camera.position, {
                    z: 12,
                    duration: 0.6,
                    ease: "power2.out"
                });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(this.camera.position, {
                    z: 15,
                    duration: 0.6,
                    ease: "power2.out"
                });
            });
        }
    }

    onWindowResize() {
        if (!this.container) return;
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        this.spheres.forEach((obj, i) => {
            const angle = time + obj.offset + obj.phase;
            obj.mesh.position.x = Math.cos(angle) * 3;
            obj.mesh.position.z = Math.sin(angle) * 3;
            obj.mesh.position.y = (obj.offset - 10);
            
            // Subtle pulse
            const scale = 1 + Math.sin(time * 2 + obj.offset) * 0.2;
            obj.mesh.scale.set(scale, scale, scale);
        });

        this.renderer.render(this.scene, this.camera);
    }
}

// ─── PROCEDURAL BUILDING (ENCODED) ───
class ProceduralBuilding {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.init();
    }

    init() {
        const width = this.container.offsetWidth || 400;
        const height = this.container.offsetHeight || 500;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.set(0, 4, 14);
        this.camera.lookAt(0, 0, 0);

        this.group = new THREE.Group();
        this.createBuilding();
        this.scene.add(this.group);

        this.addLights();
        this.initMotion();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    createBuilding() {
        // Body
        const bodyMat = new THREE.MeshPhongMaterial({ color: 0x4ade80, shininess: 40 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 6), bodyMat);
        body.position.y = -1.5;
        this.group.add(body);

        // Windows
        const winMat = new THREE.MeshPhongMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 1 });
        [-2.5, 0, 2.5].forEach(x => {
            const win = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.4), winMat);
            win.position.set(x, -1.2, 3.01);
            this.group.add(win);
        });

        // Roof
        const roofMat = new THREE.MeshPhongMaterial({ color: 0x2d5a27 });
        const roof = new THREE.Mesh(new THREE.ConeGeometry(6.5, 4, 4), roofMat);
        roof.position.y = 3.5;
        roof.rotation.y = Math.PI / 4;
        this.group.add(roof);

        // Chimney (geometry first, material second)
        const chimney = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), roofMat);
        chimney.position.set(2, 5, 1);
        this.group.add(chimney);
    }

    addLights() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const dir = new THREE.DirectionalLight(0xffffff, 2);
        dir.position.set(8, 10, 8);
        this.scene.add(dir);
    }

    initMotion() {
        this.rot = { y: 0 };
        gsap.to(this.rot, {
            y: Math.PI * 2,
            duration: 12,
            repeat: -1,
            ease: 'none',
            onUpdate: () => { this.group.rotation.y = this.rot.y; }
        });

        const card = this.container.closest('.botanical-card');
        if (card) {
            card.addEventListener('mouseenter', () => gsap.to(this.camera.position, { z: 11, duration: 0.6 }));
            card.addEventListener('mouseleave', () => gsap.to(this.camera.position, { z: 14, duration: 0.6 }));
        }
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}

// ─── PROCEDURAL CLOCK (ENCODED) ───
class ProceduralClock {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.init();
    }

    init() {
        const width = this.container.offsetWidth || 400;
        const height = this.container.offsetHeight || 500;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.set(0, 0, 14);
        this.camera.lookAt(0, 0, 0);

        this.createClock();
        this.addLights();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    createClock() {
        // ── Clock Face ──
        const faceGeom = new THREE.CylinderGeometry(5, 5, 0.4, 64);
        const faceMat = new THREE.MeshPhongMaterial({ color: 0x1a2e1a, shininess: 80 });
        const face = new THREE.Mesh(faceGeom, faceMat);
        face.rotation.x = Math.PI / 2;
        this.scene.add(face);

        // ── Outer Rim ──
        const rimGeom = new THREE.TorusGeometry(5, 0.25, 16, 64);
        const rimMat = new THREE.MeshPhongMaterial({ color: 0x4ade80, emissive: 0x4ade80, emissiveIntensity: 0.3, shininess: 120 });
        const rim = new THREE.Mesh(rimGeom, rimMat);
        this.scene.add(rim);

        // ── Hour Tick Marks ──
        const tickMat = new THREE.MeshPhongMaterial({ color: 0x4ade80, emissive: 0x4ade80, emissiveIntensity: 0.5 });
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const isHour = true;
            const tickGeom = new THREE.BoxGeometry(i % 3 === 0 ? 0.15 : 0.08, i % 3 === 0 ? 0.6 : 0.35, 0.15);
            const tick = new THREE.Mesh(tickGeom, tickMat);
            tick.position.set(Math.sin(angle) * 4.4, Math.cos(angle) * 4.4, 0.3);
            tick.rotation.z = -angle;
            this.scene.add(tick);
        }

        // ── Center Dot ──
        const centerMat = new THREE.MeshPhongMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.8 });
        const center = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), centerMat);
        center.position.z = 0.4;
        this.scene.add(center);

        // ── Hands ──
        const handMatHour = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const handMatMin  = new THREE.MeshPhongMaterial({ color: 0x4ade80, emissive: 0x4ade80, emissiveIntensity: 0.3 });
        const handMatSec  = new THREE.MeshPhongMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.8 });

        // Hour hand — short and thick
        this.hourPivot = new THREE.Object3D();
        this.hourPivot.position.z = 0.3;
        const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 0.15), handMatHour);
        hourHand.position.y = 1.25;
        this.hourPivot.add(hourHand);
        this.scene.add(this.hourPivot);

        // Minute hand — long and medium
        this.minPivot = new THREE.Object3D();
        this.minPivot.position.z = 0.35;
        const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.6, 0.12), handMatMin);
        minHand.position.y = 1.8;
        this.minPivot.add(minHand);
        this.scene.add(this.minPivot);

        // Second hand — thin and full length
        this.secPivot = new THREE.Object3D();
        this.secPivot.position.z = 0.4;
        const secHand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 4.2, 0.05), handMatSec);
        secHand.position.y = 2.1;
        this.secPivot.add(secHand);
        this.scene.add(this.secPivot);
    }

    addLights() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const front = new THREE.DirectionalLight(0xffffff, 1.5);
        front.position.set(0, 5, 10);
        this.scene.add(front);
        const green = new THREE.PointLight(0x4ade80, 1.5, 30);
        green.position.set(-6, 4, 5);
        this.scene.add(green);
        const yellow = new THREE.PointLight(0xfef08a, 0.8, 20);
        yellow.position.set(6, -4, 5);
        this.scene.add(yellow);
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const now = new Date();
        const secs  = now.getSeconds() + now.getMilliseconds() / 1000;
        const mins  = now.getMinutes() + secs / 60;
        const hours = (now.getHours() % 12) + mins / 60;

        // Rotate hands (negative because Three.js Z-axis rotation goes counterclockwise visually)
        this.secPivot.rotation.z  = -(secs  / 60)  * Math.PI * 2;
        this.minPivot.rotation.z  = -(mins  / 60)  * Math.PI * 2;
        this.hourPivot.rotation.z = -(hours / 12)  * Math.PI * 2;

        // Subtle slow tilt for depth
        const t = Date.now() * 0.0003;
        this.scene.rotation.x = Math.sin(t) * 0.15;
        this.scene.rotation.y = Math.cos(t * 0.7) * 0.1;

        this.renderer.render(this.scene, this.camera);
    }
}

// ─── PARTICLE GLOBE (LUNA FOODHUB) ───
class ParticleGlobe {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.init();
    }

    init() {
        const width  = this.container.offsetWidth  || 400;
        const height = this.container.offsetHeight || 500;

        this.scene    = new THREE.Scene();
        this.camera   = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
        this.camera.position.set(0, 0, 14);

        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.createGlobe();
        this.createPins();
        this.addLights();
        this.initMotion();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    createGlobe() {
        const RADIUS = 5;
        const COUNT  = 1800;
        const positions = new Float32Array(COUNT * 3);
        const colors    = new Float32Array(COUNT * 3);

        const palette = [
            new THREE.Color(0x4ade80), // leaf bright
            new THREE.Color(0xfef08a), // sunlight
            new THREE.Color(0x2d5a27), // leaf primary
            new THREE.Color(0x86efac), // soft mint
        ];

        for (let i = 0; i < COUNT; i++) {
            // Fibonacci sphere for even distribution
            const phi   = Math.acos(1 - 2 * (i + 0.5) / COUNT);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;

            positions[i * 3]     = RADIUS * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = RADIUS * Math.cos(phi);
            positions[i * 3 + 2] = RADIUS * Math.sin(phi) * Math.sin(theta);

            const c = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3]     = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

        const mat = new THREE.PointsMaterial({
            size: 0.12,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            sizeAttenuation: true,
        });

        this.points = new THREE.Points(geo, mat);
        this.group.add(this.points);

        // Wireframe latitude/longitude rings
        const ringMat = new THREE.LineBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.08 });
        [0, 30, 60, -30, -60].forEach(lat => {
            const latRad = (lat * Math.PI) / 180;
            const r = RADIUS * Math.cos(latRad);
            const y = RADIUS * Math.sin(latRad);
            const pts = [];
            for (let a = 0; a <= 64; a++) {
                const angle = (a / 64) * Math.PI * 2;
                pts.push(new THREE.Vector3(r * Math.cos(angle), y, r * Math.sin(angle)));
            }
            this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat));
        });
        [0, 45, 90, 135].forEach(lon => {
            const lonRad = (lon * Math.PI) / 180;
            const pts = [];
            for (let a = 0; a <= 64; a++) {
                const phi = (a / 64) * Math.PI * 2;
                pts.push(new THREE.Vector3(
                    RADIUS * Math.sin(phi) * Math.cos(lonRad),
                    RADIUS * Math.cos(phi),
                    RADIUS * Math.sin(phi) * Math.sin(lonRad)
                ));
            }
            this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat));
        });
    }

    createPins() {
        // A few glowing location-pin dots on the surface
        const pinPositions = [
            [0, 5, 0], [3.5, 3.5, 0], [-3.5, 3.5, 0],
            [2, -4, 2.5], [-2, -4, -2.5], [4.5, 0, 2],
        ];
        pinPositions.forEach(([x, y, z]) => {
            const norm = new THREE.Vector3(x, y, z).normalize().multiplyScalar(5.15);
            const geo  = new THREE.SphereGeometry(0.18, 12, 12);
            const mat  = new THREE.MeshPhongMaterial({
                color: 0xfef08a,
                emissive: 0xfef08a,
                emissiveIntensity: 1,
                shininess: 120,
            });
            const pin = new THREE.Mesh(geo, mat);
            pin.position.copy(norm);
            this.group.add(pin);
        });
    }

    addLights() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const key = new THREE.DirectionalLight(0x4ade80, 1.5);
        key.position.set(8, 8, 8);
        this.scene.add(key);
        const fill = new THREE.PointLight(0xfef08a, 1, 40);
        fill.position.set(-6, -4, 6);
        this.scene.add(fill);
    }

    initMotion() {
        this.rot = { y: 0 };
        gsap.to(this.rot, {
            y: Math.PI * 2,
            duration: 18,
            repeat: -1,
            ease: 'none',
            onUpdate: () => { this.group.rotation.y = this.rot.y; }
        });

        // Hover zoom
        const card = this.container.closest('.botanical-card');
        if (card) {
            card.addEventListener('mouseenter', () => gsap.to(this.camera.position, { z: 11, duration: 0.6, ease: 'power2.out' }));
            card.addEventListener('mouseleave', () => gsap.to(this.camera.position, { z: 14, duration: 0.6, ease: 'power2.out' }));
        }
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        // Gentle tilt sway
        const t = Date.now() * 0.0003;
        this.group.rotation.x = Math.sin(t * 0.7) * 0.12;
        this.renderer.render(this.scene, this.camera);
    }
}

// ─── 3D INIT ON SCROLL REVEAL ───
function init3DOnReveal() {
    const cards = document.querySelectorAll('.botanical-card');
    cards.forEach(card => {
        ScrollTrigger.create({
            trigger: card,
            start: 'top 90%',
            once: true,
            onEnter: () => {
                const dnaEl   = card.querySelector('#nutrideq-dna');
                const buildEl = card.querySelector('#hydria-building');
                const clockEl = card.querySelector('#sprout-clock');
                const globeEl = card.querySelector('#luna-globe');
                if (dnaEl   && !dnaEl.hasChildNodes())   new DNAHelix('nutrideq-dna');
                if (buildEl && !buildEl.hasChildNodes()) new ProceduralBuilding('hydria-building');
                if (clockEl && !clockEl.hasChildNodes()) new ProceduralClock('sprout-clock');
                if (globeEl && !globeEl.hasChildNodes()) new ParticleGlobe('luna-globe');
            }
        });
    });
}

function initFloatingLeaves() {
    const floatingLeavesContainer = document.getElementById('floating-leaves-container');
    if (!floatingLeavesContainer) return;
    
    const floatingLeafStates = new Map();
    
    // Generate floating leaves
    function createFloatingLeaves() {
        const leafCount = 30;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        for (let i = 0; i < leafCount; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'floating-leaf';
            
            const inner = document.createElement('div');
            inner.className = 'floating-leaf-inner';
            leaf.appendChild(inner);
            
            // Random size
            const size = 8 + Math.random() * 12;
            leaf.style.width = `${size}px`;
            leaf.style.height = `${size * 1.5}px`;
            
            // Random position (avoiding central content area)
            let x, y;
            if (Math.random() > 0.5) {
                // Left or right side
                x = Math.random() > 0.5 
                    ? Math.random() * (viewportWidth * 0.15) 
                    : viewportWidth * 0.85 + Math.random() * (viewportWidth * 0.15);
                y = Math.random() * viewportHeight;
            } else {
                // Top or bottom
                x = Math.random() * viewportWidth;
                y = Math.random() > 0.5 
                    ? Math.random() * (viewportHeight * 0.2) 
                    : viewportHeight * 0.8 + Math.random() * (viewportHeight * 0.2);
            }
            
            leaf.style.left = `${x}px`;
            leaf.style.top = `${y}px`;
            
            // Random initial rotation
            const initialRotation = Math.random() * 360;
            gsap.set(leaf, { rotation: initialRotation });
            
            // Store state
            floatingLeafStates.set(leaf, {
                velocity: 0,
                targetVelocity: 0,
                lastAngle: initialRotation,
                originalX: x,
                originalY: y,
                floatOffset: Math.random() * Math.PI * 2,
                floatSpeed: 0.5 + Math.random() * 1
            });
            
            floatingLeavesContainer.appendChild(leaf);
            
            // Gentle floating animation
            animateFloatingLeaf(leaf);
        }
    }
    
    function animateFloatingLeaf(leaf) {
        const state = floatingLeafStates.get(leaf);
        
        function float() {
            const time = Date.now() * 0.001;
            const floatY = Math.sin(time * state.floatSpeed + state.floatOffset) * 10;
            const floatX = Math.cos(time * state.floatSpeed * 0.7 + state.floatOffset) * 5;
            
            gsap.set(leaf, {
                x: floatX,
                y: floatY
            });
            
            requestAnimationFrame(float);
        }
        
        float();
    }
    
    createFloatingLeaves();
    
    // Add interactivity to floating leaves
    window.addEventListener('mousemove', (e) => {
        const floatingLeaves = document.querySelectorAll('.floating-leaf');
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastMoveTime) / 1000;
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        
        floatingLeaves.forEach(leaf => {
            const rect = leaf.getBoundingClientRect();
            const leafX = rect.left + rect.width / 2;
            const leafY = rect.top + rect.height / 2;
            
            const distance = Math.hypot(e.clientX - leafX, e.clientY - leafY);
            
            if (distance < 150) {
                const state = floatingLeafStates.get(leaf);
                
                const direction = deltaX >= 0 ? 1 : -1;
                const speed = Math.hypot(deltaX, deltaY) / Math.max(deltaTime, 0.01);
                
                state.targetVelocity = Math.max(-1200, Math.min(1200, speed * direction * 0.4));
                
                const proximity = 1 - (distance / 150);
                
                gsap.to(leaf, {
                    filter: `drop-shadow(0 0 ${3 + proximity * 12}px var(--leaf-bright))`,
                    opacity: 0.7 + proximity * 0.3,
                    duration: 0.3,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
                
                if (leaf._floatingMomentumTween) {
                    leaf._floatingMomentumTween.kill();
                }
            } else {
                const state = floatingLeafStates.get(leaf);
                if (state && Math.abs(state.velocity) > 10) {
                    if (!leaf._floatingMomentumTween) {
                        leaf._floatingMomentumTween = gsap.to(state, {
                            velocity: 0,
                            duration: 2,
                            ease: 'power2.out',
                            onComplete: () => {
                                leaf._floatingMomentumTween = null;
                                gsap.to(leaf, {
                                    filter: 'drop-shadow(0 0 0px var(--leaf-bright))',
                                    opacity: 0.6,
                                    duration: 0.5,
                                    ease: 'power2.out',
                                    overwrite: 'auto'
                                });
                            }
                        });
                    }
                } else if (state) {
                    gsap.to(leaf, {
                        filter: 'drop-shadow(0 0 0px var(--leaf-bright))',
                        opacity: 0.6,
                        duration: 0.5,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                }
            }
        });
    });
    
    // Animation loop for floating leaves
    function animateFloatingLeavesRotation() {
        const floatingLeaves = document.querySelectorAll('.floating-leaf');
        
        floatingLeaves.forEach(leaf => {
            const state = floatingLeafStates.get(leaf);
            if (state) {
                state.velocity += (state.targetVelocity - state.velocity) * 0.12;
                
                const rotationDelta = state.velocity * 0.016;
                state.lastAngle += rotationDelta;
                
                gsap.set(leaf, {
                    rotation: state.lastAngle
                });
            }
        });
        
        requestAnimationFrame(animateFloatingLeavesRotation);
    }
    animateFloatingLeavesRotation();
}

window.addEventListener('load', () => {
    init3DOnReveal();
    initFloatingLeaves();
});

// ─── SCROLL TO TOP ───
const scrollTopBtn = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}, { passive: true });

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── MOBILE NAVIGATION ───
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
const mobileNavClose = document.getElementById('mobile-nav-close');
const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

function openMobileNav() {
    hamburger.classList.add('active');
    mobileNav.classList.add('open');
    mobileNavBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeMobileNav() {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('open');
    mobileNavBackdrop.classList.remove('open');
    document.body.style.overflow = '';
}

if (hamburger && mobileNav) {
    hamburger.addEventListener('click', openMobileNav);
    mobileNavClose.addEventListener('click', closeMobileNav);
    mobileNavBackdrop.addEventListener('click', closeMobileNav);

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });
}
