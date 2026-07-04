import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  readReviewFigmaImageStoreFile,
  runExclusiveReviewImageStoreTask,
  writeReviewFigmaImageStoreFile,
} from './figma-image-store.image';

// 스토어 파일 mutation 직렬화(락 큐)와 원자적 쓰기 검증.

const waitForMs = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

let tempDir: string | null = null;

async function createTempDataFile() {
  tempDir = await mkdtemp(path.join(tmpdir(), 'dfwr-image-store-'));
  return path.join(tempDir, 'figma-images.json');
}

afterEach(async () => {
  if (tempDir) await rm(tempDir, { recursive: true, force: true });
  tempDir = null;
});

describe('runExclusiveReviewImageStoreTask', () => {
  it('runs tasks for the same data file strictly in order', async () => {
    const order: string[] = [];

    // 첫 작업이 더 오래 걸려도 두 번째는 첫 작업이 끝난 뒤 시작해야 한다.
    const first = runExclusiveReviewImageStoreTask('queue-a', async () => {
      order.push('first:start');
      await waitForMs(30);
      order.push('first:end');
      return 1;
    });
    const second = runExclusiveReviewImageStoreTask('queue-a', async () => {
      order.push('second:start');
      return 2;
    });

    await expect(Promise.all([first, second])).resolves.toEqual([1, 2]);
    expect(order).toEqual(['first:start', 'first:end', 'second:start']);
  });

  it('keeps the queue alive after a task fails', async () => {
    await expect(
      runExclusiveReviewImageStoreTask('queue-b', async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');

    await expect(
      runExclusiveReviewImageStoreTask('queue-b', async () => 'recovered')
    ).resolves.toBe('recovered');
  });

  it('serializes concurrent read-modify-write without losing updates', async () => {
    const dataFile = await createTempDataFile();
    // readReviewFigmaImageStoreFile 의 isReviewFigmaImage 검증을 통과하는 최소 형태.
    const createImage = (id: string) =>
      ({
        id,
        projectId: 'p',
        target: { type: 'route', projectId: 'p', pageUrl: '/' },
        figmaUrl: `https://www.figma.com/design/KEY?node-id=1-2`,
        fileKey: 'KEY',
        nodeId: `1:${id.charCodeAt(0)}`,
        label: id,
        order: 0,
        imageFormat: 'png',
        imageUrl: `/assets/${id}.png`,
        storageKey: `figma_${id}.png`,
        createdAt: '2026-07-04T00:00:00.000Z',
        updatedAt: '2026-07-04T00:00:00.000Z',
      }) as never;

    // 락 없이 실행하면 두 요청이 같은 빈 파일을 읽고 서로를 덮어써 1개만 남는다.
    await Promise.all(
      ['a', 'b', 'c'].map((id) =>
        runExclusiveReviewImageStoreTask(dataFile, async () => {
          const data = await readReviewFigmaImageStoreFile(dataFile);
          await waitForMs(10); // read 와 write 사이 간격을 벌려 race 재현
          data.images = [createImage(id), ...data.images];
          await writeReviewFigmaImageStoreFile(dataFile, data);
        })
      )
    );

    const data = await readReviewFigmaImageStoreFile(dataFile);
    expect(data.images.map((image) => image.id).sort()).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});

describe('writeReviewFigmaImageStoreFile', () => {
  it('writes valid JSON and leaves no temp files behind', async () => {
    const dataFile = await createTempDataFile();
    await writeReviewFigmaImageStoreFile(dataFile, {
      version: 1,
      images: [],
    });

    const raw = await readFile(dataFile, 'utf8');
    expect(JSON.parse(raw)).toEqual({ version: 1, images: [] });

    // 원자적 쓰기(temp → rename) 후 temp 파일이 남으면 안 된다.
    const files = await readdir(path.dirname(dataFile));
    expect(files).toEqual(['figma-images.json']);
  });
});
