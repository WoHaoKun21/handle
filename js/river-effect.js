class RiverFlowEffect {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.rivers = [];
    this.particles = [];
    this.isAnimating = false;
    this.animationId = null;

    this.init();
  }

  init() {
    this.createSVG();
    this.createRivers();
    this.createControlPanel();
    this.startAnimation();
  }

  createSVG() {
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.svg.classList.add("absolute", "top-0", "left-0");
    this.container.appendChild(this.svg);
  }

  createRivers() {
    // 创建主要河流
    const mainRiver = this.createRiverPath(
      [
        [50, 100],
        [150, 120],
        [250, 110],
        [350, 130],
        [450, 115],
        [550, 125],
        [650, 135],
        [750, 120],
      ],
      "#4A90E2",
      8
    );

    // 创建支流
    const branchRiver1 = this.createRiverPath(
      [
        [200, 110],
        [220, 150],
        [240, 180],
        [260, 200],
        [300, 240],
      ],
      "#5DADE2",
      5
    );

    // 创建支流2
    const branchRiver2 = this.createRiverPath(
      [
        [400, 130],
        [420, 160],
        [440, 190],
      ],
      "#3498DB",
      4
    );

    this.rivers.push(mainRiver, branchRiver1, branchRiver2);
    this.createWaterParticles();
  }

  createRiverPath(points, color, width) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i][0]} ${points[i][1]}`;
    }

    path.setAttribute("d", d);
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", width);
    path.setAttribute("fill", "none");
    path.classList.add("river-path");

    this.svg.appendChild(path);
    return { element: path, points, color, width };
  }

  createWaterParticles() {
    for (const river of this.rivers) {
      for (let i = 0; i < river.points.length - 1; i++) {
        const startPoint = river.points[i];
        const endPoint = river.points[i + 1];

        // 沿河流创建粒子
        for (let j = 0; j < 3; j++) {
          this.createParticleAlongPath(river, i);
        }
      }
    }
  }

  createParticleAlongPath(river, segmentIndex) {
    const particle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );

    const startPoint = river.points[segmentIndex];
    const endPoint = river.points[segmentIndex + 1];

    particle.setAttribute("r", Math.random() * 2 + 1);
    particle.setAttribute("fill", this.getParticleColor(river.color));
    particle.classList.add("water-particle");

    // 设置随机位置和动画延迟
    const progress = Math.random();
    const x = startPoint[0] + (endPoint[0] - startPoint[0]) * progress;
    const y = startPoint[1] + (endPoint[1] - startPoint[1]) * progress;

    particle.setAttribute("cx", x);
    particle.setAttribute("cy", y);
    particle.style.animationDelay = `${Math.random() * 2}s`;

    this.svg.appendChild(particle);
    this.particles.push({
      element: particle,
      river,
      segmentIndex,
      progress,
      speed: 1,
    });
  }

  getParticleColor(baseColor) {
    const colors = {
      "#4A90E2": ["#87CEEB", "#ADD8E6", "#B0E0E6"],
      "#5DADE2": ["#7FB3D5", "#A2D9CE", "#AED6F1"],
      "#3498DB": ["#5DADE2", "#85C1E9", "#A9CCE3"],
    };

    const availableColors = colors[baseColor] || ["#87CEEB", "#ADD8E6"];
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  }

  createControlPanel() {
    const controls = document.createElement("div");
    controls.className =
      "absolute top-4 right-4 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg";
    controls.innerHTML = `
          <h3 class="font-bold text-gray-800 mb-2">控制选项</h3>
          <div class="space-y-2">
              <div>
                  <label class="text-sm text-gray-700">流速: </label>
                  <input type="range" id="speedControl" min="1" max="10" value="5" class="w-full">
              </div>
              <div>
                  <label class="text-sm text-gray-700">粒子数量: </label>
                  <input type="range" id="particleControl" min="5" max="50" value="20" class="w-full">
              </div>
              <button id="toggleAnimation" class="w-full bg-green-500 hover:bg-green-600 text-white py-1 rounded transition duration-300">
                      <i class="fas fa-pause mr-1" />暂停
                </button>
          </div>
      `;
    this.container.appendChild(controls);

    this.setupEventListeners();
  }

  setupEventListeners() {
    const speedControl = document.getElementById("speedControl");
    const particleControl = document.getElementById("particleControl");
    const toggleButton = document.getElementById("toggleAnimation");

    speedControl.addEventListener("input", (e) => {
      this.updateAnimationSpeed(e.target.value);
    });

    particleControl.addEventListener("input", (e) => {
      this.updateParticleCount(e.target.value);
    });

    toggleButton.addEventListener("click", () => {
      this.toggleAnimation();
    });
  }

  updateAnimationSpeed(speed) {
    const animationDuration = 3 - speed * 0.2;
    console.log("流苏效果：", document.styleSheets[0]);
    document.styleSheets[0].insertRule(
      `@keyframes flow { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 20; }`,
      document.styleSheets.length
    );
  }

  updateParticleCount(count) {
    // 移除多余粒子
    while (this.particles.length > count) {
      const particle = this.particles.pop();
      particle.element.remove();
    }

    // 添加新粒子
    while (this.particles.length < count) {
      const randomRiver =
        this.rivers[Math.floor(Math.random() * this.rivers.length)];
      this.createParticleAlongPath(randomRiver, 0);
    }
  }

  toggleAnimation() {
    const button = document.getElementById("toggleAnimation");

    if (this.isAnimating) {
      this.stopAnimation();
      button.innerHTML = '<i class="fas fa-play mr-1"></i>播放';
    } else {
      this.startAnimation();
      button.innerHTML = '<i class="fas fa-pause mr-1"></i>暂停';
    }
  }

  startAnimation() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.animate();
  }

  stopAnimation() {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  animate() {
    if (!this.isAnimating) return;

    // 更新粒子位置
    this.updateParticles();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  updateParticles() {
    for (const particle of this.particles) {
      particle.progress += particle.speed;

      if (particle.progress >= 1) {
        particle.progress = 0;
        particle.segmentIndex =
          (particle.segmentIndex + 1) % (particle.river.points.length - 1);
      }

      const segmentIndex = particle.segmentIndex;
      const startPoint = particle.river.points[segmentIndex];
      const endPoint = particle.river.points[segmentIndex + 1];

      const x =
        startPoint[0] + (endPoint[0] - startPoint[0]) * particle.progress;
      const y =
        startPoint[1] + (endPoint[1] - startPoint[1]) * particle.progress;

      particle.element.setAttribute("cx", x);
      particle.element.setAttribute("cy", y);
    }
  }

  reset() {
    this.stopAnimation();
    this.particles.forEach((p) => p.element.remove());
    this.rivers.forEach((r) => r.element.remove());
    this.particles = [];
    this.rivers = [];
    this.createRivers();
    this.startAnimation();
  }
}

// 初始化河流效果
document.addEventListener("DOMContentLoaded", function () {
  const riverEffect = new RiverFlowEffect("riverCanvas");

  // 设置重置按钮事件
  // document.getElementById('resetBtn').addEventListener('click', function() {
  //     riverEffect.reset();
  // });

  // 创建涟漪效果
  setInterval(() => {
    createRippleEffect();
  }, 2000);
});

function createRippleEffect() {
  const canvas = document.getElementById("riverCanvas");
  const rivers = document.querySelectorAll(".river-path");

  if (rivers.length > 0) {
    const randomRiver = rivers[Math.floor(Math.random() * rivers.length)];
    const pathLength = randomRiver.getTotalLength();
    const randomPoint = randomRiver.getPointAtLength(
      Math.random() * pathLength
    );

    const ripple = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    ripple.setAttribute("cx", point.x);
    ripple.setAttribute("cy", point.y);
    ripple.setAttribute("r", 0);
    ripple.setAttribute("fill", "none");
    ripple.setAttribute("stroke", "#87CEEB");
    ripple.setAttribute("stroke-width", "2");
    ripple.classList.add("ripple");

    document.querySelector("svg").appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 1500);
  }
}

// // 鼠标交互效果
// function setupMouseInteraction() {
//   const canvas = document.getElementById("riverCanvas");

//   canvas.addEventListener("mousemove", function (e) {
//     const rect = canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     // 在鼠标位置创建临时粒子
//     createMouseParticle(x, y);
//   });
// }

function createMouseParticle(x, y) {
  const particle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  particle.setAttribute("cx", x);
  particle.setAttribute("cy", y);
  particle.setAttribute("r", 2);
  particle.setAttribute("fill", "#87CEEB");

  document.querySelector("svg").appendChild(particle);

  // 粒子消失动画
  setTimeout(() => {
    particle.style.transition = "all 1s ease-out";
    particle.style.opacity = "0";
    particle.style.transform = "scale(2)";

    setTimeout(() => {
      particle.remove();
    }, 1000);
  }, 100);
}

// 初始化鼠标交互
// document.addEventListener("DOMContentLoaded", setupMouseInteraction);
