const slides = document.querySelectorAll("#slider .slide");
let currentSlide = 0;
carousel()

function carousel() {
  slides[currentSlide].className = "slide";
  currentSlide = (currentSlide+1)%slides.length;
  slides[currentSlide].className = "slide showing";
  setTimeout(carousel, 5000);
}
