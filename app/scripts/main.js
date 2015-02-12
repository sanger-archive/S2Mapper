//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013-2015 Genome Research Ltd.
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
    services.print('barcode', 'desc', 'name', 'prefix', 'project', 'suffix').done(function(){
      alert('Printed');
    });
  });
  console.log(app);
});
