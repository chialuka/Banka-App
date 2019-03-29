const slides = document.querySelectorAll(".slider .slide");
let currentSlide = 0;
const menuItems = document.querySelector(".menu-items");
carousel()

function carousel() {
  slides[currentSlide].className = "slide";
  currentSlide = (currentSlide+1)%slides.length;
  slides[currentSlide].className = "slide showing";
  setTimeout(carousel, 3000);
}

function menuFunction(menu) {
  menu.classList.toggle("change");
  menuItems.style.display = menuItems.style.display === "" || menuItems.style.display === "none" ? "block" : "none";
}