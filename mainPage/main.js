/**
 * GOOGLE SEARCH
 * Enter domain of site to search.
 *
 * @see https://alt-web.com/TUTORIALS/?id=add_google_to_bootstrap_search_bar
 */
var domainroot = "https://krotalias.github.io";
function Gsitesearch(curobj) {
  curobj.q.value = "site:" + domainroot + " " + curobj.qfront.value;
}

/**
 * <p>Show/Hide footer.</p>
 * Use localStorage to remember the choice.
 */
function togglePlanes() {
  let style = getComputedStyle(document.body);
  let dsp = style.getPropertyValue("--airplane-image");
  dsp = dsp == "block" ? "none" : "block";
  document.documentElement.style.setProperty("--airplane-image", dsp);
  localStorage.setItem("planes", dsp);
}

const dsp = localStorage.getItem("planes") || "none";
document.documentElement.style.setProperty("--airplane-image", dsp);

/**
 * Include HTML snippets in HTML.
 *
 * @see https://www.w3schools.com/howto/howto_html_include.asp
 */
function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /* search for elements with a certain atrribute: */
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) {
            elmnt.innerHTML = this.responseText;
          }
          if (this.status == 404) {
            elmnt.innerHTML = "Page not found.";
          }
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      };
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
}
