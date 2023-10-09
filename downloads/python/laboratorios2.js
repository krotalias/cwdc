// If we put the script inside the head tag, then it
// will be executed before the document is loaded, and thus it will not work.
// To fix this, you can either put the script tag after the element 
// you want to modify (topBtn), or at the bottom of the body tag.

"use strict";

$(function() {
  $(document).keydown(function(e) {
    switch (e.which) {
      case 27: // esc key
        alert($('.roundButton').text())
        $(".roundButton").trigger("click")
        break;
    }
  });
});

function toggleList(id) {
    // alert(JSON.stringify($(id).css("display")));
    if ($(id).css("display") != "none") {
        $(id).fadeOut();
        $('.roundButton').text('Show Extras');
        $('.roundButton').css('color','red');
    } else {
        $(id).fadeIn();
        $('.roundButton').text('Hide Extras');
        $('.roundButton').css('color','black');
    }
}

// Get the button
var mybutton = document.getElementById("topBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0;            // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
