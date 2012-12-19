if (!window.OO_Ext){
    var OO_Ext =  (function(){
                    
                    "use strict";
                    
                    /** addPublicMethod(methodName, method)
                        
                        Shortcut for defyning a method which will be considered
                        public by createSafeProxy;
                        
                        @param methodName {string}    The name of the new property to be added to this object
                                                        WARNING: if Object[methodName] exists, then it will
                                                                 be overridden.
                        @param method {Function}       The method body.
                        
                        @throw   
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
                    }   

                    /** addProtectedMethod(methodName, method)
                        
                        Shortcut for defyning a method which will be considered
                        protected by createSafeProxy;
                        
                        @param methodName {string}    The name of the new property to be added to this object
                                                        WARNING: if Object[methodName] exists, then it will
                                                                 be overridden.
                        @param method {Function}       The method body.
                        
                        @throw   
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
                    
                        Creates and returns a safe proxy for the object passed
                        that will wrap around it and expose only those methods
                        that are declared as enumerable.
                        
                        @param {boolean, default=false} CanDestroy 
                                         States if the proxy consumer has the authority to call destroy 
                                         on the original object
                        
                        @return {Object} A proxy wrapping this object;
                        @throw  Any exception the original object pseudo-constructor might throw.
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
                       
                       @param methodName {string} The name of the method to look up for in this object super object 
                       @param ...args The arguments to be passed to the super method, if any is needed;
                       @return  The method named methodName in the super object, if any
                       @throw
                                <ul>
                                    <li>Wrong number of arguments Exception, if methodName is missing or null;</li>
                                    <li>Illegal Argument Exception, if methodName is not a String;</li>                                                                    
                                    <li>Method not found Exception, if the super object has no such method.</li>
                                </ul>
                     */
                    function superMethod(methodName /*, args*/){
                        //console.log(this, methodName);
                        if (!methodName){
                            throw "Wrong number of arguments Exception";
                        }
                        if (!Object.isString(methodName)){
                            throw "Illegal Argument Exception: methodName must be a string";
                        }    
                        
                        //Looks up for this object's prototype
                        var proto = this.prototype && this.prototype[methodName] ? this.prototype : this.__proto__;
                        //console.log(this.prototype, this.__proto__, proto[methodName]);
                        if (proto && proto[methodName] && Object.isFunction(proto[methodName])){
                            return proto[methodName].apply(proto, Array.prototype.slice.apply(arguments, [1]));
                        }else{
                            throw   "Super object has no method " + methodName;
                        }
                    }   

                    function isArray(obj){
                        return obj && (obj.constructor === Array);
                    }
                    
                    function isString(arg) {
                        return typeof(arg) === 'string';
                    }
                    
                    function isFunction(arg) {
                        return typeof(arg) === 'function';
                    }  
                    
                    function isNumber(n){
                        return !isNaN(parseFloat(n)) && isFinite(n);
                    }                     
                    
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
    })();
}