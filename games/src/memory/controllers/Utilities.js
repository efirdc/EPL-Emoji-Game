export function getCssData(points) {
    let minX = Math.min(...points.map(([x, ]) => (x)));
    let maxX = Math.max(...points.map(([x, ]) => (x)));
    let minY = Math.min(...points.map(([, y]) => (y)));
    let maxY = Math.max(...points.map(([, y]) => (y)));
    let boundingBox = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };

    let localPoints = points.map(([x, y]) => ([x - boundingBox.x, y - boundingBox.y]));
    let stringCoords = localPoints.map(([x, y]) =>
        (x.toFixed(3) + 'vh ' + y.toFixed(3) + 'vh')
    );
    let clipPolygon = 'polygon(' + stringCoords.join(', ') + ')';
    return {boundingBox, localPoints, clipPolygon};
}

export function polygonCss(cssData) {
    return {
        position: 'fixed',
        width: cssData.boundingBox.width + 'vh',
        height: cssData.boundingBox.height + 'vh',
        transform: `translate(${cssData.boundingBox.x}vh, ${cssData.boundingBox.y}vh)`,
        clipPath: cssData.clipPolygon,
    }
}