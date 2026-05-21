/* global React, ReactDOM */
const {
  useState,
  useEffect
} = React;
const {
  TweaksPanel,
  useTweaks,
  TweakSection,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakColor
} = window;
const DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentPalette": ["#C9A86C", "#1A1714", "#F6F3EC"],
  "particleDensity": 35,
  "parallaxIntensity": 1.0,
  "grainIntensity": 0.08,
  "headlineStyle": "two-line",
  "showSteam": true,
  "darkHero": true
} /*EDITMODE-END*/;
function LucaTweaks() {
  const [t, setTweak] = useTweaks(DEFAULTS);

  // Live-apply
  useEffect(() => {
    const root = document.documentElement;
    const [gold, dark, cream] = t.accentPalette;
    root.style.setProperty('--gold', gold);
    if (dark) root.style.setProperty('--dark', dark);
    if (cream) root.style.setProperty('--cream', cream);
    root.dataset.parallax = t.parallaxIntensity;
    const grain = document.querySelector('.hero__grain');
    if (grain) grain.style.opacity = t.grainIntensity;
    const heroParticles = document.querySelector('[data-particles="hero"]');
    if (heroParticles) {
      heroParticles.style.display = t.showSteam ? '' : 'none';
    }
    document.querySelectorAll('[data-particles="card"]').forEach(el => {
      el.style.display = t.showSteam ? '' : 'none';
    });
    if (window.__lucaSpawnHero) window.__lucaSpawnHero(t.particleDensity);

    // Headline variant
    const title = document.querySelector('.hero__title');
    if (title) {
      if (t.headlineStyle === 'one-line') {
        title.dataset.variant = 'one-line';
      } else if (t.headlineStyle === 'stacked') {
        title.dataset.variant = 'stacked';
      } else {
        title.dataset.variant = 'two-line';
      }
    }
  }, [t]);
  return /*#__PURE__*/React.createElement(TweaksPanel, {
    title: "Tweaks"
  }, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Palette"
  }, /*#__PURE__*/React.createElement(TweakColor, {
    label: "Accent palette",
    value: t.accentPalette,
    onChange: v => setTweak('accentPalette', v),
    options: [['#C9A86C', '#1A1714', '#F6F3EC'], ['#C4A882', '#0E0C0A', '#EDE7D9'], ['#A78A56', '#181613', '#F2EEE3'], ['#D4B27A', '#1A1714', '#FAF7EF']]
  })), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Motion"
  }, /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Steam particles",
    value: t.showSteam,
    onChange: v => setTweak('showSteam', v)
  }), /*#__PURE__*/React.createElement(TweakSlider, {
    label: "Particle density",
    value: t.particleDensity,
    min: 0,
    max: 80,
    step: 1,
    onChange: v => setTweak('particleDensity', v)
  }), /*#__PURE__*/React.createElement(TweakSlider, {
    label: "Parallax intensity",
    value: t.parallaxIntensity,
    min: 0,
    max: 2,
    step: 0.05,
    onChange: v => setTweak('parallaxIntensity', v)
  }), /*#__PURE__*/React.createElement(TweakSlider, {
    label: "Film grain",
    value: t.grainIntensity,
    min: 0,
    max: 0.25,
    step: 0.005,
    onChange: v => setTweak('grainIntensity', v)
  })), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Headline"
  }, /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Layout",
    value: t.headlineStyle,
    options: [{
      value: 'two-line',
      label: 'Two line'
    }, {
      value: 'stacked',
      label: 'Stacked'
    }, {
      value: 'one-line',
      label: 'Inline'
    }],
    onChange: v => setTweak('headlineStyle', v)
  })));
}
const root = ReactDOM.createRoot(document.getElementById('tweaks-root'));
root.render(/*#__PURE__*/React.createElement(LucaTweaks, null));
