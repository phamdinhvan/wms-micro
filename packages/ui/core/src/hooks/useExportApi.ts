// src/hooks/useExportApi.ts
'use client';

import type {AxiosResponse} from 'axios';
import {useCallback, useRef, useState} from 'react';
import {ApiMutationType} from '../types';
import {useAbortController} from './useAbortController';
import {useAppMutation} from './useAppMutation';

const EXCEL_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function getFilenameFromContentDisposition(cd: string | null | undefined) {
  if (!cd) return undefined;
  // filename*="UTF-8''name.xlsx" OR filename="name.xlsx"
  const m =
    /filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i.exec(cd) ||
    /filename=(.+)$/i.exec(cd);
  if (!m) return undefined;
  try {
    return decodeURIComponent(m[1].trim());
  } catch {
    return m[1].trim();
  }
}

async function assertZipLike(blob: Blob) {
  // XLSX is a zip -> must start with "PK" (0x50, 0x4B)
  const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  const isZip = head[0] === 0x50 && head[1] === 0x4b;
  if (!isZip) {
    let preview = '';
    try {
      preview = await blob.text();
      preview = preview.slice(0, 200);
    } catch {}
    throw new Error(
      `Export did not return XLSX (magic bytes=${Array.from(head).join(',')}). Preview: ${preview}`,
    );
  }
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const useExportApi = <T extends keyof ApiMutationType>(
  mutationKey: T,
) => {
  const [isExporting, setIsExporting] = useState(false);
  const ctrlRef = useRef<AbortController | null>(null);

  const {signal, abort} = useAbortController();

  // IMPORTANT:
  // - responseType: 'blob' to get binary
  // - isFile: true so useAppMutation returns the full AxiosResponse (we need headers)
  const {mutateAsync: exportRequest} = useAppMutation<T>(
    mutationKey,
    {
      config: {
        responseType: 'blob',
      },
      responseType: 'blob', // (used on GET path in your hook)
      signal,
    },
    true, // isFile -> return AxiosResponse
    true, // isArrayParams (keep your existing behavior as needed)
  );

  const exportFile = useCallback(
    async (
      params: Omit<ApiMutationType[T], 'response'> & {
        fileName?: string;
        // pass `isFormData: true` in params if your payload is FormData-compatible
      },
    ) => {
      setIsExporting(true);
      ctrlRef.current = new AbortController();

      try {
        // With isFile:true, exportRequest resolves to AxiosResponse<Blob>
        const res = (await exportRequest(params)) as AxiosResponse<Blob>;

        // res.data is the Blob; do NOT rewrap in new Blob()
        const blob = res.data;

        // Optional: sanity check that it's really an XLSX/zip
        await assertZipLike(blob);

        // Try to read filename from Content-Disposition; else fallback
        const serverFile =
          getFilenameFromContentDisposition(
            res.headers?.['content-disposition'],
          ) ||
          params.fileName ||
          'export.xlsx';

        // If server didn't set MIME, keep saving anyway (Excel doesn't require it here)
        // If you need to force the MIME:
        // const typedBlob = blob.type ? blob : new Blob([blob], { type: EXCEL_MIME });

        saveBlob(blob, serverFile);
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // cancelled
          return;
        }
        // Surface server JSON/text errors if the API returned non-200 with body
        console.error('Export failed:', err);
        throw err;
      } finally {
        setIsExporting(false);
        ctrlRef.current = null;
      }
    },
    [exportRequest],
  );

  return {
    exportFile,
    cancelExport: abort,
    isExporting,
  };
};
