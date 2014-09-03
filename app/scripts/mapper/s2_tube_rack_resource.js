define([
  "mapper/s2_base_resource",
  "mapper/s2_labeling_module",
  "mapper/s2_batchable_module",
  "config"
], function(BaseResource, LabelingModule, BatchableModule, config){
  "use strict";

  var TubeRack = BaseResource.extendAs("tube_rack", function(tubeRackInstance, options) {
    $.extend(tubeRackInstance, batchableMethods);
    $.extend(tubeRackInstance, LabelingModule);
    $.extend(tubeRackInstance, instanceMethods);
    return tubeRackInstance;
  });

  TubeRack.resourceType      = "tube_rack";
  TubeRack.transferBehaviour = "plateLike";

  var batchableMethods   = BatchableModule(TubeRack.resourceType);
  var instanceMethods = {
    labelRole: function(){
      var aliquotTypes = _.chain(this.tubes).
        values().
        pluck("aliquots").
        flatten().
        pluck("type").
        uniq().
        value();

      if (aliquotTypes.length > 1) throw "More than 1 type of aliquot found.";

      var aliquotType = aliquotTypes[0];

      switch (aliquotType){
        case "DNA": return "DNA Stock";
        case "RNA": return "RNA Stock";
        default:    return aliquotType;
      }
    },
    
    allOrdersFromTubes: function() {
      return _.chain(this.tubes).map(_.bind(function(tube) {
        return this.root.find(tube.uuid).then(function(labware) {
          return labware.orders();
        });
      }, this)).flatten().uniq().value();
    },
    processItemOrderUpdate: function(order, itemOrderUpdate) {
      var tubeRack = this;
      return _.every(_.pairs(itemOrderUpdate.items), function(pairs) {
        var roleName = pairs[0], updateObj = pairs[1];
        if (!_.isUndefined(config) && !_.isUndefined(config.resetableRolesList) &&
          _.indexOf(config.resetableRolesList, roleName)<0) {
          // If it is not a role to be checked
          return true;
        }
        // If my rack is going to be marked as "unused" in a role for the order
        if ((!_.isUndefined(updateObj[tubeRack.uuid])) && (updateObj[tubeRack.uuid].event === "unuse")) {
          // Check that there isn't any tubes remaining inside my rack that belongs to this order that are
          // identified inside this order as an enabled item (status==done) because in that case they would be still in use.
          // If this is the case, I mustn't execute the "unuse" event on this rack for this order, as I 
          // am still having tubes awaiting to be processed among my contents.
          var uuidForRemainingTubes = _.chain(tubeRack.tubes).values().pluck("uuid").value();
          var uuidForEnabledItemsOnOrder = _.chain(order.items).values().flatten().
          filter(function(item) {
            return item.status=='done';
          }).pluck("uuid").value();
          var allowUpdate =  (_.difference(uuidForRemainingTubes, uuidForEnabledItemsOnOrder).length === 0);
          if (!allowUpdate) {
            delete updateObj[tubeRack.uuid];
          }
          return allowUpdate;
        }
        return true;
      });
    }
  };

  return TubeRack;
});

