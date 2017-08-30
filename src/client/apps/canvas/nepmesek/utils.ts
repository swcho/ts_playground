
export function drawCircle(
        ctx: CanvasRenderingContext2D,
        { x, y }: Pos,
        radius: number,
        color: Color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color || 'white';
    ctx.fill();
    ctx.closePath();
}
