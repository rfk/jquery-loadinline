
Status: Unmaintained
====================


[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)

I am [no longer actively maintaining this project](https://rfk.id.au/blog/entry/archiving-open-source-projects/).



jquery.loadInline: have links and forms load content inline via ajax
====================================================================


This jQuery plugin causes links to display their contents within an
element on the current page, using a simple AJAX request.  Similarly,
it modifies forms to submit themselves via ajax and display the resulting
content inline in the current page (using the fantastic jquery.form
plugin for all the heavy lifting).


The interesting part is that any links or forms within the returned content
are automatically decorated to load their content into the same inline
element. The overall effect is like a little mini browser window contained 
inline in the current page.

Use it like so:

    $("a.load-inline").loadInline();

An options object may be given as the only argument to loadInline(), to
specify any of the following properties:


    target:  selector for the inline element into which contents
             will be loaded.

    create:  function that will be called if no target is specified;
             it must find/create and the inline element to be used
             and then return it.

    template:  HTML node that will be cloned by the default 'create'
               function to produce the inline element.

    success:  callback executed whenever content is successfully loaded

    error:  callback executed whenever content loading gives an error

    setState:  callback executed whenever the state of the inline element
               changes.  The state name is given as the only argument,
               and can be one of 'wait', 'success' or 'error'.

    finish:  callback executed when content is successfully loaded but
             contains no further links or forms; basically indicates that
             no further navigation can be performed within the element.


The default behavior is to create a fresh <div> for each loadInline() element
and display it as a pop-up.  When no further navigation is possible, or when
ESC is pressed, the pop-up is automatically closed.


