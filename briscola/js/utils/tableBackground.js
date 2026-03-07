"use strict";

function drawCardTableBackground(app) {
  const w = app.renderer.width;
  const h = app.renderer.height;

  const container = new PIXI.Container();

  const g = new PIXI.Graphics();

  // Full-screen dark green felt surface
  g.beginFill(0x2E7D32);
  g.drawRect(0, 0, w, h);
  g.endFill();

  // Large rounded-rectangle "table top" (~90% width, ~85% height), centered
  const tableW = w * 0.9;
  const tableH = h * 0.85;
  const tableX = (w - tableW) / 2;
  const tableY = (h - tableH) / 2;
  const cornerRadius = Math.min(tableW, tableH) * 0.06;

  g.beginFill(0x388E3C);
  g.drawRoundedRect(tableX, tableY, tableW, tableH, cornerRadius);
  g.endFill();

  // Inner rail: darker green rounded-rectangle outline, inset 18px from table top
  const railInset = 18;
  g.lineStyle(6, 0x1B5E20, 1);
  g.drawRoundedRect(
    tableX + railInset,
    tableY + railInset,
    tableW - railInset * 2,
    tableH - railInset * 2,
    Math.max(cornerRadius - railInset, 4)
  );

  // Thin gold/brass trim line, inset 28px
  const trimInset = 28;
  g.lineStyle(2, 0xBFA54A, 1);
  g.drawRoundedRect(
    tableX + trimInset,
    tableY + trimInset,
    tableW - trimInset * 2,
    tableH - trimInset * 2,
    Math.max(cornerRadius - trimInset, 4)
  );

  g.lineStyle(0);

  // Decorative corner diamonds in each corner of the inner playing area
  const playInset = 48;
  const playX = tableX + playInset;
  const playY = tableY + playInset;
  const playW = tableW - playInset * 2;
  const playH = tableH - playInset * 2;
  const diamondSize = 10;
  const diamondAlpha = 0.3;

  const corners = [
    [playX, playY],
    [playX + playW, playY],
    [playX, playY + playH],
    [playX + playW, playY + playH],
  ];

  corners.forEach(([cx, cy]) => {
    g.beginFill(0xBFA54A, diamondAlpha);
    g.moveTo(cx, cy - diamondSize);
    g.lineTo(cx + diamondSize, cy);
    g.lineTo(cx, cy + diamondSize);
    g.lineTo(cx - diamondSize, cy);
    g.closePath();
    g.endFill();
  });

  container.addChild(g);
  app.stage.addChildAt(container, 0);
}

export { drawCardTableBackground };
