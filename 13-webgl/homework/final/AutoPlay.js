/**
 *  @file
 *
 *  Summary.
 *  <p>Auto Play.</p>
 *
 *  Description.
 *  <p>
 *  Controls whether the audio should autoplay when someone visits my site.
 *  </p>
 *
 *  @author: Paulo Roma Cavalcanti on 19/10/2021.
 *  @license LGPL.
 *  @see https://jsfiddle.net/sanddune/oz0nhv2k/
 *  @see https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/Video_player_styling_basics
 *  @see https://css-tricks.com/lets-create-a-custom-audio-player/
 *  @see https://codeconvey.com/customize-html5-audio-player-css/
 *  @see https://support.mozilla.org/en-US/kb/block-autoplay
 */

var chkAutoPlay = document.getElementById("disableAutoplay");
var myAudio = document.getElementById("audio1");
var stat = document.getElementById("status");

var disableAutoplay = localStorage.getItem("disableAP");
stat.innerHTML = "Autoplay disabled? : " + disableAutoplay;

if (disableAutoplay === "no") {
  localStorage.setItem("disableAP", "no");
  stat.innerHTML = "Autoplay disabled? : no";
  chkAutoPlay.checked = false;
  //myAudio.autoplay = true;
  //myAudio.load(); //reload audio
  //myAudio.muted = true;
} else if (disableAutoplay === "yes" || !disableAutoplay) {
  //default is yes
  stat.innerHTML = "Autoplay disabled? : yes";
  chkAutoPlay.checked = true;
  //myAudio.autoplay = false;
  //myAudio.load(); //reload audio
}

/**
 * Save checked status in local storage.
 */
function check() {
  if (this.checked) {
    stat.innerHTML = "Autoplay disabled? : yes";
    localStorage.setItem("disableAP", "yes");
  } else {
    stat.innerHTML = "Autoplay disabled? : no";
    localStorage.setItem("disableAP", "no");
  }
  window.location.reload();
}

document.getElementById("disableAutoplay").onchange = check;
