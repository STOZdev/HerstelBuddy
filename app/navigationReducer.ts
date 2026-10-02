import type { FlowEventType, StepId } from "./userFlow";
import { FLOW_TARGETS } from "./userFlow";

export function navigationReducer(currentStep: StepId, event: { type: FlowEventType }): StepId {
  return FLOW_TARGETS[event.type] ?? currentStep;
}
