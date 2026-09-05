"use client";

import { useEffect, useRef } from "react";

/** A self-contained canvas layer; it owns no React state, so form updates never restart the animation. */
export default function BlackHoleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let W = 0, H = 0, DPR = 1;
    let streams: Array<{ phase: number; inner: number; outer: number; width: number; speed: number; bend: number; seed: number }> = [];
    let stars: Array<{ x: number; y: number; r: number; a: number; tw: number; speed: number }> = [];
    let dust: Array<{ angle: number; radius: number; size: number; alpha: number; speed: number }> = [];
    let animationFrame = 0;
    const TAU = Math.PI * 2;

    const smoothstep = (a: number, b: number, x: number) => {
      x = Math.max(0, Math.min(1, (x - a) / (b - a)));
      return x * x * (3 - 2 * x);
    };
    const plasmaColor = (value: number, alpha = 1) => {
      const stops: Array<[number, [number, number, number]]> = [[0, [255, 249, 226]], [.16, [255, 194, 108]], [.34, [255, 112, 87]], [.52, [238, 74, 137]], [.72, [143, 63, 205]], [1, [58, 88, 190]]];
      const t = Math.max(0, Math.min(1, value));
      let left = stops[0], right = stops[stops.length - 1];
      for (let i = 0; i < stops.length - 1; i++) if (t >= stops[i][0] && t <= stops[i + 1][0]) { left = stops[i]; right = stops[i + 1]; break; }
      const p = (t - left[0]) / (right[0] - left[0]);
      const ease = p * p * (3 - 2 * p);
      const [r, g, b] = left[1].map((channel, i) => channel + (right[1][i] - channel) * ease);
      return `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
    };
    const getBH = () => {
      const scale = Math.min(W, H);
      return { x: W * .62, y: H * .53, horizon: scale * .075, photon: scale * .088 };
    };
    const createScene = () => {
      streams = []; stars = []; dust = [];
      const scale = Math.min(W, H);
      const starCount = Math.floor(Math.min(260, Math.max(120, W * H / 8500)));
      for (let i = 0; i < starCount; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * .95 + .18, a: Math.random() * .42 + .08, tw: Math.random() * TAU, speed: Math.random() * .45 + .15 });
      for (let i = 0; i < 30; i++) dust.push({ angle: Math.random() * TAU, radius: scale * (.25 + Math.random() * .52), size: Math.random() * 1.15 + .25, alpha: Math.random() * .12 + .025, speed: .0008 + Math.random() * .0015 });
      const streamData = [
        { phase: -1.72, inner: .105, outer: .52, width: .050, speed: .82, bend: 1.18 }, { phase: -.72, inner: .12, outer: .60, width: .062, speed: .68, bend: 1.02 },
        { phase: .22, inner: .105, outer: .55, width: .046, speed: .92, bend: 1.28 }, { phase: 1.28, inner: .13, outer: .62, width: .065, speed: .64, bend: 1.08 }, { phase: 2.30, inner: .12, outer: .55, width: .048, speed: .78, bend: 1.20 },
      ];
      streams = streamData.map((stream) => ({ ...stream, phase: stream.phase + (Math.random() - .5) * .12, seed: Math.random() * 1000 }));
    };
    // DPR capping and resize behavior intentionally match the reference exactly.
    const resize = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      createScene();
    };
    const drawNebula = () => {
      const clouds: [number, number, number, number, string][] = [[W*.05,H*.22,W*.55,H*.55,"rgba(64,36,145,0.17)"],[W*.78,H*.20,W*.52,H*.55,"rgba(42,50,145,0.15)"],[W*.80,H*.84,W*.55,H*.42,"rgba(89,30,130,0.13)"],[W*.18,H*.88,W*.45,H*.35,"rgba(120,35,95,0.10)"]];
      for (const [x,y,rx,ry,color] of clouds) { ctx.save(); ctx.translate(x,y); ctx.scale(1,ry/rx); const gradient=ctx.createRadialGradient(0,0,0,0,0,rx); gradient.addColorStop(0,color); gradient.addColorStop(.55,color.replace(/[\d.]+\)$/,"0.035)")); gradient.addColorStop(1,"rgba(0,0,0,0)"); ctx.fillStyle=gradient; ctx.beginPath(); ctx.arc(0,0,rx,0,TAU); ctx.fill(); ctx.restore(); }
    };
    const drawStars = (time: number) => {
      const bh=getBH();
      for (const star of stars) { const pulse=.72+Math.sin(time*star.speed+star.tw)*.28; let x=star.x,y=star.y; const dx=x-bh.x,dy=y-bh.y,dist=Math.hypot(dx,dy),lensRadius=bh.photon*5.2;
        if (dist>bh.photon*.75&&dist<lensRadius) { const influence=1-smoothstep(bh.photon*.75,lensRadius,dist), bend=influence*influence*(bh.photon/Math.max(dist,bh.photon*.8))*.62, angle=Math.atan2(dy,dx)+bend, radius=dist*(1+influence*.045); x=bh.x+Math.cos(angle)*radius;y=bh.y+Math.sin(angle)*radius; }
        if (dist<bh.horizon*1.05) continue; ctx.beginPath();ctx.fillStyle=`rgba(225,228,255,${star.a*pulse})`;ctx.arc(x,y,star.r,0,TAU);ctx.fill(); }
    };
    const streamPoint = (stream: typeof streams[number], radius: number, time: number) => {
      const bh=getBH(),scale=Math.min(W,H),normalized=radius/scale,rotation=time*.00042*stream.speed*Math.pow(.115/Math.max(normalized,.045),1.42),radialT=(radius/scale-stream.inner)/(stream.outer-stream.inner),inward=1-smoothstep(0,1,radialT),wobble=Math.sin(stream.seed+radius*.021+time*.00045)*.055+Math.sin(stream.seed*1.7+radius*.009-time*.00022)*.032,turbulence=Math.sin(stream.seed*2.31+radius*.030-time*.00115)*.020+Math.sin(stream.seed*.71+radius*.013+time*.00073)*.014+Math.sin(stream.seed*3.17+radius*.006-time*.00041)*.010,curve=stream.bend*Math.pow(Math.max(.04,inward),1.28)+.42*Math.pow(Math.max(.02,inward),2.15),angle=stream.phase+rotation+curve+wobble+turbulence,densityWave=1+Math.sin(stream.seed*1.91+radius*.026-time*.0010)*.026+Math.sin(stream.seed*.53+radius*.011+time*.00062)*.015;
      radius*=densityWave; const side=Math.sin(angle+.65),perspective=.60+.40*((side+1)*.5),thickness=scale*.025*(.45+.55*Math.min(1,normalized/.35)),vertical=Math.sin(angle*1.7+stream.seed)*scale*.014*Math.pow(Math.max(.1,inward),.8)+Math.cos(angle*2.1+stream.seed*.73)*thickness*.30;
      return {x:bh.x+Math.cos(angle)*radius,y:bh.y+Math.sin(angle)*radius*perspective+vertical,depth:side};
    };
    const smoothRibbonPath = (points: ReturnType<typeof streamPoint>[]) => {
      const path=new Path2D(); if (!points.length) return path; if (points.length===1) { path.moveTo(points[0].x,points[0].y); return path; } path.moveTo(points[0].x,points[0].y);path.lineTo((points[0].x+points[1].x)*.5,(points[0].y+points[1].y)*.5); for(let i=1;i<points.length-1;i++){const point=points[i],next=points[i+1];path.quadraticCurveTo(point.x,point.y,(point.x+next.x)*.5,(point.y+next.y)*.5);} const last=points[points.length-1];path.quadraticCurveTo(last.x,last.y,last.x,last.y);return path;
    };
    const drawRibbon = (stream: typeof streams[number], time: number) => {
      const scale=Math.min(W,H),points=Array.from({length:81},(_,i)=>{const p=i/80;return streamPoint(stream,scale*(stream.inner+(stream.outer-stream.inner)*Math.pow(p,1.22)),time);}),path=smoothRibbonPath(points),average=points.reduce((sum,point)=>sum+point.depth,0)/points.length,approaching=Math.max(0,average),receding=Math.max(0,-average),doppler=.78+approaching*.48-receding*.18,density=1+Math.sin(stream.seed*1.91+time*.00105)*.055+Math.sin(stream.seed*.63-time*.00067)*.035,turbulence=Math.max(.82,Math.min(1.18,density));
      ctx.save();ctx.lineCap="round";ctx.lineJoin="round";ctx.globalCompositeOperation="lighter";ctx.globalAlpha=Math.max(.22,Math.min(.42,doppler*.34));ctx.strokeStyle=approaching>receding?"rgba(255,150,105,1)":"rgba(125,105,220,1)";ctx.lineWidth=scale*stream.width*.90*(.94+approaching*.10)*turbulence;ctx.stroke(path);ctx.restore();
      ctx.save();ctx.lineCap="round";ctx.lineJoin="round";ctx.globalCompositeOperation="lighter";const gradient=ctx.createLinearGradient(points[0].x,points[0].y,points.at(-1)!.x,points.at(-1)!.y);[[0,"rgba(255,237,193,0.78)"],[.16,"rgba(255,166,91,0.68)"],[.36,"rgba(255,95,111,0.50)"],[.58,"rgba(221,67,163,0.36)"],[.8,"rgba(120,62,196,0.25)"],[1,"rgba(56,76,180,0.12)"]].forEach(([stop,color])=>gradient.addColorStop(stop as number,color as string));ctx.globalAlpha=Math.max(.58,Math.min(1.06,doppler));ctx.strokeStyle=gradient;ctx.lineWidth=scale*stream.width*.48*(.94+approaching*.12)*turbulence;ctx.stroke(path);ctx.restore();
      ctx.save();ctx.globalCompositeOperation="lighter";ctx.lineCap="round";ctx.lineJoin="round";ctx.globalAlpha=approaching>.15?.11+approaching*.11:.085-receding*.02;ctx.strokeStyle=approaching>.15?"rgba(255,225,188,1)":"rgba(210,185,235,1)";ctx.lineWidth=Math.max(.7,scale*.0022);ctx.stroke(path);ctx.restore();
      for(let k=0;k<2;k++){const p=(Math.sin(stream.seed+k*8.1)+1)*.5,q=points[Math.floor(10+p*(points.length-20))];ctx.save();ctx.globalCompositeOperation="lighter";ctx.globalAlpha=.18;ctx.fillStyle=plasmaColor(p*.75);ctx.beginPath();ctx.arc(q.x,q.y,scale*.0028,0,TAU);ctx.fill();ctx.restore();}
    };
    const drawFlares = (time: number) => { const t=time*.001,bh=getBH(),scale=Math.min(W,H),flares=[{angle:-.62,phase:0,length:.95},{angle:2.55,phase:2.8,length:.78}];ctx.save();ctx.globalCompositeOperation="lighter";ctx.lineCap="round";for(const flare of flares){const pulse=.35+.65*(.5+.5*Math.sin(t*.75+flare.phase)),length=scale*(.055+flare.length*.075*(.72+.28*pulse));ctx.save();ctx.translate(bh.x,bh.y);ctx.rotate(flare.angle);ctx.globalAlpha=.09*pulse;ctx.strokeStyle="rgba(255,150,120,1)";ctx.lineWidth=Math.max(2,scale*.013);ctx.beginPath();ctx.moveTo(scale*.020,0);ctx.quadraticCurveTo(length*.48,scale*.008*Math.sin(t+flare.phase),length,0);ctx.stroke();ctx.globalAlpha=.56*pulse;ctx.strokeStyle="rgba(255,220,175,1)";ctx.lineWidth=Math.max(.8,scale*.0025);ctx.beginPath();ctx.moveTo(scale*.020,0);ctx.quadraticCurveTo(length*.48,scale*.004*Math.sin(t*1.4+flare.phase),length,0);ctx.stroke();ctx.restore();}ctx.restore(); };
    const drawBlackHole = () => { const bh=getBH(),scale=Math.min(W,H);ctx.save();const shadow=ctx.createRadialGradient(bh.x,bh.y,bh.horizon*.3,bh.x,bh.y,bh.horizon*2.8);[[0,"rgba(0,0,0,1)"],[.48,"rgba(0,0,0,0.96)"],[.74,"rgba(5,3,12,0.68)"],[1,"rgba(0,0,0,0)"]].forEach(([stop,color])=>shadow.addColorStop(stop as number,color as string));ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(bh.x,bh.y,bh.horizon*2.8,0,TAU);ctx.fill();ctx.restore();ctx.save();ctx.translate(bh.x,bh.y);ctx.globalCompositeOperation="lighter";ctx.beginPath();ctx.arc(0,0,bh.photon*1.015,0,TAU);ctx.strokeStyle="rgba(255,104,85,0.18)";ctx.lineWidth=scale*.014;ctx.stroke();ctx.beginPath();ctx.arc(0,0,bh.photon*.985,0,TAU);ctx.strokeStyle="rgba(255,184,112,0.16)";ctx.lineWidth=scale*.006;ctx.stroke();ctx.lineWidth=Math.max(1.1,scale*.0026);const gradient=ctx.createLinearGradient(-bh.photon,-bh.photon,bh.photon,bh.photon);[[0,"rgba(100,73,196,0.18)"],[.26,"rgba(227,72,144,0.42)"],[.46,"rgba(255,175,91,0.98)"],[.58,"rgba(255,229,183,0.90)"],[.73,"rgba(255,104,91,0.56)"],[1,"rgba(75,69,180,0.16)"]].forEach(([stop,color])=>gradient.addColorStop(stop as number,color as string));ctx.strokeStyle=gradient;ctx.beginPath();ctx.arc(0,0,bh.photon,0,TAU);ctx.stroke();ctx.fillStyle="#000";ctx.beginPath();ctx.arc(0,0,bh.horizon*.94,0,TAU);ctx.fill();ctx.restore(); };
    const drawDust = () => { const bh=getBH(),scale=Math.min(W,H);ctx.save();ctx.globalCompositeOperation="lighter";for(const particle of dust){particle.angle+=particle.speed;const x=bh.x+Math.cos(particle.angle)*particle.radius,y=bh.y+Math.sin(particle.angle)*particle.radius*.74,proximity=Math.exp(-Math.abs(particle.radius-scale*.34)/(scale*.22));ctx.fillStyle=plasmaColor(Math.max(0,Math.min(1,(particle.radius/scale-.1)/.55)),particle.alpha*(.35+proximity));ctx.beginPath();ctx.arc(x,y,particle.size,0,TAU);ctx.fill();}ctx.restore(); };
    const drawVignette = () => { const gradient=ctx.createRadialGradient(W*.42,H*.5,Math.min(W,H)*.12,W*.45,H*.5,Math.max(W,H)*.75);[[0,"rgba(0,0,0,0)"],[.58,"rgba(0,0,0,0.05)"],[1,"rgba(0,0,0,0.48)"]].forEach(([stop,color])=>gradient.addColorStop(stop as number,color as string));ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);const right=ctx.createLinearGradient(W*.52,0,W,0);right.addColorStop(0,"rgba(0,0,0,0)");right.addColorStop(1,"rgba(0,0,0,0.18)");ctx.fillStyle=right;ctx.fillRect(0,0,W,H); };
    let last=performance.now(),elapsed=0;
    const animate = (now: number) => { const dt=Math.min(40,now-last);last=now;elapsed+=dt;ctx.fillStyle="#020106";ctx.fillRect(0,0,W,H);const driftX=Math.sin(elapsed*.000055)*W*.0022+Math.sin(elapsed*.000021)*W*.0009,driftY=Math.cos(elapsed*.000043)*H*.0018+Math.sin(elapsed*.000017)*H*.0007,breathing=1.006+Math.sin(elapsed*.000035)*.0014;ctx.save();ctx.translate(W*.5+driftX,H*.5+driftY);ctx.scale(breathing,breathing);ctx.translate(-W*.5,-H*.5);drawNebula();drawStars(elapsed);drawDust();[...streams].sort((a,b)=>b.outer-a.outer).forEach((stream)=>drawRibbon(stream,elapsed));drawFlares(elapsed);drawBlackHole();ctx.restore();drawVignette();animationFrame=requestAnimationFrame(animate); };
    window.addEventListener("resize", resize);
    resize();
    animationFrame = requestAnimationFrame(animate);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animationFrame); };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 block h-full w-full" />;
}
