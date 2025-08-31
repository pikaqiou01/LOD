const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const W = 744, H = 1084;

const DICE_KINDS = [
  'slash','pierce','blunt','evade','block',
  'slash_r','pierce_r','blunt_r','evade_r','block_r'
];

/* ========== 骰子行 ========== */
function addDiceRow(kind='slash',range='4-7',eff='') {
  const div = document.createElement('div');
  div.className = 'dice-row';

  const sel = document.createElement('select');
  DICE_KINDS.forEach(k=>{
    const opt = new Option(k,k);
    if(k===kind) opt.selected = true;
    sel.appendChild(opt);
  });

  const rng = document.createElement('input');
  rng.type='text'; rng.value=range; rng.placeholder='4-7';

  const effect = document.createElement('input');
  effect.className='effect'; effect.value=eff; effect.placeholder='骰子效果';

  const del = document.createElement('button');
  del.textContent='×';
  del.onclick = () => div.remove();

  [sel,rng,effect,del].forEach(el=>div.appendChild(el));
  document.getElementById('diceList').appendChild(div);
}
addDiceRow();   // 默认 1 行

/* ========== 渲染 ========== */
async function renderCard() {
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H);

  const name  = document.getElementById('name').value;
  const cost  = +document.getElementById('cost').value;
  const grade = document.getElementById('grade').value;
  const showEffect = document.getElementById('cbEffect').checked;
  const effectText = document.getElementById('effect').value;

  /* 标题 */
  ctx.fillStyle='#000';
  ctx.textAlign='center';
  ctx.font='bold 46px Arial';
  ctx.fillText(name, W/2, 90);

  /* 费用圆 */
  ctx.beginPath(); ctx.arc(70,90,28,0,2*Math.PI); ctx.stroke();
  ctx.font='32px Arial'; ctx.fillText(cost,70,100);

  /* 等级 */
  ctx.font='30px Arial';
  ctx.fillText(grade, W-70,100);

  /* 卡图 */
  const file = document.getElementById('artInput').files[0];
  if(file){
    const img = await loadImg(URL.createObjectURL(file));
    ctx.drawImage(img,52,130,640,480);
  }

  /* 效果 */
  let y=640;
  if(showEffect){
    ctx.textAlign='left'; ctx.font='28px Arial';
    y=wrapText(ctx,effectText,52,y,640,34)+20;
  }

  /* 骰子 */
  ctx.font='24px Arial';
  for(const row of document.querySelectorAll('.dice-row')){
    const kind  = row.querySelector('select').value;
    const range = row.querySelector('input[type=text]').value;
    const eff   = row.querySelector('.effect').value;

    const icon = await loadImg(`dice/${kind}.png`);
    ctx.drawImage(icon,52,y,50,50);
    ctx.fillText(range,120,y+30);
    wrapText(ctx,eff,200,y+5,490,25);
    y+=60;
  }
}

/* ========== 工具 ========== */
function wrapText(ctx,text,x,y,maxW,lineH){
  const lines=text.split('\n');
  for(const ln of lines){
    const words=ln.split(' '); let buf='';
    for(const w of words){
      const tst=buf+w+' ';
      if(ctx.measureText(tst).width>maxW && buf!==''){
        ctx.fillText(buf,x,y); buf=w+' '; y+=lineH;
      }else buf=tst;
    }
    ctx.fillText(buf,x,y); y+=lineH;
  }
  return y;
}
function loadImg(src){
  return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=src;});
}
function downloadCard(){
  const a=document.createElement('a');
  a.download='lor_card.png';
  a.href=cv.toDataURL('image/png');
  a.click();
}

/* ========== PWA Service Worker ========== */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('data:text/javascript,console.log("sw ok")');
}