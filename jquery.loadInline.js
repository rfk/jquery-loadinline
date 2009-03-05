//
//  jQuery.loadInline.js:  have links and forms load content inline via ajax
//
//
//  Copyright (c) 2009, Ryan Kelly
//  Available under the terms of the MIT licencse.
//  http://www.opensource.org/licenses/mit-license.php
//
//
//  This jQuery plugin causes links to display their contents within an
//  element on the current page, using a simple AJAX request.  Similarly,
//  it modifies forms to submit themselves via ajax and display the resulting
//  content inline in the current page (using the fantastic jquery.form
//  plugin for all the heavy lifting).
//
//  The interesting part is that any links or forms within the returned content
//  are automatically decorated to load their content into the same inline
//  element. The overall effect is like a little mini browser window contained 
//  inline in the current page.
//
//  Use it like so:
//
//     $("a.load-inline").loadInline();
//
//  An options object may be given as the only argument to loadInline(), to
//  specify any of the following properties:
//
//      target:  selector for the inline element into which contents
//               will be loaded.
//
//      linkSelector:  selector to locate elements within the loaded content
//                     that should be recursively decorated.
//  
//      create:  function that will be called if no target is specified;
//               it must find/create the inline element to be used and
//               then return it.
//
//      template:  HTML node that will be cloned by the default 'create'
//                 function to produce the inline element.
//
//      success:  callback executed whenever content is successfully loaded
//
//      error:  callback executed whenever content loading gives an error
//
//      setState:  callback executed whenever the state of the inline element
//                 changes.  The state name is given as the only argument,
//                 and can be one of 'wait', 'success' or 'error'.
//
//      finish:  callback executed when content is successfully loaded but
//               contains no further links or forms; basically indicates that
//               no further navigation can be performed within the element.
//
//  The default behavior is to create a fresh <div> for each loadInline() 
//  element and display it as a pop-up.  When no further navigation is
//  possible, or when ESC is pressed, the pop-up is automatically closed.
//

(function($) {

//  Main plugin entrypoint
//
$.fn.loadInline = function(options) {
    var opts = $.extend({},$.fn.loadInline.defaults,options);
    return this.each(function() {
        var $this = $(this);
        var inline = null;
        //  Capture link click events and send them into the inline element
        $this.filter("a").click(function(evt) {
             evt.preventDefault();
             inline = new Inline(opts,$this,evt);
             $.ajax({
                 url: $this.attr("href"),
                 success: function() {
                              return inline.success.apply(inline,arguments);
                          },
                 error: function() {
                            return inline.error.apply(inline,arguments);
                        }
             })
        });
        //  Capture form submissions and send them into the inline element.
        //  This leverages the awesome ajax form plugin.
        $this.filter("form").ajaxForm({
            beforeSubmit: function() {
                            inline = new Inline(opts,$this);
                            return inline.beforeSubmit.apply(inline,arguments);
                          },
            success: function() {
                         return inline.success.apply(inline,arguments);
                     },
            error: function() {
                       return inline.error.apply(inline,arguments);
                   }
        });
    });

};

//  Great for simple debugging messages.
//
function debug() {
    if(window.console) {
        console.log(arguments);
    } else {
        var s = "";
        $.each(function(a) {
            s = s + a;
        });
        alert(s)
    }
};

//  Inline object constructor.
//  This class manages basic state interactions for loadInline
//
function Inline(opts,source,event) {
    if(opts.recursing) {
        this.opts = opts;
    } else {
        this.opts = $.extend({},opts);
        this.opts.recursing = true;
    }
    if(this.opts.target) {
        this.target = $(this.opts.target);
    } else {
        this.target = this.opts.create(source,event);
        this.opts.target = this.target;
    }
    this.setState("wait");
}

//  Conditionally pass on calls to setState()
//
Inline.prototype.setState = function(state) {
    this.opts.setState(state);
}

//  Display an error in the inline object.
//
Inline.prototype.error = function(req,status,err) {
    this.setState("error");
    this.target.html(req.responseText);
    this.opts.error(req,status,err);
    $(this.opts.linkSelector,this.target).loadInline(this.opts);
}

//  Show some loaded content in an inline object.
//
Inline.prototype.success = function(data) {
    this.setState("success");
    this.target.html(data);
    this.opts.success(data);
    var links = $(this.opts.linkSelector,this.target).loadInline(this.opts);
    if(links.length == 0) {
        this.opts.finish();
    }
}

//  Run beforeSuccess callback for form submission
//
Inline.prototype.beforeSubmit = function() {
    return this.opts.beforeSubmit();
}

//  Default options for loadInline.
//
//  We create a fresh div and display it like a popup.
//  When we run out of links, or when ESC is pressed, we close the popup.
//
$.fn.loadInline.defaults = {
  target: undefined,
  linkSelector: "a, form",
  success: function(){},
  error: function(){},
  template: $("<div class='load-inline-display' style='display: none'></div>"),
  create: function(source) {
              var target = $(this.template).clone().appendTo("body");
              var self = this;
              //  Handler for close events
              this.onCloseEvent = function(evt) {
                  if(evt.type == "keypress" && evt.keyCode == 27) {
                      self.close();
                  }
              };
              $(document).bind("keypress",this.onCloseEvent);
              //  Actual function to call when closing
              this.close = function() {
                  target.fadeOut("normal",function() {
                      target.remove();
                  });
                  $(document).unbind("keypress",this.onCloseEvent);
              };
              //  Position the popup over the element that was activated
              target.css("position","absolute");
              var pos = source.offset();
              target.css("top",pos.top).css("left",pos.left);
              target.fadeIn();
              return target;
          },
  finish: function() {
              var self = this;
              setTimeout(function() {
                  self.close();
              },700);
          },
  setState: function(state) {
                this.target.removeClass("error");
                this.target.removeClass("wait");
                this.target.removeClass("success");
                this.target.addClass(state);
            },
  beforeSubmit: function() { return true; }
};

})(jQuery);
