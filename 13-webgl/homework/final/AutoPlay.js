/**
 *  @file
 *
 * Summary.
 * <p>Auto Play.</p>
 *
 * Description.
 * <p>
 * Controls whether the audio should autoplay when someone visits my site.
 * </p>
 * The window {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage local storage}
 * property is used to save whether the autoplay is disabled or not:
 * <table style="margin: 20px 70px">
 *  <tr>
 *    <th>Key</th>
 *    <th>Value</th>
 *  </tr>
 *  <tr>
 *    <td>"disableAP"</td>
 *    <td>"yes"</td>
 *  </tr>
 * </table>
 *
 * @author {@link https://krotalias.github.io Paulo Roma Cavalcanti}
 * @since 19/10/2021.
 * @license {@link https://www.gnu.org/licenses/lgpl-3.0.en.html LGPLv3}
 * @see <a href="/cwdc/13-webgl/homework/final/AutoPlay.js">source</a>
 * @see {@link https://jsfiddle.net/sanddune/oz0nhv2k/ "Disable Autoplay? tick me then" jsfiddle code}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/Video_player_styling_basics Video player styling basics}
 * @see {@link https://css-tricks.com/lets-create-a-custom-audio-player/ Custom Audio Player}
 * @see {@link https://codeconvey.com/customize-html5-audio-player-css/ Customize HTML5 Audio Player with CSS}
 * @see {@link https://support.mozilla.org/en-US/kb/block-autoplay Allow or block media autoplay in Firefox}
 */

const chkAutoPlay = document.getElementById("disableAutoplay");
const myAudio = document.getElementById("audio1");
const stat = document.getElementById("status");

const disableAutoplay = localStorage.getItem("disableAP");
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
