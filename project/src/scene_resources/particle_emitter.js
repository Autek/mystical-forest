export class ParticleEmitter {
  constructor({ position, maxParticles, emissionRate }) {
    this.position = position;
    this.maxParticles = maxParticles;
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
      }
    }

    // avoid emitting a lot of particles when loading the page
    dt = Math.min(dt, 0.1);
    this.timeSinceLastEmission += dt;
    const toEmit = Math.floor(this.timeSinceLastEmission * this.emissionRate);
    if (this.emissionRate !== 0) {
      this.timeSinceLastEmission -= toEmit / this.emissionRate;
    }
    
    for (let i = 0; i < toEmit; i++) {
      const p = this.getFreeParticle();
      if (p) {
        this.respawn(p);
      }
    }
  }

  createParticle() {
    return {
      position: [0, 0, 0],
      velocity: [0, 0, 0], // Initialize with zero velocity
      color: [1, 1, 1, 1],
      life: 0, // Start with zero life (inactive)
      size: 0
    };
  }

  respawn(p) {
  { /* not defined for abstract ParticleEmitter */ }
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
