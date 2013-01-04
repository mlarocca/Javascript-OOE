var Factory = ( function(){
    "use strict";
    
    /** Object of type A
        @private
        
        Private (to Factory) pseudo-constructor for A-type objects
        */
    function Object_A(arg1, arg2){
        var obj_A = Object.create(Object);    //The new Object that will be returned
        
            //Private attribute: it will be visible to Object_A only
        var privateAttribute1;
            //Protected attribute: it will be visible to Object_A and every Object directly inheriting from it
        obj_A.protectedAttribute1 = "A";  //["A" is a placeholder for any value you might want]
            
            //Public attribute: it will also be visible to Object_A and every Object directly inheriting from it...
        obj_A.publicAttribute1 = 1;  //[1 is a placeholder for any value you might want]
            //                  but by defining a proper getter and setter, consumers will be able to modify it                        
        obj_A.publicAttribute2 = 1;  //[1 is a placeholder for any value you might want]
            //                  but by defining a proper getter and setter, consumers will be able to modify it                        
        obj_A.addPublicMethod("setPublicAttribute1", 
                                function(val){
                                    //Special care is needed to ensure inheritance-compliancy
                                    if (this.hasOwnProperty("publicAttribute1")){
                                        this.publicAttribute1 = val;
                                    }else{
                                        //If publicAttribute1 is inherited, we must look up for it in the super classes;
                                        this.superMethod("setPublicAttribute1", val);
                                    }
                                    return this;
                                });
        obj_A.addPublicMethod("setPublicAttribute2", 
                                function(val){
                                    //Another way to ensure inheritance-compliancy is using support method setProperty 
                                    //added to Object by OO_ExT library
                                    this.setProperty("publicAttribute2", val);
                                    
                                    return this;
                                });                                
        obj_A.addPublicMethod("getPublicAttribute1", function(){return this.publicAttribute1;});
        
        obj_A.publicMethod1 = function(m_arg1){
            try{
                console.log("Obj " + this.protectedAttribute1 + ": " + arg1 + ", " + arg2 + ";", "Method 1: " + m_arg1);
            }catch(err){
            }
        };

        obj_A.addProtectedMethod("protectedMethod1", function(){
            //Protected method: you won't be able to call it through a proxy!
            try{
                console.log("Protected Method 1");
            }catch(err){
            }
         });
        
        Object.seal(obj_A);   //You might want to do so, otherwise there is no real encapsulation
                              //WARNING: using freeze instead of seal would prevent any assignment
                              //objects's public attributes
        
        return obj_A;
    }
    
    /**
        Private (to Factory) pseudo-constructor for B-type objects
        */
    function Object_B(arg1, arg2, arg3){
        var superObj = Object_A(arg1, arg2);    //The new Object that will be returned
        var obj_B = Object.create(superObj);
        
            //Private attribute: it will be visible to Object_B only
        var privateAttribute1;
            //Protected attribute: it will be visible to Object_A and every Object directly inheriting from it
            //Overrides obj_A.protectedAttribute1
        obj_B.protectedAttribute1 = "B";  //["B" is a placeholder for any value you might want]
            
        //Public attribute 1, together with its getters and setters, is inherited from : it will also be visible to Object_A and every Object directly inheriting from it...

        
        obj_B.publicMethod2 = function(m_arg1){
            //Call protected method 1, just to show it can; 
            obj_B.protectedMethod1();
        };
        
        Object.seal(obj_B);   //You might want to do so, otherwise there is no real encapsulation
                              //WARNING: using freeze instead of seal would prevent any assignment
                              //objects's public attributes
        
        return obj_B;
    }                    
    
    var FactoryObj = {
        Object_A: function(){
                    return Object_A.apply(null, Array.prototype.slice.apply(arguments, [0])).createSafeProxy();
                  },
        Object_B: function(){
                    return Object_B.apply(null, Array.prototype.slice.apply(arguments, [0])).createSafeProxy();
                  }                                  
    };
    
    Object.freeze(FactoryObj);  //We don't want anybody messing with our factory!
    
    return FactoryObj;
})();