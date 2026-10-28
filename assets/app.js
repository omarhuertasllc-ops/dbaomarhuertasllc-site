/* Omar Huertas LLC: progressive enhancements that work on every page (the family shell shared with albena.ai).
   1. Nav: border on scroll, the menu panel, the In-development menu, reveal-on-scroll (off when motion is reduced).
   2. Contact / support forms post to Web3Forms without leaving the page (the form also works as a plain HTML post).
   3. The accessibility toolbar (high contrast, larger text, reduced motion), remembered per visitor. */
/* ============ NAV: border on scroll; menu panel; the "In development" menu closes on outside click; reveal-on-scroll ============ */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-nomotion');
  var els = document.querySelectorAll('.reveal, .stage');
  if(reduce || !('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('in'); }); }
  else { var io = new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target); } }); }, {threshold:.08, rootMargin:'0px 0px -4% 0px'}); els.forEach(function(e){ io.observe(e); }); }
  var nav = document.querySelector('[data-nav]'); if(!nav) return;
  var onScroll = function(){ nav.classList.toggle('scrolled', scrollY > 8); };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
  var t = document.querySelector('[data-nav-toggle]'), p = document.getElementById('nav-panel');
  var set = function(o){ p.classList.toggle('open', o); t.setAttribute('aria-expanded', String(o)); };
  t.addEventListener('click', function(){ set(!p.classList.contains('open')); });
  var lab = nav.querySelector('[data-lab]');
  document.addEventListener('keydown', function(e){ if(e.key !== 'Escape') return; if(lab && lab.open){ lab.open = false; lab.querySelector('summary').focus(); } else if(p.classList.contains('open')){ set(false); t.focus(); } });
  document.addEventListener('click', function(e){ if(lab && lab.open && !lab.contains(e.target)) lab.open = false; });
  p.addEventListener('click', function(e){ if(e.target.closest('a')) set(false); });
})();

(function(){
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });

  // contact form -> Web3Forms (real send, no email app) with mailto fallback
  var form = document.querySelector('[data-contact-form]');
  if(form){
    var status = form.querySelector('.form-status');
    var submitBtn = form.querySelector('button[type=submit]');
    if(/[?&]sent=1/.test(location.search) && status){ status.innerHTML = '&#10003; Message sent. Thank you! We&rsquo;ll get back to you shortly.'; }
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      var d = new FormData(form);
      d.delete('redirect');
      var nm = (d.get('name')||'').replace(/[<>]/g,'');
      var keyEl = form.querySelector('[name=access_key]');
      var hasKey = keyEl && keyEl.value && keyEl.value.indexOf('PASTE') === -1;
      if(hasKey){
        status.textContent = 'Sending…'; if(submitBtn) submitBtn.disabled = true;
        try{
          if(!d.get('subject')) d.set('subject', 'New website inquiry from ' + (nm||'a visitor'));
          d.set('from_name', 'Omar Huertas LLC website');
          var r = await fetch('https://api.web3forms.com/submit', { method:'POST', body:d });
          var j = await r.json();
          if(j.success){ status.innerHTML = '&#10003; Message sent' + (nm?(', '+nm):'') + '. Thank you! We&rsquo;ll get back to you shortly.'; form.reset(); }
          else { throw new Error(j.message||'failed'); }
        }catch(err){
          status.innerHTML = 'Sorry, that didn&rsquo;t go through. Please email us directly at <strong>omar@dbaomarhuertasllc.com</strong>.';
        }
        if(submitBtn) submitBtn.disabled = false;
        return;
      }
      // Fallback (no key yet): mailto + clear confirmation
      var subject = encodeURIComponent('Website inquiry from ' + (nm || 'prospect'));
      var body = 'Name: ' + (d.get('name')||'') + '%0D%0AEmail: ' + (d.get('email')||'') +
                 '%0D%0ACompany: ' + (d.get('company')||'') + '%0D%0A%0D%0A' + (d.get('message')||'');
      status.innerHTML = '&#10003; Thanks' + (nm ? (', ' + nm) : '') + '! Opening your email app to send to <strong>omar@dbaomarhuertasllc.com</strong>. If nothing opens, just email us there directly.';
      try { window.location.href = 'mailto:omar@dbaomarhuertasllc.com?subject=' + subject + '&body=' + body; } catch(err){}
    });
  }
})();

/* ============ ACCESSIBILITY TOOLBAR ============ */
(function(){
  var root = document.documentElement, store;
  try { store = window.localStorage; } catch(e){ store = { getItem:function(){return null}, setItem:function(){} }; }
  var OPTS = [['contrast','High contrast'],['large','Larger text'],['nomotion','Reduce motion']];
  OPTS.forEach(function(o){ try{ if(store.getItem('a11y-'+o[0])==='1') root.classList.add('a11y-'+o[0]); }catch(e){} });

  var fab = document.createElement('button');
  fab.className='a11y-fab'; fab.type='button';
  fab.setAttribute('aria-label','Accessibility options'); fab.setAttribute('aria-expanded','false'); fab.setAttribute('aria-controls','a11y-panel');
  fab.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.5" r="1.8"/><path d="M5 9.5c4.6 1.2 9.4 1.2 14 0M12 10v4.5M12 14.5 8.5 21M12 14.5l3.5 6.5"/></svg>';
  var panel = document.createElement('div');
  panel.className='a11y-panel'; panel.id='a11y-panel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','Accessibility options');
  panel.innerHTML = '<h2>Accessibility</h2>' + OPTS.map(function(o){ return '<div class="a11y-opt"><span id="a11y-l-'+o[0]+'">'+o[1]+'</span><button type="button" data-k="'+o[0]+'" aria-pressed="false" aria-labelledby="a11y-l-'+o[0]+'">Off</button></div>'; }).join('');
  document.body.appendChild(fab); document.body.appendChild(panel);

  function syncBtns(){
    panel.querySelectorAll('button[data-k]').forEach(function(b){
      var on = root.classList.contains('a11y-'+b.dataset.k);
      b.setAttribute('aria-pressed', on?'true':'false'); b.textContent = on?'On':'Off';
    });
  }
  function applyMotion(){
    document.querySelectorAll('video').forEach(function(v){
      if(root.classList.contains('a11y-nomotion')){ try{v.pause();}catch(e){} } else { try{v.play();}catch(e){} }
    });
  }
  fab.addEventListener('click', function(){
    var open = panel.classList.toggle('open'); fab.setAttribute('aria-expanded', open?'true':'false');
    if(open){ var first = panel.querySelector('button'); if(first) first.focus(); }
  });
  panel.addEventListener('click', function(e){
    var b = e.target.closest('button[data-k]'); if(!b) return;
    var cls='a11y-'+b.dataset.k, on=root.classList.toggle(cls);
    try{ store.setItem(cls, on?'1':'0'); }catch(err){}
    syncBtns(); if(b.dataset.k==='nomotion') applyMotion();
  });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && panel.classList.contains('open')){ panel.classList.remove('open'); fab.setAttribute('aria-expanded','false'); fab.focus(); }});
  syncBtns(); applyMotion();
})();

/* ============ HOME: stage pointer tilt ============ */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-nomotion');
  var stage = document.querySelector('.stage');
  if(stage && !reduce && matchMedia('(hover:hover) and (pointer:fine)').matches){
    stage.setAttribute('data-tilt','');
    stage.addEventListener('pointermove', function(e){ var r = stage.getBoundingClientRect(); stage.style.setProperty('--tx', ((e.clientX-r.left)/r.width*2-1).toFixed(2)); stage.style.setProperty('--ty', ((e.clientY-r.top)/r.height*2-1).toFixed(2)); });
    stage.addEventListener('pointerleave', function(){ stage.style.setProperty('--tx',0); stage.style.setProperty('--ty',0); });
  }
})();
