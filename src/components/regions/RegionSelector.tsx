import { useEffect, useMemo, useState } from 'react';
import { listRegionChildren, listRegions } from '@/lib/api';
import type { RegionSummary } from '@/types/api';

interface RegionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
}

function getRootCode(regionCode: string) {
  const segments = regionCode.split('-');
  return segments.length > 2 ? segments.slice(0, 2).join('-') : regionCode;
}

export function RegionSelector({
  value,
  onChange,
  label = '활동 지역',
  helperText = '1차 지역을 고르면 하위 지역을 선택할 수 있습니다.',
}: RegionSelectorProps) {
  const [roots, setRoots] = useState<RegionSummary[]>([]);
  const [children, setChildren] = useState<RegionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  const rootCode = useMemo(() => (value ? getRootCode(value) : ''), [value]);
  const selectedRoot = useMemo(
    () => roots.find((region) => region.code === rootCode) ?? null,
    [rootCode, roots],
  );

  useEffect(() => {
    let cancelled = false;

    void listRegions()
      .then((items) => {
        if (!cancelled) {
          setRoots(items);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!rootCode) {
      setChildren([]);
      return;
    }

    let cancelled = false;
    setIsLoadingChildren(true);

    void listRegionChildren(rootCode)
      .then((items) => {
        if (!cancelled) {
          setChildren(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setChildren([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingChildren(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [rootCode]);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <select
          value={rootCode}
          onChange={(event) => onChange(event.target.value)}
          disabled={isLoading}
          className="rounded-xl border border-gray-300 px-4 py-3"
        >
          <option value="">{isLoading ? '지역 불러오는 중...' : '1차 지역 선택'}</option>
          {roots.map((root) => (
            <option key={root.code} value={root.code}>
              {root.name}
            </option>
          ))}
        </select>

        <select
          value={value && (value === rootCode || children.some((child) => child.code === value)) ? value : ''}
          onChange={(event) => onChange(event.target.value)}
          disabled={!selectedRoot || children.length === 0 || isLoadingChildren}
          className="rounded-xl border border-gray-300 px-4 py-3"
        >
          <option value="">
            {!selectedRoot
              ? '하위 지역 없음'
              : isLoadingChildren
                ? '하위 지역 불러오는 중...'
                : children.length === 0
                  ? `${selectedRoot.name} 전체`
                  : '하위 지역 선택'}
          </option>
          {selectedRoot ? (
            <option value={selectedRoot.code}>{`${selectedRoot.name} 전체`}</option>
          ) : null}
          {children.map((child) => (
            <option key={child.code} value={child.code}>
              {child.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
