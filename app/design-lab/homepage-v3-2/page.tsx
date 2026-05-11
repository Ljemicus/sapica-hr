import type { Metadata } from 'next';
import Image from 'next/image';
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarCheck,
  Check,
  ChevronRight,
  Clock,
  GraduationCap,
  Heart,
  HeartHandshake,
  Home,
  MapPin,
  MessageCircle,
  PawPrint,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'PetPark Homepage v3.2 Design Lab',
  description: 'Reference-grade PetPark homepage visual prototype.',
  robots: { index: false, follow: false },
};

type IconType = typeof PawPrint;

const shellCss = `
body:has(#petpark-v32) > header[role="banner"],
body:has(#petpark-v32) footer:not(#petpark-v32-footer),
body:has(#petpark-v32) nav.fixed.bottom-0.left-0.right-0,
body:has(#petpark-v32) div.fixed.bottom-0.left-0.right-0,
body:has(#petpark-v32) div.fixed.bottom-20.right-4,
body:has(#petpark-v32) div.fixed.bottom-4.right-4,
body:has(#petpark-v32) button.fixed.bottom-20.right-4,
body:has(#petpark-v32) button.fixed.bottom-4.right-4,
body:has(#petpark-v32) nextjs-portal,
body:has(#petpark-v32) [data-nextjs-toast],
body:has(#petpark-v32) [data-nextjs-dialog-overlay] { display:none !important; }
body:has(#petpark-v32) main#main-content { overflow:hidden; }
#petpark-v32 { --green:#123829; --green2:#0f6b57; --mint:#dff2e5; --cream:#fbf3e4; --paper:#fffdf7; --orange:#f97316; --muted:#6b766c; font-family: var(--font-sans), ui-sans-serif, system-ui; position:relative; }
#petpark-v32:before { content:""; position:absolute; inset:0; z-index:0; pointer-events:none; opacity:.24; background-image:url('data:image/svg+xml,%3Csvg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" stroke="%230f6b57" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".20"%3E%3Cpath d="M44 62c18-18 39-17 58 1-23 2-38 15-45 39-12-14-16-27-13-40Z"/%3E%3Cpath d="M57 100c10-19 24-31 45-37"/%3E%3Cpath d="M122 116c12-13 26-14 42-2-17 3-28 13-32 31-9-10-12-19-10-29Z"/%3E%3Cpath d="M132 144c7-14 17-24 32-30"/%3E%3C/g%3E%3C/svg%3E'),url('data:image/svg+xml,%3Csvg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" stroke="%23f97316" stroke-width="2" stroke-linecap="round" opacity=".14"%3E%3Cellipse cx="100" cy="118" rx="18" ry="15"/%3E%3Cellipse cx="73" cy="96" rx="8" ry="11" transform="rotate(-24 73 96)"/%3E%3Cellipse cx="93" cy="82" rx="8" ry="12" transform="rotate(-8 93 82)"/%3E%3Cellipse cx="116" cy="84" rx="8" ry="12" transform="rotate(10 116 84)"/%3E%3Cellipse cx="135" cy="100" rx="8" ry="11" transform="rotate(26 135 100)"/%3E%3C/g%3E%3C/svg%3E'); background-size:360px 360px, 440px 440px; background-position:18px 90px, right 70px top 220px; }
#petpark-v32 > * { position:relative; z-index:1; }
#petpark-v32 * { box-sizing:border-box; }
#petpark-v32 .wrap { width:min(1288px, calc(100% - 48px)); margin-inline:auto; }
#petpark-v32 .header { height:82px; display:flex; align-items:center; justify-content:space-between; gap:22px; }
#petpark-v32 .nav { display:flex; align-items:center; gap:4px; padding:7px; border:1px solid rgba(210,196,170,.75); background:rgba(255,255,255,.72); border-radius:999px; box-shadow:0 16px 42px rgba(18,56,41,.075); backdrop-filter:blur(14px); }
#petpark-v32 .nav span { padding:10px 16px; border-radius:999px; color:var(--green); font-size:14px; font-weight:900; }
#petpark-v32 .actions { display:flex; gap:10px; align-items:center; }
#petpark-v32 .btn { min-height:44px; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:0 17px; border-radius:999px; font-size:14px; font-weight:950; white-space:nowrap; }
#petpark-v32 .btn.login { color:var(--green); background:#f7fff8; border:1px solid #cfe4d5; }
#petpark-v32 .btn.orange { color:#fff; background:var(--orange); box-shadow:0 18px 34px rgba(249,115,22,.24); }
#petpark-v32 .hero { display:grid; grid-template-columns:minmax(0, .48fr) minmax(560px, .52fr); align-items:center; gap:58px; padding:38px 0 34px; }
#petpark-v32 .eyebrow { display:inline-flex; align-items:center; gap:8px; height:36px; padding:0 16px; border-radius:999px; background:#e9f7ee; color:var(--green2); font-size:12px; font-weight:950; letter-spacing:.17em; }
#petpark-v32 h1 { margin:22px 0 0; max-width:590px; color:#0b2f22; font-size:76px; line-height:.96; letter-spacing:-.071em; font-weight:1000; }
#petpark-v32 .lead { margin-top:22px; max-width:550px; color:#637165; font-size:19px; line-height:1.75; font-weight:650; }
#petpark-v32 .assistant { margin-top:30px; max-width:580px; background:rgba(255,255,255,.96); border:1px solid rgba(234,223,203,.9); border-radius:34px; padding:25px; box-shadow:0 30px 80px rgba(18,56,41,.125); }
#petpark-v32 .assistantTop { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:22px; }
#petpark-v32 h2 { margin:0; color:#0b2f22; font-size:29px; line-height:1.05; letter-spacing:-.045em; font-weight:1000; }
#petpark-v32 .sub { margin-top:7px; color:#6a756b; font-size:14px; line-height:1.6; font-weight:650; }
#petpark-v32 .smart { display:inline-flex; align-items:center; gap:6px; padding:8px 11px; border-radius:999px; background:#fff0dc; color:var(--orange); font-size:11px; letter-spacing:.08em; text-transform:uppercase; font-weight:950; white-space:nowrap; }
#petpark-v32 .formBlock { margin-top:18px; }
#petpark-v32 .label { margin-bottom:10px; color:var(--green); font-size:14px; font-weight:950; }
#petpark-v32 .chips { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:9px; }
#petpark-v32 .chips.services { grid-template-columns:repeat(3, minmax(0,1fr)); }
#petpark-v32 .chip { min-height:46px; display:flex; align-items:center; justify-content:center; gap:7px; padding:0 10px; border-radius:17px; border:1px solid #eadfcb; background:#fffaf2; color:#647064; font-size:13px; font-weight:900; }
#petpark-v32 .chip.selectedGreen { border-color:rgba(21,144,103,.30); background:#e8f6ec; color:var(--green); }
#petpark-v32 .chip.selectedOrange { border-color:rgba(249,115,22,.30); background:#fff0dc; color:var(--green); }
#petpark-v32 .locationRow { display:grid; grid-template-columns:1fr 170px; gap:12px; }
#petpark-v32 .select { min-height:52px; display:flex; align-items:center; gap:9px; padding:0 16px; border-radius:19px; border:1px solid #eadfcb; background:#fffaf2; color:var(--green); font-size:14px; font-weight:950; }
#petpark-v32 .continue { min-height:52px; display:flex; align-items:center; justify-content:center; gap:9px; border-radius:19px; background:var(--green); color:white; font-size:14px; font-weight:950; box-shadow:0 17px 36px rgba(18,56,41,.22); }
#petpark-v32 .orbit { position:relative; height:570px; width:570px; margin-left:auto; }
#petpark-v32 .orbBg { position:absolute; inset:0; border-radius:50%; background:radial-gradient(circle at 50% 45%, #fff 0%, #fff6e8 38%, #e5f4e9 70%, #fff0dc 100%); box-shadow:0 44px 120px rgba(18,56,41,.16); }
#petpark-v32 .ring1 { position:absolute; inset:34px; border-radius:50%; border:1px solid rgba(255,255,255,.9); }
#petpark-v32 .ring2 { position:absolute; inset:88px; border-radius:50%; border:1.5px dashed rgba(15,107,87,.22); }
#petpark-v32 .petPhoto { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:306px; height:306px; border-radius:50%; overflow:hidden; background:#fff7ed; border:12px solid #fffdf7; box-shadow:0 28px 78px rgba(18,56,41,.18); }
#petpark-v32 .petPhoto:after { content:""; position:absolute; inset:0; background:linear-gradient(180deg, transparent 60%, rgba(18,56,41,.10)); }
#petpark-v32 .node { position:absolute; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:8px; }
#petpark-v32 .nodeIcon { width:68px; height:68px; display:grid; place-items:center; border-radius:50%; background:white; border:1px solid rgba(255,255,255,.95); box-shadow:0 16px 36px rgba(18,56,41,.14); }
#petpark-v32 .nodeLabel { padding:7px 13px; border-radius:999px; background:rgba(255,255,255,.9); color:var(--green); font-size:14px; font-weight:950; box-shadow:0 10px 24px rgba(18,56,41,.09); }
#petpark-v32 .shortcut { margin-top:8px; margin-bottom:46px; padding:8px; border-radius:34px; border:1px solid rgba(234,223,203,.85); background:rgba(255,255,255,.95); box-shadow:0 25px 70px rgba(18,56,41,.105); }
#petpark-v32 .shortcutGrid { display:grid; grid-template-columns:repeat(6, minmax(0,1fr)); gap:2px; }
#petpark-v32 .quick { min-height:94px; display:flex; align-items:center; gap:12px; padding:14px 13px; border-radius:27px; }
#petpark-v32 .quick:hover { background:#fff7ed; }
#petpark-v32 .quickIcon { width:44px; height:44px; flex:0 0 auto; display:grid; place-items:center; border-radius:17px; background:#fff0dc; color:var(--orange); }
#petpark-v32 .quickTitle { color:var(--green); font-size:13px; line-height:1.2; font-weight:1000; }
#petpark-v32 .quickText { margin-top:4px; color:#728074; font-size:12px; font-weight:700; }
#petpark-v32 .sectionHead { margin-bottom:24px; }
#petpark-v32 .sectionHead .kicker { color:var(--orange); font-size:12px; letter-spacing:.17em; font-weight:950; text-transform:uppercase; }
#petpark-v32 .sectionHead h3 { margin:8px 0 0; max-width:690px; color:#0b2f22; font-size:44px; line-height:1.02; letter-spacing:-.058em; font-weight:1000; }
#petpark-v32 .cards { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:20px; margin-bottom:48px; }
#petpark-v32 .card { min-height:430px; border-radius:34px; border:1px solid rgba(234,223,203,.88); background:rgba(255,255,255,.94); padding:24px; box-shadow:0 22px 64px rgba(18,56,41,.09); }
#petpark-v32 .card.mint { background:linear-gradient(180deg,#ecf8f0,#dff2e5); border-color:#cfe4d5; }
#petpark-v32 .cardTop { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:18px; }
#petpark-v32 .card h4 { margin:0; color:#0b2f22; font-size:24px; letter-spacing:-.04em; font-weight:1000; }
#petpark-v32 .live { display:inline-flex; align-items:center; gap:7px; border-radius:999px; background:#e8f6ec; color:var(--green2); padding:6px 10px; font-size:12px; font-weight:950; }
#petpark-v32 .dot { width:8px; height:8px; border-radius:50%; background:var(--green2); }
#petpark-v32 .row { display:flex; gap:10px; align-items:center; padding:11px; border-radius:20px; background:#fffaf2; margin-top:10px; }
#petpark-v32 .avatar { width:42px; height:42px; flex:0 0 auto; display:grid; place-items:center; border-radius:50%; background:#fff0dc; color:var(--orange); }
#petpark-v32 .thumb { width:58px; height:48px; flex:0 0 auto; border-radius:16px; background:linear-gradient(135deg,#e8f6ec,#fff0dc); }
#petpark-v32 .rowTitle { color:var(--green); font-size:14px; line-height:1.25; font-weight:950; }
#petpark-v32 .rowMeta { margin-top:4px; color:#748077; font-size:12px; font-weight:700; }
#petpark-v32 .link { margin-top:18px; display:inline-flex; align-items:center; gap:8px; color:var(--orange); font-size:14px; font-weight:950; }
#petpark-v32 .app { display:grid; grid-template-columns:300px 1fr; align-items:center; gap:34px; margin-bottom:52px; padding:34px 42px; border-radius:42px; background:linear-gradient(135deg,#dff2e5 0%,#fff0dc 100%); box-shadow:0 26px 78px rgba(18,56,41,.12); overflow:hidden; }
#petpark-v32 .phone { width:168px; height:250px; margin:auto; border:9px solid var(--green); border-radius:36px; background:white; box-shadow:0 20px 52px rgba(18,56,41,.20); padding:15px; }
#petpark-v32 .phoneTop { height:76px; border-radius:24px; background:linear-gradient(135deg,#e8f6ec,#fff0dc); margin-bottom:13px; }
#petpark-v32 .phoneLine { height:10px; border-radius:99px; background:rgba(18,56,41,.16); margin-bottom:8px; }
#petpark-v32 .app h3 { margin:5px 0 0; color:#0b2f22; font-size:44px; line-height:1.03; letter-spacing:-.055em; font-weight:1000; }
#petpark-v32 .app p { max-width:680px; margin-top:12px; color:#617066; font-size:16px; line-height:1.8; font-weight:700; }
#petpark-v32 .chips2 { margin-top:22px; display:flex; flex-wrap:wrap; gap:10px; }
#petpark-v32 .chips2 span { display:inline-flex; align-items:center; gap:8px; border-radius:999px; background:rgba(255,255,255,.78); padding:10px 14px; color:var(--green); font-size:14px; font-weight:950; box-shadow:0 8px 20px rgba(18,56,41,.06); }
#petpark-v32 footer { border-top:1px solid #eadfcb; background:#fffaf2; }
#petpark-v32 .foot { display:grid; grid-template-columns:1.35fr repeat(3,1fr); gap:32px; padding:34px 0; }
#petpark-v32 .foot p { color:#657267; font-size:14px; line-height:1.7; font-weight:650; max-width:350px; margin-top:13px; }
#petpark-v32 .foot h5 { margin:0 0 12px; color:var(--green); font-size:14px; font-weight:1000; }
#petpark-v32 .foot span { display:block; margin-top:8px; color:#657267; font-size:14px; font-weight:700; }
#petpark-v32 .mobilePet { display:none; }
@media (max-width:1199px){
 #petpark-v32 .wrap { width:min(100% - 40px, 980px); }
 #petpark-v32 .hero { grid-template-columns:minmax(0,520px) 400px; gap:24px; padding-top:30px; align-items:center; }
 #petpark-v32 h1 { font-size:52px; max-width:520px; }
 #petpark-v32 .lead { max-width:520px; font-size:16px; line-height:1.65; }
 #petpark-v32 .assistant { max-width:520px; padding:21px; }
 #petpark-v32 .orbit { display:block; width:400px; height:400px; margin-left:auto; }
 #petpark-v32 .petPhoto { width:214px; height:214px; border-width:8px; }
 #petpark-v32 .nodeIcon { width:46px; height:46px; }
 #petpark-v32 .nodeLabel { font-size:11px; padding:4px 8px; }
 #petpark-v32 .mobilePet { display:none; position:relative; max-width:430px; margin:4px auto 0; padding:18px; border-radius:38px; background:radial-gradient(circle at 50% 40%, #fff 0%,#fff3df 50%,#e8f6ec 100%); box-shadow:0 24px 70px rgba(18,56,41,.12); }
 #petpark-v32 .mobilePetInner { position:relative; aspect-ratio:1; border-radius:50%; overflow:hidden; background:#fff7ed; }
 #petpark-v32 .miniNode { position:absolute; transform:translate(-50%,-50%); width:42px; height:42px; display:grid; place-items:center; border-radius:50%; background:#fff; box-shadow:0 10px 26px rgba(18,56,41,.13); }
 #petpark-v32 .shortcut { overflow:hidden; }
 #petpark-v32 .shortcutGrid { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:4px; overflow:visible; padding-bottom:0; }
 #petpark-v32 .quick { min-width:0; }
 #petpark-v32 .cards { grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
 #petpark-v32 .card { min-height:auto; padding:18px; }
 #petpark-v32 .app { grid-template-columns:220px 1fr; padding:30px; }
 #petpark-v32 .foot { grid-template-columns:1.3fr repeat(3,1fr); }
}
@media (max-width:760px){
 #petpark-v32 .wrap { width:calc(100% - 32px); }
 #petpark-v32 .hero { grid-template-columns:1fr; gap:26px; }
 #petpark-v32 .orbit { display:none; }
 #petpark-v32 .mobilePet { display:none; }
 #petpark-v32 .orbit { display:block; width:350px; height:350px; margin:2px auto 0; }
 #petpark-v32 .petPhoto { width:176px; height:176px; border-width:7px; }
 #petpark-v32 .nodeIcon { width:38px; height:38px; }
 #petpark-v32 .nodeLabel { font-size:10px; padding:3px 7px; }
 #petpark-v32 .header { height:72px; }
 #petpark-v32 .nav, #petpark-v32 .actions { display:none; }
 #petpark-v32 .menu { display:inline-flex !important; }
 #petpark-v32 h1 { font-size:44px; line-height:1.02; letter-spacing:-.062em; }
 #petpark-v32 .lead { font-size:16px; line-height:1.65; }
 #petpark-v32 .assistant { padding:20px; border-radius:30px; }
 #petpark-v32 .assistantTop { display:block; }
 #petpark-v32 .smart { margin-top:12px; }
 #petpark-v32 .chips { grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; }
 #petpark-v32 .chips.services { grid-template-columns:1fr 1fr; gap:7px; }
 #petpark-v32 .chip { font-size:12px; padding:0 6px; }
 #petpark-v32 .locationRow { grid-template-columns:1fr; }
 #petpark-v32 .shortcut { margin-bottom:36px; }
 #petpark-v32 .shortcutGrid { grid-template-columns:1fr; }
 #petpark-v32 .quick { min-height:82px; min-width:0; }
 #petpark-v32 .sectionHead h3 { font-size:32px; }
 #petpark-v32 .cards { grid-template-columns:1fr; gap:16px; margin-bottom:36px; }
 #petpark-v32 .card { padding:20px; border-radius:30px; }
 #petpark-v32 .app { grid-template-columns:1fr; text-align:left; padding:26px; border-radius:34px; }
 #petpark-v32 .phone { width:142px; height:210px; margin:0 auto; }
 #petpark-v32 .app h3 { font-size:32px; }
 #petpark-v32 .foot { grid-template-columns:1fr; gap:20px; }
}
`;

const services: { label: string; Icon: IconType; x: string; y: string; color: string }[] = [
  { label: 'Čuvanje', Icon: Home, x: '49%', y: '6%', color: '#159067' },
  { label: 'Šetnja', Icon: PawPrint, x: '92%', y: '30%', color: '#f97316' },
  { label: 'Grooming', Icon: Sparkles, x: '78%', y: '82%', color: '#159067' },
  { label: 'Trening', Icon: GraduationCap, x: '47%', y: '95%', color: '#f97316' },
  { label: 'Izgubljeni', Icon: MapPin, x: '12%', y: '79%', color: '#d95a33' },
  { label: 'Udomljavanje', Icon: HeartHandshake, x: '7%', y: '32%', color: '#159067' },
];

const needChoices = [
  { label: 'Čuvanje', Icon: Home },
  { label: 'Šetnja', Icon: PawPrint },
  { label: 'Grooming', Icon: Sparkles },
  { label: 'Trening', Icon: GraduationCap },
  { label: 'Izgubljeni', Icon: MapPin },
  { label: 'Udomljavanje', Icon: HeartHandshake },
];

const quick = [
  { title: 'Rezerviraj šetnju', text: 'Aktivan dan za psa', Icon: CalendarCheck },
  { title: 'Pronađi čuvanje', text: 'Siguran dogovor', Icon: Home },
  { title: 'Naruči grooming', text: 'Njega i svježina', Icon: Sparkles },
  { title: 'Trening & savjeti', text: 'Bolje navike', Icon: GraduationCap },
  { title: 'Hitno: izgubljen?', text: 'Brza objava', Icon: MapPin },
  { title: 'Udomi ljubav', text: 'Novi dom', Icon: HeartHandshake },
];

function Header() {
  return (
    <div className="wrap header">
      <Image src="/brand/petpark-logo.svg" alt="PetPark" width={146} height={44} priority style={{ width: 142, height: 'auto' }} />
      <div className="nav">{['Usluge', 'Kako radi', 'Zajednica', 'Blog'].map((item) => <span key={item}>{item}</span>)}</div>
      <div className="actions"><span className="btn login"><UserRound size={16} />Prijava</span><span className="btn orange"><Plus size={16} />Objavi uslugu</span></div>
      <span className="btn login menu" style={{ display: 'none' }}>Menu</span>
    </div>
  );
}

function Assistant() {
  return (
    <div className="assistant">
      <div className="assistantTop">
        <div><h2>Reci nam što trebaš</h2><p className="sub">Tri kratka koraka do prave PetPark opcije.</p></div>
        <span className="smart"><Sparkles size={14} />Pametni asistent</span>
      </div>
      <div className="formBlock"><div className="label">1. Odaberi ljubimca</div><div className="chips"><span className="chip selectedGreen"><Check size={16} />Pas</span><span className="chip">Mačka</span><span className="chip">Mali ljubimci</span></div></div>
      <div className="formBlock"><div className="label">2. Što trebaš?</div><div className="chips services">{needChoices.map(({ label, Icon }, i) => <span key={label} className={`chip ${i === 0 ? 'selectedOrange' : ''}`}><Icon size={16} color={i % 2 ? '#159067' : '#f97316'} />{label}</span>)}</div></div>
      <div className="formBlock"><div className="label">3. Gdje?</div><div className="locationRow"><span className="select"><MapPin size={17} color="#f97316" />Zagreb</span><span className="continue">Nastavi <ArrowRight size={17} /></span></div></div>
    </div>
  );
}

function PetImage({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={mobile ? 'mobilePetInner' : 'petPhoto'}>
      <Image src="/images/design-lab/petpark-v32-hero-dog-cat.png" alt="Pas i mačka za PetPark" fill priority sizes={mobile ? '320px' : '306px'} style={{ objectFit: 'cover' }} />
    </div>
  );
}

function Orbit() {
  return (
    <div className="orbit" aria-label="PetPark krug usluga">
      <div className="orbBg" /><div className="ring1" /><div className="ring2" /><PetImage />
      {services.map(({ label, Icon, x, y, color }) => <div className="node" key={label} style={{ left: x, top: y }}><span className="nodeIcon"><Icon size={28} color={color} /></span><span className="nodeLabel">{label}</span></div>)}
      <Heart size={22} color="#f97316" fill="rgba(249,115,22,.18)" style={{ position: 'absolute', left: '16%', top: '12%' }} />
      <Sparkles size={24} color="rgba(21,144,103,.7)" style={{ position: 'absolute', right: '15%', bottom: '12%' }} />
    </div>
  );
}

function Hero() {
  return (
    <div className="wrap hero">
      <div>
        <span className="eyebrow">ODABERI ŠTO TREBAŠ</span>
        <h1>Što treba tvom ljubimcu danas?</h1>
        <p className="lead">PetPark povezuje ljubimce s pouzdanim ljudima i uslugama koje im olakšavaju svaki dan. Brzo, sigurno i s ljubavlju.</p>
        <Assistant />
        <div className="mobilePet"><PetImage mobile />{services.map(({ label, Icon, color, x, y }) => <span key={label} className="miniNode" style={{ left: x, top: y }} aria-label={label}><Icon size={18} color={color} /></span>)}</div>
      </div>
      <Orbit />
    </div>
  );
}

function Shortcut() {
  return <div className="wrap shortcut"><div className="shortcutGrid">{quick.map(({ title, text, Icon }) => <div className="quick" key={title}><span className="quickIcon"><Icon size={21} /></span><div style={{ minWidth: 0, flex: 1 }}><div className="quickTitle">{title}</div><div className="quickText">{text}</div></div><ChevronRight size={16} color="#159067" /></div>)}</div></div>;
}

function Cards() {
  return (
    <div className="wrap">
      <div className="sectionHead"><div className="kicker">PetPark vodi dalje</div><h3>Jedan početak, tri korisna smjera.</h3></div>
      <div className="cards">
        <article className="card"><div className="cardTop"><h4>Live zajednica</h4><span className="live"><span className="dot" />Uživo</span></div>{[['Ana traži čuvanje za vikend','Zagreb · prije 8 min'],['Marko dijeli savjet za šetnju','Split · trening'],['Bella traži novi dom','Rijeka · udomljavanje']].map(([t,m])=><div className="row" key={t}><span className="avatar"><PawPrint size={20}/></span><div><div className="rowTitle">{t}</div><div className="rowMeta">{m}</div></div></div>)}<span className="link">Otvori zajednicu <ArrowRight size={16}/></span></article>
        <article className="card"><div className="cardTop"><h4>Najnoviji savjeti</h4><BookOpen color="#f97316" /></div>{[['Kako pas pokazuje stres?','Ponašanje · 4 min'],['Njega dlake bez nervoze','Grooming · 5 min'],['Prvi koraci kad ljubimac nestane','Sigurnost · važno']].map(([t,m])=><div className="row" key={t}><span className="thumb"/><div><div className="rowTitle">{t}</div><div className="rowMeta">{m}</div></div></div>)}<span className="link">Pogledaj blog <ArrowRight size={16}/></span></article>
        <article className="card mint"><div className="cardTop"><h4>Zašto PetPark?</h4><ShieldCheck color="#159067" /></div>{['Krećeš od potrebe ljubimca','Sve važno na jednom mjestu','Topao lokalni kontekst','Manje marketplace buke'].map(t=><div className="row" key={t} style={{background:'rgba(255,255,255,.72)'}}><span className="avatar" style={{background:'#fff', color:'#159067'}}><Check size={20}/></span><div className="rowTitle">{t}</div></div>)}<span className="link" style={{color:'#159067'}}>Prikaži opcije <ArrowRight size={16}/></span></article>
      </div>
    </div>
  );
}

function AppBanner() {
  return <div className="wrap app"><div className="phone"><div className="phoneTop"/><div className="phoneLine"/><div className="phoneLine" style={{width:'70%', background:'rgba(249,115,22,.35)'}}/></div><div><div className="sectionHead" style={{marginBottom:0}}><div className="kicker" style={{color:'#159067'}}>PetPark app</div><h3>PetPark uvijek uz tebe.</h3></div><p>Brze obavijesti, lakša rezervacija, poruke i sve odluke za ljubimca na jednom toplom mjestu.</p><div className="chips2">{[['Brze obavijesti',Bell],['Laka rezervacija',CalendarCheck],['Poruke',MessageCircle],['Sve na jednom mjestu',Search],['Vrijeme',Clock]].map(([label,Icon])=>{const I=Icon as IconType; return <span key={label as string}><I size={16} color="#159067" />{label as string}</span>})}</div></div></div>;
}

function Footer() {
  return <footer id="petpark-v32-footer"><div className="wrap foot"><div><Image src="/brand/petpark-logo.svg" alt="PetPark" width={118} height={38} style={{width:108,height:'auto'}}/><p>Design-lab prototip prema tvojoj referenci, s pravim PetPark logom.</p></div>{['Usluge','Zajednica','Pomoć'].map(h=><div key={h}><h5>{h}</h5><span>Čuvanje</span><span>Savjeti</span><span>Kontakt</span></div>)}</div></footer>;
}

export default function HomepageV32() {
  return <><style dangerouslySetInnerHTML={{__html:shellCss}}/><main id="petpark-v32" style={{minHeight:'100vh', overflow:'hidden', color:'#163528', background:'radial-gradient(circle at 10% 10%, rgba(255,240,218,.82), transparent 28%), radial-gradient(circle at 88% 8%, rgba(211,239,219,.95), transparent 34%), radial-gradient(circle at 50% 62%, rgba(238,248,232,.92), transparent 42%), linear-gradient(180deg,#eaf6df 0%,#dff0d5 46%,#eef7e6 100%)'}}><Header/><Hero/><Shortcut/><Cards/><AppBanner/><Footer/></main></>;
}
