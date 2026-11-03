(function(){
'use strict';
var KEY='dhaaga_cart_v1',R=window.ROOT||'',FREE=1999,SHIP=99;
window.dataLayer=window.dataLayer||[];
function $(s,r){return(r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function inr(n){return '\u20b9'+Number(n).toLocaleString('en-IN')}
function esc(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML}
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
function save(c){try{localStorage.setItem(KEY,JSON.stringify(c))}catch(e){}badge()}
function count(c){return c.reduce(function(a,l){return a+l.qty},0)}
function sub(c){return c.reduce(function(a,l){return a+l.price*l.qty},0)}
function ship(s){return(s===0||s>=FREE)?0:SHIP}
function badge(){var n=count(load());$$('.cart-count').forEach(function(e){e.textContent=n;e.style.display=n?'inline-flex':'none'})}
function item(l){return{item_id:l.id,item_name:l.name,item_category:l.cat,item_variant:l.size,price:l.price,quantity:l.qty}}
function ec(ev,items,extra){
  var v=items.reduce(function(a,i){return a+i.price*i.quantity},0);
  window.dataLayer.push({ecommerce:null});
  window.dataLayer.push({event:ev,ecommerce:Object.assign({currency:'INR',value:v,items:items},extra||{})});
}
function img(slug,alt){return '<img src="'+R+'images/'+slug+'.jpg" alt="'+esc(alt)+'" onerror="this.onerror=null;this.src=\''+R+'images/'+slug+'.svg\'">'}
function toast(h){var t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.innerHTML=h;document.body.appendChild(t);setTimeout(function(){t.remove()},3800)}

function category(){
  var g=$('#grid');if(!g)return;var cards=$$('.card',g);
  ec('view_item_list',cards.map(function(a,i){return{item_id:a.getAttribute('data-id'),item_name:a.getAttribute('data-name'),item_category:a.getAttribute('data-cat'),price:+a.getAttribute('data-price'),index:i,quantity:1}}));
  var s=$('#sort');
  if(s)s.addEventListener('change',function(){
    var arr=cards.slice(),v=s.value;
    if(v==='low')arr.sort(function(a,b){return a.getAttribute('data-price')-b.getAttribute('data-price')});
    if(v==='high')arr.sort(function(a,b){return b.getAttribute('data-price')-a.getAttribute('data-price')});
    arr.forEach(function(a){g.appendChild(a)});
  });
}

function product(){
  var P=window.PRODUCT;if(!P)return;var size=null,qty=1;
  ec('view_item',[{item_id:P.id,item_name:P.name,item_category:P.cat,price:P.price,quantity:1}]);
  $$('.size-btn').forEach(function(b){b.addEventListener('click',function(){
    $$('.size-btn').forEach(function(x){x.classList.remove('on')});
    b.classList.add('on');size=b.getAttribute('data-size');$('#sizeMsg').textContent='';
  })});
  $('#qtyMinus').addEventListener('click',function(){if(qty>1){qty--;$('#qtyVal').textContent=qty}});
  $('#qtyPlus').addEventListener('click',function(){if(qty<10){qty++;$('#qtyVal').textContent=qty}});
  function add(){
    if(!size){var s=$('#sizes');$('#sizeMsg').textContent='Select a size to continue';s.classList.remove('shake');void s.offsetWidth;s.classList.add('shake');return false}
    var c=load(),f=c.filter(function(l){return l.id===P.id&&l.size===size})[0];
    if(f){f.qty+=qty}else{c.push({id:P.id,slug:P.slug,name:P.name,cat:P.cat,price:P.price,size:size,qty:qty})}
    save(c);
    ec('add_to_cart',[{item_id:P.id,item_name:P.name,item_category:P.cat,item_variant:size,price:P.price,quantity:qty}]);
    return true;
  }
  $('#addToCart').addEventListener('click',function(){if(add())toast('Added to your bag <a href="'+R+'cart.html">View bag</a>')});
  $('#buyNow').addEventListener('click',function(){if(add())location.href=R+'checkout.html'});
}

function cart(){
  var root=$('#cartRoot');if(!root)return;var viewed=false;
  function draw(){
    var c=load();
    if(!c.length){root.innerHTML='<div class="empty"><h2>Your bag is empty</h2><p>Add something you like and it will show up here.</p><a class="btn" href="'+R+'t-shirts.html">Shop T-Shirts</a></div>';return}
    var s=sub(c),sh=ship(s);
    var rows=c.map(function(l,i){return '<div class="row" data-i="'+i+'">'+img(l.slug,l.name)+'<div class="r-info"><a href="'+R+'products/'+l.slug+'.html"><b>'+esc(l.name)+'</b></a><span>Size '+l.size+'</span><span>'+inr(l.price)+'</span><div class="qty"><button data-act="dec" aria-label="Decrease quantity">&minus;</button><em>'+l.qty+'</em><button data-act="inc" aria-label="Increase quantity">+</button></div></div><div class="r-total">'+inr(l.price*l.qty)+'<button class="link" data-act="rm">Remove</button></div></div>'}).join('');
    var left=FREE-s,pct=Math.min(100,Math.round(s/FREE*100));
    var note=left>0?'Add '+inr(left)+' more for free shipping':'You have free shipping';
    root.innerHTML='<div class="cart-grid"><div>'+rows+'</div><aside class="summary"><h3>Order summary</h3><div class="sum-row"><span>Subtotal</span><span>'+inr(s)+'</span></div><div class="sum-row"><span>Shipping</span><span>'+(sh?inr(sh):'Free')+'</span></div><div class="sum-row sum-total"><span>Total</span><span>'+inr(s+sh)+'</span></div><p class="ship-note">'+note+'</p><div class="bar-t"><i style="width:'+pct+'%"></i></div><a class="btn block" style="margin-top:20px" id="toCheckout" href="'+R+'checkout.html">Proceed to checkout</a></aside></div>';
    if(!viewed){viewed=true;ec('view_cart',c.map(item))}
  }
  root.addEventListener('click',function(e){
    var b=e.target.closest('[data-act]');if(!b)return;
    var row=b.closest('.row'),i=+row.getAttribute('data-i'),c=load(),l=c[i],a=b.getAttribute('data-act');
    if(a==='inc'&&l.qty<10){l.qty++;ec('add_to_cart',[Object.assign(item(l),{quantity:1})])}
    else if(a==='dec'&&l.qty>1){l.qty--;ec('remove_from_cart',[Object.assign(item(l),{quantity:1})])}
    else if(a==='rm'){ec('remove_from_cart',[item(l)]);c.splice(i,1)}
    save(c);draw();
  });
  draw();
}

function checkout(){
  var f=$('#checkoutForm');if(!f)return;var c=load();
  if(!c.length){location.href=R+'cart.html';return}
  var s=sub(c),sh=ship(s);
  $('#orderSummary').innerHTML='<h3>Your order</h3>'+c.map(function(l){return '<div class="sum-row"><span>'+esc(l.name)+' ('+l.size+') x '+l.qty+'</span><span>'+inr(l.price*l.qty)+'</span></div>'}).join('')+'<div class="sum-row"><span>Shipping</span><span>'+(sh?inr(sh):'Free')+'</span></div><div class="sum-row sum-total"><span>Total</span><span>'+inr(s+sh)+'</span></div>';
  ec('begin_checkout',c.map(item));
  f.addEventListener('submit',function(e){
    e.preventDefault();var m=$('#formMsg');
    if(!f.checkValidity()){m.textContent='Please fill in all the fields correctly.';f.reportValidity();return}
    m.textContent='';var cc=load();if(!cc.length)return;
    var s2=sub(cc),sh2=ship(s2),id='DH'+String(Date.now()).slice(-8);
    var order={id:id,items:cc,sub:s2,ship:sh2,total:s2+sh2,name:f.fname.value,city:f.city.value,pay:f.pay.value};
    try{sessionStorage.setItem('dhaaga_last_order',JSON.stringify(order))}catch(x){}
    ec('purchase',cc.map(item),{transaction_id:id,value:s2+sh2,shipping:sh2});
    save([]);location.href=R+'thank-you.html';
  });
}

function thanks(){
  var r=$('#orderRoot');if(!r)return;var o=null;
  try{o=JSON.parse(sessionStorage.getItem('dhaaga_last_order'))}catch(e){}
  if(!o){r.innerHTML='<h1>No recent order</h1><p>Browse the range to place one.</p><a class="btn" href="'+R+'t-shirts.html">Start shopping</a>';return}
  r.innerHTML='<h1>Thank you, '+esc(o.name.split(' ')[0])+'. Your order is confirmed.</h1><p>Order number <b>'+o.id+'</b>. We will deliver to '+esc(o.city)+' within 3 to 6 working days.</p><div class="summary" style="position:static">'+o.items.map(function(l){return '<div class="sum-row"><span>'+esc(l.name)+' ('+l.size+') x '+l.qty+'</span><span>'+inr(l.price*l.qty)+'</span></div>'}).join('')+'<div class="sum-row"><span>Shipping</span><span>'+(o.ship?inr(o.ship):'Free')+'</span></div><div class="sum-row sum-total"><span>Total</span><span>'+inr(o.total)+'</span></div></div><p style="margin-top:24px"><a class="btn" href="'+R+'index.html">Continue shopping</a></p>';
}

badge();
var menu=$('#menuBtn');
if(menu)menu.addEventListener('click',function(){var o=$('#mainNav').classList.toggle('open');menu.setAttribute('aria-expanded',o)});
var nl=$('#newsletter');
if(nl)nl.addEventListener('submit',function(e){e.preventDefault();window.dataLayer.push({event:'newsletter_signup'});$('#nlMsg').textContent='Thanks for joining. Your 10% code is on its way.';nl.reset()});
var map={product:product,category:category,cart:cart,checkout:checkout,thanks:thanks},pg=document.body.getAttribute('data-page');
if(map[pg])map[pg]();
})();
