export function MathBackdrop(){
 const F:[t:string,x:number,y:number,r:number,s:number][]=[
  ['e^{iπ}+1=0',130,120,-6,22],
  ['a²+b²=c²',950,90,4,27],
  ['∫₀^∞ e^{-x²}dx=√π/2',160,330,9,24],
  ['sin²θ+cos²θ=1',830,430,-7,20],
  ['d/dx eˣ = eˣ',560,180,6,26],
  ['x = (-b±√(b²-4ac))/2a',190,520,-5,29],
  ['∑ 1/n² = π²/6',940,610,3,24],
  ['φ = (1+√5)/2',70,690,-11,23],
  ['2x+5=15 ⇒ x=5',430,650,-4,26],
  ['lim(x→0) sinx/x = 1',690,300,8,21],
  ['f′(x)=3x²',880,200,-9,25],
  ['√144=12',60,420,5,34],
  ['log₂8=3',1060,330,2,27],
  ['A=πr²',330,740,1,22],
  ['C=2πr',540,470,-8,30],
  ['V=⅓πr²h',1100,520,6,21],
  ['y=mx+b',300,240,7,32],
  ['P(A|B)=P(A∩B)/P(B)',760,740,-2,20],
  ['π ≈ 3.14159',420,760,10,30],
  ['n! = n(n−1)!',1080,730,-5,24],
  ['i²=−1',1010,160,3,22],
  ['x̄ = Σxₙ/n',620,650,-12,20],
  ['Θ = ∬ f(x,y)dA',170,610,7,24],
  ['σ = √(1/N Σ(xᵢ−μ)²)',880,560,-3,20],
  ['tanθ = sinθ/cosθ',380,180,-8,21],
  ['1+2+3+⋯+n = n(n+1)/2',600,90,4,23]
 ];
 return <svg className="math-backdrop" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  {F.map(([t,x,y,r,s],i)=><text key={i} x={x} y={y} fontSize={s} transform={`rotate(${r} ${x} ${y})`}>{t}</text>)}
  <path d="M 70 350 q 55 -55 110 0 t 110 0" fill="none" strokeWidth="2"/>
  <circle cx="1005" cy="420" r="52" fill="none" strokeWidth="2"/>
  <path d="M 1005 368 L 1005 420 L 1042 420" fill="none" strokeWidth="2"/>
  <path d="M 80 250 L 80 170 L 170 170 Z" fill="none" strokeWidth="2"/>
  <path d="M 760 190 h 130 M 760 190 v -80 M 760 190 q 50 8 90 -70" fill="none" strokeWidth="2"/>
 </svg>;
}
