	/**
		Module ChartUtils
        
Extends Object class with several useful methods to allow better encapsulation mechanisms.<br>
Effective encapsulation will be obtained by wrapping JS Objects in a wrapper object, a proxy
that will hide original object's attributes and protected methods, while exposing all of
its public methods.<br>
To access public attributes of the original object, appropriate getters and setters needs
to be declared.<br>
<b>A method will be considered protected if and only if it is declared as NOT enumerable</b><br>
For a wider discussion on the topic, please go <a href="http://mlarocca.github.com">here</a>.
        
        @module ChartUtils           
	*/

if (!window.OO_Ext){
    var OO_Ext =  (function(){
                    
                    "use strict";
                    
                    /** addPublicMethod(methodName, method)
                        
                        Shortcut for defyning a method which will be considered
                        public by createSafeProxy;<br>
                        Usage: obj.addPublicMethod("name", method)<br>
                        to add function method to obj as property obj["name"].
                        
                        @method addPublicMethod
                        @for Object
                        @chainable
                        @param  {String} methodName    The name of the new property to be added to this object<br>
                                                      <b>WARNING</b>: if Object[methodName] exists, then it will
                                                                      be overwritten.
                        @param method {Function}       The method body.
                        @return {Object} This object, to enable method chaining
                        @throws   
                                <ul>
                                    <li>    Wrong number of arguments Exception, if either is missing or null;</li>
                                    <li>    Illegal Argument Exception, if methodName is not a String;</li>
                                    <li>    Illegal Argument Exception, if method is not a Function.</li>
                                </ul>     
                      */
                    function addPublicMethod(methodName, method){
                        
                        if (!methodName || !method){
                            throw "Wrong number of arguments Exception";
                        }
                        if (!Object.isString(methodName)){
                            throw "Illegal Argument Exception: methodName must be a string";
                        }                                                            
                        if (!Object.isFunction(method)){
                            throw "Illegal Argument Exception: method must be a function";
                        }
                        Object.defineProperty(this, methodName, {
                            value: method,
                            writable: false,
                            enumerable: true,
                            configurable:false
                        });
                        return this;    //Chainable
                    }   

                    /** addProtectedMethod(methodName, method)
                        
                        Shortcut for defyning a method which will be considered
                        protected by createSafeProxy;<br>
                        Usage: obj.addProtectedMethod("name", method)<br>
                        to add function method to obj as property obj["name"].
                        
                        @method addProtectedMethod
                        @for Object
                        @chainable
                        @param  {String} methodName    The name of the new property to be added to this object<br>
                                                      <b>WARNING</b>: if Object[methodName] exists, then it will
                                                                      be overwritten.
                        @param method {Function}       The method body.
                        @return {Object} This object, to enable method chaining
                        @throws   
                                <ul>
                                    <li>    Wrong number of arguments Exception, if either is missing or null;</li>
                                    <li>    Illegal Argument Exception, if methodName is not a String;</li>
                                    <li>    Illegal Argument Exception, if method is not a Function.</li>
                                </ul>     
                      */
                    function addProtectedMethod(methodName, method){
                        
                        if (!methodName || !method){
                            throw "Wrong number of arguments Exception";
                        }
                        if (!Object.isString(methodName)){
                            throw "Illegal Argument Exception: methodName must be a string";
                        }                                                            
                        if (!Object.isFunction(method)){
                            throw "Illegal Argument Exception: method must be a function";
                        }
                        Object.defineProperty(this, methodName, {
                            value: method,
                            writable: false,
                            enumerable: false,
                            configurable:false
                        });
                    }      

                    /** createSafeProxy()
                    
                        Creates and returns a safe proxy for the object passed, 
                        that will wrap around it and expose only those methods
                        marked as public (i.e. those that are declared as enumerable).
                        
                        
                        @method createSafeProxy
                        @for Object
                        @chainable
                        @param {Boolean} [canDestroy=false] States if the proxy consumer has the authority
                                                            to call destroy on the original object;<br>
                                                            We assume the convention that object's uses
                                                            destroy method as their destructor.
                        @return {Object} A proxy wrapping this object.
                        @throws  Any exception the original object pseudo-constructor might throw.
                      */
                    function createSafeProxy(canDestroy){
                        
                        var property;
                        var proxy = Object.create(null);
                        var obj = this; //We must retain the "this" pointer to the current object to use it inside different contexts
                        
                        for (property in obj){
                            //DO NOT check hasOwnProperty: the proxy must work for obj's prototype methods as well
                            //ONLY enumerable methods will be added to proxy's interface
                            if (Function.isFunction(obj[property])){
                                
                                //If it's a method not marked as protected, it is added to the proxy interface;
                                proxy[property] = ( function(p){
                                                        return  function(){
                                                                    var result;
                                                                    if (obj){
                                                                        result = obj[p].apply(obj, Array.prototype.slice.apply(arguments, [0]));
                                                                        //Special care is needed to support method chaining
                                                                        if (result === obj){
                                                                            //obj.property returns obj itself, but we must return this proxy instead;
                                                                            return proxy;
                                                                        }else{
                                                                            return result;
                                                                        }
                                                                    }else{
                                                                        throw "Null reference: the object has been already destroyed";
                                                                    }
                                                                };
                                                    })(property);
                            }
                        }
                        
                        //Adds a wrapping destroy method to allow withdrawal of the privileges given up introducing 
                        //the consumer to obj;
                        proxy.destroy = function(){
                                            try{
                                                if (canDestroy){
                                                    obj.destroy();  //Destroys the original object only if authorized to
                                                }
                                            }finally{
                                                obj = null;
                                            }
                                        };
                                            
                        return proxy;
                    }   

                   /** superMethod(methodName)
                       
                       @method superMethod
                       @for Object
                       @param {String} methodName The name of the method to look up for in this object super object 
                       @param [args]* The arguments to be passed to the super method, if any is needed;
                       @return The result of the call to the method named methodName of this object's super object.
                       @throws
                                <ul>
                                    <li>Wrong number of arguments Exception, if methodName is missing or null;</li>
                                    <li>Illegal Argument Exception, if methodName is not a String;</li>                                                                    
                                    <li>Method not found Exception, if the super object has no such method.</li>
                                </ul>
                     */
                    function superMethod(methodName /*, args*/){
                        if (!methodName){
                            throw "Wrong number of arguments Exception";
                        }
                        if (!Object.isString(methodName)){
                            throw "Illegal Argument Exception: methodName must be a string";
                        }    
                        
                        //Looks up for this object's prototype
                        var proto = this.prototype && this.prototype[methodName] ? this.prototype : this.__proto__;
                        if (proto && proto[methodName] && Object.isFunction(proto[methodName])){
                            return proto[methodName].apply(proto, Array.prototype.slice.apply(arguments, [1]));
                        }else{
                            throw   "Super object has no method " + methodName;
                        }
                    }   

                    /** setProperty(property, value)
                       
                       Assign the value "value" to the property "property" of the current object.<br>
                       "property" MUST be an existing property of current object or of its ancestors:
                       if this[property] is undefined, it recursively checks along its inheritance chain. 
                       
                       @method setProperty
                       @for Object
                       @chainable
                       @param {String} property The name of the property to look up for in this object and its super object.
                       @param value The value to be assigned to the property.
                       @return This object, to allow for method chaining
                       @throws
                                <ul>
                                    <li>Wrong number of arguments Exception, if property is missing or null; (undefined is accepted for value)</li>
                                    <li>Illegal Argument Exception, if property is not a String;</li>                                                                    
                                    <li>Method not found Exception, if neither this object or its super object has such a property.</li>
                                    <li>TypeError, if property exists but it isn't writable.</li>
                                </ul>
                     */
                    function setProperty(property, value){
                        if (!property){
                            throw "Wrong number of arguments Exception";
                        }
                        if (!Object.isString(property)){
                            throw "Illegal Argument Exception: property must be a string";
                        }    
                        
                        if (this.hasOwnProperty(property)){
                            this[property] = value;
                            return this;
                        }
                        
                        //Looks up for this object's prototype
                        var proto = this.prototype && this.prototype[property] ? this.prototype : this.__proto__;
                        if (proto && !Object.isUndefined(proto[property])){
                            proto.setProperty(property, value);
                            return this;
                        }else{
                            throw "Super object has no property " + property;
                        }
                        
                    }
                  
                    
                    /** 
                        Checks if its argument is an array.
                        
                        @method isArray
                        @for Object
                        @param {Object} obj The argument to be checked.
                        @return {Boolean} true iff the object is an Array.
                    */                      
                    function isArray(obj){
                        return obj && (obj.constructor === Array);
                    }
                    
                    /** 
                        Checks if its argument is a string.
                        
                        @method isString
                        @for Object
                        @param {Object} obj The argument to be checked.
                        @return {Boolean} true iff the object is a String.
                    */                      
                    function isString(arg) {
                        return typeof(arg) === 'string';
                    }
                    
                    /** 
                        Checks if its argument is a Function.
                        
                        @method isFunction
                        @for Object
                        @param {Object} obj The argument to be checked.
                        @return {Boolean} true iff the object is a Function.
                    */                    
                    function isFunction(arg) {
                        return typeof(arg) === 'function';
                    }  
                    
                    /** 
                        Checks if its argument is a Number.
                        
                        @method isNumber
                        @for Object
                        @param {Object} obj The argument to be checked.
                        @return {Boolean} true iff the object is a Number.
                    */                    
                    function isNumber(n){
                        return !isNaN(parseFloat(n)) && isFinite(n);
                    }   

                    /** 
                        Checks if its argument is undefined.
                        
                        @method isUndefined
                        @for Object
                        @param {Object} arg The argument to be checked.
                        @return {Boolean} true <=> the argument is undefined.
                    */              
                    function isUndefined(arg){
                        return typeof(arg) === "undefined";
                    };                     
                    
                    if (!Object.prototype.addPublicMethod){
                        Object.defineProperty(Object.prototype, "addPublicMethod", {
                                                value: addPublicMethod,
                                                writable: false,
                                                enumerable: false,
                                                configurable: false
                                            });
                    }
                    
                    if (!Object.prototype.addProtectedMethod){
                        Object.defineProperty(Object.prototype, "addProtectedMethod", {
                                                value: addProtectedMethod,
                                                writable: false,
                                                enumerable: false,
                                                configurable: false
                                            });
                    }		

                    if (!Object.prototype.createSafeProxy){
                        Object.defineProperty(Object.prototype, "createSafeProxy", {
                                                value: createSafeProxy,
                                                writable: false,
                                                enumerable: false,
                                                configurable: false
                                            });
                    }    	        

                    if (!Object.prototype.superMethod){
                        Object.defineProperty(Object.prototype, "superMethod", {
                                                value: superMethod,
                                                writable: false,
                                                enumerable: false,
                                                configurable: false
                                            });
                    }
                            
                    if (!Object.prototype.setProperty){
                        Object.defineProperty(Object.prototype, "setProperty", {
                                                value: setProperty,
                                                writable: false,
                                                enumerable: false,
                                                configurable: false
                                            });
                    }  
                    
                    if (!Object.prototype.isArray){
                        Object.defineProperty(Object.prototype, "isArray", {
                                                value: isArray,
                                                writable: false,
                                                enumerable: false,
                                                configurable: false
                                            });                        
                    }

                    if (!Object.prototype.isString){
                        Object.defineProperty(Object.prototype, "isString", {
                                                value: isString,
                                                writable: false,
                                                enumerable: false,
                                                configurable: false
                                            });  
                    }    

                    if (!Object.prototype.isFunction){
                        Object.defineProperty(Object.prototype, "isFunction", {
                                                value: isFunction,
                                                writable: false,
                                                enumerable: false,
                                                configurable: false
                                            });  
                    }        

                    if (!Object.prototype.isNumber){
                        Object.defineProperty(Object.prototype, "isNumber", {
                                                value: isNumber,
                                                writable: false,
                                                enumerable: false,
                                                configurable: false
                                            });  
                    }

                    if (!Object.prototype.isUndefined){
                        Object.defineProperty(Object.prototype, "isUndefined", {
                                                value: isUndefined,
                                                writable: false,
                                                enumerable: false,
                                                configurable: false
                                            }); 
                    }                      
    })();
}