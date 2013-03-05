require.config({
  shim: {
  },

  paths: {
    hm: 'vendor/hm',
    esprima: 'vendor/esprima',
    jquery: 'vendor/jquery.min'
  }
});
 
require(['app','services/print'], function(app, services) {
  // use app here
  $('#print').click(function (){
    services.print ('barcode', 'desc', 'name', 'prefix', 'project', 'suffix');
  });
  console.log(app);
});
