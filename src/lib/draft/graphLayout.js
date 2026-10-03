const DEFAULT_CONFIG = {
  padding: 70,

  // Node separation
  repulsion: 1800,
  collisionPadding: 10,

  // Relationship attraction
  linkDistance: 150,
  linkStrength: 0.035,

  // Keep the graph inside the canvas
  boundaryStrength: 0.18,

  // Keeps the whole graph gently centered
  centerStrength: 0.002,

  // Physics
  velocityDecay: 0.82,
  maxVelocity: 8,

  // Simulation
  iterations: 260,
};

function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  return Math.sqrt(dx * dx + dy * dy);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createInitialNodes(nodes, width, height, config) {
  const centerX = width / 2;
  const centerY = height / 2;

  const usableWidth = width - config.padding * 2;
  const usableHeight = height - config.padding * 2;

  return nodes.map((node, index) => {
    const randomX = seededRandom(index * 17 + 3);
    const randomY = seededRandom(index * 31 + 7);

    return {
      ...node,

      x: config.padding + randomX * usableWidth,

      y: config.padding + randomY * usableHeight,

      vx: (seededRandom(index * 43 + 11) - 0.5) * 0.5,
      vy: (seededRandom(index * 59 + 19) - 0.5) * 0.5,

      // Used later for visual depth.
      depth: 0.7 + seededRandom(index * 71 + 23) * 0.3,

      // Preserve original position as a soft reference.
      homeX: centerX,
      homeY: centerY,
    };
  });
}

function applyCenterForce(nodes, width, height, config) {
  const centerX = width / 2;
  const centerY = height / 2;

  for (const node of nodes) {
    node.vx += (centerX - node.x) * config.centerStrength;
    node.vy += (centerY - node.y) * config.centerStrength;
  }
}

function applyRepulsion(nodes, config) {
  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];

    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = nodes[j];

      let dx = b.x - a.x;
      let dy = b.y - a.y;

      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.01) {
        dx = 0.01;
        dy = 0.01;
        dist = 0.014;
      }

      const minDistance =
        (a.radius || 16) + (b.radius || 16) + config.collisionPadding;

      const force = config.repulsion / Math.max(dist * dist, 100);

      const normalizedX = dx / dist;
      const normalizedY = dy / dist;

      a.vx -= normalizedX * force;
      a.vy -= normalizedY * force;

      b.vx += normalizedX * force;
      b.vy += normalizedY * force;

      // Stronger collision force when nodes are actually touching.
      if (dist < minDistance) {
        const overlap = minDistance - dist;

        const collisionForce = overlap * 0.08;

        a.vx -= normalizedX * collisionForce;
        a.vy -= normalizedY * collisionForce;

        b.vx += normalizedX * collisionForce;
        b.vy += normalizedY * collisionForce;
      }
    }
  }
}

function applyLinkForce(nodes, edges, nodeMap, config) {
  for (const edge of edges) {
    const from = nodeMap.get(edge.from);
    const to = nodeMap.get(edge.to);

    if (!from || !to) {
      continue;
    }

    let dx = to.x - from.x;
    let dy = to.y - from.y;

    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.01) {
      dist = 0.01;
    }

    const normalizedX = dx / dist;
    const normalizedY = dy / dist;

    const strength = Math.max(0.15, Number(edge.normalizedStrength || 0));

    /*
     * Strong relationships pull their nodes closer.
     * Weak relationships have a much softer influence.
     */
    const targetDistance = config.linkDistance - strength * 45;

    const displacement = dist - targetDistance;

    const force = displacement * config.linkStrength * (0.45 + strength);

    from.vx += normalizedX * force;
    from.vy += normalizedY * force;

    to.vx -= normalizedX * force;
    to.vy -= normalizedY * force;
  }
}

function applyBoundaryForce(nodes, width, height, config) {
  const left = config.padding;
  const right = width - config.padding;

  const top = config.padding;
  const bottom = height - config.padding;

  for (const node of nodes) {
    const radius = node.radius || 16;

    if (node.x < left + radius) {
      node.vx += (left + radius - node.x) * config.boundaryStrength;
    }

    if (node.x > right - radius) {
      node.vx -= (node.x - (right - radius)) * config.boundaryStrength;
    }

    if (node.y < top + radius) {
      node.vy += (top + radius - node.y) * config.boundaryStrength;
    }

    if (node.y > bottom - radius) {
      node.vy -= (node.y - (bottom - radius)) * config.boundaryStrength;
    }
  }
}

function integrate(nodes, width, height, config) {
  for (const node of nodes) {
    node.vx *= config.velocityDecay;
    node.vy *= config.velocityDecay;

    const velocity = Math.sqrt(node.vx * node.vx + node.vy * node.vy);

    if (velocity > config.maxVelocity) {
      const scale = config.maxVelocity / velocity;

      node.vx *= scale;
      node.vy *= scale;
    }

    node.x += node.vx;
    node.y += node.vy;

    const radius = node.radius || 16;

    node.x = clamp(
      node.x,
      config.padding + radius,
      width - config.padding - radius,
    );

    node.y = clamp(
      node.y,
      config.padding + radius,
      height - config.padding - radius,
    );
  }
}

export function createGraphLayout({
  nodes,
  edges,
  width,
  height,
  config = {},
}) {
  const settings = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const simulationNodes = createInitialNodes(nodes, width, height, settings);

  const nodeMap = new Map(
    simulationNodes.map((node) => [Number(node.heroId), node]),
  );

  for (let iteration = 0; iteration < settings.iterations; iteration += 1) {
    applyRepulsion(simulationNodes, settings);

    applyLinkForce(simulationNodes, edges, nodeMap, settings);

    applyCenterForce(simulationNodes, width, height, settings);

    applyBoundaryForce(simulationNodes, width, height, settings);

    integrate(simulationNodes, width, height, settings);
  }

  return simulationNodes;
}

export function getNodeRadius(node, min = 11, max = 18) {
  const importance = clamp(Number(node.importance || 0), 0, 1);

  return min + importance * (max - min);
}
