// python runs on the server, and javascript on the browser
$.ajax({
  type: "GET",
  url: "./readFile.py",
  data: "./pascal3.py",
  success: function (response) {
    let f = response;
    document.getElementById("code").textContent = `${f}`;
  },
}).fail(function () {
  console.log("Could not get data");
});
