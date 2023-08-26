dragAndSave("#fig");
dragAndSave("#tri");
dragAndSave("#code");

// calculate the size of the boxes for the code and triangle.
var test = document.getElementsByClassName("test");
var wTri = test[0].clientWidth + 1 + "px";
var wCode = test[1].clientWidth + 1 + "px";
document.documentElement.style.setProperty("--wTri", wTri);
document.documentElement.style.setProperty("--wCode", wCode);
