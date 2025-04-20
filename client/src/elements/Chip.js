import React from "react";

function Chip({color = "#2e8b57", size = 80}) {
    const wedgeCount = 6;
    const wedgeAngle = 25;
    const center = size / 2;
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.7;

    const wedges = Array.from({ length: wedgeCount }).map((_, i) => {
        const angle = (360 / wedgeCount) * i;
        return (
          <path
            key={i}
            d={describeDonutWedge(center, center, innerRadius, outerRadius, angle, angle + wedgeAngle)}
            fill="white"
          />
        );
    });
    
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={center} cy={center} r={outerRadius} fill={color} />
            {wedges}
        </svg>
    )
}

function describeDonutWedge(cx, cy, r1, r2, startAngle, endAngle) {
    const startOuter = polarToCartesian(cx, cy, r2, startAngle);
    const endOuter = polarToCartesian(cx, cy, r2, endAngle);
    const startInner = polarToCartesian(cx, cy, r1, endAngle);
    const endInner = polarToCartesian(cx, cy, r1, startAngle);
  
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  
    return [
      "M", startOuter.x, startOuter.y,
      "A", r2, r2, 0, largeArc, 1, endOuter.x, endOuter.y,
      "L", startInner.x, startInner.y,
      "A", r1, r1, 0, largeArc, 0, endInner.x, endInner.y,
      "Z"
    ].join(" ");
  }
  
  function polarToCartesian(cx, cy, r, angleDeg) {
    const angleRad = (angleDeg - 90) * Math.PI / 180.0;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad)
    };
  }

export default Chip;