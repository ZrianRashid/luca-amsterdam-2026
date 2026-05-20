/* global React, ReactDOM */
const { useState: useStateRT, useEffect: useEffectRT } = React;
const { TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle, TweakSlider } = window;

const RESERVE_DEFAULTS = /*EDITMODE-BEGIN*/{
  "layout": "split",
  "ambientMotion": true,
  "grainOpacity": 0.06
}/*EDITMODE-END*/;

function ReserveTweaks() {
  const [t, setTweak] = useTweaks(RESERVE_DEFAULTS);

  useEffectRT(() => {
    if (window.__lucaSetReserveLayout) window.__lucaSetReserveLayout(t.layout);

    const stage = document.querySelector('.stage');
    if (stage) stage.style.display = t.ambientMotion ? '' : 'none';

    const grain = document.querySelector('.stage__grain');
    if (grain) grain.style.opacity = t.grainOpacity;
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Layout">
        <TweakRadio
          label="Style"
          value={t.layout}
          options={[
            { value: 'split', label: 'Split' },
            { value: 'centered', label: 'Centered' },
          ]}
          onChange={(v) => setTweak('layout', v)}
        />
      </TweakSection>
      <TweakSection label="Ambient">
        <TweakToggle
          label="Motion background"
          value={t.ambientMotion}
          onChange={(v) => setTweak('ambientMotion', v)}
        />
        <TweakSlider
          label="Film grain"
          value={t.grainOpacity}
          min={0}
          max={0.2}
          step={0.005}
          onChange={(v) => setTweak('grainOpacity', v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

// Mount both apps
const reserveRoot = ReactDOM.createRoot(document.getElementById('reserve-root'));
reserveRoot.render(React.createElement(window.__ReserveApp));

const tweaksRoot = ReactDOM.createRoot(document.getElementById('tweaks-root'));
tweaksRoot.render(<ReserveTweaks />);
