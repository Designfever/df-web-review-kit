import { connectDfSheetReview } from '../../src/df-sheet';
import { mountReviewShell } from '../../src/react-shell';
import { pages, presets } from './fixtures/config';

export const DF_SHEET_REVIEW_PATH = '/review-df-sheet';
const PROJECT_ID = 'cdf02474-e15a-48b3-bf1b-f42b95da0cc5';

export async function mountDfSheetReview() {
  const root = document.getElementById('root')!;
  root.textContent = 'Connecting to DF Sheet…';

  try {
    const session = await connectDfSheetReview({
      projectId: PROJECT_ID,
    });
    if (!session) return;
    const reviewPages = await session.listPages();
    if (!reviewPages.length) throw new Error('Add a page to the Web Review Kit project in DF Sheet, then retry.');
    const selectedPageId = session.resolveSelectedPageId(reviewPages) ??
      (reviewPages.length === 1 ? reviewPages[0].id : await selectReviewPage(root, reviewPages));

    root.textContent = '';
    let unmount: (() => void) | undefined;
    const openPage = (pageId: string) => {
      session.rememberSelectedPageId(pageId, reviewPages);
      unmount?.();
      unmount = mountReviewShell({
        projectId: session.project.id,
        pages,
        presets,
        customPanels: true,
        adapters: [session.createAdapter({
          pageId,
          reviewPathPrefix: DF_SHEET_REVIEW_PATH,
        })],
        figmaImages: { store: session.figmaImageStore, imageFormat: 'webp' },
        reviewPathPrefix: DF_SHEET_REVIEW_PATH,
        qaPageSelector: {
          value: pageId,
          options: reviewPages.map((page) => ({ value: page.id, label: page.name })),
          onChange: openPage,
        },
        onLogout: async () => {
          const logoutUrl = await session.createLogoutUrl();
          session.disconnect();
          window.location.assign(logoutUrl);
        },
        ruler: { enabled: true, unit: 'px' },
      });
    };
    openPage(selectedPageId);
  } catch (error) {
    root.setAttribute('role', 'alert');
    root.textContent = error instanceof Error ? error.message : 'DF Sheet connection failed.';
    const retry = document.createElement('button');
    retry.textContent = 'Retry login';
    retry.onclick = () => window.location.assign(`${DF_SHEET_REVIEW_PATH}/`);
    root.append(document.createElement('br'), retry);
  }
}

function selectReviewPage(root: HTMLElement, pages: { id: string; name: string }[]) {
  root.textContent = '';
  const label = document.createElement('label');
  label.textContent = 'Choose a DF Sheet page: ';
  const select = document.createElement('select');
  select.append(new Option('Select a page', ''));
  for (const page of pages) select.append(new Option(page.name, page.id));
  label.append(select);
  const button = document.createElement('button');
  button.textContent = 'Open review';
  button.disabled = true;
  select.onchange = () => { button.disabled = !select.value; };
  root.append(label, button);
  return new Promise<string>((resolve) => {
    button.onclick = () => resolve(select.value);
  });
}
