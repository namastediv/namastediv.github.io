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

var work;

const videos = document.querySelectorAll('video');

var bio_open = document.getElementsByClassName("bio-open");
var navpanel = document.getElementsByTagName("nav");

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
    })
});

works.forEach(works => {
    if (works.classList.contains('campaigns')) {
        works.classList.remove('hide');
    } else {
        works.classList.add('hide');
    }
});



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

var slideIndex = [1, 1];
var slideId = ["slides1", "slides2"]
showDivs(1, 0);
showDivs(1, 1);

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