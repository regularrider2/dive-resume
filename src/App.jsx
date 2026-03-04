import React, { useState, useCallback, useRef, useEffect } from 'react';
import content from './config/content.json';
import theme from './config/theme.json';
import { createGameState, discoverItem, isComplete, getCurrentZone, getLobsterItems } from './state/gameState.js';
import { initAudio, playEffect, startAmbient, updateAmbientDepth, stopAmbient } from './audio/soundEngine.js';
import { initTracker, trackSessionStart, trackDiveStarted, trackZoneEntered, trackItemDiscovered, trackCompletion, trackCtaClicked, trackLobsterDelivered, trackConnectOpened, trackNpcChatOpened, trackGhostDiverChat } from './analytics/tracker.js';
import {
  notifyDiveStarted, notifyDepth, notifyZone, notifyItemDiscovered,
  notifyLobsterPickup, notifyLobsterDelivered, notifyResumeViewed,
  notifyCtaClick, notifyGameOver, notifyCompletion, notifyPageExit,
} from './analytics/notify.js';
import { isTouchDevice, clearTouchMovement } from './engine/touchInput.js';
import { clearMovementKeys } from './engine/input.js';
import GameCanvas from './engine/GameCanvas.jsx';
import TitleOverlay from './screens/TitleScreen.jsx';
import CompletionOverlay from './screens/CompletionOverlay.jsx';
import DecompressionOverlay from './screens/DecompressionOverlay.jsx';
import LobsterDeliveredOverlay from './screens/LobsterDeliveredOverlay.jsx';
import NPCChatOverlay from './screens/NPCChatOverlay.jsx';
import Dialog from './ui/Dialog.jsx';
import PhotoCarousel from './ui/PhotoCarousel.jsx';
import VirtualJoystick from './ui/VirtualJoystick.jsx';
import InteractButton from './ui/InteractButton.jsx';
import ConnectButton from './ui/ConnectButton.jsx';
import { Analytics } from '@vercel/analytics/react';
import { touchState } from './engine/touchInput.js';

const WORLD_HEIGHT = theme.world?.height ?? 2400;
const DECOMPRESSION_SECONDS = 10;

export default function App() {
  const [state, setState] = useState(() => createGameState(content));
  const [showClearFlash, setShowClearFlash] = useState(false);
  const [showAirWarning, setShowAirWarning] = useState(false);
  const [npcChatOpen, setNpcChatOpen] = useState(false);
  const [npcChatted, setNpcChatted] = useState(false);
  const [npcQuestionsUsed, setNpcQuestionsUsed] = useState(0);
  const [npcChatMessages, setNpcChatMessages] = useState([]); // persists for session until reload
  const NPC_QUESTION_LIMIT = 3;
  const audioRef = useRef(null);
  const trackerRef = useRef(null);

  useEffect(() => {
    trackerRef.current = initTracker(state.sessionId, state.ref);
    trackSessionStart(trackerRef.current);
    // Send session summary when user closes/leaves the page
    const onExit = () => notifyPageExit();
    window.addEventListener('pagehide', onExit);
    window.addEventListener('beforeunload', onExit);
    return () => {
      window.removeEventListener('pagehide', onExit);
      window.removeEventListener('beforeunload', onExit);
    };
  }, []);

  const handlePlayEffect = useCallback((name) => {
    if (audioRef.current) playEffect(audioRef.current, name);
  }, []);

  const handleStart = useCallback(() => {
    const engine = initAudio();
    audioRef.current = engine;
    startAmbient(engine, 0);
    trackDiveStarted(trackerRef.current);
    notifyDiveStarted();

    setState(prev => ({
      ...prev,
      screen: 'playing',
      audioUnlocked: true,
      startTime: Date.now(),
      playerY: 0,
    }));
  }, []);

  const handleUpdatePlayer = useCallback((x, y) => {
    setState(prev => {
      const depth = y / WORLD_HEIGHT;
      if (audioRef.current) updateAmbientDepth(audioRef.current, depth);
      // Track max depth (convert world-y to approximate feet: world 2400px ~ 130ft)
      const depthFt = Math.round((y / WORLD_HEIGHT) * 130);
      notifyDepth(depthFt);
      return { ...prev, playerX: x, playerY: y };
    });
  }, []);

  const handleZoneChange = useCallback((zone) => {
    setState(prev => {
      if (zone === prev.currentZone) return prev;
      const zoneData = content.zones?.find(z => z.id === zone);
      handlePlayEffect('zoneChange');
      trackZoneEntered(trackerRef.current, zone);
      notifyZone(zone);

      const deliveringLobster = zone === 'surface' && prev.carryingLobster;

      if (deliveringLobster) {
        // If decompression is still active (not yet completed), surfacing is a violation — lobster drops, game over
        if (prev.decompressionActive) {
          notifyGameOver('decompressionWithLobster');
          return {
            ...prev,
            previousZone: prev.currentZone,
            currentZone: zone,
            carryingLobster: null,
            airTimer: 0,
            airTimerActive: false,
            // Clear all decompression state so its countdown can't overwrite this screen
            decompressionActive: false,
            decompressionTriggered: false,
            decompressionWarning: false,
            decompressionTimer: DECOMPRESSION_SECONDS,
            decompressionWarningTimer: 3,
            screen: 'gameOver',
            gameOverReason: 'decompressionWithLobster',
          };
        }

        const nextCollected = new Set(prev.lobstersCollected);
        nextCollected.add(prev.carryingLobster);
        trackLobsterDelivered(trackerRef.current, nextCollected.size);
        handlePlayEffect('discover');
        const baseNext = {
          ...prev,
          previousZone: prev.currentZone,
          currentZone: zone,
          carryingLobster: null,
          lobstersCollected: nextCollected,
          airTimer: 0,
          airTimerActive: false,
          zoneAnnouncement: {
            text: zoneData?.announcement ?? zone,
            flavor: zoneData?.flavor ?? null,
            fade: 1,
            startTime: Date.now(),
          },
        };
        // If all items are already discovered, go straight to completion with lobster bonus flag
        notifyLobsterDelivered();
        if (isComplete(baseNext) && baseNext.screen !== 'completed') {
          const totalTime = baseNext.startTime ? Math.round((Date.now() - baseNext.startTime) / 1000) : 0;
          trackCompletion(trackerRef.current, totalTime);
          notifyCompletion();
          return { ...baseNext, screen: 'completed', completionLobsterBonus: true };
        }
        return { ...baseNext, showLobsterDelivered: true };
      }

      return {
        ...prev,
        previousZone: prev.currentZone,
        currentZone: zone,
        zoneAnnouncement: {
          text: zoneData?.announcement ?? zone,
          flavor: zoneData?.flavor ?? null,
          fade: 1,
          startTime: Date.now(),
        },
      };
    });
  }, [handlePlayEffect]);

  useEffect(() => {
    if (!state.zoneAnnouncement) return;
    const TOTAL = 4200; // ms total display time
    const SLIDE_IN = 350;  // ms to slide in
    const EXPAND = 500;    // ms to expand flavor subtitle
    const SLIDE_OUT = 400; // ms to slide out at end
    const interval = setInterval(() => {
      setState(prev => {
        if (!prev.zoneAnnouncement) return prev;
        const elapsed = Date.now() - prev.zoneAnnouncement.startTime;
        if (elapsed > TOTAL) return { ...prev, zoneAnnouncement: null };
        // slideT: 0 = fully hidden above, 1 = fully in view
        const slideT = elapsed < SLIDE_IN
          ? elapsed / SLIDE_IN
          : elapsed > TOTAL - SLIDE_OUT
            ? (TOTAL - elapsed) / SLIDE_OUT
            : 1;
        // expandT: 0 = collapsed (label only), 1 = fully expanded (with flavor)
        const expandT = elapsed < SLIDE_IN ? 0
          : elapsed < SLIDE_IN + EXPAND ? (elapsed - SLIDE_IN) / EXPAND
          : elapsed > TOTAL - SLIDE_OUT ? Math.max(0, 1 - (elapsed - (TOTAL - SLIDE_OUT)) / SLIDE_OUT)
          : 1;
        // easeOutCubic for smoothness
        const ease = (t) => 1 - Math.pow(1 - t, 3);
        return { ...prev, zoneAnnouncement: {
          ...prev.zoneAnnouncement,
          slideT: ease(Math.max(0, Math.min(1, slideT))),
          expandT: ease(Math.max(0, Math.min(1, expandT))),
        }};
      });
    }, 16);
    return () => clearInterval(interval);
  }, [state.zoneAnnouncement?.startTime]);

  const handleDiscover = useCallback((itemId, itemType, zone) => {
    handlePlayEffect('discover');
    trackItemDiscovered(trackerRef.current, itemId, itemType, zone);
    notifyItemDiscovered(itemId, itemType, zone);
    setState(prev => {
      const next = discoverItem(prev, itemId);
      if (isComplete(next) && next.screen !== 'completed') {
        const totalTime = next.startTime ? Math.round((Date.now() - next.startTime) / 1000) : 0;
        trackCompletion(trackerRef.current, totalTime);
        notifyCompletion();
        // If a dialog is open, defer completion until it closes
        if (next.showDialog) {
          return { ...next, pendingCompletion: true };
        }
        return { ...next, screen: 'completed' };
      }
      return next;
    });
  }, [handlePlayEffect]);

  const handleGameOver = useCallback((reason) => {
    notifyGameOver(reason);
    setState(prev => {
      if (prev.screen === 'gameOver') return prev;
      return { ...prev, screen: 'gameOver', gameOverReason: reason };
    });
  }, []);

  const handleOpenNPCChat = useCallback(() => {
    trackNpcChatOpened(trackerRef.current);
    clearMovementKeys();
    clearTouchMovement();
    setNpcChatOpen(true);
    setNpcChatted(true);
  }, []);


  const handlePickupLobster = useCallback((lobsterId) => {
    handlePlayEffect('discover');
    notifyLobsterPickup();
    setState(prev => {
      if (prev.carryingLobster || prev.lobstersCollected.has(lobsterId)) return prev;
      return {
        ...prev,
        carryingLobster: lobsterId,
        airTimer: 45,
        airTimerActive: false,
      };
    });
    // Start the air timer + LOW AIR warning 2s after pickup (no dialog to close)
    setTimeout(() => {
      setState(s => ({ ...s, airTimerActive: true }));
      setShowAirWarning(true);
      setTimeout(() => setShowAirWarning(false), 2500);
    }, 2000);
  }, [handlePlayEffect]);

  const handleOpenDialog = useCallback((dialogData) => {
    handlePlayEffect('dialogOpen');
    setState(prev => ({ ...prev, showDialog: dialogData }));
  }, [handlePlayEffect]);

  const handleCloseDialog = useCallback(() => {
    handlePlayEffect('dialogClose');
    clearMovementKeys();
    setState(prev => {
      const next = { ...prev, showDialog: null, showCarousel: false };
      if (prev.pendingCompletion) {
        return { ...next, pendingCompletion: false, screen: 'completed' };
      }
      return next;
    });
  }, [handlePlayEffect]);

  const handleViewGallery = useCallback(() => {
    setState(prev => ({ ...prev, showDialog: null, showCarousel: true }));
  }, []);

  const handleCloseCarousel = useCallback(() => {
    handlePlayEffect('dialogClose');
    clearMovementKeys();
    setState(prev => ({ ...prev, showCarousel: false }));
  }, [handlePlayEffect]);

  const handleDecompression = useCallback((action) => {
    if (action === 'reachedDeep') {
      setState(prev => ({ ...prev, hasReachedDeep: true }));
    } else if (action === 'trigger') {
      handlePlayEffect('decompressionStart');
      setState(prev => ({
        ...prev,
        decompressionTriggered: true,
        decompressionActive: true,
        decompressionTimer: DECOMPRESSION_SECONDS,
        decompressionWarning: false,
        decompressionWarningTimer: 3,
      }));
    } else if (action === 'cancelAndReset') {
      // Diver went back below 30ft mid-stop — cancel the stop silently, reset cycle
      setState(prev => {
        if (!prev.decompressionActive) return prev;
        return {
          ...prev,
          decompressionActive: false,
          decompressionTriggered: false,
          decompressionTimer: DECOMPRESSION_SECONDS,
          decompressionWarning: false,
          decompressionWarningTimer: 3,
          // hasReachedDeep stays true — they've been deep, next ascent triggers again
        };
      });
    } else if (action === 'ascending') {
      setState(prev => {
        if (!prev.decompressionActive || prev.decompressionWarning) return prev;
        return { ...prev, decompressionWarning: true, decompressionWarningTimer: 3 };
      });
    } else if (action === 'returnedDown') {
      setState(prev => {
        if (!prev.decompressionWarning) return prev;
        return { ...prev, decompressionWarning: false, decompressionWarningTimer: 3 };
      });
    }
  }, [handlePlayEffect]);

  // Main decompression countdown — pauses only during warning
  useEffect(() => {
    if (!state.decompressionActive || state.decompressionWarning) return;
    const interval = setInterval(() => {
      setState(prev => {
        if (!prev.decompressionActive || prev.decompressionWarning) return prev;
        const next = prev.decompressionTimer - 1;
        if (next <= 0) {
          handlePlayEffect('decompressionComplete');
          // If carrying lobster with items still to find, "swap the tank" — reset air so they can keep diving
          const tankSwapped = prev.carryingLobster && (prev.discoveredItems.size < prev.totalItems);
          return {
            ...prev,
            decompressionActive: false,
            decompressionTriggered: false,
            decompressionTimer: 0,
            decompressionWarning: false,
            decompressionCompleted: true,
            hasReachedDeep: false, // reset so next dive cycle triggers a fresh stop
            airTimer: tankSwapped ? 45 : 0,
            airTimerActive: tankSwapped,
          };
        }
        return { ...prev, decompressionTimer: next };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.decompressionActive, state.decompressionWarning, handlePlayEffect]);

  // Warning countdown — if player stays above threshold for 3s, game over
  useEffect(() => {
    if (!state.decompressionWarning) return;
    const interval = setInterval(() => {
      setState(prev => {
        if (!prev.decompressionWarning) return prev;
        // If air ran out first, don't override that game over screen
        if (prev.screen === 'gameOver') return { ...prev, decompressionWarning: false, decompressionActive: false };
        const next = prev.decompressionWarningTimer - 1;
        if (next <= 0) {
          const reason = prev.carryingLobster ? 'decompressionWithLobster' : 'decompression';
          notifyGameOver(reason);
          return {
            ...prev,
            carryingLobster: prev.carryingLobster ? null : prev.carryingLobster,
            decompressionActive: false,
            decompressionTriggered: false,
            decompressionWarning: false,
            screen: 'gameOver',
            gameOverReason: reason,
          };
        }
        return { ...prev, decompressionWarningTimer: next };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.decompressionWarning]);


  // Air timer countdown while carrying lobster
  useEffect(() => {
    if (!state.airTimerActive) return;
    const interval = setInterval(() => {
      setState(prev => {
        if (!prev.airTimerActive) return prev;
        const next = prev.airTimer - 1;
        if (next <= 0) { notifyGameOver('outOfAir'); return { ...prev, airTimer: 0, airTimerActive: false, screen: 'gameOver', gameOverReason: 'outOfAir' }; }
        return { ...prev, airTimer: next };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.airTimerActive]);

  // Play game over sound whenever screen transitions to gameOver
  const prevScreenRef = useRef(null);
  useEffect(() => {
    if (state.screen === 'gameOver' && prevScreenRef.current !== 'gameOver') {
      const sfx = state.gameOverReason === 'sharkBite' ? 'sharkBite' : 'gameOver';
      if (audioRef.current) playEffect(audioRef.current, sfx);
    }
    prevScreenRef.current = state.screen;
  }, [state.screen, state.gameOverReason]);

  // Detect when decompression stop completes (timer hit zero) — fire the "CLEAR" flash
  useEffect(() => {
    if (!state.decompressionCompleted) return;
    // Consume the flag immediately so it doesn't re-fire
    setState(prev => ({ ...prev, decompressionCompleted: false }));
    if (state.screen === 'playing') {
      setShowClearFlash(true);
      const timer = setTimeout(() => setShowClearFlash(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [state.decompressionCompleted, state.screen]);

  const handleUpdateDecompression = useCallback(() => {}, []);

  const handleUpdateNearby = useCallback((item) => {
    setState(prev => {
      if (prev.nearbyItem?.id === item?.id) return prev;
      return { ...prev, nearbyItem: item };
    });
  }, []);

  const handleCloseLobsterDelivered = useCallback(() => {
    setState(prev => {
      const next = { ...prev, showLobsterDelivered: false };
      if (isComplete(next) && next.screen !== 'completed') {
        const totalTime = next.startTime ? Math.round((Date.now() - next.startTime) / 1000) : 0;
        trackCompletion(trackerRef.current, totalTime);
        notifyCompletion();
        return { ...next, screen: 'completed' };
      }
      return next;
    });
  }, []);

  const handleDiveAgain = useCallback(() => {
    if (audioRef.current) stopAmbient(audioRef.current);
    window.location.reload();
  }, []);

  const handleKeepExploring = useCallback(() => {
    setState(prev => ({ ...prev, screen: 'playing' }));
  }, []);

  const handleCtaClick = useCallback((linkType) => {
    trackCtaClicked(trackerRef.current, linkType);
    notifyCtaClick(linkType);
    if (linkType === 'resume_view' || linkType === 'resume') notifyResumeViewed();
  }, []);

  const handleTouchInteract = useCallback(() => {
    touchState.interactPressed = true;
  }, []);

  const isTouch = typeof window !== 'undefined' && isTouchDevice();
  const joystickHalf = (theme.joystick?.size ?? 120) / 2;

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Analytics />
      <GameCanvas
        gameState={state}
        onDiscover={handleDiscover}
        onOpenDialog={handleOpenDialog}
        onCloseDialog={handleCloseDialog}
        onZoneChange={handleZoneChange}
        onDecompression={handleDecompression}
        onUpdateDecompression={handleUpdateDecompression}
        onUpdatePlayer={handleUpdatePlayer}
        onPlayEffect={handlePlayEffect}
        onUpdateNearby={handleUpdateNearby}
        onPickupLobster={handlePickupLobster}
        onGameOver={handleGameOver}
        onOpenNPCChat={handleOpenNPCChat}
        npcChatOpen={npcChatOpen}
        npcChatted={npcChatted}
        npcExhausted={npcQuestionsUsed >= NPC_QUESTION_LIMIT}
      />

      {state.screen === 'ready' && <TitleOverlay onStart={handleStart} onCtaClick={handleCtaClick} />}

      {state.screen !== 'ready' && (
        <>
          <ConnectButton onCtaClick={handleCtaClick} onConnectOpened={() => trackConnectOpened(trackerRef.current)} />

          {isTouch && (
            <>
              <VirtualJoystick
                active={touchState.active}
                thumbX={touchState.dx * joystickHalf}
                thumbY={touchState.dy * joystickHalf}
              />
              <InteractButton
                visible={!!state.nearbyItem && !state.showDialog && !state.showCarousel}
                onInteract={handleTouchInteract}
              />
            </>
          )}

          {state.showDialog && (
            <Dialog
              type={state.showDialog.type}
              data={state.showDialog.data}
              onClose={handleCloseDialog}
              onViewGallery={handleViewGallery}
            />
          )}

          {state.showCarousel && (
            <PhotoCarousel
              photos={content.camera?.photos ?? []}
              onClose={handleCloseCarousel}
            />
          )}

          {state.decompressionActive && (
            <DecompressionOverlay
              timer={state.decompressionTimer}
              warning={state.decompressionWarning}
              warningTimer={state.decompressionWarningTimer}
            />
          )}

          {showClearFlash && <ClearFlash />}
          {showAirWarning && <AirWarning />}

          {state.screen === 'gameOver' && (
            <GameOverScreen reason={state.gameOverReason} onRetry={handleDiveAgain} />
          )}

          {state.showLobsterDelivered && !state.showDialog && (
            <LobsterDeliveredOverlay
              allItemsFound={state.discoveredItems.size >= state.totalItems}
              onClose={handleCloseLobsterDelivered}
            />
          )}

          {state.screen === 'completed' && (
            <CompletionOverlay
              onDiveAgain={handleDiveAgain}
              onKeepExploring={handleKeepExploring}
              onCtaClick={handleCtaClick}
              withLobster={!!state.completionLobsterBonus}
            />
          )}
        </>
      )}

      {npcChatOpen && (
        <NPCChatOverlay
          onClose={() => { setNpcChatOpen(false); clearMovementKeys(); }}
          questionsUsed={npcQuestionsUsed}
          questionLimit={NPC_QUESTION_LIMIT}
          onQuestionAsked={() => setNpcQuestionsUsed(n => n + 1)}
          onGhostDiverExchange={(question, answer) => trackGhostDiverChat(trackerRef.current, question, answer)}
          messages={npcChatMessages}
          setMessages={setNpcChatMessages}
        />
      )}
    </div>
  );
}

function AirWarning() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2500,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'airWarnFade 2.5s ease-out forwards',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(220,60,0,0.22) 0%, rgba(220,60,0,0.06) 55%, transparent 100%)',
        animation: 'airTintFade 2.5s ease-out forwards',
      }} />

      <div style={{
        position: 'relative',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 'clamp(28px, 7vw, 72px)',
        color: '#FFD700',
        letterSpacing: '0.08em',
        textAlign: 'center',
        textShadow: '0 0 30px rgba(255,200,0,0.8), 0 0 60px rgba(255,160,0,0.4)',
        animation: 'airTextPop 2.5s ease-out forwards',
      }}>
        ⚠ LOW AIR
      </div>

      <div style={{
        position: 'relative',
        fontFamily: 'monospace',
        fontSize: 'clamp(10px, 1.8vw, 16px)',
        color: 'rgba(255, 220, 80, 0.9)',
        letterSpacing: '0.15em',
        textAlign: 'center',
        marginTop: 6,
        animation: 'airTextPop 2.5s ease-out forwards',
      }}>
        GET TO THE SURFACE
      </div>

      <style>{`
        @keyframes airTextPop {
          0%   { opacity: 0; transform: scale(0.75); }
          10%  { opacity: 1; transform: scale(1.06); }
          20%  { transform: scale(1.0); }
          65%  { opacity: 1; }
          100% { opacity: 0; transform: scale(1.03); }
        }
        @keyframes airTintFade {
          0%   { opacity: 0; }
          12%  { opacity: 1; }
          65%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function ClearFlash() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2500,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'clearFlash 2.2s ease-out forwards',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(0,200,80,0.18) 0%, rgba(0,200,80,0.05) 60%, transparent 100%)',
        animation: 'clearTintFade 2.2s ease-out forwards',
      }} />

      <div style={{
        position: 'relative',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 'clamp(36px, 9vw, 100px)',
        color: '#00e060',
        letterSpacing: '0.12em',
        textAlign: 'center',
        textShadow: '0 0 40px rgba(0,220,80,0.8), 0 0 80px rgba(0,220,80,0.4)',
        animation: 'clearTextPop 2.2s ease-out forwards',
      }}>
        CLEAR
      </div>

      <div style={{
        position: 'relative',
        fontFamily: 'monospace',
        fontSize: 'clamp(10px, 2vw, 18px)',
        color: 'rgba(0, 230, 100, 0.85)',
        letterSpacing: '0.2em',
        textAlign: 'center',
        marginTop: 6,
        animation: 'clearTextPop 2.2s ease-out forwards',
      }}>
        SAFE TO ASCEND
      </div>

      <style>{`
        @keyframes clearTextPop {
          0%   { opacity: 0; transform: scale(0.7); }
          12%  { opacity: 1; transform: scale(1.08); }
          22%  { transform: scale(1.0); }
          60%  { opacity: 1; }
          100% { opacity: 0; transform: scale(1.05); }
        }
        @keyframes clearTintFade {
          0%   { opacity: 0; }
          15%  { opacity: 1; }
          60%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const GAME_OVER_COPY = {
  outOfAir: {
    icon: '💨',
    headline: 'NO AIR, NO GLORY',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.6)',
    bg: 'radial-gradient(ellipse at center, rgba(10,20,60,0.97) 0%, rgba(0,0,0,0.97) 100%)',
    text: "More ambition than oxygen. Happens to the best of us.",
    showSinkingLobster: true,
  },
  decompression: {
    icon: '🫧',
    headline: 'YOU GOT THE BENDS',
    color: '#ff4444',
    glow: 'rgba(255,68,68,0.6)',
    bg: 'radial-gradient(ellipse at center, rgba(50,5,5,0.97) 0%, rgba(0,0,0,0.97) 100%)',
    text: "There's a reason divers take it slow on the way up. You found out.",
    showSinkingLobster: false,
  },
  sharkBite: {
    icon: '🦈',
    headline: 'YOU ARE LUNCH',
    color: '#ff6b35',
    glow: 'rgba(255,107,53,0.7)',
    bg: 'radial-gradient(ellipse at center, rgba(40,8,0,0.97) 0%, rgba(0,0,0,0.97) 100%)',
    text: "You came down here looking for lobster. The shark came down here looking for you.",
    showSinkingLobster: false,
  },
  decompressionWithLobster: {
    icon: '🦞',
    headline: 'DROPPED THE LOBSTER',
    subheadline: '⚡ AND GOT THE BENDS',
    color: '#ff4444',
    glow: 'rgba(255,68,68,0.6)',
    bg: 'radial-gradient(ellipse at center, rgba(50,5,5,0.97) 0%, rgba(0,0,0,0.97) 100%)',
    text: "Lobsters are replaceable. You are not. Don't rush next time.",
    showSinkingLobster: true,
  },
};

const GAME_OVER_STYLES = `
@keyframes sinkLobster {
  0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
  60%  { transform: translateY(80px) rotate(25deg); opacity: 0.8; }
  100% { transform: translateY(160px) rotate(45deg); opacity: 0; }
}
@keyframes gameOverFadeIn {
  from { opacity: 0; transform: scale(0.93) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes bikeHeadline {
  0%, 100% { text-shadow: 0 0 20px var(--glow), 0 0 60px var(--glow); }
  50%       { text-shadow: 0 0 35px var(--glow), 0 0 90px var(--glow), 0 0 120px var(--glow); }
}
@keyframes bloodBubble {
  0%   { transform: translateY(0) scale(1); opacity: 0.7; }
  100% { transform: translateY(-40px) scale(0.3); opacity: 0; }
}
`;

const CTA_ICONS = { email: '✉', linkedin: '🔗', phone: '📞' };

function GameOverScreen({ reason, onRetry }) {
  const copy = GAME_OVER_COPY[reason] ?? {
    icon: '💀', headline: 'GAME OVER',
    color: '#ff4444', glow: 'rgba(255,68,68,0.6)',
    bg: 'rgba(0,0,0,0.97)',
    text: "Something went wrong down there. The ocean is unforgiving.",
    showSinkingLobster: false,
  };

  // Blood bubble positions for shark bite
  const bloodBubbles = reason === 'sharkBite'
    ? [{ x: 38, delay: 0 }, { x: 55, delay: 0.15 }, { x: 25, delay: 0.3 }, { x: 48, delay: 0.5 }, { x: 32, delay: 0.7 }]
    : [];

  return (
    <>
      <style>{GAME_OVER_STYLES}</style>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: copy.bg,
        fontFamily: 'monospace', textAlign: 'center',
      }}>
        <div style={{
          maxWidth: 460, padding: '0 28px',
          animation: 'gameOverFadeIn 0.5s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          {/* Icon with effects */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
            <div style={{ fontSize: 56 }}>{copy.icon}</div>
            {/* Blood bubbles for shark bite */}
            {bloodBubbles.map((b, i) => (
              <div key={i} style={{
                position: 'absolute', top: 0, left: `${b.x}%`,
                fontSize: 14, lineHeight: 1,
                animation: `bloodBubble 1.2s ease-out ${b.delay}s infinite`,
                pointerEvents: 'none',
              }}>🩸</div>
            ))}
          </div>

          {/* Headline */}
          <div style={{
            fontSize: 'clamp(28px, 6vw, 46px)',
            fontWeight: 'bold',
            color: copy.color,
            letterSpacing: '0.12em',
            marginBottom: 18,
            '--glow': copy.glow,
            animation: 'bikeHeadline 2s ease-in-out infinite',
            textShadow: `0 0 20px ${copy.glow}, 0 0 60px ${copy.glow}`,
          }}>
            {copy.headline}
          </div>

          {copy.subheadline && (
            <div style={{
              fontSize: 'clamp(14px, 3vw, 22px)',
              fontWeight: 'bold',
              color: 'rgba(255,180,80,0.9)',
              letterSpacing: '0.1em',
              marginTop: -10,
              marginBottom: 16,
              textShadow: '0 0 12px rgba(255,150,50,0.5)',
            }}>
              {copy.subheadline}
            </div>
          )}

          {/* Sinking lobster (outOfAir only) */}
          {copy.showSinkingLobster && (
            <div style={{
              fontSize: 36, marginBottom: 8,
              animation: 'sinkLobster 2.5s ease-in 0.3s forwards',
              display: 'inline-block',
            }}>
              🦞
            </div>
          )}

          <p style={{
            fontSize: 15, color: 'rgba(200,220,255,0.82)',
            lineHeight: 1.75, marginBottom: 36,
            fontStyle: 'italic',
          }}>
            {copy.text}
          </p>

          <button
            onClick={onRetry}
            style={{
              padding: '13px 44px', fontSize: 15, fontWeight: 'bold',
              fontFamily: 'monospace', letterSpacing: '0.08em',
              color: '#fff',
              background: 'rgba(30,30,60,0.8)',
              border: `2px solid ${copy.color}`, borderRadius: 8,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(60,60,100,0.9)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(30,30,60,0.8)'}
          >
            Try Again
          </button>

          {/* Contact links */}
          <div style={{
            marginTop: 32,
            paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            <p style={{ color: 'rgba(150,180,220,0.6)', fontSize: 12, marginBottom: 14, letterSpacing: '0.08em' }}>
              OR JUST REACH OUT DIRECTLY
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
              {(content.completion?.ctaLinks ?? []).map(link => (
                <a
                  key={link.type}
                  href={link.url}
                  target={link.url.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 16px', fontSize: 13,
                    fontFamily: 'monospace', fontWeight: 'bold',
                    color: 'rgba(200,220,255,0.9)',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: 7, textDecoration: 'none',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
                >
                  <span>{CTA_ICONS[link.type] ?? '•'}</span>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
