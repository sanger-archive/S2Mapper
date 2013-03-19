define([
       'config',
       'mapper/s2_root',
       'text!json/unit/root.json',
       'text!json/unit/tube_by_barcode.json',
       'text!json/unit/order_without_batch.json',
       'text!json/unit/batch.json'
], function(config, Root, rootTestJson, tubeByBarcodeJson, orderWithoutBatchJson, batchJson){
  'use strict';


  function assignResultTo(target){
    return function(source){ 
      // Assignment through side effect; simultates callback.
      results[target] = source;
    }
  }

  var s2, results;

  describe("Batch Resource:-",function(){

    function commonBefore() {
      results = {};

      config.setupTest(rootTestJson);
      Root.load().done(assignResultTo('root'));
      s2 = results.root;

      config.setupTest(orderWithoutBatchJson);
      s2.tubes.findByEan13Barcode('2345678901234').done(assignResultTo('tube'));
    }

    describe("Creating a new, unsaved, batch using s2.batches.new(),", function(){
      beforeEach(function(){
	commonBefore();
      });

      it("returns a new, unsaved batch resource.", function(){
        results.batch = s2.batches.new();
        expect(results.batch.isNew).toBe(true);
      });

      it("can add items to the unsaved batch.", function(){
        results.batch = s2.batches.new({
          items: [ results.tube ]
        });


        expect(results.batch.items.length).toEqual(1);
      });
    });

    describe("New unsaved empty batch", function() {
      beforeEach(function() {
	commonBefore();
	results.batch = s2.batches.new();
      });
      
      it("throws exception on save", function() {
	spyOn(results.batch, "update");
	expect(results.batch.save).toThrow();
      });
    });

    describe("New unsaved batch with one tube item", function() {
      
      var order = undefined;	
      
      beforeEach(function() {
	commonBefore();
	spyOn(results.tube, "order").andCallThrough();
	
	results.batch = s2.batches.new({
	  items : [ results.tube ]
	}, 
        s2);
	
	  // Take advantage of memoisation
	results.tube.order();
	order = results.tube._order;
	spyOn(order, "update");
	
	//	config.setupTest(orderWithoutBatchJson, 2);
	config.setupTest(batchJson);
      });
      
      
      it("saving with no callback saves batch and item", function() {
	var expectedBatchUuid = "abcd";
	spyOn(results.batch, "create").andCallThrough();
	results.batch.save(function(order) { });
	
	expect(results.batch.create).toHaveBeenCalledWith({"batch":{}});
	expect(results.tube.order).toHaveBeenCalled();
	var item0 = order.items && order.items[0];
	var batch0 = item0 && item0.batch;
	  
	expect(results.batch.uuid).toBe(expectedBatchUuid);
	expect(batch0 && batch0.uuid).toBe(expectedBatchUuid);
	expect(order.update).toHaveBeenCalled();
      });
    });
  });
});
