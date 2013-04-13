/*
 * Copyright (c) 2013 Taye Adeyemi
 * Open source under the MIT License.
 * https://raw.github.com/taye/interact.js/master/LICENSE
 */

/**
 * @namespace interact.js module
 * @name interact
 */
(function(interact) {
    'use strict';

    var canvas,
        context,
        guidesCanvas,
        guidesContext,
        width = 800,
        height = 800,
        snap = interact.snap(true).snap(),
        status,
        prevX = 0,
        prevY = 0,
        blue = '#2299ee',
        peppermint = '#66e075',
        tango = '#ff4400',
        draggingAnchor = false;

    function drawGrid (grid) {
        var barWidth = 4,
            barLength = 16;

        guidesContext.clearRect(0, 0, width, height);

        guidesCanvas.fillStyle = blue;

        if (snap.range < 0) {
            guidesContext.fillStyle = 'rgba(34, 153, 238, 0.5)';
            guidesContext.fillRect(0, 0, width, height);
        }

        for (var i = 0, lenX = width / grid.x + 1; i < lenX; i++) {
            for (var j = 0, lenY = height / grid.y + 1; j < lenY; j++) {
                if (snap.range > 0) {
                    guidesContext.circle(i * grid.x + grid.offsetX, j * grid.y + grid.offsetY, snap.range, blue).fill();
                }

                guidesContext.beginPath();
                guidesContext.moveTo(i * grid.x + grid.offsetX, j * grid.y + grid.offsetY - barLength / 2);
                guidesContext.lineTo(i * grid.x + grid.offsetX, j * grid.y + grid.offsetY + barLength / 2);
                guidesContext.stroke();

                guidesContext.beginPath();
                guidesContext.moveTo(i * grid.x + grid.offsetX - barLength / 2, j * grid.y + grid.offsetY);
                guidesContext.lineTo(i * grid.x + grid.offsetX + barLength / 2, j * grid.y + grid.offsetY);
                guidesContext.stroke();
            }
        }
    }

    function drawAnchors (anchors) {
        guidesContext.clearRect(0, 0, width, height);

        for (var i = 0, len = anchors.length; i < len; i++) {
            var anchor = anchors[i],
                range = typeof anchor.range === 'number'? anchor.range: snap.range;

            if (range > 0) {
                guidesContext.circle(anchor.x, anchor.y, range, blue).fill();
            }
        }
    }

    function circle (x, y, radius, color) {
        this.fillStyle = color || this.fillStyle;
        this.beginPath();
        this.arc(x, y, radius, 0, 2*Math.PI);

        return this;
    }
    window.CanvasRenderingContext2D.prototype.circle = circle;

    function dragMove (event) {
        context.clearRect(0, 0, width, height);

        if (snap.enabled) {
            var highlightRadius = snap.range > 0? snap.range + 1: 10;

            context.circle(snap.x, snap.y, highlightRadius, 'rgba(102, 225, 117, 0.8)').fill();
        }

        context.circle(event.pageX, event.pageY, 10, tango).fill();

        prevX = event.pageX;
        prevY = event.pageY;
    }

    function dragEnd (event) {
        context.circle(event.pageX, event.pageY, 10, tango).fill();

        prevX = event.pageX;
        prevY = event.pageY;
    }

    function anchorDragStart (event) {
        if (snap.locked) {
            snap.enabled = false;
            draggingAnchor = true;

            anchorDragMove(event);
        }
    }

    function anchorDragMove (event) {
        if (draggingAnchor && snap.anchors.closest) {
            snap.anchors.closest.x += event.dx;
            snap.anchors.closest.y += event.dy;

            drawAnchors(snap.anchors);
        }
    }

    function anchorDragEnd (event) {
        snap.enabled = true;
        draggingAnchor = false;
    }

    function statusChange (event) {
        snap.grid.x = Number(status.gridX.value);
        snap.grid.y = Number(status.gridY.value);
        snap.grid.offsetX = Number(status.offsetX.value);
        snap.grid.offsetY = Number(status.offsetY.value);

        snap.range = Number(status.range.value);
        snap.enabled = !status.offMode.checked;

        if (status.anchorDrag.checked) {
            status.anchorMode.disabled = status.offMode.disabled = status.gridMode.disabled = true;
            snap.mode = 'anchor';

            interact(canvas)
                .unbind('dragmove', dragMove)
                .unbind('dragend', dragEnd)
                .bind('dragstart', anchorDragStart)
                .bind('dragmove', anchorDragMove)
                .bind('dragend', anchorDragEnd)
                .checkOnHover(false);
        }
        else {
            status.anchorMode.disabled = status.offMode.disabled = status.gridMode.disabled = false;

            interact(canvas)
                .bind('dragmove', dragMove)
                .bind('dragend', dragEnd)
                .unbind('dragstart', anchorDragStart)
                .unbind('dragmove', anchorDragMove)
                .unbind('dragend', anchorDragEnd)
                .checkOnHover(false);
        }

        snap.mode = status.anchorMode.checked || status.anchorDrag.checked? 'anchor': 'grid';

        context.clearRect(0, 0, width, height);
        if (snap.enabled) {
            if (snap.mode === 'grid') {
                drawGrid(snap.grid);
            }
            else if (snap.mode === 'anchor') {
                drawAnchors(snap.anchors);
            }
        }
        else {
            context.clearRect(0, 0, width, height);
            guidesContext.clearRect(0, 0, width, height);
        }
    }

    interact.styleCursor(false);

    interact(document).bind('DOMContentLoaded', function () {
        canvas = document.getElementById('drag');
        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext('2d');

        interact(canvas).draggable(true);

        guidesCanvas = document.getElementById('grid');
        guidesCanvas.width = width;
        guidesCanvas.height = height;
        guidesContext = guidesCanvas.getContext('2d');

        status = {
            container: document.getElementById('status'),
            offMode: document.getElementById('off-mode'),
            gridMode: document.getElementById('grid-mode'),
            anchorMode: document.getElementById('anchor-mode'),
            range: document.getElementById('snap-range'),
            snapX: document.getElementById('snap-x'),
            snapY: document.getElementById('snap-y'),
            gridX: document.getElementById('grid-x'),
            gridY: document.getElementById('grid-y'),
            offsetX: document.getElementById('offset-x'),
            offsetY: document.getElementById('offset-y'),
            anchorDrag: document.getElementById('drag-anchors')
        }

        interact(status.container).bind('change', statusChange);

        snap.anchors = [
            {x: 100, y: 100},
            {x: 600, y: 400},
            {x: 500, y: 150},
            {x: 900, y: 300},
            {x: 300, y: 300}
        ];

        statusChange();
    });

    window.grid = {
        drawGrid: drawGrid
    };

}(window.interact));