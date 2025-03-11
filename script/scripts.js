/*  <script>
        $('.work-wrapper').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: false,
            //autoplaySpeed: 3000,
            dots: false,
            infinite: true,
            adaptiveHeight: true,
            arrows: true
        });

        var video = $('.work-wrapper .slick-active').find('iframe').get(0).play();

        $('.work-wrapper ').on('afterChange', function (event, slick, currentSlide, nextSlide) {
            $('.work-wrapper .slick-slide').find('video').get(0).pause();
            var video = $('.work-wrapper .slick-active').find('video').get(0).play();
        });
    </script> */


// Get all <video> elements.


//document.addEventListener('DOMContentLoaded', function (event) {
// array with texts to type in typewriter
//var dataText = ["What if we could make every drop of water count?", "What if IKEA collab with LEGO?", "What if we treated poverty as a global emergency?", "What if AI became an integral part of education globally?", "What if we protected nature like our own life support system?", "What if we embraced a 'no one goes hungry' mindset globally?"];
var dataText = ["Imagine if we could make every drop of water count.", "Imagine an IKEA collaboration with LEGO.", "Imagine AI start imagining.", "Imagine if education aimed to nurture creativity over conformity.", "Imagine if we embraced a 'no one goes hungry' mindset globally."];

var currentTimeout;

function pauseAnimation() {
    clearTimeout(currentTimeout);
}

function resetAnimation() {
    pauseAnimation();
    document.querySelector(".whatif").innerHTML = ""; // Reset the text to an empty string or an initial value
    StartTextAnimation(0);
}

function typeWriter(text, i, fnCallback) {
    var newText = '';

    if (i < text.length) {
        newText = text.substring(0, i + 1) + '<span aria-hidden="true"></span>';

        currentTimeout = setTimeout(function () {
            document.querySelector(".whatif").innerHTML = newText;
            typeWriter(text, i + 1, fnCallback);
        }, 100);
    } else if (typeof fnCallback == 'function') {
        setTimeout(function () {
            document.querySelector(".whatif").innerHTML = newText; // Ensure the last character is displayed before the pause
            fnCallback();
        }, 2000);
    }
}

function StartTextAnimation(i) {
    if (typeof dataText[i] == 'undefined') {
        currentTimeout = setTimeout(function () {
            StartTextAnimation(0);
        }, 20000);
    }

    if (i < dataText.length) {
        typeWriter(dataText[i], 0, function () {
            setTimeout(function () {
                StartTextAnimation((i + 1) % dataText.length);
            }, 0); // Ensure a small delay before starting the next text
        });
    }
}

//});https://codepen.io/Danielgroen/pen/VeRPOq


TweenMax.staggerFrom(
    ".intro > div",
    0.8,
    {
        x: "-60",
        ease: Power3.easeInOut,
        opacity: "0",
    },
    2
);

TweenMax.staggerTo(
    ".intro > div",
    0.8,
    {
        x: "60",
        ease: Power3.easeInOut,
        delay: 1.2,
        opacity: "0",
    },
    2
);

anime.timeline().add({
    targets: ".intro_wrap",
    opacity: [1, 0],
    easing: "easeOutExpo",
    duration: 1000,
    delay: 6000,
    begin: function () {
        document.querySelector('.intro_wrap').style.display = 'none';
    },
})

anime.timeline().add({
    targets: "header",
    opacity: [0, 1],
    translateY: [80, 0],
    easing: "easeOutExpo",
    duration: 2000,
    delay: 6000
});

anime.timeline().add({
    targets: "main",
    opacity: [0, 1],
    easing: "easeOutExpo",
    duration: 2000,
    delay: 6000 + 300
});

var work;

const videos = document.querySelectorAll('video');

var bio_open = document.getElementsByClassName("bio-open");
var navpanel = document.getElementsByTagName("nav");
var closebutton = document.getElementById("closework");


// Pause all <video> elements except for the one that started playing.
function pauseOtherVideos({ target }) {
    for (const video of videos) {
        if (video !== target) {
            video.pause();
        }
    }
}

// Listen for the 'play' event on all the <video> elements.
for (const video of videos) {
    video.addEventListener('play', pauseOtherVideos);
}

var workwrapper = document.getElementById('workwrapper');
const triggers = document.querySelectorAll('a.filter-trigger');
const works = document.querySelectorAll('.work');
var all = document.querySelector('.reset')


function clearActive() {
    var activeLink = document.querySelector('.active');
    activeLink.classList.remove("active");
}

triggers.forEach(element => {
    element.addEventListener('click', function () {
        clearActive();
        element.classList.add('active');

        let filter = element.dataset.filter;
        console.log(filter);

        works.forEach(works => {
            if (!works.classList.contains(filter)) {
                works.classList.add('hide');
            } else {
                works.classList.remove('hide');
            }
        });

        if (filter === 'all') {
            works.forEach(works => {
                works.classList.remove('hide');
            })
        }

        if (filter === "whatif") {
            // start the text animation
            document.getElementById("whynot").style.display = "none";
            document.getElementById("whatif").style.display = "block";
            resetAnimation();
        }

        if (filter != "whatif") {
            document.getElementById("whynot").style.display = "block";
            document.getElementById("whatif").style.display = "none";
            pauseAnimation();
        }


        if (filter == "mixbag") {
            workwrapper.classList.add('masonry');
        } else {
            workwrapper.classList.remove('masonry');
        }
    })
});

works.forEach(works => {
    if (works.classList.contains('whatif')) {
        works.classList.remove('hide');
    } else {
        works.classList.add('hide');
    }
});

//document.getElementById("whynot").style.display = "block";
document.getElementById("whatif").style.display = "block";
setTimeout(function () { resetAnimation() }, 6000);




var t1 = new TimelineMax({ paused: true });

t1.to(".bio-container", 0.25, {
    borderWidth: 5,
    opacity: 1,
    ease: Expo.ease,
    zIndex: 0
});

t1.staggerFrom(
    ".bio-container p",
    0.25,
    {
        y: "10",
        ease: Power3.ease,
        opacity: "0",
    },
    0.05
);


t1.to(".work-wrapper", 0.25, {
    opacity: "0",
    display: "none",
}, 0.05);

t1.to(".proj-container", 0.25, {
    opacity: "0",
    display: "none",
}, 0.05);

t1.to(navpanel, 0.5, {
    opacity: "0",
    display: "none",
}, 0.05);

t1.to("header .title", 0.25, {
    color: "#dbdbdb",
}, 0.05);

t1.to("header .line", 0.25, {
    background: "#dbdbdb",
}, 0.05);

t1.reverse();

function fn_bio_open() {
    t1.reversed(!t1.reversed());
    if (bio_open[0].innerHTML === "Bio.") {
        bio_open[0].innerHTML = ".Back";
        //navpanel[0].style.opacity = 0;
    } else {
        bio_open[0].innerHTML = "Bio.";
        //navpanel[0].style.opacity = 1;
    }
}
bio_open[0].addEventListener('click', fn_bio_open, false);


var t2 = new TimelineMax({ paused: true });

t2.to(".proj-container", 0.25, {
    borderWidth: 5,
    opacity: 1,
    ease: Expo.ease,
    zIndex: 0
});

t2.staggerFrom(
    ".proj-container div",
    0.25,
    {
        y: "10",
        ease: Expo.ease,
        opacity: "0",
    },
    0.05
);

/*  t2.to("nav", 0.5, {
      opacity: "0",
      display: "none",
  }, 0.05);*/

t2.to(closebutton, 0.25, {
    opacity: "1",
    display: "block",
}, 0.05);

t2.to(".work-wrapper", 0.25, {
    opacity: "0",
    display: "none",
}, 0.05);

t2.to(".bio-container", 0.25, {
    opacity: "0",
    display: "none",
}, 0.05);

t2.to("header", 0.25, {
    opacity: "0",
    display: "none",
}, 0.05);

t2.to(navpanel, 0.25, {
    opacity: "0",
    display: "none",
}, 0.05);

t2.reverse();



const cards = document.querySelectorAll('.work');
cards.forEach(card => {
    card.addEventListener('click', function handleClick(event) {

        if (card.id) {
            work = card.id;
            document.querySelectorAll('.proj').forEach(function (el) {
                el.style.display = 'none';
                el.scrollTop = 0;
            });
            var theWork = document.getElementsByClassName(work);
            theWork[0].style.display = 'block';
            //var activework = callwork(work);
            t2.reversed(!t2.reversed());
            //document.getElementById("closework").style.display = "block";
        }
    });
});

var closework = document.getElementById('closework');

function fn_close_proj() {
    //var myCircle = document.querySelector('.horizontal-scroll');
    //myCircle.style.transform = `translate3d(0,0,0)`;
    t2.reversed(!t2.reversed());
    for (const video of videos) {
        video.pause();
        video.currentTime = 0;
    }
    //document.getElementById("closework").style.display = "none";
}
closework.addEventListener('click', fn_close_proj, false);

/*
// Listening to the video element
let clip = document.querySelector(".vid")

/* Adding the event listeners on the video to play/pause the video. *-/
clip.addEventListener("mouseover", function (e) {
    clip.playbackRate = 2.0;
    clip.play();
})

/* Applying the mouse out event to pause the video *-/
clip.addEventListener("mouseout", function (e) {
    clip.currentTime = 0;
    clip.pause();
})*/


/*var slideIndex = 0;
carousel();

function carousel() {
    var i;
    var x = document.getElementsByClassName("slides");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > x.length) { slideIndex = 1 }
    x[slideIndex - 1].style.display = "block";
    setTimeout(carousel, 2000); // Change image every 2 seconds
}
*/

var slideIndex = [1, 1, 1, 1];
var slideId = ["slides1", "slides2", "slides3", "slides4"]
showDivs(1, 0);
showDivs(1, 1);
showDivs(1, 2);
showDivs(1, 3);

function plusDivs(n, no) {
    showDivs(slideIndex[no] += n, no);
}

function showDivs(n, no) {
    var i;
    var x = document.getElementsByClassName(slideId[no]);
    if (n > x.length) { slideIndex[no] = 1 }
    if (n < 1) { slideIndex[no] = x.length }
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    x[slideIndex[no] - 1].style.display = "block";
}

const toggle = document.getElementById("toggle");
const content = document.querySelector(".contenttoggle");

toggle.addEventListener("click", function () {
    if (window.getComputedStyle(content).display === "none") {
        content.style.display = "inline-block";
    } else {
        content.style.display = "none";
    }
});
