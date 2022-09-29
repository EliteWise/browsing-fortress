var DateDiff = {
 
    inDays: function(d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();
  
        return Math.floor((t2-t1)/(24*3600*1000));
    }
  
  }