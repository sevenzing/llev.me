// MatterStepOne.js
import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { time } from 'console';

const CONFIG = {
  width: 400,
  height: 800,
  startX: 0,
  startY: 100,
  armHeight: 200,
  armWidth: 20,
  armsGap: 20,
  numberOfArms: 2,
  gravity: 0.0005,
  timeScale: 1,
  frictionAir: 0.0001,
  offsetPercent: 0.45,
  colorBackground: '#102C57',
  color_1: '#FFCBCB',
  color_2: '#FFCBCB',
  trailColorValue: 300,
  buildWalls: false,
}


export const DoublePendulum = () => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const Engine = Matter.Engine,
        World = Matter.World,
        Events = Matter.Events,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Constraint = Matter.Constraint,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Bodies = Matter.Bodies,
        Vector = Matter.Vector;

    const engine = Engine.create();
    const world = engine.world;

    var render = Render.create({
      element: boxRef.current || undefined,
      engine: engine,
      canvas: canvasRef.current || undefined,
      options: {
        width: CONFIG.width,
        height: CONFIG.height,
        wireframes: false,
        background: CONFIG.colorBackground
      },
    });
    
    world.gravity.scale = CONFIG.gravity;
    engine.timing.timeScale = CONFIG.timeScale;
    
    const offsetPercent = CONFIG.offsetPercent;
    const xOffsetForArm = CONFIG.armHeight * offsetPercent;

    const pendulumGroup = Body.nextGroup(true);
    const pendulum = Composites.stack(CONFIG.startX, CONFIG.startY, CONFIG.numberOfArms, 1, -CONFIG.armsGap, 0, (x: number, y: number) => {
      return Bodies.rectangle(x, y, CONFIG.armHeight, CONFIG.armWidth, {
        collisionFilter: {
          group: pendulumGroup,
        },
        render: { 
          fillStyle: 'transparent',
          lineWidth: 1,
          strokeStyle: CONFIG.color_1,
        },
        frictionAir: CONFIG.frictionAir,
        chamfer: {
          radius: 10,
        },


      });
    })
    Composites.chain(pendulum, offsetPercent, 0, -offsetPercent, 0, { 
      stiffness: 0.9, 
      length: 0,
      angularStiffness: 0.7,
      render: {
          strokeStyle: CONFIG.color_1,
      }
    });
    const upperArm = pendulum.bodies[0];
    const lowerArm = pendulum.bodies[pendulum.bodies.length - 1];

    Composite.add(pendulum, Constraint.create({
      bodyA: upperArm,
      pointA: {
        x: -xOffsetForArm,
        y: 0,
      },
      pointB : {
        x: upperArm.position.x + xOffsetForArm,
        y: upperArm.position.y,
      },
      stiffness: 0.9,
      length: 0,
      render: {
        visible: true,
        lineWidth: 2,
        strokeStyle: CONFIG.color_2,
      }
    }))
    Composite.add(world, pendulum);
    leaveTrail(render, lowerArm, xOffsetForArm);

    if (CONFIG.buildWalls) {
      const wallOptions = {
        isStatic: true,
        render: {
          visible: false,
        }
      };
      World.add(world, [
        Bodies.rectangle(CONFIG.width / 2, 0, CONFIG.width, 50, wallOptions),
        Bodies.rectangle(CONFIG.width / 2, CONFIG.height, CONFIG.width, 50, wallOptions),
        Bodies.rectangle(CONFIG.width, CONFIG.height / 2, 50, CONFIG.height, wallOptions),
        Bodies.rectangle(0, CONFIG.height / 2, 50, CONFIG.height, wallOptions),
      ]);
    }

    var mouse = Mouse.create(render.canvas);

    var runner = Runner.create();
    Runner.run(runner, engine);
    Engine.run(engine);
    Render.run(render);
  }, []);

  return (
    <div ref={boxRef}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default DoublePendulum;



const leaveTrail = (render: Matter.Render, lowerArm: Matter.Body, xOffsetForArm: number) => {
  const trail: any = [];

  Matter.Events.on(render, 'afterRender', function() {
      const x = lowerArm.position.x + xOffsetForArm * Math.cos(lowerArm.angle);
      const y = lowerArm.position.y + xOffsetForArm * Math.sin(lowerArm.angle);
      trail.unshift({
          position: {
            x: x,
            y: y,
          },
          speed: lowerArm.speed
      });

      for (var i = 0; i < trail.length; i += 1) {
          var point = trail[i].position,
              speed = trail[i].speed;
          const value = CONFIG.trailColorValue;
          var hue = value + Math.round((1 - Math.min(1, speed / 10)) * (370 - value));
          render.context.fillStyle = 'hsl(' + hue + ', 100%, 75%)';
          render.context.fillRect(point.x, point.y, 2, 2);
      }

      if (trail.length > 2000) {
          trail.pop();
      }
  });
}