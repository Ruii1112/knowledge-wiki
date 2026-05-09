import { useState } from 'react';
import styles from './TagInput.module.css';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
}

// DB tags.name VARCHAR(100) と OpenAPI Tag schema (maxLength: 100) に同期
const TAG_MAX_LENGTH = 100;

const normalize = (raw: string) => raw.trim().toLowerCase();

export function TagInput({
  value,
  onChange,
  disabled = false,
  placeholder = 'タグを入力 (Enter / , で確定)',
  id,
}: TagInputProps) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | undefined>();

  // raw 文字列をカンマで分割して複数タグを一度に確定する。
  // paste した "spring,react" や ",,react" にも対応。
  const commit = (raw: string) => {
    const parts = raw.split(',').map(normalize).filter(Boolean);
    if (parts.length === 0) {
      setDraft('');
      return;
    }
    const tooLong = parts.find((t) => t.length > TAG_MAX_LENGTH);
    if (tooLong) {
      setError(`タグは ${TAG_MAX_LENGTH} 文字以内です`);
      return;
    }
    const next = [...value];
    for (const tag of parts) {
      if (!next.some((t) => normalize(t) === tag)) {
        next.push(tag);
      }
    }
    if (next.length !== value.length) onChange(next);
    setDraft('');
    setError(undefined);
  };

  const remove = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (draft.trim()) commit(draft);
  };

  return (
    <div className={styles.wrapper}>
      {value.map((tag) => (
        <span key={tag} className={styles.tag}>
          #{tag}
          <button
            type="button"
            className={styles.remove}
            onClick={() => remove(tag)}
            disabled={disabled}
            aria-label={`${tag}を削除`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        className={styles.input}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          if (error) setError(undefined);
        }}
        onKeyDown={handleKey}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? placeholder : ''}
        disabled={disabled}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
