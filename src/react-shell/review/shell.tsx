// 리뷰 셸의 최상위 엔트리. store/config/refs 를 만들고 runtime + frame 을 조립한다.
//
// 구조 지도:
// - store/                      zustand slice (sidePanel/target/qa) + config/refs context
// - hooks/use.review.shell.runtime runtime controller hook
// - review/shell.providers      runtime provider stack
// - review/shell.frame          layout frame
// - *.container                 feature UI containers
import {
  useMemo,
  useState,
} from 'react';
import type { ReviewShellProps } from '../types';
import { FigmaImagesPanelContainer } from '../figma/images.panel.container';
import { QaPanelContainer } from '../qa/panel.container';
import { SectionOutlineContainer } from './section.outline.container';
import { ReviewSideRailContainer } from './side.rail.container';
import { ReviewShellFrameContainer } from './shell.frame.container';
import { ReviewShellModalsContainer } from './shell.modals.container';
import { ReviewShellProviders } from './shell.providers';
import { SourceInspectorOverlayContainer } from './source.inspector.overlay.container';
import { ReviewTargetFrame } from '../target/frame';
import { TopbarContainer } from '../topbar.container';
import { ReviewToastContainer } from './toast.container';
import { useReviewShellRuntime } from '../hooks/use.review.shell.runtime';
import { createReviewShellStore } from '../store/create.review.shell.store';
import {
  createReviewShellConfig,
  ReviewShellConfigProvider,
} from '../store/shell.config';
import {
  createReviewShellRefs,
  ReviewShellRefsProvider,
} from '../store/shell.refs';
import { getInitialTargetSliceState } from '../store/target.slice';
import {
  ReviewShellStoreProvider,
} from '../store/store.context';

// store 는 인스턴스마다 생성한다 (전역 아님). useState initializer 는 StrictMode 안전.
export const ReviewShell = (props: ReviewShellProps) => {
  const config = useMemo(
    () => createReviewShellConfig(props),
    [
      props.adapters,
      props.initialPrompt,
      props.pages,
      props.presets,
      props.projectId,
      props.reviewPathPrefix,
      props.sourceInspector,
      props.sourceRoot,
    ]
  );
  const [store] = useState(() =>
    createReviewShellStore({ target: getInitialTargetSliceState(config) })
  );
  const [refs] = useState(createReviewShellRefs);

  return (
    <ReviewShellConfigProvider value={config}>
      <ReviewShellStoreProvider value={store}>
        <ReviewShellRefsProvider value={refs}>
          <ReviewShellContent {...props} />
        </ReviewShellRefsProvider>
      </ReviewShellStoreProvider>
    </ReviewShellConfigProvider>
  );
};

const ReviewShellContent = (props: ReviewShellProps) => {
  const runtime = useReviewShellRuntime(props);

  return (
    <ReviewShellProviders {...runtime}>
      <ReviewShellFrameContainer
        slots={{
          topbar: <TopbarContainer />,
          modals: <ReviewShellModalsContainer />,
          toast: <ReviewToastContainer />,
          sideRail: <ReviewSideRailContainer />,
          qaPanel: <QaPanelContainer />,
          figmaImagesPanel: <FigmaImagesPanelContainer />,
          sourceTreePanel: <SectionOutlineContainer />,
          targetFrame: <ReviewTargetFrame />,
          sourceInspector: <SourceInspectorOverlayContainer />,
        }}
      />
    </ReviewShellProviders>
  );
};
