
/* WOLFGARTEN OEFFENTLICHE RAUMNAMEN */
const wolfPublicRoomNames = {
  "0-1stockgangreligionsraum": "Gang im 1. Stock",
  "1-2stockgang": "Gang im 2. Stock",
  "2-2stockgangsprachenraum": "Gang bei den Sprachenräumen",
  "3-3stockgang": "Gang im 3. Stock",
  "4-arztzimmer": "Arztzimmer",
  "5-aufenthaltsraum": "Aufenthaltsraum",
  "6-aufgangauen": "Aufgang zum Außenbereich",
  "7-aueneingang": "Außeneingang",
  "8-bibliothek": "Bibliothek",
  "9-bibliothek2": "Bibliothek",
  "10-buffet": "Buffet",
  "11-chemiesaal": "Chemiesaal",
  "12-erdgeschoss_gangedv": "Gang im Erdgeschoss",
  "13-gangdirektion": "Gang zur Direktion",
  "14-gangkeller": "Gang im Untergeschoss",
  "15-gangkuche": "Gang zur Küche",
  "16-gangphysik": "Gang zum Physiksaal",
  "17-gangzeichmusiksaal": "Gang zu Musik und Zeichnen",
  "18-haupteingang": "Haupteingang",
  "19-ikt": "IKT-Raum",
  "20-lernwaben1": "Lernwaben",
  "21-mausoleum": "Mausoleum",
  "22-musiksaal": "Musiksaal",
  "23-outdoorklasse": "Outdoor-Klasse",
  "24-physiksaal1": "Physiksaal",
  "25-religionsraum1": "Religionsraum",
  "26-sekretariat1": "Sekretariat",
  "27-speisesaal1": "Speisesaal",
  "28-sportplatz": "Sportplatz",
  "29-sprachenraum": "Sprachenraum",
  "30-tischfussball": "Tischfußball",
  "31-tischtennis": "Tischtennis",
  "32-turnsaal": "Turnsaal",
  "33-werksaal": "Werksaal",
  "34-zeichensaal": "Zeichensaal",
  "35-1stocksitzeckeneu": "Sitzecke im 1. Stock",
  "36-direktionneu": "Direktion"
};

if (typeof APP_DATA !== 'undefined' && Array.isArray(APP_DATA.scenes)) {
  APP_DATA.scenes.forEach(function(scene) {
    if (Object.prototype.hasOwnProperty.call(wolfPublicRoomNames, scene.id)) {
      scene.name = wolfPublicRoomNames[scene.id];
    }
  });
}

/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

(function() {
  var Marzipano = window.Marzipano;
  var bowser = window.bowser;
  var screenfull = window.screenfull;
  var data = window.APP_DATA;

  // Grab elements from DOM.
  var panoElement = document.querySelector('#pano');
  var sceneNameElement = document.querySelector('#titleBar .sceneName');
  var sceneListElement = document.querySelector('#sceneList');
  var sceneElements = document.querySelectorAll('#sceneList .scene');
  var sceneListToggleElement = document.querySelector('#sceneListToggle');
  var autorotateToggleElement = document.querySelector('#autorotateToggle');
  var fullscreenToggleElement = document.querySelector('#fullscreenToggle');

  // Detect desktop or mobile mode.
  if (window.matchMedia) {
    var setMode = function() {
      if (mql.matches) {
        document.body.classList.remove('desktop');
        document.body.classList.add('mobile');
      } else {
        document.body.classList.remove('mobile');
        document.body.classList.add('desktop');
      }
    };
    var mql = matchMedia("(max-width: 500px), (max-height: 500px)");
    setMode();
    mql.addListener(setMode);
  } else {
    document.body.classList.add('desktop');
  }

  // Detect whether we are on a touch device.
  document.body.classList.add('no-touch');
  window.addEventListener('touchstart', function() {
    document.body.classList.remove('no-touch');
    document.body.classList.add('touch');
  });

  // Use tooltip fallback mode on IE < 11.
  if (bowser.msie && parseFloat(bowser.version) < 11) {
    document.body.classList.add('tooltip-fallback');
  }

  // Viewer options.
  var viewerOpts = {
    controls: {
      mouseViewMode: data.settings.mouseViewMode
    }
  };

  // Initialize viewer.
  var viewer = new Marzipano.Viewer(panoElement, viewerOpts);

  // Create scenes.
  var scenes = data.scenes.map(function(data) {
    var urlPrefix = "tiles";
    var source = Marzipano.ImageUrlSource.fromString(
      urlPrefix + "/" + data.id + "/{z}/{f}/{y}/{x}.jpg",
      { cubeMapPreviewUrl: urlPrefix + "/" + data.id + "/preview.jpg" });
    var geometry = new Marzipano.CubeGeometry(data.levels);

    var limiter = Marzipano.RectilinearView.limit.traditional(data.faceSize, 100*Math.PI/180, 120*Math.PI/180);
    var view = new Marzipano.RectilinearView(data.initialViewParameters, limiter);

    var scene = viewer.createScene({
      source: source,
      geometry: geometry,
      view: view,
      pinFirstLevel: true
    });

    // Create link hotspots.
    data.linkHotspots.forEach(function(hotspot) {
      var element = createLinkHotspotElement(hotspot);
      scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
    });

    // Create info hotspots.
    data.infoHotspots.forEach(function(hotspot) {
      var element = createInfoHotspotElement(hotspot);
      scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
    });

    return {
      data: data,
      scene: scene,
      view: view
    };
  });

  // Set up autorotate, if enabled.
  var autorotate = Marzipano.autorotate({
    yawSpeed: 0.03,
    targetPitch: 0,
    targetFov: Math.PI/2
  });
  if (false) { // Wolfgarten: Autorotation dauerhaft deaktiviert
    autorotateToggleElement.classList.add('enabled');
  }

  // Set handler for autorotate toggle.
  autorotateToggleElement.style.display = 'none';

  // Set up fullscreen mode, if supported.
  if (screenfull.enabled && data.settings.fullscreenButton) {
    document.body.classList.add('fullscreen-enabled');
    fullscreenToggleElement.addEventListener('click', function() {
      screenfull.toggle();
    });
    screenfull.on('change', function() {
      if (screenfull.isFullscreen) {
        fullscreenToggleElement.classList.add('enabled');
      } else {
        fullscreenToggleElement.classList.remove('enabled');
      }
    });
  } else {
    document.body.classList.add('fullscreen-disabled');
  }

  // Set handler for scene list toggle.
  sceneListToggleElement.addEventListener('click', toggleSceneList);

  // Start with the scene list open on desktop.
  if (!document.body.classList.contains('mobile')) {
    showSceneList();
  }

  // Set handler for scene switch.
  scenes.forEach(function(scene) {
    var el = document.querySelector('#sceneList .scene[data-id="' + scene.data.id + '"]');
    if (!el) {
      console.warn('Raum fehlt in der Raumliste:', scene.data.id);
      return;
    }
    el.addEventListener('click', function() {
      switchScene(scene);
      // On mobile, hide scene list after selecting a scene.
      if (document.body.classList.contains('mobile')) {
        hideSceneList();
      }
    });
  });

  // DOM elements for view controls.
  var viewUpElement = document.querySelector('#viewUp');
  var viewDownElement = document.querySelector('#viewDown');
  var viewLeftElement = document.querySelector('#viewLeft');
  var viewRightElement = document.querySelector('#viewRight');
  var viewInElement = document.querySelector('#viewIn');
  var viewOutElement = document.querySelector('#viewOut');

  // Dynamic parameters for controls.
  var velocity = 0.7;
  var friction = 3;

  // Associate view controls with elements.
  var controls = viewer.controls();
  controls.registerMethod('upElement',    new Marzipano.ElementPressControlMethod(viewUpElement,     'y', -velocity, friction), true);
  controls.registerMethod('downElement',  new Marzipano.ElementPressControlMethod(viewDownElement,   'y',  velocity, friction), true);
  controls.registerMethod('leftElement',  new Marzipano.ElementPressControlMethod(viewLeftElement,   'x', -velocity, friction), true);
  controls.registerMethod('rightElement', new Marzipano.ElementPressControlMethod(viewRightElement,  'x',  velocity, friction), true);
  controls.registerMethod('inElement',    new Marzipano.ElementPressControlMethod(viewInElement,  'zoom', -velocity, friction), true);
  controls.registerMethod('outElement',   new Marzipano.ElementPressControlMethod(viewOutElement, 'zoom',  velocity, friction), true);

  function sanitize(s) {
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
  }

  function switchScene(scene) {
    stopAutorotate();
    scene.view.setParameters(scene.data.initialViewParameters);
    scene.scene.switchTo();
    viewer.stopMovement();
    viewer.setIdleMovement(Infinity);
    updateSceneName(scene);
    updateSceneList(scene);
  }

  function updateSceneName(scene) {
    sceneNameElement.innerHTML = sanitize(scene.data.name);
  }

  function updateSceneList(scene) {
    for (var i = 0; i < sceneElements.length; i++) {
      var el = sceneElements[i];
      if (el.getAttribute('data-id') === scene.data.id) {
        el.classList.add('current');
      } else {
        el.classList.remove('current');
      }
    }
  }

  function showSceneList() {
    sceneListElement.classList.add('enabled');
    sceneListToggleElement.classList.add('enabled');
  }

  function hideSceneList() {
    sceneListElement.classList.remove('enabled');
    sceneListToggleElement.classList.remove('enabled');
  }

  function toggleSceneList() {
    sceneListElement.classList.toggle('enabled');
    sceneListToggleElement.classList.toggle('enabled');
  }

  function startAutorotate() {
    return; // Wolfgarten: keine automatische Drehung
    if (!autorotateToggleElement.classList.contains('enabled')) {
      return;
    }
    viewer.startMovement(autorotate);
    viewer.setIdleMovement(3000, autorotate);
  }

  function stopAutorotate() {
    viewer.stopMovement();
    viewer.setIdleMovement(Infinity);
  }

  function toggleAutorotate() {
    if (autorotateToggleElement.classList.contains('enabled')) {
      autorotateToggleElement.classList.remove('enabled');
      stopAutorotate();
    } else {
      autorotateToggleElement.classList.add('enabled');
      startAutorotate();
    }
  }

  function createLinkHotspotElement(hotspot) {

    // Create wrapper element to hold icon and tooltip.
    var wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('link-hotspot');

    // Create image element.
    var icon = document.createElement('img');
    icon.src = 'img/link.png';
    icon.classList.add('link-hotspot-icon');

    // Set rotation transform.
    var transformProperties = [ '-ms-transform', '-webkit-transform', 'transform' ];
    for (var i = 0; i < transformProperties.length; i++) {
      var property = transformProperties[i];
      icon.style[property] = 'rotate(' + hotspot.rotation + 'rad)';
    }

    // Add click event handler.
    wrapper.addEventListener('click', function() {
      switchScene(findSceneById(hotspot.target));
    });

    // Prevent touch and scroll events from reaching the parent element.
    // This prevents the view control logic from interfering with the hotspot.
    stopTouchAndScrollEventPropagation(wrapper);

    // Create tooltip element.
    var tooltip = document.createElement('div');
    tooltip.classList.add('hotspot-tooltip');
    tooltip.classList.add('link-hotspot-tooltip');
    tooltip.innerHTML = findSceneDataById(hotspot.target).name;

    wrapper.appendChild(icon);
    wrapper.appendChild(tooltip);

    return wrapper;
  }

  function createInfoHotspotElement(hotspot) {

    // Create wrapper element to hold icon and tooltip.
    var wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('info-hotspot');

    // Create hotspot/tooltip header.
    var header = document.createElement('div');
    header.classList.add('info-hotspot-header');

    // Create image element.
    var iconWrapper = document.createElement('div');
    iconWrapper.classList.add('info-hotspot-icon-wrapper');
    var icon = document.createElement('img');
    icon.src = 'img/info.png';
    icon.classList.add('info-hotspot-icon');
    iconWrapper.appendChild(icon);

    // Create title element.
    var titleWrapper = document.createElement('div');
    titleWrapper.classList.add('info-hotspot-title-wrapper');
    var title = document.createElement('div');
    title.classList.add('info-hotspot-title');
    title.innerHTML = hotspot.title;
    titleWrapper.appendChild(title);

    // Create close element.
    var closeWrapper = document.createElement('div');
    closeWrapper.classList.add('info-hotspot-close-wrapper');
    var closeIcon = document.createElement('img');
    closeIcon.src = 'img/close.png';
    closeIcon.classList.add('info-hotspot-close-icon');
    closeWrapper.appendChild(closeIcon);

    // Construct header element.
    header.appendChild(iconWrapper);
    header.appendChild(titleWrapper);
    header.appendChild(closeWrapper);

    // Create text element.
    var text = document.createElement('div');
    text.classList.add('info-hotspot-text');
    text.innerHTML = hotspot.text;

    // Place header and text into wrapper element.
    wrapper.appendChild(header);
    wrapper.appendChild(text);

    // Create a modal for the hotspot content to appear on mobile mode.
    var modal = document.createElement('div');
    modal.innerHTML = wrapper.innerHTML;
    modal.classList.add('info-hotspot-modal');
    document.body.appendChild(modal);

    var toggle = function() {
      wrapper.classList.toggle('visible');
      modal.classList.toggle('visible');
    };

    // Show content when hotspot is clicked.
    wrapper.querySelector('.info-hotspot-header').addEventListener('click', toggle);

    // Hide content when close icon is clicked.
    modal.querySelector('.info-hotspot-close-wrapper').addEventListener('click', toggle);

    // Prevent touch and scroll events from reaching the parent element.
    // This prevents the view control logic from interfering with the hotspot.
    stopTouchAndScrollEventPropagation(wrapper);

    return wrapper;
  }

  // Prevent touch and scroll events from reaching the parent element.
  function stopTouchAndScrollEventPropagation(element, eventList) {
    var eventList = [ 'touchstart', 'touchmove', 'touchend', 'touchcancel',
                      'wheel', 'mousewheel' ];
    for (var i = 0; i < eventList.length; i++) {
      element.addEventListener(eventList[i], function(event) {
        event.stopPropagation();
      });
    }
  }

  function findSceneById(id) {
    for (var i = 0; i < scenes.length; i++) {
      if (scenes[i].data.id === id) {
        return scenes[i];
      }
    }
    return null;
  }

  function findSceneDataById(id) {
    for (var i = 0; i < data.scenes.length; i++) {
      if (data.scenes[i].id === id) {
        return data.scenes[i];
      }
    }
    return null;
  }


  // Wolfgarten Challenge: hotspots and shared score.
  // Student edition: configuration is bundled with the project, not browser storage.
  var config = window.WOLF_STUDENT_CONFIG;
  if (!config || !Array.isArray(config.tasks) || !config.tasks.length) {
    throw new Error('Wolfgarten: Aufgaben-Konfiguration fehlt oder ist leer.');
  }
  var gameKey = 'wolfgarten-schueler-spielstand-v2';
  var gameTasks = config.tasks.filter(function(task) {
    return task && ['coin', 'quiz', 'info'].indexOf(task.type) !== -1 &&
      scenes.some(function(scene) { return scene.data.id === task.scene; });
  });
  if (gameTasks.length !== config.tasks.length) {
    throw new Error('Wolfgarten: Einige Aufgaben verweisen auf unbekannte Räume.');
  }
  var savedPositions = config.positions || {};
  var savedQuestions = config.questions || {};
  Object.keys(savedQuestions).forEach(function(key) {
    var task = gameTasks[Number(key)], saved = savedQuestions[key];
    if (!task || task.type !== 'quiz' || !saved || !Array.isArray(saved.answers)) return;
    task.question = String(saved.question || task.question);
    task.answers = saved.answers.map(String);
    task.correct = Number(saved.correct) || 0;
    task.points = Number(saved.points) || 0;
  });
  var done = {};
  try { done = JSON.parse(localStorage.getItem(gameKey) || '{}') || {}; } catch(e) { done = {}; }
  var scoreEl = document.getElementById('wolfScore');
  var progressEl = document.getElementById('wolfProgress');
  var gameModal = document.getElementById('wolfModal');
  var gameContent = document.getElementById('wolfModalContent');
  var gameClose = document.getElementById('wolfClose');
  function gameSave() { try { localStorage.setItem(gameKey, JSON.stringify(done)); } catch(e) {} }
  function gameScore() {
    return gameTasks.reduce(function(sum, task, i) { return sum + (done[i] === true && task.type !== 'info' ? (task.type === 'coin' ? 5 : (task.points === undefined ? 10 : task.points)) : 0); }, 0);
  }
  function gameUpdate() {
    var count = gameTasks.filter(function(t,i) { return t.type !== 'info' && !!done[i]; }).length;
    var total = gameTasks.filter(function(t) { return t.type !== 'info'; }).length;
    scoreEl.textContent = gameScore() + ' Punkte';
    progressEl.textContent = count + ' von ' + total + ' Aufgaben entdeckt';
    var bar = document.getElementById('wolfProgressBar');
    if (bar) {
      bar.style.width = (total ? count / total * 100 : 0) + '%';
    }
  }
  function gameOpen() { gameModal.classList.add('open'); gameModal.setAttribute('aria-hidden','false'); }
  function gameDismiss() { gameModal.classList.remove('open', 'wolf-info-open'); gameModal.setAttribute('aria-hidden','true'); }
  gameClose.addEventListener('click', gameDismiss);
  gameModal.addEventListener('click', function(e) { if(e.target === gameModal) gameDismiss(); });
  document.addEventListener('keydown', function(e) { if(e.key === 'Escape') gameDismiss(); });
  document.getElementById('wolfReset').addEventListener('click', function() {
    if (!confirm('Wolfgarten-Challenge wirklich neu starten?')) return;

    // Gespeicherten Spielstand vollständig löschen
    localStorage.removeItem('wolfgarten-schueler-spielstand-v2');

    // Neu laden: Die Tour beginnt wieder am Außeneingang
    window.location.reload();
  });

  // Wolfgarten: fliegende Punkte-Animation
  function wolfFlyPoints(element, points) {
    var rect = element.getBoundingClientRect();
    var badge = document.createElement('div');

    badge.className = 'wolf-flying-points';
    badge.textContent = '+' + points;

    badge.style.left = (rect.left + rect.width / 2) + 'px';
    badge.style.top = (rect.top + rect.height / 2) + 'px';

    document.body.appendChild(badge);

    badge.addEventListener('animationend', function() {
      badge.remove();
    }, { once: true });

    setTimeout(function() {
      if (badge.parentNode) badge.remove();
    }, 1800);
  }

  function gameTaskClick(task, index, el) {
    gameContent.replaceChildren();
    if (task.type === 'info') {
      // Infotafeln sind reine Informationen:
      // keine Punkte, kein Aufgabenfortschritt.
      var eyebrow = document.createElement('div');
      eyebrow.className = 'wolf-info-eyebrow';
      eyebrow.textContent = task.eyebrow || 'GYMNASIUM WOLFGARTEN';
      gameContent.appendChild(eyebrow);
      var infoTitle = document.createElement('h2');
      infoTitle.className = 'wolf-info-title';
      infoTitle.textContent = task.title || 'Unsere Schule';
      gameContent.appendChild(infoTitle);
      if (task.image) {
        var image = document.createElement('img');
        image.className = 'wolf-info-image';
        image.src = task.image;
        image.alt = task.title || 'Wolfgarten';
        image.loading = 'lazy';
        gameContent.appendChild(image);
      }
      var infoText = document.createElement('p');
      infoText.className = 'wolf-info-body';
      infoText.textContent = task.text || '';
      gameContent.appendChild(infoText);
      gameModal.classList.add('wolf-info-open');
      gameOpen();
      return;
    }
    gameModal.classList.remove('wolf-info-open');
    var title = document.createElement('h2');
    title.textContent = task.type === 'coin' ? '🐺 Wolfgarten-Coin gefunden!' : '❓ Wolfgarten-Quiz';
    gameContent.appendChild(title);
    var desc = document.createElement('p');
    if (task.type === 'coin') {
      if (done[index]) {
        desc.textContent = 'Diesen Wolfgarten-Coin hast du bereits eingesammelt.';
      } else {
        done[index] = true; gameSave(); gameUpdate(); wolfFlyPoints(el, 5); el.classList.add('completed');
        desc.textContent = '+5 Punkte! Suche weitere Wolfgarten-Coins und Quizfragen in der Schule.';
      }
      gameContent.appendChild(desc); gameOpen(); return;
    }
    desc.textContent = task.question;
    gameContent.appendChild(desc);
    var feedback = document.createElement('p');
    feedback.className = 'wolf-feedback';
    var answerButtons = [];
    var locked = !!done[index];
    function paint(selected, correct) {
      answerButtons.forEach(function(button, ai) {
        button.disabled = true;
        button.style.opacity = '1';
        button.style.color = '#24417B';
        button.style.backgroundColor = ai === task.correct ? '#CEE697' : (ai === selected && !correct ? '#EEE6D8' : '#F6F3EB');
        button.style.border = ai === task.correct ? '2px solid #83AB2E' : (ai === selected && !correct ? '2px solid #8793BC' : '1px solid #EEE6D8');
      });
    }
    task.answers.forEach(function(answer, ai) {
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'wolf-answer'; btn.textContent = answer;
      btn.addEventListener('click', function() {
        if (locked || done[index]) return;
        locked = true;
        var correct = ai === task.correct;
        done[index] = correct ? true : 'wrong:' + ai;
        gameSave(); gameUpdate(); el.classList.add('completed');
        paint(ai, correct);
        feedback.textContent = correct ? 'Richtig! +' + (task.points === undefined ? 10 : task.points) + ' Punkte 🎉' : 'Leider falsch! 0 Punkte. Die richtige Antwort ist grün markiert.';
        feedback.className = 'wolf-feedback ' + (correct ? 'correct' : 'wrong');
      });
      answerButtons.push(btn);
      gameContent.appendChild(btn);
    });
    if (locked) {
      paint(typeof done[index] === 'string' && done[index].indexOf('wrong:') === 0 ? Number(done[index].split(':')[1]) : -1, done[index] === true);
      feedback.textContent = done[index] === true ? 'Bereits richtig beantwortet – die Punkte sind gespeichert.' : 'Bereits falsch beantwortet – kein weiterer Versuch möglich.';
      feedback.className = 'wolf-feedback ' + (done[index] === true ? 'correct' : 'wrong');
    }
    gameContent.appendChild(feedback);
    gameOpen();
  }
  var gameHotspots = [];
  var activeScene = scenes[0];
  function createGameHotspot(task, index) {
    var target = scenes.find(function(s) { return s.data.id === task.scene; });
    if (!target) return;
    var el = document.createElement('button'); el.type = 'button';
    el.className = 'wolf-hotspot ' + (task.type === 'coin' ? 'wolf-coin' : (task.type === 'quiz' ? 'wolf-quiz' : 'wolf-info')) + (done[index] ? ' completed' : '');
    if (task.type === 'coin') {
      el.textContent = '';
      el.style.setProperty('background-image', 'url("img/wolfgarten-coin.png")', 'important');
      el.style.setProperty('background-size', 'contain', 'important');
      el.style.setProperty('background-position', 'center', 'important');
      el.style.setProperty('background-repeat', 'no-repeat', 'important');
      el.style.setProperty('background-color', 'transparent', 'important');
      el.style.setProperty('border', '0', 'important');
      el.style.setProperty('border-radius', '50%', 'important');
      el.style.setProperty('padding', '0', 'important');
      el.style.setProperty('width', '33px', 'important');
      el.style.setProperty('height', '33px', 'important');
    } else {
      el.textContent = task.type === 'quiz' ? '❓' : 'ⓘ';
    }
    el.title = task.type === 'coin' ? 'Coin einsammeln' : (task.type === 'quiz' ? 'Quizfrage öffnen' : 'Infotafel öffnen');
    el.setAttribute('aria-label', el.title);
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      gameTaskClick(task,index,el);
    });
    stopTouchAndScrollEventPropagation(el);
    var fallback = {yaw:target.data.initialViewParameters.yaw + task.offset, pitch:task.pitch};
    var position = savedPositions[index] || fallback;
    var hotspot = target.scene.hotspotContainer().createHotspot(el, position);
    gameHotspots[index] = {hotspot:hotspot, target:target, fallback:fallback, element:el};
  }
  gameTasks.forEach(createGameHotspot);

  // Follow Marzipano scene changes (also for link hotspots).
  var originalSwitchScene = switchScene;
  switchScene = function(scene) {
    activeScene = scene;
    originalSwitchScene(scene);
  };
  gameUpdate();

  // Display the initial scene.
  switchScene(findSceneById('6-aueneingang') || scenes[0]);

})();
