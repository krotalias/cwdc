/**
 * @file
 *
 * Summary.
 * <p>Your First {@link https://blog.webdevsimplified.com/2022-01/intersection-observer/ Intersection Observer}.</p>
 *
 * @author {@link https://javascriptsimplified.com Kyle Cook}
 * @author Paulo Roma
 * @since 08/01/2024
 *
 * @see <a href="/cwdc/3-javascript/observer/obs.js">source</a>
 * @see <a href="/cwdc/3-javascript/observer/style.css">css</a>
 * @see <a href="/cwdc/3-javascript/showCode.php?f=observer/obs">html</a>
 * @see <a href="/cwdc/3-javascript/observer/obs.html">link</a>
 * @see https://youtu.be/2IbRtjez6ag
 * @see https://www.smashingmagazine.com/2021/07/dynamic-header-intersection-observer/
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/root
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/thresholds
 * @see <iframe width="600" height="512" src="/cwdc/3-javascript/observer/obs.html"></iframe>
 * @see <img src="../1-dynamic-header-intersection-observer.png" width="512">
 */

/**
 * A {@link https://developer.mozilla.org/en-US/docs/Web/API/NodeList NodeList},
 * that is, an array with all
 * document's elements of class ".card"
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
 */
const cards = document.querySelectorAll(".card");

/**
 * <p>The scroller
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/root root} element.</p>
 *
 * <p>Identifies the Element or Document whose bounds are treated as the
 * bounding box of the viewport for the element which is the observer's target.</p>
 *
 * If the root is null, then the bounds of the actual document viewport are used.
 */
const scrollRoot = document.querySelector(".scroller");

/**
 * An intersection observer object that shows/hides a card, by applying an animation:
 * <ul>
 *  <li> card changes from invisible to visible (opacity 0 → 1) </li>
 *  <li> card moves from left to right (translation 100 → 0) </li>
 * </ul>
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("show", entry.isIntersecting);
      // if (entry.isIntersecting) observer.unobserve(entry.target);
    });
  },
  {
    root: scrollRoot,
    threshold: 1,
    rootMargin: "0px 0px -15% 0px",
  },
);

observer.root.style.border = "2px solid #44aa44";

/**
 * <p>An observer object to track the last card.</p>
 * If the last card is outside the viewport, does nothing.
 * Otherwise, creates 10 new cards, and updates the last card
 * to be the last card created.
 *
 * <p>This way, the deck of cards is infinite, because
 * there will be an endless number of cards appearing from
 * the bottom of the viewport.</p>
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 */
const lastCardObserver = new IntersectionObserver(
  (entries) => {
    lastCard = entries[0];
    if (!lastCard.isIntersecting) return;
    loadNewCards();
    lastCardObserver.unobserve(lastCard.target);
    lastCardObserver.observe(document.querySelector(".card:last-child"));
  },
  { root: scrollRoot, threshold: 0, rootMargin: "100px" },
);

lastCardObserver.observe(document.querySelector(".card:last-child"));

cards.forEach((card) => {
  observer.observe(card);
});

/**
 * <p>The deck of cards.</p>
 * It is the first (and only) element within the document that is of class ".card-container"
 * (matches the specified
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector selector}).
 */
const cardContainer = document.querySelector(".card-container");
let ncard = 1;

/**
 * <p>Appends 10 new &lt;div&gt;, each one containing a new card,
 * to the {@link cardContainer}.</p>
 *
 * The 10 new cards are observed by the {@link observer}.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 */
function loadNewCards() {
  for (let i = 0; i < 10; ++i) {
    const card = document.createElement("div");
    card.textContent = `New Card ${ncard}`;
    card.classList.add("card");
    observer.observe(card);
    cardContainer.append(card);
    ncard++;
  }
}
