/* Inicialización de Supabase compartida — cargado una sola vez por página,
   justo después del CDN de Supabase y antes de cualquier script que use _sb o LOCAL_ID.
   Expone _sb y LOCAL_ID como globales para todos los scripts de la misma página. */
var SUPABASE_URL  = 'https://nnmaedehqeeogmhzqzji.supabase.co';
var SUPABASE_ANON = 'sb_publishable_spxukgcwMf-VFre7l_E68g_tWatBs9X';
var LOCAL_ID      = '3fd1108c-1c7b-4a0e-9141-8527db4e5ccc';
var _sb           = (typeof supabase !== 'undefined')
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON)
  : null;

/* Interceptor global de escrituras ─ notifica al header de index.html
   automáticamente cada vez que cualquier iframe haga insert/update/delete/upsert,
   sin que las funciones de guardado individuales tengan que hacerlo a mano. */
(function(){
  if(!_sb) return;
  var _wc = 0;
  function _wNotify(state){
    try{ window.parent.setHeaderSaveState(state); }catch(e){}
  }
  function _wInc(){
    _wc++;
    if(_wc === 1) _wNotify('saving');
  }
  function _wDec(isErr){
    _wc = Math.max(0, _wc - 1);
    if(_wc === 0) _wNotify(isErr ? 'error' : 'saved');
  }
  var _origFrom = _sb.from.bind(_sb);
  _sb.from = function(table){
    var qb = _origFrom(table);
    ['insert','update','delete','upsert'].forEach(function(m){
      if(typeof qb[m] !== 'function') return;
      var orig = qb[m].bind(qb);
      qb[m] = function(){
        var fb = orig.apply(qb, arguments);
        var origThen = fb.then.bind(fb);
        fb.then = function(onFulfilled, onRejected){
          _wInc();
          return origThen(
            function(res){
              _wDec(!!(res && res.error));
              return onFulfilled ? onFulfilled(res) : res;
            },
            function(err){
              _wDec(true);
              return onRejected ? onRejected(err) : Promise.reject(err);
            }
          );
        };
        return fb;
      };
    });
    return qb;
  };
})();
