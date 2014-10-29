/**
 @namespace
 @name ejs
 @desc All elastic.js modules are organized under the ejs namespace.
 */
(function () {
  'use strict';

  var 

    // save reference to global object
    // `window` in browser
    // `exports` on server
    root = this,
    
    // save the previous version of ejs
    _ejs = root && root.ejs,

    // from underscore.js, used in utils
    ArrayProto = Array.prototype, 
    ObjProto = Object.prototype, 
    slice = ArrayProto.slice,
    toString = ObjProto.toString,
    hasOwnProp = ObjProto.hasOwnProperty,
    nativeForEach = ArrayProto.forEach,
    nativeIsArray = Array.isArray,
    nativeIndexOf = ArrayProto.indexOf,
    breaker = {},
    has,
    each,
    extend,
    indexOf,
    genClientParams,
    genParamStr,
    isArray,
    isObject,
    isString,
    isNumber,
    isFunction,
    isEJSObject, // checks if valid ejs object
    isQuery, // checks valid ejs Query object
    isRescore, // checks valid ejs Rescore object
    isFilter, // checks valid ejs Filter object
    isFacet, // checks valid ejs Facet object
    isScriptField, // checks valid ejs ScriptField object
    isGeoPoint, // checks valid ejs GeoPoint object
    isIndexedShape, // checks valid ejs IndexedShape object
    isShape, // checks valid ejs Shape object
    isSort, // checks valid ejs Sort object
    isHighlight, // checks valid ejs Highlight object
    isSuggest, // checks valid ejs Suggest object
    isGenerator, // checks valid ejs Generator object
    isClusterHealth, // checks valid ejs ClusterHealth object
    isClusterState, // checks valid ejs ClusterState object
    isNodeStats, // checks valid ejs NodeStats object
    isNodeInfo, // checks valid ejs NodeInfo object
    isRequest, // checks valid ejs Request object
    isMultiSearchRequest, // checks valid ejs MultiSearchRequest object
    
    // create ejs object
    ejs;
    
  if (typeof exports !== 'undefined') {
    ejs = exports;
  } else {
    ejs = root.ejs = {};
  }
