import { ParticleEmitter } from "./particle_emitter.js";

export class FireEmitter extends ParticleEmitter{
  constructor({ position, maxParticles, emissionRate, color, maxLife, minLife, minPartSize, maxPartSize}) {
    super({ position, maxParticles, emissionRate })
    this.color = color;
    this.maxLife = maxLife;
    this.minLife = minLife;
    this.minPartSize = minPartSize;
    this.maxPartSize = maxPartSize;
    this.fireRadius = 0.12;
    this.speed = 0.1;
    this.aDecay = 1;
    this.bDecay = 1;
    this.gDecay = 0.7;
    this.rDecay = 0;
    this.aThreshold = 0;
    this.bThreshold = 0.6;
    this.gThreshold = 0.8;
    this.rThreshold = 0;
  }

  update(dt) {
    // update existing particles
    super.update(dt);
    for (const p of this.particles) {
      if (p.life > 0) {
        p.color[3] = (1 - this.aDecay) + this.aDecay * Math.max((p.life / this.maxLife) - this.aThreshold, 0) ;
        p.color[2] = (1 - this.bDecay) + this.bDecay * Math.max((p.life / this.maxLife) - this.bThreshold, 0) ;
        p.color[1] = (1 - this.gDecay) + this.gDecay * Math.max((p.life / this.maxLife) - this.gThreshold, 0) ;
        p.color[0] = (1 - this.rDecay) + this.rDecay * Math.max((p.life / this.maxLife) - this.rThreshold, 0) ; 
      }
    }
  }

  respawn(p) {
    // Add randomness to position for a volume effect
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * this.fireRadius;
    p.position = [
      this.position[0] + radius * Math.sin(angle),
      this.position[1] + radius * Math.cos(angle),
      this.position[2] + (Math.random() - 0.5) * 0.1,
    ];

    // More varied velocities
    p.velocity = [
      (Math.random() - 0.5) * this.speed,   // Wider lateral motion
      (Math.random() - 0.5) * this.speed,    // Wider depth motion
      Math.random() * 2.0 * this.speed + 0.1,     // Stronger upward motion
    ];
    
    // Varied colors for a more realistic fire
    p.color = [
      1.0,                      // red stays max
      1.0,                      // varied green
      1.0,                      // no blue for fire
      1.0                       // start fully opaque
    ];

    // Varied sizes
    p.size = Math.random() * (this.maxPartSize - this.minPartSize) + this.minPartSize;
    
    // Random life duration between 1.5 and 3.0 seconds
    p.life = Math.random() * (this.maxLife - this.minLife) + this.minLife;
  }
}

