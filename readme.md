S2 Mapper
=========

S2 Mapper is a wrapper for an S2 LIMS (Laboritory Information Management
System) compatible API.

[S2](https://github.com/sanger/lims-api) is a backend LIMS server sending and receiving JSON.


Installation
------------
S2Mapper is a [Bower](https://github.com/twitter/bower) module.  It
hasn't yet been registered with the central Bower repository but can be
installed with:-

```bash
bower install git@github.com:sanger/S2Mapper.git
```

Resources
---------
A plain S2 resouce typically has the following structure:-
```javascript
{
  resourceType: 'tube',
  read:     function(){...},  // a function to reread the resource using an AJAX
                              // request.

  create:   function() {...},
  update:   function() {...},
  delete:   function() {...},
  rawJson:  {...},            // holds the JSON as sent back by the S2API.
  batch:    function(){ },    // returns a Batch Promise
}
```
Searching for Resources
-----------------------
Searching is carried out asynchronusly and returns a jQuery promise
object.

```javascript
var s2root = S2Root.load();
s2root.tubes.findByEan13Barcode('0123456789123');
// => Resource Promise
```

The resource can then be extracted with a callback.  E.g.
```javascript
var s2root = S2Root.load();
var tube;

s2root.tubes.findByEan13Barcode('0123456789123').done(function(returnedResource){
  tube = returnedResource;
});
```

Order and Batch
---------------
An order represents a request for work to be carried out on a number of
items (tubes, plates, spin columns, etc.)

An order may span several laboritory pipelines. For example, from Sample 
reception through library preparation and into cluster formation (sequencing).

A project investigator will be created an Order ahead of sample
reception.

To allow individual pipelines the flexibility to decide how work 
processed items from 1 or more Orders can be processed in batches.

Batch is used as the unit of work for items in S2.

The S2Mapper allows you to retrieve the batch for an item through the
batch function.

```javascript
tube.batch(); 
// => Batch Promise
```

Both Order and Batch are S2 Resources but with some specialiation.

##Services
###Printing

S2Mapper also includes a service to print barcodes. Currently this is bound to one printer, and only tube labels.

To use the printing service, include 'services/prints.js' and call

```print (barcode, desc, name, prefix, project, suffix) // => Promise```
