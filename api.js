YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "Object"
    ],
    "modules": [
        "ChartUtils"
    ],
    "allModules": [
        {
            "displayName": "ChartUtils",
            "name": "ChartUtils",
            "description": "Module ChartUtils\n        \nExtends Object class with several useful methods to allow better encapsulation mechanisms.<br>\nEffective encapsulation will be obtained by wrapping JS Objects in a wrapper object, a proxy\nthat will hide original object's attributes and protected methods, while exposing all of\nits public methods.<br>\nTo access public attributes of the original object, appropriate getters and setters needs\nto be declared.<br>\n<b>A method will be considered protected if and only if it is declared as NOT enumerable</b><br>\nFor a wider discussion on the topic, please go <a href=\"http://mlarocca.github.com\">here</a>."
        }
    ]
} };
});