// Placing scripts at the bottom of the <body> element improves the display speed, 
// because script interpretation slows down the display.

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
        $('.roundButton').css('color', 'red');
    } else {
        $(id).fadeIn();
        $('.roundButton').text('Hide Extras');
        $('.roundButton').css('color', 'black');
    }
}

// When the user scrolls down 20px from the top of the document, show the button
$(window).scroll (function() {
    if ($(window).scrollTop() > 20) {
        $('#topBtn').css('display', 'block');
    } else {
        $('#topBtn').css('display', 'none');
    }
});

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    $(window).scrollTop(0);
}
