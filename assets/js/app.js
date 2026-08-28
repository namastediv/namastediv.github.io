(function ($) {
  "use strict";

  var state = {
    data: null,
    activeFilter: "imagine",
    visibleProjects: [],
    viewerIndex: 0,
    mediaIndex: 0,
    viewerAnimating: false,
    savedScrollTop: 0,
    lastTrigger: null,
    touchStart: null,
    wheelAccumulator: 0,
    wheelArmed: true,
    masonryColumns: 0
  };

  var $intro = $("#introScreen");
  var $imagineStage = $("#imagine");
  var $portfolio = $("#portfolio");
  var $footer = $(".site-footer");
  var $grid = $("#projectGrid");
  var $viewer = $("#projectViewer");
  var viewerElement = $viewer.get(0);
  var $viewerStage = $("#viewerStage");
  var $bioDialog = $("#bioDialog");
  var bioElement = $bioDialog.get(0);
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var viewerDuration = reducedMotion ? 30 : 520;
  var introTimer = null;
  var typeTimer = null;
  var resizeTimer = null;
  var wheelResetTimer = null;
  var defaultTitle = document.title;

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function syncDialogState() {
    var hasOpenDialog = Boolean(
      (viewerElement && viewerElement.open) || (bioElement && bioElement.open)
    );
    $("body").toggleClass("has-dialog", hasOpenDialog);
  }

  function dismissIntro() {
    if ($intro.hasClass("is-leaving")) {
      return;
    }

    window.clearTimeout(introTimer);
    $intro.addClass("is-leaving");
    window.setTimeout(function () {
      $intro.attr("hidden", true);
      if (state.data && state.activeFilter === "imagine") {
        startTypewriter();
      }
    }, reducedMotion ? 20 : 580);
  }

  function setupIntro() {
    if (reducedMotion) {
      dismissIntro();
      return;
    }

    introTimer = window.setTimeout(dismissIntro, 3450);
  }

  function stopTypewriter() {
    window.clearTimeout(typeTimer);
    typeTimer = null;
  }

  function startTypewriter() {
    stopTypewriter();

    var phrases = state.data.imagine || [];
    var $text = $("#imagineText");

    if (!phrases.length) {
      $text.text("Imagine ideas without a fixed edge.");
      return;
    }

    if (reducedMotion) {
      $text.text(phrases[0]);
      return;
    }

    var phraseIndex = 0;
    var characterIndex = 0;

    function clearPhrase() {
      if (state.activeFilter !== "imagine") {
        return;
      }

      $text.text("");
      characterIndex = 0;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeTimer = window.setTimeout(tick, 420);
    }

    function tick() {
      if (state.activeFilter !== "imagine") {
        return;
      }

      var phrase = phrases[phraseIndex];
      characterIndex += 1;
      $text.text(phrase.slice(0, characterIndex));

      if (characterIndex >= phrase.length) {
        typeTimer = window.setTimeout(clearPhrase, 1800);
        return;
      }

      typeTimer = window.setTimeout(tick, 70);
    }

    $text.text("");
    tick();
  }

  function createFallback(project, path) {
    return $("<span>", { class: "media-fallback" }).append(
      $("<span>").append(
        $("<strong>").text(project.title),
        $("<span>").text("Add asset: " + path)
      )
    );
  }

  function attachImageFallback($image, $container, project, path) {
    $image.one("error", function () {
      if ($container.find(".media-fallback").length) {
        return;
      }

      $(this).remove();
      $container.append(createFallback(project, path));
    });
  }

  function renderDisciplines() {
    var $list = $("#disciplineList").empty();

    $.each(state.data.site.disciplines || [], function (_, discipline) {
      $list.append($("<li>").text(discipline));
    });
  }

  function renderFilters() {
    var $list = $("#filterList").empty();

    $.each(state.data.navigation || [], function (_, filter) {
      $list.append(
        $("<button>", {
          class: "filter-button",
          type: "button",
          "data-filter": filter.id,
          "aria-pressed": filter.id === state.activeFilter ? "true" : "false"
        }).text(filter.label)
      );
    });
  }

  function renderBio() {
    var bio = state.data.bio;
    var $content = $("#bioContent").empty();
    var $copy = $("<section>", { class: "bio-copy" });
    var $links = $("<div>", { class: "bio-links" });
    var $roles = $("<section>", { class: "bio-roles" });

    $copy.append(
      $("<h2>", { class: "bio-copy__label", id: "bioHeading" }).text(bio.greeting),
      $("<p>", { class: "bio-copy__intro" }).text(bio.intro),
      $("<p>", { class: "bio-copy__summary" }).text(bio.summary)
    );

    if (bio.fullBio && bio.fullBio.url) {
      $links.append(
        $("<a>", {
          href: bio.fullBio.url,
          target: "_blank",
          rel: "noreferrer"
        }).text(bio.fullBio.label + " ↗")
      );
    }

    if (bio.linkedin) {
      $links.append(
        $("<a>", {
          href: bio.linkedin,
          target: "_blank",
          rel: "noreferrer"
        }).text("LinkedIn ↗")
      );
    }

    if (bio.phone) {
      $links.append(
        $("<button>", {
          type: "button",
          "data-action": "toggle-phone"
        }).text("Let's chat over chai?")
      );
      $links.append(
        $("<p>", { class: "bio-phone", id: "bioPhone", hidden: true }).text(
          "Call or WhatsApp " + bio.phone
        )
      );
    }

    $copy.append($links);
    $roles.append($("<h3>", { class: "bio-roles__label" }).text("Roles & Playgrounds"));

    $.each(bio.roles || [], function (_, item) {
      $roles.append(
        $("<div>", { class: "bio-role" }).append(
          $("<strong>").text(item.role + " · " + item.company),
          $("<span>").text(item.place + " // " + item.years)
        )
      );
    });

    $content.append($copy, $roles);
  }

  function getFilter(filterId) {
    return (state.data.navigation || []).find(function (filter) {
      return filter.id === filterId;
    });
  }

  function getMasonryColumnCount() {
    var width = window.innerWidth;

    if (width < 520) {
      return 1;
    }

    if (width < 800) {
      return 2;
    }

    if (width < 1160) {
      return 3;
    }

    if (width < 1600) {
      return 4;
    }

    return 5;
  }

  function createProjectCard(project, index) {
    var isArchive = project.category === "archive";
    var $card = $("<button>", {
      class: "project-card" + (isArchive ? " project-card--archive" : ""),
      type: "button",
      "data-project-id": project.id,
      "aria-label": "Open " + project.client + ": " + project.title
    });
    var $media = $("<span>", { class: "project-card__media" }).css(
      "--card-aspect",
      project.aspect || 1.5
    );
    var $image = $("<img>", {
      src: project.thumbnail,
      alt: project.client + " — " + project.title,
      loading: index < 6 ? "eager" : "lazy",
      decoding: "async"
    });

    attachImageFallback($image, $media, project, project.thumbnail);
    $media.append(
      $image,
      $("<span>", { class: "project-card__number", "aria-hidden": "true" }).text(
        pad(index + 1)
      ),
      $("<span>", { class: "project-card__caption" }).append(
        $("<strong>").text(project.client),
        $("<span>").text(project.title)
      )
    );

    $card.append(
      $media,
      $("<span>", { class: "project-card__meta" }).append(
        $("<strong>").text(project.client),
        $("<span>").text(project.title)
      )
    );

    return $card;
  }

  function renderMasonry(projects) {
    var columnCount = getMasonryColumnCount();
    var columns = [];
    var heights = [];

    state.masonryColumns = columnCount;
    $grid.addClass("project-grid--masonry").css("--masonry-columns", columnCount);

    for (var columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      var $column = $("<div>", {
        class: "masonry-column",
        "aria-label": "Archive column " + (columnIndex + 1)
      });
      columns.push($column);
      heights.push(0);
      $grid.append($column);
    }

    $.each(projects, function (index, project) {
      var shortestColumn = heights.indexOf(Math.min.apply(null, heights));
      columns[shortestColumn].append(createProjectCard(project, index));
      heights[shortestColumn] += 1 / (project.aspect || 1) + 0.06;
    });
  }

  function renderGrid() {
    var projects = (state.data.projects || []).filter(function (project) {
      return project.category === state.activeFilter;
    });

    state.visibleProjects = projects;
    $grid.empty().removeClass("project-grid--masonry").removeAttr("style");
    $("#visibleCount").text(pad(projects.length));
    $("#emptyState").prop("hidden", projects.length > 0);

    if (!projects.length) {
      return;
    }

    var filter = getFilter(state.activeFilter);

    if (filter && filter.layout === "masonry") {
      renderMasonry(projects);
      return;
    }

    $.each(projects, function (index, project) {
      $grid.append(createProjectCard(project, index));
    });
  }

  function updatePageTitle(filterId) {
    var filter = getFilter(filterId);

    document.title =
      filterId === "imagine" || !filter
        ? defaultTitle
        : filter.label + " — " + state.data.site.name;
  }

  function updateView(filterId) {
    var isImagine = filterId === "imagine";

    stopTypewriter();
    $("body").toggleClass("is-imagine", isImagine);
    $imagineStage.prop("hidden", !isImagine);
    $portfolio.prop("hidden", isImagine);
    $footer.prop("hidden", isImagine);
    updatePageTitle(filterId);

    if (isImagine) {
      state.visibleProjects = [];
      $grid.empty().removeClass("project-grid--masonry").removeAttr("style");
      if ($intro.prop("hidden")) {
        startTypewriter();
      } else {
        $("#imagineText").text("");
      }
    }
  }

  function setFilter(filterId, shouldScroll) {
    if (!getFilter(filterId)) {
      return;
    }

    state.activeFilter = filterId;
    $(".filter-button").attr("aria-pressed", "false");
    $('.filter-button[data-filter="' + filterId + '"]').attr("aria-pressed", "true");
    updateView(filterId);

    if (filterId !== "imagine") {
      renderGrid();
    }

    if (shouldScroll) {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth"
      });
    }
  }

  function createViewerMedia(project, media) {
    var $wrapper = $("<div>", {
      class:
        "viewer-media" + (media && media.orientation === "portrait" ? " viewer-media--portrait" : "")
    });

    if (!media || !media.src) {
      $wrapper.append(createFallback(project, "No media path supplied"));
      return $wrapper;
    }

    if (media.type === "video") {
      var $video = $("<video>", {
        controls: true,
        playsinline: true,
        preload: "metadata"
      });
      var $source = $("<source>", {
        src: media.src,
        type: "video/mp4"
      });

      $source.one("error", function () {
        if (!$wrapper.find(".media-fallback").length) {
          $video.remove();
          $wrapper.append(createFallback(project, media.src));
        }
      });
      $video.append($source);
      $wrapper.append($video);
      return $wrapper;
    }

    var $image = $("<img>", {
      src: media.src,
      alt: project.client + " — " + project.title,
      decoding: "async"
    });
    attachImageFallback($image, $wrapper, project, media.src);
    $wrapper.append($image);
    return $wrapper;
  }

  function createViewerPanel(project, mediaIndex) {
    var media = (project.media || [])[mediaIndex];
    return $("<article>", {
      class: "viewer-panel",
      "data-viewer-project": project.id,
      "aria-hidden": "true"
    }).append(createViewerMedia(project, media));
  }

  function pauseViewerVideos() {
    $viewer.find("video").each(function () {
      this.pause();
    });
  }

  function updateMediaControls(project) {
    var total = (project.media || []).length;
    $("#mediaControls").prop("hidden", total <= 1);
    $("#mediaCurrent").text(pad(state.mediaIndex + 1));
    $("#mediaTotal").text(pad(Math.max(1, total)));
  }

  function updateViewerChrome(project) {
    var meta = [project.client, project.agency].filter(Boolean).join(" · ");
    var total = state.visibleProjects.length;
    var $external = $("#viewerExternal");

    $("#viewerTitle").text(project.title);
    $("#viewerMeta").text(meta);
    $("#viewerHeadline").text(project.headline || project.title);
    $("#viewerDescription").text(
      project.credit || "Selected exploration from the archive."
    );
    $("#projectCurrent").text(pad(state.viewerIndex + 1));
    $("#projectTotal").text(pad(total));
    $("#projectProgress").css(
      "width",
      total ? ((state.viewerIndex + 1) / total) * 100 + "%" : "0%"
    );

    if (project.external && project.external.url) {
      $external
        .attr("href", project.external.url)
        .text(project.external.label + " ↗")
        .prop("hidden", false);
    } else {
      $external.prop("hidden", true).removeAttr("href");
    }

    updateMediaControls(project);
    document.title = project.client + " · " + project.title + " — Divyesh Bhandari";
  }

  function currentProject() {
    return state.visibleProjects[state.viewerIndex];
  }

  function openProject(projectId, trigger) {
    var index = state.visibleProjects.findIndex(function (project) {
      return project.id === projectId;
    });

    if (index < 0 || !viewerElement || typeof viewerElement.showModal !== "function") {
      return;
    }

    state.viewerIndex = index;
    state.mediaIndex = 0;
    state.savedScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    state.lastTrigger = trigger || null;
    $viewerStage.empty();

    var project = currentProject();
    var $panel = createViewerPanel(project, state.mediaIndex)
      .addClass("is-active")
      .attr("aria-hidden", "false");
    $viewerStage.append($panel);
    updateViewerChrome(project);
    viewerElement.showModal();
    syncDialogState();
    $viewerStage.trigger("focus");
  }

  function navigateProject(direction) {
    if (state.viewerAnimating || !viewerElement.open || state.visibleProjects.length < 2) {
      return;
    }

    state.viewerAnimating = true;
    pauseViewerVideos();

    var nextIndex =
      (state.viewerIndex + direction + state.visibleProjects.length) %
      state.visibleProjects.length;
    var nextProject = state.visibleProjects[nextIndex];
    var $current = $viewerStage.find(".viewer-panel.is-active");
    var $next = createViewerPanel(nextProject, 0);
    var startClass = direction > 0 ? "is-after" : "is-before";
    var exitClass = direction > 0 ? "is-before" : "is-after";

    $next.addClass(startClass + " is-positioning");
    $viewerStage.append($next);
    void $next.get(0).offsetHeight;
    $next.removeClass("is-positioning");

    state.viewerIndex = nextIndex;
    state.mediaIndex = 0;
    updateViewerChrome(nextProject);

    window.requestAnimationFrame(function () {
      $current.removeClass("is-active").addClass(exitClass).attr("aria-hidden", "true");
      $next.removeClass(startClass).addClass("is-active").attr("aria-hidden", "false");
    });

    window.setTimeout(function () {
      $current.remove();
      state.viewerAnimating = false;
    }, viewerDuration);
  }

  function navigateMedia(direction) {
    var project = currentProject();
    var media = project ? project.media || [] : [];

    if (!project || media.length < 2 || state.viewerAnimating) {
      return;
    }

    state.mediaIndex = (state.mediaIndex + direction + media.length) % media.length;
    pauseViewerVideos();

    var $activePanel = $viewerStage.find(".viewer-panel.is-active");
    $activePanel.empty().append(createViewerMedia(project, media[state.mediaIndex]));
    updateMediaControls(project);
  }

  function closeProject() {
    if (viewerElement && viewerElement.open) {
      viewerElement.close();
    }
  }

  function afterProjectClose() {
    pauseViewerVideos();
    $viewerStage.empty();
    updatePageTitle(state.activeFilter);
    window.scrollTo(0, state.savedScrollTop);
    syncDialogState();

    if (state.lastTrigger && typeof state.lastTrigger.focus === "function") {
      state.lastTrigger.focus({ preventScroll: true });
    }
  }

  function openBio() {
    if (bioElement && typeof bioElement.showModal === "function") {
      bioElement.showModal();
      syncDialogState();
    }
  }

  function closeBio() {
    if (bioElement && bioElement.open) {
      bioElement.close();
    }
  }

  function handleWheel(event) {
    if (!viewerElement.open) {
      return;
    }

    event.preventDefault();
    window.clearTimeout(wheelResetTimer);
    wheelResetTimer = window.setTimeout(function () {
      state.wheelAccumulator = 0;
      state.wheelArmed = true;
    }, 170);

    if (!state.wheelArmed || state.viewerAnimating) {
      return;
    }

    state.wheelAccumulator += event.originalEvent.deltaY;

    if (Math.abs(state.wheelAccumulator) >= 34) {
      state.wheelArmed = false;
      navigateProject(state.wheelAccumulator > 0 ? 1 : -1);
      state.wheelAccumulator = 0;
    }
  }

  function handleTouchStart(event) {
    var touch = event.originalEvent.touches[0];
    state.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }

  function handleTouchEnd(event) {
    if (!state.touchStart || state.viewerAnimating) {
      state.touchStart = null;
      return;
    }

    var touch = event.originalEvent.changedTouches[0];
    var deltaX = touch.clientX - state.touchStart.x;
    var deltaY = touch.clientY - state.touchStart.y;
    var elapsed = Date.now() - state.touchStart.time;

    if (elapsed < 750 && Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 50) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        navigateMedia(deltaX < 0 ? 1 : -1);
      } else {
        navigateProject(deltaY < 0 ? 1 : -1);
      }
    }

    state.touchStart = null;
  }

  function handleKeydown(event) {
    if (!$intro.prop("hidden")) {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        dismissIntro();
      }
      return;
    }

    if (!viewerElement.open) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeProject();
    } else if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      navigateProject(1);
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      navigateProject(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      navigateMedia(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigateMedia(-1);
    }
  }

  function bindEvents() {
    $(document).on("click", "[data-action]", function (event) {
      var action = $(this).attr("data-action");

      if (action === "skip-intro") {
        dismissIntro();
      } else if (action === "show-imagine") {
        event.preventDefault();
        setFilter("imagine", true);
      } else if (action === "open-bio") {
        openBio();
      } else if (action === "close-bio") {
        closeBio();
      } else if (action === "toggle-phone") {
        event.preventDefault();
        $("#bioPhone").prop("hidden", !$("#bioPhone").prop("hidden"));
      } else if (action === "close-project") {
        closeProject();
      } else if (action === "previous-project") {
        navigateProject(-1);
      } else if (action === "next-project") {
        navigateProject(1);
      } else if (action === "previous-media") {
        navigateMedia(-1);
      } else if (action === "next-media") {
        navigateMedia(1);
      }
    });

    $(document).on("click", ".filter-button", function () {
      setFilter($(this).attr("data-filter"), true);
    });

    $(document).on("click", ".project-card", function () {
      openProject($(this).attr("data-project-id"), this);
    });

    $viewer.on("wheel", handleWheel);
    $viewer.on("touchstart", handleTouchStart);
    $viewer.on("touchmove", function (event) {
      event.preventDefault();
    });
    $viewer.on("touchend", handleTouchEnd);
    $viewer.on("cancel", function (event) {
      event.preventDefault();
      closeProject();
    });
    $viewer.on("close", afterProjectClose);

    $bioDialog.on("close", syncDialogState);
    $(document).on("keydown", handleKeydown);

    $(window).on("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        if (
          state.activeFilter === "archive" &&
          getMasonryColumnCount() !== state.masonryColumns
        ) {
          renderGrid();
        }
      }, 150);
    });
  }

  function initialise(data) {
    state.data = data;
    defaultTitle = data.site.name + " · " + data.site.title;
    document.title = defaultTitle;
    document.documentElement.style.setProperty("--accent", data.site.accent || "#00ffff");
    renderDisciplines();
    renderFilters();
    renderBio();
    setFilter("imagine", false);
  }

  setupIntro();
  bindEvents();

  $.getJSON("data/portfolio.json")
    .done(initialise)
    .fail(function () {
      $("body").removeClass("is-imagine");
      $imagineStage.prop("hidden", true);
      $portfolio.prop("hidden", false);
      $("#loadError").prop("hidden", false);
      $("#emptyState").prop("hidden", true);
      $("#visibleCount").text("00");
    });
})(jQuery);
