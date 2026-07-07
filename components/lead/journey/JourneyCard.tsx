"use client";
/**
 * JourneyCard — the lead card root. Command-center layout:
 *   [ JourneyMap 230px | StageView (the stage) | RightRail 320px ]  (RTL)
 * One journey, one focused step, keyboard-first, server-persisted.
 */
import * as React from "react";
import type { JourneyState } from "@/lib/journey";
import { Confetti } from "@/components/ui/Confetti";
import {
  JourneyContext, useJourneyProvider, type LeadDTO, type ActivityDTO, type CardFace,
} from "./useJourney";
import { useJourneyKeys, ShortcutsOverlay } from "./useJourneyKeys";
import { JourneyHeader } from "./JourneyHeader";
import { JourneyMap } from "./JourneyMap";
import { StageView } from "./StageView";
import { SpeakableStage } from "./SpeakableStage";
import { GhostFooter } from "./GhostFooter";
import { OutcomePanel } from "./OutcomePanel";
import { RightRail } from "./RightRail";
import { VehiclePivot, PivotReminder } from "./VehiclePivot";
import { CallbackModal } from "./CallbackModal";
import { LeadDataSheet } from "./LeadDataSheet";

export function JourneyCard(props: {
  lead: LeadDTO;
  initialJourney: JourneyState;
  initialVersion: number;
  initialPrefilled: string[];
  initialActivities: ActivityDTO[];
  face?: CardFace;
}) {
  const ctx = useJourneyProvider({
    lead: props.lead,
    initial: props.initialJourney,
    initialVersion: props.initialVersion,
    initialPrefilled: props.initialPrefilled,
    initialActivities: props.initialActivities,
    face: props.face,
  });

  return (
    <JourneyContext.Provider value={ctx}>
      <Inner />
    </JourneyContext.Provider>
  );
}

function Inner() {
  useJourneyKeys();
  const { confettiTrigger, confettiCount, face } = React.useContext(JourneyContext)!;
  const speak = face === "speak";

  return (
    <div className="max-w-[1280px] space-y-4">
      <Confetti trigger={confettiTrigger} count={confettiCount} />
      <JourneyHeader />

      {!speak && <PivotReminder />}

      <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)_320px] gap-4 items-start">
        <JourneyMap />
        {speak ? <SpeakableStage /> : <StageView />}
        <RightRail />
      </div>

      <GhostFooter />

      {/* the speak face morphs the pivot into the script — the modal stays for the form face */}
      {!speak && <VehiclePivot />}
      <OutcomePanel />
      <CallbackModal />
      <LeadDataSheet />
      <ShortcutsOverlay />
    </div>
  );
}
