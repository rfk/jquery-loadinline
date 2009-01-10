//
//  jQuery.loadInline.js:  have links and forms load content inline via ajax
//
//  This jQuery plugin causes links to display their contents within an
//  element on the current page, using a simple AJAX request.  Similarly,
//  it modifies forms to submit themselves via ajax and display the resulting
//  content inline in the current page.
//
//  The real trick is that any links or forms within the returned content
//  are automatically decorated to load their content inline as well.
//  The overall effect is like a little mini browser window contained inline
//  in the current page.
//

(function($) {

$.fn.loadInline = function(options) {
    var opts = $.extend({},$.fn.loadInline.defaults,options);
    return this.each(function() {
        var $this = $(this);
        var inline = null;
        //  Capture link click events and send them into the popup
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
        //  Capture form submissions and send them into the popup via ajax
        $this.filter("form").ajaxForm({
            beforeSubmit: function() {
                              inline = new Inline(opts,$this);
                              return true;
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
//  This object manages basic state interactions for the loadInline instance.
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

Inline.prototype.setState = function(state) {
    if(this.opts.setState) {
        this.opts.setState(state);
    }
}

//  Display an error in the inline object.
//
Inline.prototype.error = function(req,status,err) {
    if(status) {
        this.target.html(status);
    } else if(err) {
        this.target.html(err);
    }
    this.setState("error");
    if(this.opts.error) {
        this.opts.error(req,status,err);
    }
}

//  Show some loaded content in an inline object.
//
Inline.prototype.success = function(data) {
    this.setState("success");
    this.target.html(data);
    if(this.opts.success) {
        this.opts.success(data);
    }
    var links = $("a, form",this.target).loadInline(this.opts);
    if(links.length == 0) {
        this.opts.finish();
    }
}

//  Default options.
//
//  We create a fresh div and display it like a popup.
//  When we run out of links, or when ESC is pressed, we close
//  the popup.

$.fn.loadInline.defaults = {
    target: undefined,
    success: undefined,
    error: undefined,
    create: function(source) {
                var target = $(this.template).clone().appendTo("body");
                var self = this;
                this.onCloseEvent = function(evt) {
                    if(evt.type == "keypress" && evt.keyCode == 27) {
                        self.close();
                    }
                };
                this.close = function() {
                    target.fadeOut("normal",function() {
                        target.remove();
                    });
                    $(document).unbind("keypress",this.onCloseEvent);
                };
                $(document).bind("keypress",this.onCloseEvent);
                target.css("position","absolute");
                var pos = source.position();
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
              }
};

//  Create a default template for the popup on page load
//
$(function() {
  $.fn.loadInline.defaults.template = $(document.createElement("div"))
  $.fn.loadInline.defaults.template.appendTo("body").hide();
  $.fn.loadInline.defaults.template.addClass("load-inline-display");
});

})(jQuery);
