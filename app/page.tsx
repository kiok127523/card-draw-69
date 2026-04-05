'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'card-prob-state';

interface HistoryItem {
  type: 'black' | 'red';
  number: number;
}

interface SavedState {
  phase: string;
  totalBlack: string;
  totalRed: string;
  totalPeople: string;
  currentBlack: number;
  currentRed: number;
  drawnBlack: number;
  drawnRed: number;
  history: HistoryItem[];
}

function loadState(): SavedState | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(state: SavedState) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function CardIcon({ color, size = 32 }: { color: string; size?: number }) {
  const fill = color === 'red' ? '#ef4444' : '#1e293b';
  return (
    <svg width={size} height={size * 1.4} viewBox='0 0 40 56' fill='none'>
      <rect
        x='1'
        y='1'
        width='38'
        height='54'
        rx='4'
        fill={fill}
        stroke='#475569'
        strokeWidth='1.5'
      />
      <rect
        x='4'
        y='4'
        width='32'
        height='48'
        rx='2'
        fill={fill}
        fillOpacity='0.3'
      />
      {color === 'red' ? (
        <path
          d='M20 16 L14 24 L20 32 L26 24 Z'
          fill='#fca5a5'
          fillOpacity='0.8'
        />
      ) : (
        <circle cx='20' cy='24' r='7' fill='#94a3b8' fillOpacity='0.5' />
      )}
    </svg>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<'setup' | 'play'>('setup');
  const [totalBlack, setTotalBlack] = useState('');
  const [totalRed, setTotalRed] = useState('');
  const [totalPeople, setTotalPeople] = useState('');
  const [currentBlack, setCurrentBlack] = useState(0);
  const [currentRed, setCurrentRed] = useState(0);
  const [drawnBlack, setDrawnBlack] = useState(0);
  const [drawnRed, setDrawnRed] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === 'play') {
      saveState({
        phase,
        totalBlack,
        totalRed,
        totalPeople,
        currentBlack,
        currentRed,
        drawnBlack,
        drawnRed,
        history,
      });
    }
  }, [
    phase,
    currentBlack,
    currentRed,
    drawnBlack,
    drawnRed,
    history,
    totalBlack,
    totalRed,
    totalPeople,
  ]);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  const totalCards = currentBlack + currentRed;
  const probRed = totalCards > 0 ? (currentRed / totalCards) * 100 : 0;
  const probBlack = totalCards > 0 ? (currentBlack / totalCards) * 100 : 0;
  const drawNumber = drawnBlack + drawnRed + 1;

  const startGame = () => {
    const b = parseInt(totalBlack) || 0;
    const r = parseInt(totalRed) || 0;
    if (b + r === 0) return;
    setCurrentBlack(b);
    setCurrentRed(r);
    setDrawnBlack(0);
    setDrawnRed(0);
    setHistory([]);
    setPhase('play');
  };

  const drawCard = (color: 'black' | 'red') => {
    if (color === 'black' && currentBlack > 0) {
      setCurrentBlack((prev) => prev - 1);
      setDrawnBlack((prev) => prev + 1);
      setHistory((prev) => [...prev, { type: 'black', number: drawNumber }]);
    } else if (color === 'red' && currentRed > 0) {
      setCurrentRed((prev) => prev - 1);
      setDrawnRed((prev) => prev + 1);
      setHistory((prev) => [...prev, { type: 'red', number: drawNumber }]);
    }
  };

  const resetGame = () => {
    setPhase('setup');
    setTotalBlack('');
    setTotalRed('');
    setTotalPeople('');
    setCurrentBlack(0);
    setCurrentRed(0);
    setDrawnBlack(0);
    setDrawnRed(0);
    setHistory([]);
    setResetDialogOpen(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  if (phase === 'setup') {
    const canStart =
      (parseInt(totalBlack) || 0) + (parseInt(totalRed) || 0) > 0;
    const previewProb = canStart
      ? (
          ((parseInt(totalRed) || 0) /
            ((parseInt(totalBlack) || 0) + (parseInt(totalRed) || 0))) *
          100
        ).toFixed(1)
      : '0';

    return (
      <main className='flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6'>
        <Card className='w-full max-w-sm sm:max-w-md'>
          <CardHeader className='text-center'>
            <div className='flex items-center justify-center gap-3 mb-1'>
              <CardIcon color='black' size={22} />
              <CardTitle className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent'>
                CARD DRAW
              </CardTitle>
              <CardIcon color='red' size={22} />
            </div>
            <p className='text-muted-foreground text-sm'>
              คำนวณความน่าจะเป็นในการจับใบ
            </p>
          </CardHeader>

          <CardContent className='flex flex-col gap-4'>
            <div className='space-y-2'>
              <Label
                htmlFor='totalBlack'
                className='flex items-center gap-2 text-xs uppercase tracking-wider'
              >
                <span className='h-3 w-3 rounded bg-slate-700 border border-slate-600' />
                จำนวนใบดำ
              </Label>
              <Input
                id='totalBlack'
                type='number'
                value={totalBlack}
                onChange={(e) => setTotalBlack(e.target.value)}
                placeholder='0'
                min='0'
                className='text-lg font-semibold'
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='totalRed'
                className='flex items-center gap-2 text-xs uppercase tracking-wider'
              >
                <span className='h-3 w-3 rounded bg-red-600' />
                จำนวนใบแดง
              </Label>
              <Input
                id='totalRed'
                type='number'
                value={totalRed}
                onChange={(e) => setTotalRed(e.target.value)}
                placeholder='0'
                min='0'
                className='text-lg font-semibold'
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='totalPeople'
                className='flex items-center gap-2 text-xs uppercase tracking-wider'
              >
                <span className='text-sm'>👥</span>
                จำนวนคนทั้งหมด
              </Label>
              <Input
                id='totalPeople'
                type='number'
                value={totalPeople}
                onChange={(e) => setTotalPeople(e.target.value)}
                placeholder='0'
                min='0'
                className='text-lg font-semibold'
              />
            </div>

            {canStart && (
              <div className='rounded-xl border border-primary/20 bg-primary/5 p-4 text-center'>
                <p className='text-muted-foreground text-xs uppercase tracking-wider mb-1'>
                  โอกาสจับใบแดง
                </p>
                <p className='text-3xl sm:text-4xl font-extrabold text-red-500 font-mono'>
                  {previewProb}%
                </p>
                {totalPeople && parseInt(totalPeople) > 0 && (
                  <p className='text-muted-foreground text-sm mt-1'>
                    จาก {totalPeople} คน | ใบทั้งหมด{' '}
                    {(parseInt(totalBlack) || 0) + (parseInt(totalRed) || 0)} ใบ
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={startGame}
              disabled={!canStart}
              size='lg'
              className='w-full mt-2 py-6 text-base font-bold'
            >
              เริ่มจับใบ
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Play phase
  return (
    <main className='min-h-screen flex flex-col items-center px-4 py-6 sm:px-6 sm:py-10'>
      <div className='w-full max-w-lg'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4 sm:mb-6'>
          <h1 className='text-lg font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent'>
            CARD DRAW
          </h1>
          <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <DialogTrigger render={<Button variant='outline' size='sm' />}>
              รีเซ็ต
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>รีเซ็ตข้อมูลทั้งหมด?</DialogTitle>
                <DialogDescription>จะเริ่มตั้งค่าใหม่ทั้งหมด</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setResetDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button variant='destructive' onClick={resetGame}>
                  รีเซ็ต
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Probability display */}
        <Card className='mb-4'>
          <CardContent className='pt-3'>
            <div className='flex items-baseline justify-between mb-1'>
              <span className='text-muted-foreground text-xs uppercase tracking-wider'>
                โอกาสจับใบแดง
              </span>
              {totalPeople && (
                <span className='text-muted-foreground text-xs'>
                  {totalPeople} คน
                </span>
              )}
            </div>
            <div
              className={`text-4xl sm:text-5xl font-extrabold font-mono leading-none transition-colors duration-300 ${
                probRed > 50
                  ? 'text-red-500'
                  : probRed > 25
                    ? 'text-amber-500'
                    : 'text-green-500'
              }`}
            >
              {probRed.toFixed(1)}%
            </div>
            <div className='mt-3 h-2 overflow-hidden rounded-full bg-secondary flex'>
              <div
                className='h-full bg-slate-500 transition-all duration-300'
                style={{ width: `${probBlack}%` }}
              />
              <div
                className='h-full bg-red-500 transition-all duration-300'
                style={{ width: `${probRed}%` }}
              />
            </div>
            <div className='mt-1.5 flex justify-between text-xs text-muted-foreground'>
              <span>ดำ {probBlack.toFixed(1)}%</span>
              <span>แดง {probRed.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Draw buttons */}
        <div className='grid grid-cols-2 gap-3 sm:gap-4 mb-4'>
          {/* Black card */}
          <Card>
            <CardContent className='text-center pt-4 pb-4'>
              <div className='flex items-center justify-center gap-1.5 mb-3'>
                <span className='h-2.5 w-2.5 rounded bg-slate-600' />
                <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                  ใบดำ
                </span>
              </div>
              <div className='text-3xl sm:text-4xl font-extrabold font-mono'>
                {currentBlack}
              </div>
              <div className='text-xs text-muted-foreground mb-4'>
                เหลือ จาก {totalBlack}
              </div>
              <Button
                onClick={() => drawCard('black')}
                disabled={currentBlack <= 0}
                variant='secondary'
                className='w-full py-5 font-bold'
              >
                จับใบดำ
              </Button>
              <div className='mt-2 rounded-md bg-secondary/50 px-2 py-1.5 text-xs text-muted-foreground'>
                จับแล้ว{' '}
                <span className='font-bold text-foreground'>{drawnBlack}</span>{' '}
                ใบ
              </div>
            </CardContent>
          </Card>

          {/* Red card */}
          <Card className='border-red-900/30'>
            <CardContent className='text-center pt-4 pb-4'>
              <div className='flex items-center justify-center gap-1.5 mb-3'>
                <span className='h-2.5 w-2.5 rounded bg-red-600' />
                <span className='text-xs font-semibold text-red-400 uppercase tracking-wider'>
                  ใบแดง
                </span>
              </div>
              <div className='text-3xl sm:text-4xl font-extrabold font-mono text-red-400'>
                {currentRed}
              </div>
              <div className='text-xs text-muted-foreground mb-4'>
                เหลือ จาก {totalRed}
              </div>
              <Button
                onClick={() => drawCard('red')}
                disabled={currentRed <= 0}
                className='w-full py-5 font-bold bg-red-600 hover:bg-red-700 text-white border-red-500'
              >
                จับใบแดง
              </Button>
              <div className='mt-2 rounded-md bg-red-950/20 px-2 py-1.5 text-xs text-red-400'>
                จับแล้ว <span className='font-bold'>{drawnRed}</span> ใบ
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <Card className='mb-4'>
          <CardContent className='flex justify-around py-4'>
            <div className='text-center'>
              <div className='text-[11px] text-muted-foreground uppercase tracking-wider'>
                จับแล้ว
              </div>
              <div className='text-xl font-extrabold text-primary font-mono'>
                {drawnBlack + drawnRed}
              </div>
            </div>
            <div className='w-px bg-border' />
            <div className='text-center'>
              <div className='text-[11px] text-muted-foreground uppercase tracking-wider'>
                เหลือ
              </div>
              <div className='text-xl font-extrabold font-mono'>
                {totalCards}
              </div>
            </div>
            <div className='w-px bg-border' />
            <div className='text-center'>
              <div className='text-[11px] text-muted-foreground uppercase tracking-wider'>
                ทั้งหมด
              </div>
              <div className='text-xl font-extrabold text-muted-foreground font-mono'>
                {(parseInt(totalBlack) || 0) + (parseInt(totalRed) || 0)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <Card>
            <CardContent>
              <div className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5'>
                ประวัติการจับ
              </div>
              <div
                ref={historyRef}
                className='max-h-[180px] overflow-y-auto flex flex-wrap gap-1.5'
              >
                {history.map((item, i) => (
                  <Badge
                    key={i}
                    variant={item.type === 'red' ? 'destructive' : 'secondary'}
                    className='gap-1'
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-sm ${item.type === 'red' ? 'bg-red-400' : 'bg-slate-400'}`}
                    />
                    #{item.number}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game complete */}
        {totalCards === 0 && (
          <Card className='mt-3 border-primary/30 bg-primary/5'>
            <CardContent className='text-center py-5'>
              <div className='text-2xl mb-2'>🎉</div>
              <p className='text-base font-bold text-primary mb-1'>
                จับใบครบแล้ว!
              </p>
              <p className='text-sm text-muted-foreground'>
                ดำ {drawnBlack} ใบ | แดง {drawnRed} ใบ
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
