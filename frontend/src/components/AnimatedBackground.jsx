const bubbles = [
  { left: '8%', size: 10, delay: '0s', duration: '18s' },
  { left: '22%', size: 6, delay: '3s', duration: '22s' },
  { left: '38%', size: 14, delay: '6s', duration: '26s' },
  { left: '52%', size: 8, delay: '1.5s', duration: '20s' },
  { left: '67%', size: 12, delay: '8s', duration: '28s' },
  { left: '81%', size: 7, delay: '4.5s', duration: '24s' },
]

export default function AnimatedBackground() {
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden result-background"><div className="absolute inset-0 result-grid opacity-70" /><div className="result-bg-orb result-drift-a -left-24 -top-32 h-[28rem] w-[28rem]" /><div className="result-bg-orb result-drift-b -right-32 top-10 h-[32rem] w-[32rem]" /><div className="result-bg-orb result-drift-c bottom-[-14rem] left-1/3 h-[30rem] w-[30rem]" />{bubbles.map((b, i) => <span key={i} className="result-rise absolute bottom-[-4rem] rounded-full" style={{ left: b.left, width: b.size, height: b.size, animationDelay: b.delay, animationDuration: b.duration }} />)}</div>
}
