export class ParticleEmitter {
  constructor({ position, maxParticles, color, emissionRate }) {
    this.position = position;
    this.maxParticles = maxParticles;
    this.color = color;
    this.emissionRate = emissionRate;
    
    // Initialize particles with life=0 so they're initially inactive
    this.particles = new Array(maxParticles).fill(null).map(() => this.createParticle());
    this.timeSinceLastEmission = 0;
    
  }

  update(dt) {
    
    // update existing particles
    for (const p of this.particles) {
      if (p.life > 0) {
        p.life -= dt;
        
        // Apply velocity to position
        p.position[0] += dt * p.velocity[0];
        p.position[1] += dt * p.velocity[1];
        p.position[2] += dt * p.velocity[2];
        
        // Fade out over time
        p.color[3] = p.life / p.maxLife; // Alpha based on remaining life
        p.color[2] = (p.life / p.maxLife) * (p.life / p.maxLife) * (p.life / p.maxLife); // Alpha based on remaining life
        p.color[1] = 0.3 + 0.7 * ( p.life / p.maxLife); // Alpha based on remaining life
      }
    }

    // emit new ones
    this.timeSinceLastEmission += dt;
    const toEmit = Math.floor(this.timeSinceLastEmission * this.emissionRate);
    this.timeSinceLastEmission -= toEmit / this.emissionRate;
    
    // Track how many particles we've actually emitted
    let emittedCount = 0;
    
    for (let i = 0; i < toEmit; i++) {
      const p = this.getFreeParticle();
      if (p) {
        this.respawn(p);
        emittedCount++;
      }
    }
  }

  createParticle() {
    return {
      position: [...this.position],
      velocity: [0, 0, 0], // Initialize with zero velocity
      color: [...this.color],
      life: 0, // Start with zero life (inactive)
      maxLife: 0,
      size: 1.0
    };
  }

  respawn(p) {
    // Add randomness to position for a volume effect
    const angle = Math.random() * 2*Math.PI;
    const radius = Math.random()
    p.position = [
      this.position[0] + radius * Math.sin(angle),  // Increased horizontal spread
      this.position[1] + radius * Math.cos(angle),   // Increased depth spread
      this.position[2] + (Math.random() - 0.5) * 0.1,
    ];

    // More varied velocities
    p.velocity = [
      (Math.random() - 0.5) * 1.0,   // Wider lateral motion
      (Math.random() - 0.5) * 1.0,    // Wider depth motion
      Math.random() * 2.0 + 1.0,     // Stronger upward motion
    ];
    
    // Varied colors for a more realistic fire
    p.color = [
      1.0,                      // red stays max
      1.0,            // varied green
      1.0,                      // no blue for fire
      1.0                       // start fully opaque
    ];

    // Varied sizes
    p.size = Math.random() * 0.60 + 0.2;
    
    // Random life duration between 1.5 and 3.0 seconds
    p.life = Math.random() * 1.5 + 1.5;
    p.maxLife = 3.;
  }

  getFreeParticle() {
    return this.particles.find(p => p.life <= 0);
  }

  getAliveParticles() {
    return this.particles.filter(p => p.life > 0);
  }

  exportParticles(positions, colors, offset) {
    let count = 0;
    
    for (const p of this.particles) {
      if (p.life > 0) {
        const i = (offset + count) * 4;

        positions[i + 0] = p.position[0];
        positions[i + 1] = p.position[1];
        positions[i + 2] = p.position[2];
        positions[i + 3] = p.size;

        colors[i + 0] = Math.round(p.color[0] * 255);
        colors[i + 1] = Math.round(p.color[1] * 255);
        colors[i + 2] = Math.round(p.color[2] * 255);
        colors[i + 3] = Math.round(p.color[3] * 255);

        count++;
      }
    }
    
    return count;
  }
}
