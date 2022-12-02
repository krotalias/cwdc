function toggleList(id) {
  // alert(JSON.stringify($(id).css("display")));
  if ($(id).css("display") != "none") {
    $(id).fadeOut();
  } else {
    $(id).fadeIn();
  }
}

function dragAndSave(id) {
  // mobile devices have trouble to drag.
  if (screen.width <= 800) return;

  // get positions in localStorage
  var positions = JSON.parse(localStorage.positions || "{}");

  if (positions[id]) $(id).css(positions[id]);

  // save the position of the draggable element into localStorage
  $(id).draggable({
    scroll: true, // If set to true, container auto-scrolls while dragging.
    // Triggered when dragging stops.
    stop: function (event, ui) {
      let positions = JSON.parse(localStorage.positions || "{}");
      positions[id] = ui.position; // { top, left } object.
      localStorage.positions = JSON.stringify(positions);
    },
  });

  // reset localStorage
  window.onkeydown = function (event) {
    if (event.key === "Escape" || event.key === "e") {
      if (event.metaKey || event.ctrlKey) {
        localStorage.clear();
        alert("Local storage has been cleared");
      }
    } else if (event.key == "b") {
      window.location.href = "/cwdc";
    } else if (event.key == "B") {
      let path = window.location.pathname;
      window.location.href = path.split("/", 3).join("/");
    }
  };
}
