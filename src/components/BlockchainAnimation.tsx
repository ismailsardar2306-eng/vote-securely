import { useEffect, useState } from "react";

interface Block {
  id: number;
  x: number;
  y: number;
  delay: number;
}

export const BlockchainAnimation = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    const newBlocks: Block[] = [];
    for (let i = 0; i < 8; i++) {
      newBlocks.push({
        id: i,
        x: 15 + i * 10,
        y: 30 + Math.sin(i * 0.8) * 20,
        delay: i * 0.3,
      });
    }
    setBlocks(newBlocks);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Connection lines */}
        {blocks.slice(0, -1).map((block, i) => (
          <line
            key={`line-${i}`}
            x1={block.x + 3}
            y1={block.y + 3}
            x2={blocks[i + 1]?.x}
            y2={blocks[i + 1]?.y + 3}
            stroke="hsl(var(--secondary))"
            strokeWidth="0.3"
            strokeDasharray="1,1"
            className="animate-pulse-slow"
            style={{ animationDelay: `${block.delay}s` }}
          />
        ))}
        
        {/* Blocks */}
        {blocks.map((block) => (
          <g
            key={block.id}
            className="animate-float"
            style={{ animationDelay: `${block.delay}s` }}
          >
            <rect
              x={block.x}
              y={block.y}
              width="6"
              height="6"
              rx="1"
              fill="hsl(var(--primary))"
              className="opacity-60"
            />
            <rect
              x={block.x + 1}
              y={block.y + 1}
              width="4"
              height="1"
              fill="hsl(var(--secondary))"
              className="opacity-80"
            />
            <rect
              x={block.x + 1}
              y={block.y + 3}
              width="3"
              height="0.5"
              fill="hsl(var(--secondary))"
              className="opacity-60"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
