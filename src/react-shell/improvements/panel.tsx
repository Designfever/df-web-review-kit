import {
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  LoaderCircle,
  Trash2,
  X,
} from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import {
  getReviewAnalyticsFailureProperties,
  trackReviewEvent,
} from '../../analytics';
import type { NormalizedReviewShellAdapter } from '../adapters';
import type {
  ReviewImprovementArea,
  ReviewImprovementCategory,
  ReviewImprovementResult,
} from '../types';

const CATEGORY_OPTIONS: Array<{
  value: ReviewImprovementCategory;
  label: string;
}> = [
  { value: 'feature', label: '기능 제안' },
  { value: 'bug', label: '버그 신고' },
  { value: 'ui_ux', label: 'UI/UX 개선' },
  { value: 'other', label: '기타' },
];

const AREA_OPTIONS: Array<{ value: ReviewImprovementArea; label: string }> = [
  { value: 'meetings', label: '회의록' },
  { value: 'issues', label: '이슈/보드' },
  { value: 'projects', label: '프로젝트' },
  { value: 'improvements', label: '공지/개선사항' },
  { value: 'all', label: '전체' },
];

const MAX_ATTACHMENTS = 5;

export const ImprovementsPanel = ({
  adapter,
  isVisible,
  projectId,
  reviewRoute,
  onClose,
}: {
  adapter: NormalizedReviewShellAdapter;
  isVisible: boolean;
  projectId: string;
  reviewRoute: string;
  onClose: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] =
    useState<ReviewImprovementCategory>('other');
  const [area, setArea] = useState<ReviewImprovementArea>('all');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<ReviewImprovementResult | null>(null);

  const reviewUrl =
    typeof window === 'undefined' ? reviewRoute : window.location.href;

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('other');
    setArea('all');
    setFiles([]);
    setError('');
    setCreated(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addFiles = (nextFiles: File[]) => {
    setCreated(null);
    setError('');
    setFiles((current) => [...current, ...nextFiles].slice(0, MAX_ATTACHMENTS));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedTitle = title.trim();
    if (!normalizedTitle || !adapter.createImprovement || isSubmitting) return;

    setIsSubmitting(true);
    setError('');
    setCreated(null);
    trackReviewEvent('click', {
      panelId: 'improvements',
      controlId: 'submit',
      action: 'create-improvement',
    });
    let pendingAction = 'create-improvement';
    try {
      if (files.length > 0 && !adapter.uploadAttachment) {
        throw new Error('현재 연결에서는 이미지를 첨부할 수 없습니다.');
      }
      if (files.length > 0) {
        pendingAction = 'upload';
        trackReviewEvent('click', {
          panelId: 'improvements',
          controlId: 'upload-attachments',
          action: 'upload',
        });
      }
      const attachments = adapter.uploadAttachment
        ? await Promise.all(
            files.map((file) =>
              adapter.uploadAttachment!({
                file,
                name: file.name,
                mime: file.type,
                kind: 'image',
                metadata: { projectId, source: 'review-kit-improvement' },
              })
            )
          )
        : [];
      if (files.length > 0) {
        trackReviewEvent('success', {
          action: 'upload',
          panelId: 'improvements',
        });
        pendingAction = 'create-improvement';
      }
      const normalizedContent = content.trim();
      const currentReviewUrl =
        typeof window === 'undefined' ? reviewRoute : window.location.href;
      const contextLine = currentReviewUrl
        ? `Review Kit 화면: ${currentReviewUrl}`
        : '';
      const result = await adapter.createImprovement({
        title: normalizedTitle,
        content:
          [normalizedContent, contextLine].filter(Boolean).join('\n\n') || null,
        category,
        area,
        attachmentUrls: attachments.map((attachment) => attachment.url),
      });
      trackReviewEvent('success', {
        action: 'create-improvement',
        panelId: 'improvements',
      });
      setCreated(result);
      setTitle('');
      setContent('');
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (submitError) {
      trackReviewEvent('failure', {
        action: pendingAction,
        panelId: 'improvements',
        ...getReviewAnalyticsFailureProperties(submitError),
      });
      setError(
        submitError instanceof Error
          ? submitError.message
          : '개선사항 등록에 실패했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside
      id="df-review-improvements-panel"
      className="df-review-improvements-panel"
      aria-hidden={!isVisible}
      aria-label="개선사항 등록"
    >
      <header className="df-review-improvements-header">
        <div>
          <strong>개선사항</strong>
          <span>DF Sheet에 바로 등록합니다.</span>
        </div>
        <button aria-label="개선사항 등록 닫기" type="button" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      </header>

      <form className="df-review-improvements-form" onSubmit={submit}>
        <p className="df-review-improvements-intro">
          Review Kit을 사용하며 발견한 개선 의견을 남겨주세요. 등록하면 DF
          Sheet에 저장되고 관리자에게 알림이 전송됩니다.
        </p>

        <label>
          <span>제목 <em>필수</em></span>
          <input
            autoComplete="off"
            maxLength={200}
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <div className="df-review-improvements-row">
          <label>
            <span>유형</span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as ReviewImprovementCategory)
              }
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>관련 영역</span>
            <select
              value={area}
              onChange={(event) =>
                setArea(event.target.value as ReviewImprovementArea)
              }
            >
              {AREA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          <span>내용</span>
          <textarea
            maxLength={5000}
            placeholder="내용을 입력하세요"
            rows={7}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </label>

        <div className="df-review-improvements-attachment">
          <span>첨부 이미지</span>
          <input
            ref={fileInputRef}
            accept="image/*"
            hidden
            multiple
            type="file"
            onChange={(event) => addFiles(Array.from(event.target.files ?? []))}
          />
          <button
            className="df-review-improvements-file-button"
            disabled={files.length >= MAX_ATTACHMENTS || isSubmitting}
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus aria-hidden="true" />
            이미지 선택
          </button>
          {files.length > 0 && (
            <ul>
              {files.map((file, index) => (
                <li key={`${file.name}-${file.lastModified}-${index}`}>
                  <span title={file.name}>{file.name}</span>
                  <button
                    aria-label={`${file.name} 삭제`}
                    disabled={isSubmitting}
                    type="button"
                    onClick={() =>
                      setFiles((current) =>
                        current.filter((_, fileIndex) => fileIndex !== index)
                      )
                    }
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <small>이미지는 최대 {MAX_ATTACHMENTS}장까지 첨부할 수 있습니다.</small>
        </div>

        <div className="df-review-improvements-context">
          <span>현재 리뷰 화면</span>
          <code title={reviewUrl}>{reviewUrl}</code>
        </div>

        {error && <p className="df-review-improvements-error" role="alert">{error}</p>}
        {created && (
          <div className="df-review-improvements-success" role="status">
            <CheckCircle2 aria-hidden="true" />
            <span>개선사항이 등록되었습니다.</span>
            {created.url && (
              <a href={created.url} rel="noreferrer" target="_blank">
                DF Sheet에서 보기 <ExternalLink aria-hidden="true" />
              </a>
            )}
          </div>
        )}

        <footer>
          <button type="button" onClick={resetForm} disabled={isSubmitting}>
            초기화
          </button>
          <button
            className="is-primary"
            disabled={!title.trim() || isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="is-spinning" aria-hidden="true" />
                등록 중
              </>
            ) : (
              '등록'
            )}
          </button>
        </footer>
      </form>
    </aside>
  );
};
