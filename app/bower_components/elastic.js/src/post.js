  // run in noConflict mode
  ejs.noConflict = function () {
    root.ejs = _ejs;
    return this;
  };
  
}).call(this);
