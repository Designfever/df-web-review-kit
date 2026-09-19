// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

const amplitude = vi.hoisted(() => ({
  initAll: vi.fn(async () => undefined),
  track: vi.fn(),
}));

vi.mock('@amplitude/unified', () => amplitude);

describe('review analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    amplitude.initAll.mockReset().mockResolvedValue(undefined);
    amplitude.track.mockReset();
    window.localStorage.clear();
  });

  it('initializes Amplitude lazily and sends only allowlisted event properties', async () => {
    const { configureReviewAnalytics, trackReviewEvent } =
      await import('./analytics');

    configureReviewAnalytics(
      {
        provider: 'amplitude',
        apiKey: 'browser-project-key',
        sessionReplay: { enabled: true, maskInputs: true, sampleRate: 1 },
      },
      { projectId: 'project-1', reviewerName: 'Reviewer' }
    );
    trackReviewEvent('click', {
      panelId: 'qa panel',
      controlId: 'save button',
      action: 'save',
    });

    await vi.waitFor(() => expect(amplitude.track).toHaveBeenCalledOnce());
    expect(amplitude.initAll).toHaveBeenCalledWith(
      'browser-project-key',
      expect.objectContaining({
        analytics: expect.objectContaining({ autocapture: false }),
        sessionReplay: expect.objectContaining({
          sampleRate: 1,
          privacyConfig: expect.objectContaining({
            defaultMaskLevel: 'medium',
          }),
        }),
      })
    );
    expect(amplitude.track).toHaveBeenCalledWith('click', {
      source: 'review-kit',
      project_id: 'project-1',
      package_version: expect.any(String),
      anonymous_id: expect.any(String),
      reviewer_name: 'Reviewer',
      panel_id: 'qa_panel',
      control_id: 'save_button',
      action: 'save',
    });
    expect(window.localStorage.getItem(
      'df-web-review-kit:analytics:anonymous-id'
    )).toEqual(expect.any(String));
  });

  it('stays disabled without config and fails safely when initialization rejects', async () => {
    const { configureReviewAnalytics, trackReviewEvent } =
      await import('./analytics');

    trackReviewEvent('view', { panelId: 'qa' });
    expect(amplitude.track).not.toHaveBeenCalled();

    amplitude.initAll.mockRejectedValueOnce(new Error('blocked'));
    configureReviewAnalytics(
      { provider: 'amplitude', apiKey: 'rejected-key' },
      { projectId: 'project-1' }
    );
    trackReviewEvent('success', { action: 'save' });
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(amplitude.track).not.toHaveBeenCalled();
  });

  it('extracts non-sensitive failure identifiers without error messages', async () => {
    const { getReviewAnalyticsFailureProperties } =
      await import('./analytics');

    expect(
      getReviewAnalyticsFailureProperties({
        code: 'HTTP 503 / private/path',
        message: 'contains a token',
        status: 503,
      })
    ).toEqual({ errorCode: 'HTTP_503_private_path', status: 503 });
    expect(getReviewAnalyticsFailureProperties('raw failure')).toEqual({});
  });
});
