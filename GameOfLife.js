import React, { useEffect, useRef } from 'react';
import { ReactComponent as Logo } from '../../assets/logo.svg';

export default function GameOfLife() {

    const WIDTH = 1200, HEIGHT = Math.floor(WIDTH * (9/16));
    const initZoom = 10;

    const canvasRef = useRef(null);
    const ctx = useRef(null);
    const settings = useRef(null);

    let cells = new Array(WIDTH * HEIGHT);

    let prev = Date.now();
    let dt = 0;

    function setCells() {
        for (let i = 0; i < cells.length; i++) {
            cells[i] = 0;
        }
    }
    setCells();

    function randCells() {
        for (let i = 0; i < cells.length; i++) {
            cells[i] = Math.floor(Math.random() * 1.1);
        }
    }

    let camera = {
        zoom: initZoom,
        offX: 0,
        offY: 0,
    }

    let mouse = {
        x: undefined,
        y: undefined,
        click: false,
        ctrl: false,
        prev: {
            x: undefined,
            y: undefined
        }
    }

    function index(x, y) { 
        return x + y * WIDTH;
    }

    function onMousedown(e) {
        mouse.click = true;
        mouse.ctrl = e.ctrlKey;
    } function onMouseUp() {
        mouse.click = false;
    } function onMouseMove(e) {
        mouse.prev.x = mouse.x;
        mouse.prev.y = mouse.y;
        mouse.x = e.pageX;
        mouse.y = e.pageY;
        
        

        if (mouse.click && mouse.ctrl) {
            camera.offX += (mouse.x - mouse.prev.x);
            camera.offY += (mouse.y - mouse.prev.y);
        }
    }
    useEffect(() => {
        const canvas = canvasRef.current;

        const context = canvas.getContext('2d');
        context.canvas.width = window.innerWidth;
        context.canvas.height = window.innerHeight;
        
        ctx.current = context;

        ctx.current.fillStyle = "#fff";

        window.addEventListener("wheel", (e) => {
            camera.zoom += e.deltaY * -0.01;
            camera.zoom = Math.min(Math.max(1, camera.zoom), 16);
        });
        canvasRef.current.onmousedown = onMousedown;
        canvasRef.current.onmouseup = onMouseUp;
        window.onmousemove = onMouseMove;
        
        animate();
        setInterval(() => {
            if (mouse.click && !mouse.ctrl) {
                let offsetX = window.innerWidth / 2 - (WIDTH * camera.zoom) / 2 + camera.offX;
                let offsetY = window.innerHeight / 2 - (HEIGHT * camera.zoom) / 2 + camera.offY;
                if (mouse.x > offsetX && mouse.x < offsetX + (WIDTH * camera.zoom) && mouse.y > offsetY && mouse.y < offsetY + (HEIGHT * camera.zoom)) {
                    let x = Math.floor((mouse.x - offsetX) / camera.zoom);
                    let y = Math.floor((mouse.y - offsetY) / camera.zoom);
                    cells[y * WIDTH + x] = (!settings.current.erase.checked) ? 1 : 0;
                }
    
            }    
        }, 1);
    });

    function isAlive(x, y) {
        if (x > 0 && x < WIDTH && y > 0 && y < HEIGHT) return cells[index(x, y)];
        else return 0;
    }

    function update() {
        let now = Date.now();
        dt += now - prev;

        let offsetX = window.innerWidth / 2 - (WIDTH * camera.zoom) / 2 + camera.offX;
        let offsetY = window.innerHeight / 2 - (HEIGHT * camera.zoom) / 2 + camera.offY;

        let temp = new Array(WIDTH * HEIGHT);
        
        ctx.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        if (dt > 1000 / settings.current.speed.value) {

            dt = 0;

            for (let y = 0; y < HEIGHT; y++) {
                for (let x = 0; x < WIDTH; x++) {
                    //check cells
                    let numAlive = isAlive(x - 1, y - 1)
                                 + isAlive(x, y - 1) 
                                 + isAlive(x + 1, y - 1) 
                                 + isAlive(x - 1, y) 
                                 + isAlive(x + 1, y) 
                                 + isAlive(x - 1, y + 1) 
                                 + isAlive(x, y + 1) 
                                 + isAlive(x + 1, y + 1);

                    //check rules
                    if (numAlive == 2) temp[index(x, y)] = cells[index(x, y)];
                    else if (numAlive == 3) temp[index(x, y)] = 1;
                    else temp[index(x, y)] = 0;

                    //draw
                    if (cells[index(x, y)] == 1) {
                        ctx.current.fillRect(x * camera.zoom + offsetX, y * camera.zoom + offsetY, camera.zoom, camera.zoom);
                    }
                }
            }

            for (let i = 0; i < cells.length; i++) cells[i] = temp[i];
        } else {
            for (let y = 0; y < HEIGHT; y++) {
                for (let x = 0; x < WIDTH; x++) {
                    //draw
                    if (cells[index(x, y)] == 1) {
                        ctx.current.fillRect(x * camera.zoom + offsetX, y * camera.zoom + offsetY, camera.zoom, camera.zoom);
                    }
                }
            }
        }
        prev = Date.now();
    }

    function animate() {
        update();
        requestAnimationFrame(animate);
    }

    return (
        <>
        <canvas className='canvas' ref={canvasRef}></canvas>
        <form className='settings' ref={settings}>
            <label>Speed</label>
            <input name='speed' type="range" min={0} max={100} defaultValue={0} />
            <label>Erase</label>
            <input name="erase" type="checkbox"/>
            <p onClick={() => {
                randCells();
            }}>Randomize</p>
            <p onClick={() => {
                setCells();
            }}>Reset</p>
        </form>
        <p className='info'>Click to Add | Ctrl + Click to Move</p>
        <a href="./"><Logo className="logo"></Logo></a>
        </>
    );
}