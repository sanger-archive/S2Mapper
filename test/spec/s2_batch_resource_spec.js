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

    describe("New unsaved empty batch", function() {
      beforeEach(function() {
	commonBefore();
	results.batch = s2.batches.new();
      });

      it("is new", function() {
	expect(results.batch.isNew).toBe(true);
      });
      
      it("throws exception on save", function() {
	spyOn(results.batch, "update");
	expect(results.batch.save).toThrow();
      });

      it("has root element set", function() {	
	expect(results.batch.root).toBeDefined();
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
	
	config.setupTest(batchJson);
      });

      it("has one item", function() {
        expect(results.batch.items.length).toEqual(1);

      });
      
      
      it("saving with no callback saves batch and item", function() {
	var expectedBatchUuid = "47608460-68ac-0130-7ac8-282066132de2",
	expectedRole = "tube_to_be_extracted",
	savedBatch = undefined;
	spyOn(s2.batches, "create").andCallThrough();
	results.batch.save(function(order) { }).
	  done(function(batch) {
	    savedBatch = batch;
	  });
	
	expect(s2.batches.create).toHaveBeenCalledWith({});
	expect(results.tube.order).toHaveBeenCalled();
	var items = order.items && order.items[expectedRole];
	var batch0 = items[0] && items[0].batch;
	  
	expect(savedBatch).toBeDefined();
	expect(savedBatch.uuid).toBe(expectedBatchUuid);
	expect(batch0 && batch0.uuid).toBe(expectedBatchUuid);
	expect(order.update).toHaveBeenCalledWith({
	items: {
	  tube_to_be_extracted: [
	    { batch : { uuid : "47608460-68ac-0130-7ac8-282066132de2" } }
	    ]
	}
	});
      });
    });
  });
});
