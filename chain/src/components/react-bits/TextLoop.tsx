"use client";

import { CSSProperties, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

import './TextLoop.css';

export type TextLoopShape = 'wave' | 'circle' | 'infinity' | 'arch' | 'line';
export type TextLoopDirection = 'forward' | 'reverse';

export interface TextLoopProps {
  text?: string;
  shape?: TextLoopShape;
  path?: string;
  speed?: number;
  direction?: TextLoopDirection;
  separator?: string;
  curviness?: number;
  fontSize?: number;
  fontWeight?: number | string;
  letterSpacing?: number;
  uppercase?: boolean;
  color?: string;
  ribbon?: boolean;
  ribbonColor?: string;
  ribbonWidth?: number;
  pauseOnHover?: boolean;
  className?: string;
  style?: CSSProperties;
}

interface Metrics {
  length: number;
  unitWidth: number;
  reps: number;
}

const VIEW_W = 1200;
const VIEW_H = 520;
const WAVE_PERIOD = 320;
const EDGE_PAD = 6;

const buildPath = (
  shape: TextLoopShape,
  curviness: number,
  ribbonWidth: number,
  width: number,
  height: number
): string => {
  const c = Math.max(0, curviness);
  const cx = width / 2;
  const cy = height / 2;
  const room = Math.max(20, cy - Math.max(0, ribbonWidth) / 2 - EDGE_PAD);

  switch (shape) {
    case 'circle': {
      const r = Math.min(90 + c * 0.95, room);
      return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
    }
    case 'infinity': {
      const r = 150 + c * 1.4;
      const h = Math.min(60 + c * 0.95, room);
      return [
        `M ${cx} ${cy}`,
        `C ${cx + r * 0.55} ${cy - h} ${cx + r} ${cy - h} ${cx + r} ${cy}`,
        `C ${cx + r} ${cy + h} ${cx + r * 0.55} ${cy + h} ${cx} ${cy}`,
        `C ${cx - r * 0.55} ${cy - h} ${cx - r} ${cy - h} ${cx - r} ${cy}`,
        `C ${cx - r} ${cy + h} ${cx - r * 0.55} ${cy + h} ${cx} ${cy}`,
        'Z'
      ].join(' ');
    }
    case 'arch': {
      const rise = Math.min(120 + c * 1.1, room * 2);
      return `M 120 ${cy + rise / 2} Q ${cx} ${cy - rise * 1.5} ${width - 120} ${cy + rise / 2}`;
    }
    case 'line':
      return `M ${-WAVE_PERIOD} ${cy} L ${width + WAVE_PERIOD} ${cy}`;
    case 'wave':
    default: {
      const a = Math.min(c * 2.2, room * 2);
      const start = -WAVE_PERIOD;
      const end = width + WAVE_PERIOD;
      let x = start + WAVE_PERIOD;
      let d = `M ${start} ${cy} Q ${start + WAVE_PERIOD / 2} ${cy - a} ${x} ${cy}`;
      while (x < end) {
        x += WAVE_PERIOD;
        d += ` T ${x} ${cy}`;
      }
      return d;
    }
  }
};

const TextLoop = ({
  text = 'React ✦ Bits',
  shape = 'wave',
  path,
  speed = 90,
  direction = 'forward',
  separator = '✦',
  curviness = 90,
  fontSize = 46,
  fontWeight = 800,
  letterSpacing = 2,
  uppercase = true,
  color = '#ffffff',
  ribbon = true,
  ribbonColor = '#5227FF',
  ribbonWidth = 86,
  pauseOnHover = true,
  className = '',
  style = {}
}: TextLoopProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const measureRef = useRef<SVGTextElement | null>(null);
  const headRef = useRef<SVGTextPathElement | null>(null);
  const tailRef = useRef<SVGTextPathElement | null>(null);

  const [viewport, setViewport] = useState({ w: VIEW_W, h: VIEW_H });
  const [metrics, setMetrics] = useState<Metrics>({ length: 0, unitWidth: 0, reps: 1 });

  const rawId = useId();
  const pathId = `text-loop-${rawId.replace(/:/g, '')}`;

  const d = useMemo(
    () => path || buildPath(shape, curviness, ribbonWidth, viewport.w, viewport.h),
    [path, shape, curviness, ribbonWidth, viewport.w, viewport.h]
  );

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;

    const apply = (width: number) => {
      const w = Math.max(1, Math.round(width));
      setViewport(prev => (prev.w === w ? prev : { w, h: VIEW_H }));
    };

    apply(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(entries => {
      apply(entries[0]?.contentRect.width ?? 0);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const unit = useMemo(() => {
    const base = uppercase ? String(text).toUpperCase() : String(text);
    const gap = separator ? `\u00A0${separator}\u00A0` : '\u00A0\u00A0\u00A0';
    return `${base}${gap}`;
  }, [text, separator, uppercase]);

  const textStyle = useMemo<CSSProperties>(
    () => ({ fontSize: `${fontSize}px`, fontWeight, letterSpacing: `${letterSpacing}px` }),
    [fontSize, fontWeight, letterSpacing]
  );

  useLayoutEffect(() => {
    const pathEl = pathRef.current;
    const measureEl = measureRef.current;
    if (!pathEl || !measureEl) return undefined;

    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      let length = 0;
      let unitWidth = 0;
      try {
        length = pathEl.getTotalLength();
        unitWidth = measureEl.getComputedTextLength();
      } catch {
        return;
      }
      if (!length || unitWidth <= 0) return;

      // Fill the visible path at natural glyph width. A second copy (tail)
      // is offset by this cycle so the loop never runs out of text.
      const reps = Math.max(1, Math.ceil(length / unitWidth));
      setMetrics(prev =>
        prev.length === length && prev.unitWidth === unitWidth && prev.reps === reps
          ? prev
          : { length, unitWidth, reps }
      );
    };

    measure();
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [d, unit, fontSize, fontWeight, letterSpacing]);

  useLayoutEffect(() => {
    const { unitWidth, reps } = metrics;
    const head = headRef.current;
    const tail = tailRef.current;
    const cycle = unitWidth * reps;
    if (!head || !tail || !cycle) return undefined;

    const apply = (offset: number) => {
      head.setAttribute('startOffset', String(offset));
      tail.setAttribute('startOffset', String(offset - cycle));
    };

    apply(0);

    const prefersReduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || speed <= 0) return undefined;

    const state = { offset: 0 };
    const tween = gsap.to(state, {
      offset: direction === 'reverse' ? -cycle : cycle,
      duration: cycle / speed,
      ease: 'none',
      repeat: -1,
      onUpdate: () => apply(state.offset)
    });

    const root = rootRef.current;
    const pause = () => tween.pause();
    const resume = () => tween.resume();

    if (pauseOnHover && root) {
      root.addEventListener('pointerenter', pause);
      root.addEventListener('pointerleave', resume);
    }

    return () => {
      tween.kill();
      if (pauseOnHover && root) {
        root.removeEventListener('pointerenter', pause);
        root.removeEventListener('pointerleave', resume);
      }
    };
  }, [metrics, speed, direction, pauseOnHover]);

  const loopText = unit.repeat(metrics.reps);

  return (
    <div ref={rootRef} className={`text-loop ${className}`.trim()} style={style}>
      <svg
        className="text-loop-svg"
        viewBox={`0 0 ${viewport.w} ${viewport.h}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: viewport.h }}
        role="img"
        aria-label={text}
      >
        <path
          ref={pathRef}
          id={pathId}
          d={d}
          fill="none"
          stroke={ribbon ? ribbonColor : 'none'}
          strokeWidth={ribbon ? ribbonWidth : 0}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text ref={measureRef} className="text-loop-measure" style={textStyle} aria-hidden="true">
          {unit}
        </text>

        <text className="text-loop-text" style={textStyle} fill={color} dominantBaseline="central" aria-hidden="true">
          <textPath ref={headRef} href={`#${pathId}`} startOffset={0}>
            {loopText}
          </textPath>
        </text>

        <text className="text-loop-text" style={textStyle} fill={color} dominantBaseline="central" aria-hidden="true">
          <textPath ref={tailRef} href={`#${pathId}`} startOffset={0}>
            {loopText}
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default TextLoop;
