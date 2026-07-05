// ReviewShell 인스턴스마다 하나씩 생성되는 store. 전역 store 를 만들지 않는다.
// (라이브러리 특성상 한 페이지에 ReviewShell 이 여러 번 mount 될 수 있다)
import { createStore } from 'zustand';
import {
  createQaSlice,
  type QaSlice,
} from './qa.slice';
import {
  createSidePanelSlice,
  type SidePanelSlice,
} from './side.panel.slice';
import {
  createTargetSlice,
  type TargetSlice,
  type TargetSliceState,
} from './target.slice';

export type ReviewShellState = SidePanelSlice & TargetSlice & QaSlice;

export interface ReviewShellStoreInit {
  target: TargetSliceState;
}

export const createReviewShellStore = (init: ReviewShellStoreInit) =>
  createStore<ReviewShellState>()((...args) => ({
    ...createSidePanelSlice(...args),
    ...createTargetSlice(init.target)(...args),
    ...createQaSlice(...args),
  }));

export type ReviewShellStore = ReturnType<typeof createReviewShellStore>;
