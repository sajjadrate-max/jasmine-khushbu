// موبائل کا پیچھے (←) والا بٹن: ایپ بند ہونے کے بجائے پہلے کھلا پینل بند کرے،
// اور صفحے پر ہوں تو ایک بار پیغام دے — دوسری بار دبانے پر ہی ایپ سے باہر نکلے۔
// ساتھ میں انٹرنیٹ نہ ہو تو "No internet 🛜" دکھانے کا مددگار۔
(function(){
  var OV=[], navTo=null, lastBack=0;
  function toast(t){ var el=document.getElementById('toast'); if(!el) return; el.textContent=t; el.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(function(){ el.classList.remove('show'); },1800); }
  function guard(){ history.replaceState({g:1},''); history.pushState({top:1},''); }
  var KHB=window.KHB={
    // پینل کھلا: اس کے لیے تاریخ میں ایک قدم بنائیں تاکہ ← اسے بند کرے
    ovOpen:function(close){ OV.push(close); history.pushState({ov:OV.length},''); },
    // پینل کا ✕ بٹن: وہی کرے جو ← کرتا ہے
    ovBack:function(){ if(OV.length) history.back(); },
    // دوسرے صفحے پر جائیں، بغیر پیچھے والی تاریخ بڑھائے
    go:function(href){ if(history.state&&history.state.top&&!OV.length){ navTo=href; history.back(); } else location.replace(href); },
    online:function(){ return navigator.onLine!==false; },
    toast:toast
  };
  window.addEventListener('popstate',function(e){
    var st=e.state||{};
    if(navTo){ var h=navTo; navTo=null; location.replace(h); return; }
    if(OV.length&&(st.ov||0)<OV.length){ var c=OV.pop(); try{ c(); }catch(x){} return; }
    if(st.g){
      var now=Date.now();
      if(now-lastBack<2000){ history.back(); return; }
      lastBack=now; history.pushState({top:1},''); toast('باہر نکلنے کے لیے دوبارہ ← دبائیں');
    }
  });
  if(!(history.state&&history.state.top)) guard();
  if(/jism-khushbu\.html$/.test(location.pathname)) try{ localStorage.setItem('khb-page','jism'); }catch(x){}
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('.pswitch a'); if(!a) return;
    e.preventDefault(); if(a.getAttribute('aria-current')==='page') return;
    try{ localStorage.setItem('khb-page',a.dataset.pg); }catch(x){}
    KHB.go(a.getAttribute('href'));
  });
})();
